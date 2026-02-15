import { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader, FilterTabs, Badge, ActionButton, Loading, EmptyState } from '../components/UI';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  user: { id: string; name: string | null; phone: string };
  address: { subCity: string; fullAddress: string | null };
  driver: { id: string; name: string | null; phone: string } | null;
  _count: { items: number };
}

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
  'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED',
];

const statusBadgeVariant = (s: string) => {
  if (s === 'DELIVERED') return 'success';
  if (s === 'CANCELLED') return 'error';
  if (s === 'PENDING') return 'warning';
  return 'info';
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = (status?: string) => {
    setLoading(true);
    api.get('/orders', { params: { status: status === 'all' ? undefined : status, limit: 50 } })
      .then((r) => setOrders(r.data.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(filter); }, [filter]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="View and manage all customer orders" />

      <FilterTabs
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'PENDING', label: '⏳ Pending' },
          { value: 'CONFIRMED', label: 'Confirmed' },
          { value: 'PREPARING', label: 'Preparing' },
          { value: 'ON_THE_WAY', label: '🚚 On the Way' },
          { value: 'DELIVERED', label: '✅ Delivered' },
          { value: 'CANCELLED', label: '❌ Cancelled' },
        ]}
        active={filter}
        onChange={setFilter}
      />

      {loading ? <Loading /> : orders.length === 0 ? (
        <EmptyState icon="📦" message="No orders found" />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2A2A2A' }}>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Driver</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{o.orderNumber}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.user.name || 'Guest'}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{o.user.phone}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{o.address.subCity}</div>
                  </td>
                  <td>{o._count.items}</td>
                  <td style={{ fontWeight: 600 }}>{o.total.toLocaleString()} ETB</td>
                  <td>
                    <Badge variant={o.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}>
                      {o.paymentMethod}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={statusBadgeVariant(o.status)}>{o.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {o.driver ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{o.driver.name}</div>
                        <div style={{ color: '#666' }}>{o.driver.phone}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#666' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: '#666' }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                    <br />
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(o.id, e.target.value);
                        }}
                        style={{ padding: '6px 8px', fontSize: 12, minWidth: 130 }}
                      >
                        <option value="">Change status...</option>
                        {ORDER_STATUSES
                          .filter((s) => s !== o.status)
                          .map((s) => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                      </select>
                    )}
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
