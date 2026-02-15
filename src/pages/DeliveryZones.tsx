import { useEffect, useState, CSSProperties } from 'react';
import api from '../api';
import { PageHeader, Badge, ActionButton, Loading, EmptyState } from '../components/UI';

interface DeliveryZone {
  id: string;
  name: string;
  nameAm?: string | null;
  subCity: string;
  centerLat: number | null;
  centerLng: number | null;
  radiusKm: number;
  deliveryFee: number;
  minOrder: number;
  isActive: boolean;
  estimatedMin: number;
  estimatedMax: number;
}

// Addis Ababa sub-city center coordinates and default radius
const SUB_CITY_PRESETS: Record<string, { lat: number; lng: number; radius: number }> = {
  'Bole':             { lat: 8.9806, lng: 38.7578, radius: 4.0 },
  'Kirkos':           { lat: 9.0084, lng: 38.7500, radius: 2.5 },
  'Arada':            { lat: 9.0350, lng: 38.7468, radius: 2.0 },
  'Addis Ketema':     { lat: 9.0300, lng: 38.7350, radius: 2.0 },
  'Lideta':           { lat: 9.0150, lng: 38.7300, radius: 2.0 },
  'Kolfe Keranio':    { lat: 9.0200, lng: 38.7100, radius: 4.5 },
  'Gulele':           { lat: 9.0600, lng: 38.7350, radius: 3.5 },
  'Yeka':             { lat: 9.0400, lng: 38.7800, radius: 4.0 },
  'Nifas Silk-Lafto': { lat: 8.9600, lng: 38.7200, radius: 4.0 },
  'Akaki Kality':     { lat: 8.8900, lng: 38.7400, radius: 5.0 },
  'Lemi Kura':        { lat: 8.9200, lng: 38.8100, radius: 3.5 },
};

const ADDIS_SUB_CITIES = Object.keys(SUB_CITY_PRESETS);

const EMPTY_FORM = {
  name: '',
  nameAm: '',
  subCity: '',
  centerLat: '' as string | number,
  centerLng: '' as string | number,
  radiusKm: 3.0,
  deliveryFee: 30,
  minOrder: 100,
  isActive: true,
  estimatedMin: 15,
  estimatedMax: 30,
};

