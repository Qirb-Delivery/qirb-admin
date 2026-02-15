import { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader, FilterTabs, Badge, ActionButton, Loading, EmptyState } from '../components/UI';

interface Driver {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  vehicleType: string;
  vehiclePlate: string | null;
  licenseNumber: string | null;
  isVerified: boolean;
  isActive: boolean;
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  createdAt: string;
  _count: { orders: number; earnings: number };
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDrivers = (status?: string) => {
    setLoading(true);
    api.get('/drivers', { params: { status: status === 'all' ? undefined : status, limit: 100 } })
      .then((r) => setDrivers(r.data.data.drivers))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrivers(filter); }, [filter]);

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/drivers/${id}/verify`);
      setDrivers((prev) => prev.map((d) => d.id === id ? { ...d, isVerified: true } : d));
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/drivers/${id}/suspend`);
      setDrivers((prev) => prev.map((d) => d.id === id ? { ...d, isActive: false, isOnline: false } : d));
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      await api.put(`/drivers/${id}/activate`);
      setDrivers((prev) => prev.map((d) => d.id === id ? { ...d, isActive: true } : d));
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  return (
    <div>
      <PageHeader title="Delivery Drivers" subtitle="Manage and verify delivery drivers" />

      <FilterTabs
        tabs={[
          { value: 'all', label: 'All Drivers' },
          { value: 'pending', label: '⏱ Pending Verification' },
          { value: 'verified', label: '✔ Verified' },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {loading ? <Loading /> : drivers.length === 0 ? (
        <EmptyState icon="🚴" message="No drivers found" />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2A2A2A' }}>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Deliveries</th>
                <th>Earnings</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.name || 'Unnamed'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{d.phone}</div>
                    {d.email && <div style={{ fontSize: 11, color: '#666' }}>{d.email}</div>}
                  </td>
                  <td>
                    <Badge variant="default">{d.vehicleType}</Badge>
                    {d.vehiclePlate && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{d.vehiclePlate}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Badge variant={d.isVerified ? 'success' : 'warning'}>
                        {d.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                      {d.isActive ? (
                        <Badge variant={d.isOnline ? 'info' : 'default'}>
                          {d.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      ) : (
                        <Badge variant="error">Suspended</Badge>
                      )}
                    </div>
                  </td>
                  <td>⭐ {d.rating.toFixed(1)}</td>
                  <td>{d.totalDeliveries}</td>
                  <td>{d.totalEarnings.toLocaleString()} ETB</td>
                  <td style={{ fontSize: 12, color: '#666' }}>
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {!d.isVerified && (
                        <ActionButton
                          small
                          variant="primary"
                          onClick={() => handleVerify(d.id)}
                          disabled={actionLoading === d.id}
                        >
                          ✓ Verify
                        </ActionButton>
                      )}
                      {d.isActive ? (
                        <ActionButton
                          small
                          variant="danger"
                          onClick={() => handleSuspend(d.id)}
                          disabled={actionLoading === d.id}
                        >
                          Suspend
                        </ActionButton>
                      ) : (
                        <ActionButton
                          small
                          variant="warning"
                          onClick={() => handleActivate(d.id)}
                          disabled={actionLoading === d.id}
                        >
                          Activate
                        </ActionButton>
                      )}
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
