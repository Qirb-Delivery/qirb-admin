import { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader, SearchInput, Badge, ActionButton, Loading, EmptyState } from '../components/UI';

interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number; reviews: number };
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api.get('/users', { params: { search: searchDebounce || undefined, limit: 50 } })
      .then((r) => setUsers(r.data.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchDebounce]);

  const toggleActive = async (id: string) => {
    try {
      const res = await api.put(`/users/${id}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) => u.id === id ? { ...u, isActive: res.data.data.isActive } : u)
      );
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage customer accounts">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone, email..." />
      </PageHeader>

      {loading ? <Loading /> : users.length === 0 ? (
        <EmptyState icon="👥" message="No users found" />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2A2A2A' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Reviews</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name || 'Unnamed'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{u.phone}</div>
                    {u.email && <div style={{ fontSize: 11, color: '#666' }}>{u.email}</div>}
                  </td>
                  <td>
                    <Badge variant={u.isActive ? 'success' : 'error'}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td>{u._count.orders}</td>
                  <td>{u._count.reviews}</td>
                  <td style={{ fontSize: 12, color: '#666' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <ActionButton
                      small
                      variant={u.isActive ? 'danger' : 'primary'}
                      onClick={() => toggleActive(u.id)}
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </ActionButton>
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
