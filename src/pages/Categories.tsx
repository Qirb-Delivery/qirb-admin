import { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader, Badge, ActionButton, Loading, EmptyState, SearchInput } from '../components/UI';

interface Category {
  id: string;
  name: string;
  nameAm: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Category>>({});
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/categories')
      .then((r) => setCategories(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (c: Category) => {
    setEditing(c.id);
    setEditData({ name: c.name, nameAm: c.nameAm, sortOrder: c.sortOrder, isActive: c.isActive });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await api.put(`/categories/${id}`, editData);
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...res.data.data } : c));
      setEditing(null);
    } catch (e) { console.error(e); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.put(`/categories/${id}`, { isActive: !current });
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !current } : c));
    } catch (e) { console.error(e); }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nameAm.includes(search)
  );

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage product categories">
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
      </PageHeader>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState icon="📂" message="No categories found" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#1A1A1A',
                borderRadius: 12,
                border: '1px solid #2A2A2A',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ height: 120, background: '#222', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={c.image}
                  alt={c.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  display: 'flex', gap: 6,
                }}>
                  <Badge variant={c.isActive ? 'success' : 'error'}>
                    {c.isActive ? 'Active' : 'Hidden'}
                  </Badge>
                </div>
              </div>

              <div style={{ padding: 16 }}>
                {editing === c.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Name (English)</label>
                      <input
                        value={editData.name ?? ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Name (Amharic)</label>
                      <input
                        value={editData.nameAm ?? ''}
                        onChange={(e) => setEditData({ ...editData, nameAm: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Sort Order</label>
                      <input
                        type="number"
                        value={editData.sortOrder ?? 0}
                        onChange={(e) => setEditData({ ...editData, sortOrder: parseInt(e.target.value) })}
                        style={{ width: 80, padding: '6px 10px', fontSize: 13 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <ActionButton small variant="primary" onClick={() => saveEdit(c.id)}>Save</ActionButton>
                      <ActionButton small variant="ghost" onClick={() => setEditing(null)}>Cancel</ActionButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                        <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{c.nameAm}</div>
                      </div>
                      <div style={{
                        background: '#2A2A2A',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 12,
                        color: '#aaa',
                      }}>
                        #{c.sortOrder}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: 12, paddingTop: 12, borderTop: '1px solid #2A2A2A',
                    }}>
                      <span style={{ fontSize: 13, color: '#888' }}>
                        {c._count.products} products
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionButton small variant="ghost" onClick={() => startEdit(c)}>Edit</ActionButton>
                        <ActionButton
                          small
                          variant={c.isActive ? 'danger' : 'primary'}
                          onClick={() => toggleActive(c.id, c.isActive)}
                        >
                          {c.isActive ? 'Hide' : 'Show'}
                        </ActionButton>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
