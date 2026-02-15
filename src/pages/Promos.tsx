import { useEffect, useState, CSSProperties } from 'react';
import api from '../api';
import { PageHeader, Badge, ActionButton, Loading, EmptyState } from '../components/UI';

interface PromoCode {
  id: string;
  code: string;
  title: string;
  titleAm?: string;
  description?: string;
  descriptionAm?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  maxUses?: number | null;
  maxUsesPerUser: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  _count?: { usages: number };
}

const EMPTY_FORM: Partial<PromoCode> & { [key: string]: any } = {
  code: '',
  title: '',
  titleAm: '',
  description: '',
  descriptionAm: '',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscount: null,
  maxUses: null,
  maxUsesPerUser: 1,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: null,
  isActive: true,
};

export default function Promos() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/promos');
      setPromos(res.data.data.promos);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, startDate: new Date().toISOString().slice(0, 16) });
    setShowForm(true);
  };

  const openEditForm = (p: PromoCode) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      title: p.title,
      titleAm: p.titleAm || '',
      description: p.description || '',
      descriptionAm: p.descriptionAm || '',
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderAmount: p.minOrderAmount,
      maxDiscount: p.maxDiscount ?? null,
      maxUses: p.maxUses ?? null,
      maxUsesPerUser: p.maxUsesPerUser,
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 16) : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 16) : null,
      isActive: p.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.title || !form.discountValue) {
      alert('Code, Title, and Discount Value are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/promos/${editingId}`, form);
        setPromos((prev) => prev.map((p) => (p.id === editingId ? res.data.data : p)));
      } else {
        const res = await api.post('/promos', form);
        setPromos((prev) => [res.data.data, ...prev]);
      }
      setShowForm(false);
      setEditingId(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save promo');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const res = await api.patch(`/promos/${id}/toggle`);
      setPromos((prev) => prev.map((p) => (p.id === id ? res.data.data : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    try {
      await api.delete(`/promos/${id}`);
      setPromos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const isExpired = (p: PromoCode) => p.endDate && new Date(p.endDate) < new Date();
  const isNotStarted = (p: PromoCode) => new Date(p.startDate) > new Date();

  const getStatusBadge = (p: PromoCode) => {
    if (!p.isActive) return <Badge variant="default">Inactive</Badge>;
    if (isExpired(p)) return <Badge variant="error">Expired</Badge>;
    if (isNotStarted(p)) return <Badge variant="warning">Scheduled</Badge>;
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <div>
      <PageHeader title="Promo Codes" subtitle="Manage discounts & offers">
        <ActionButton onClick={openCreateForm}>+ Create Promo</ActionButton>
      </PageHeader>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div style={modalStyles.overlay} onClick={() => setShowForm(false)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>
              {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
            </h2>

            <div style={modalStyles.grid}>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Code *</label>
                <input
                  style={modalStyles.input}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME20"
                  disabled={!!editingId}
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Discount Type *</label>
                <select
                  style={modalStyles.input}
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (ETB)</option>
                </select>
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Title (English) *</label>
                <input
                  style={modalStyles.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Welcome Discount"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Title (Amharic)</label>
                <input
                  style={modalStyles.input}
                  value={form.titleAm}
                  onChange={(e) => setForm({ ...form, titleAm: e.target.value })}
                  placeholder="e.g. የእንኳን ደህና መጡ ቅናሽ"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>
                  Discount Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(ETB)'}
                </label>
                <input
                  type="number"
                  style={modalStyles.input}
                  value={form.discountValue || ''}
                  onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                  placeholder={form.discountType === 'PERCENTAGE' ? '10' : '50'}
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Min Order Amount (ETB)</label>
                <input
                  type="number"
                  style={modalStyles.input}
                  value={form.minOrderAmount || ''}
                  onChange={(e) => setForm({ ...form, minOrderAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Max Discount (ETB)</label>
                <input
                  type="number"
                  style={modalStyles.input}
                  value={form.maxDiscount ?? ''}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="No limit"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Max Total Uses</label>
                <input
                  type="number"
                  style={modalStyles.input}
                  value={form.maxUses ?? ''}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Unlimited"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Max Uses Per User</label>
                <input
                  type="number"
                  style={modalStyles.input}
                  value={form.maxUsesPerUser}
                  onChange={(e) => setForm({ ...form, maxUsesPerUser: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Start Date</label>
                <input
                  type="datetime-local"
                  style={modalStyles.input}
                  value={form.startDate || ''}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>End Date</label>
                <input
                  type="datetime-local"
                  style={modalStyles.input}
                  value={form.endDate || ''}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
                />
              </div>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Active</label>
                <select
                  style={modalStyles.input}
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
              <ActionButton variant="ghost" onClick={() => setShowForm(false)}>Cancel</ActionButton>
              <ActionButton onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <Loading />
      ) : promos.length === 0 ? (
        <EmptyState icon="🎫" message="No promo codes yet. Create one to get started!" />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2A2A2A' }}>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: 14,
                      background: '#1A3D2B',
                      color: '#2ECC71',
                      padding: '4px 10px',
                      borderRadius: 6,
                      letterSpacing: 1,
                    }}>
                      {p.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    {p.titleAm && <div style={{ fontSize: 11, color: '#666' }}>{p.titleAm}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#FFC107' }}>
                      {p.discountType === 'PERCENTAGE'
                        ? `${p.discountValue}%`
                        : `${p.discountValue} ETB`}
                    </span>
                    {p.maxDiscount && (
                      <div style={{ fontSize: 11, color: '#666' }}>Max: {p.maxDiscount} ETB</div>
                    )}
                  </td>
                  <td>
                    {p.minOrderAmount > 0
                      ? <span>{p.minOrderAmount} ETB</span>
                      : <span style={{ color: '#666' }}>—</span>
                    }
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{p.usedCount}</span>
                    <span style={{ color: '#666' }}>
                      {p.maxUses ? ` / ${p.maxUses}` : ' / ∞'}
                    </span>
                  </td>
                  <td>{getStatusBadge(p)}</td>
                  <td>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {new Date(p.startDate).toLocaleDateString()}
                      {p.endDate && (
                        <> — {new Date(p.endDate).toLocaleDateString()}</>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionButton small variant="ghost" onClick={() => openEditForm(p)}>
                        ✏️
                      </ActionButton>
                      <ActionButton
                        small
                        variant={p.isActive ? 'warning' : 'primary'}
                        onClick={() => toggleActive(p.id)}
                      >
                        {p.isActive ? 'Disable' : 'Enable'}
                      </ActionButton>
                      <ActionButton small variant="danger" onClick={() => deletePromo(p.id)}>
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
    </div>
  );
}

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
    maxWidth: 680,
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