export default function DeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/zones');
      setZones(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const usedSubCities = zones.map((z) => z.subCity);
  const availableSubCities = editingId
    ? ADDIS_SUB_CITIES
    : ADDIS_SUB_CITIES.filter((sc) => !usedSubCities.includes(sc));

  const applyPreset = (subCity: string) => {
    const preset = SUB_CITY_PRESETS[subCity];
    if (preset) {
      setForm((f) => ({
        ...f,
        subCity,
        name: f.name || subCity,
        centerLat: preset.lat,
        centerLng: preset.lng,
        radiusKm: preset.radius,
      }));
    } else {
      setForm((f) => ({ ...f, subCity }));
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    const firstAvailable = availableSubCities[0] || '';
    const preset = SUB_CITY_PRESETS[firstAvailable];
    setForm({
      ...EMPTY_FORM,
      subCity: firstAvailable,
      name: firstAvailable,
      centerLat: preset?.lat ?? '',
      centerLng: preset?.lng ?? '',
      radiusKm: preset?.radius ?? 3.0,
    });
    setShowForm(true);
  };

  const openEditForm = (z: DeliveryZone) => {
    setEditingId(z.id);
    setForm({
      name: z.name,
      nameAm: z.nameAm || '',
      subCity: z.subCity,
      centerLat: z.centerLat ?? '',
      centerLng: z.centerLng ?? '',
      radiusKm: z.radiusKm,
      deliveryFee: z.deliveryFee,
      minOrder: z.minOrder,
      isActive: z.isActive,
      estimatedMin: z.estimatedMin,
      estimatedMax: z.estimatedMax,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.subCity) {
      alert('Name and Sub-City are required');
      return;
    }
    if (!form.centerLat || !form.centerLng) {
      alert('Geofence center coordinates are required. Use the "Reset to Preset" button or enter manually.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/zones/${editingId}`, form);
        setZones((prev) => prev.map((z) => (z.id === editingId ? res.data.data : z)));
      } else {
        const res = await api.post('/zones', form);
        setZones((prev) => [...prev, res.data.data]);
      }
      setShowForm(false);
      setEditingId(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const res = await api.patch(`/zones/${id}/toggle`);
      setZones((prev) => prev.map((z) => (z.id === id ? res.data.data : z)));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Delete this delivery zone? Users in this area will NOT be able to order.')) return;
    try {
      await api.delete(`/zones/${id}`);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = zones.filter((z) => z.isActive).length;
  const geofencedCount = zones.filter((z) => z.centerLat && z.centerLng).length;
  const avgFee = zones.length > 0
    ? (zones.reduce((s, z) => s + z.deliveryFee, 0) / zones.length).toFixed(0)
    : '0';

  return (
    <div>
      <PageHeader title="Delivery Zones" subtitle="Geofenced delivery areas, fees & estimated times">
        <ActionButton onClick={openCreateForm} disabled={availableSubCities.length === 0}>
          + Add Zone
        </ActionButton>
      </PageHeader>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={summaryCard}>
          <div style={{ fontSize: 24 }}>📍</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2ECC71' }}>{zones.length}</div>
            <div style={{ fontSize: 12, color: '#A0A0A0' }}>Total Zones</div>
          </div>
        </div>
        <div style={summaryCard}>
          <div style={{ fontSize: 24 }}>✅</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3498DB' }}>{activeCount}</div>
            <div style={{ fontSize: 12, color: '#A0A0A0' }}>Active Zones</div>
          </div>
        </div>
        <div style={summaryCard}>
          <div style={{ fontSize: 24 }}>🎯</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#9B59B6' }}>{geofencedCount}</div>
            <div style={{ fontSize: 12, color: '#A0A0A0' }}>Geofenced</div>
          </div>
        </div>
        <div style={summaryCard}>
          <div style={{ fontSize: 24 }}>🚴</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FFC107' }}>{avgFee} ETB</div>
            <div style={{ fontSize: 12, color: '#A0A0A0' }}>Avg. Delivery Fee</div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        padding: 14,
        background: '#1A2A3D',
        border: '1px solid #2A4060',
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 13,
        color: '#7CB3D9',
        lineHeight: 1.6,
      }}>
        <strong>🛡️ Geofence Enforcement:</strong> Orders are only accepted from addresses inside an <strong>active</strong> zone's
        radius. If all zones are disabled or the customer is outside every zone, the order is <strong>rejected</strong>.
        Each zone uses a circular geofence defined by center coordinates + radius in km.
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div style={modalStyles.overlay} onClick={() => setShowForm(false)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>
              {editingId ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
            </h2>

            <div style={modalStyles.grid}>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Zone Name *</label>
                <input
                  style={modalStyles.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bole Area"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Sub-City *</label>
                <select
                  style={modalStyles.input}
                  value={form.subCity}
                  onChange={(e) => applyPreset(e.target.value)}
                  disabled={!!editingId}
                >
                  <option value="">Select sub-city...</option>
                  {(editingId ? ADDIS_SUB_CITIES : availableSubCities).map((sc) => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Name (Amharic)</label>
                <input
                  style={modalStyles.input}
                  value={form.nameAm}
                  onChange={(e) => setForm({ ...form, nameAm: e.target.value })}
                  placeholder="e.g. ቦሌ አካባቢ"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Status</label>
                <select
                  style={modalStyles.input}
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Geofence section */}
            <div style={{
              marginTop: 20,
              padding: 16,
              background: '#0F0F0F',
              borderRadius: 10,
              border: '1px solid #2A2A2A',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#9B59B6', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  🎯 Geofence Settings
                </span>
                {form.subCity && SUB_CITY_PRESETS[form.subCity] && (
                  <button
                    onClick={() => applyPreset(form.subCity)}
                    style={{
                      background: '#1A2A3D',
                      color: '#3498DB',
                      border: '1px solid #2A4060',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Reset to Preset
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={modalStyles.field}>
                  <label style={modalStyles.label}>Center Latitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    style={modalStyles.input}
                    value={form.centerLat}
                    onChange={(e) => setForm({ ...form, centerLat: e.target.value ? parseFloat(e.target.value) : '' })}
                    placeholder="8.9806"
                  />
                </div>
                <div style={modalStyles.field}>
                  <label style={modalStyles.label}>Center Longitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    style={modalStyles.input}
                    value={form.centerLng}
                    onChange={(e) => setForm({ ...form, centerLng: e.target.value ? parseFloat(e.target.value) : '' })}
                    placeholder="38.7578"
                  />
                </div>
                <div style={modalStyles.field}>
                  <label style={modalStyles.label}>Radius (km) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    style={modalStyles.input}
                    value={form.radiusKm}
                    onChange={(e) => setForm({ ...form, radiusKm: parseFloat(e.target.value) || 3 })}
                    placeholder="3.0"
                  />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
                Customers within {form.radiusKm} km of ({String(form.centerLat || '—')}, {String(form.centerLng || '—')}) can order from this zone.
              </div>
            </div>

            {/* Fee & time section */}
            <div style={{ marginTop: 16 }}>
              <div style={modalStyles.grid}>
                <div style={modalStyles.field}>
                  <label style={modalStyles.label}>Delivery Fee (ETB)</label>
                  <input
                    type="number"
                    style={modalStyles.input}
                    value={form.deliveryFee}
                    onChange={(e) => setForm({ ...form, deliveryFee: parseFloat(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div style={modalStyles.field}>
                  <label style={modalStyles.label}>Min Order Amount (ETB)</label>
                  <input
                    type="number"
                    style={modalStyles.input}
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: parseFloat(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div style={modalStyles.field}>
                  <label style={modalStyles.label}>Est. Min Time (min)</label>
                  <input
                    type="number"
                    style={modalStyles.input}
                    value={form.estimatedMin}
                    onChange={(e) => setForm({ ...form, estimatedMin: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div style={modalStyles.field}>
                  <label style={modalStyles.label}>Est. Max Time (min)</label>
                  <input
                    type="number"
                    style={modalStyles.input}
                    value={form.estimatedMax}
                    onChange={(e) => setForm({ ...form, estimatedMax: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{
              marginTop: 16,
              padding: 12,
              background: '#0F0F0F',
              borderRadius: 8,
              border: '1px solid #2A2A2A',
              fontSize: 13,
              color: '#A0A0A0',
            }}>
              <strong style={{ color: '#FFC107' }}>Preview:</strong>{' '}
              Customers within <strong style={{ color: '#9B59B6' }}>{form.radiusKm} km</strong> of{' '}
              <strong style={{ color: '#E0E0E0' }}>{form.subCity || '—'}</strong> center will
              pay <strong style={{ color: '#2ECC71' }}>{form.deliveryFee} ETB</strong> delivery,
              need min <strong style={{ color: '#E0E0E0' }}>{form.minOrder} ETB</strong> order,
              delivered in{' '}
              <strong style={{ color: '#3498DB' }}>{form.estimatedMin}–{form.estimatedMax} min</strong>.
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
              <ActionButton variant="ghost" onClick={() => setShowForm(false)}>Cancel</ActionButton>
              <ActionButton onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Zone' : 'Create Zone'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <Loading />
      ) : zones.length === 0 ? (
        <EmptyState icon="📍" message="No delivery zones configured. Orders will be rejected until you add active zones." />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2A2A2A' }}>
          <table>
            <thead>
              <tr>
                <th>Zone</th>
                <th>Sub-City</th>
                <th>Geofence</th>
                <th>Delivery Fee</th>
                <th>Min Order</th>
                <th>Est. Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{z.name}</div>
                      {z.nameAm && <div style={{ fontSize: 11, color: '#666' }}>{z.nameAm}</div>}
                    </div>
                  </td>
                  <td>
                    <Badge variant="info">{z.subCity}</Badge>
                  </td>
                  <td>
                    {z.centerLat && z.centerLng ? (
                      <div>
                        <Badge variant="success">🎯 {z.radiusKm} km</Badge>
                        <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                          {z.centerLat.toFixed(4)}, {z.centerLng.toFixed(4)}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="warning">No coords</Badge>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#FFC107' }}>{z.deliveryFee} ETB</span>
                  </td>
                  <td>
                    <span>{z.minOrder} ETB</span>
                  </td>
                  <td>
                    <span style={{ color: '#3498DB' }}>
                      {z.estimatedMin}–{z.estimatedMax} min
                    </span>
                  </td>
                  <td>
                    <Badge variant={z.isActive ? 'success' : 'default'}>
                      {z.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionButton small variant="ghost" onClick={() => openEditForm(z)}>
                        ✏️
                      </ActionButton>
                      <ActionButton
                        small
                        variant={z.isActive ? 'warning' : 'primary'}
                        onClick={() => toggleActive(z.id)}
                      >
                        {z.isActive ? 'Disable' : 'Enable'}
                      </ActionButton>
                      <ActionButton small variant="danger" onClick={() => deleteZone(z.id)}>
                        🗑️
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Uncovered areas info */}
      {zones.length > 0 && availableSubCities.length > 0 && (
        <div style={{
          marginTop: 20,
          padding: 16,
          background: '#1A1A1A',
          borderRadius: 12,
          border: '1px solid #2A2A2A',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#A0A0A0', marginBottom: 8 }}>
            ⚠️ Uncovered Sub-Cities (orders from these areas will be rejected)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {availableSubCities.map((sc) => (
              <span key={sc} style={{
                background: '#2A2020',
                color: '#E74C3C',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
              }}>
                {sc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const summaryCard: CSSProperties = {
  background: '#1A1A1A',
  borderRadius: 12,
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flex: 1,
  minWidth: 180,
};

const modalStyles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1A1A1A',
    borderRadius: 16,
    padding: 32,
    width: '90%',
    maxWidth: 700,
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #2A2A2A',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#A0A0A0',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  input: {
    background: '#0F0F0F',
    border: '1px solid #2A2A2A',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: '#E0E0E0',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
};
