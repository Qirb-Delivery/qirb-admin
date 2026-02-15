import { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader, SearchInput, Badge, ActionButton, Loading, EmptyState } from '../components/UI';

interface Product {
  id: string;
  name: string;
  nameAm: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  image: string;
  unit: string;
  unitValue: number;
  category: { id: string; name: string };
  createdAt: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { search: searchDebounce || undefined, limit: 50 } })
      .then((r) => setProducts(r.data.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchDebounce]);

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setEditData({ price: p.price, stock: p.stock, isFeatured: p.isFeatured, isActive: p.isActive });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await api.put(`/products/${id}`, editData);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...res.data.data } : p));
      setEditing(null);
    } catch (e) { console.error(e); }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await api.put(`/products/${id}`, { isFeatured: !current });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isFeatured: !current } : p));
    } catch (e) { console.error(e); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.put(`/products/${id}`, { isActive: !current });
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p));
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage product catalog">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products..." />
      </PageHeader>

      {loading ? <Loading /> : products.length === 0 ? (
        <EmptyState icon="🛒" message="No products found" />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2A2A2A' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: '#222' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>{p.nameAm}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>{p.unitValue} {p.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge variant="default">{p.category.name}</Badge></td>
                  <td>
                    {editing === p.id ? (
                      <input
                        type="number"
                        value={editData.price ?? ''}
                        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                        style={{ width: 80, padding: '4px 8px', fontSize: 13 }}
                      />
                    ) : (
                      <div>
                        <span style={{ fontWeight: 600 }}>{p.price} ETB</span>
                        {p.comparePrice && (
                          <span style={{ fontSize: 11, color: '#666', textDecoration: 'line-through', marginLeft: 6 }}>{p.comparePrice}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editing === p.id ? (
                      <input
                        type="number"
                        value={editData.stock ?? ''}
                        onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) })}
                        style={{ width: 60, padding: '4px 8px', fontSize: 13 }}
                      />
                    ) : (
                      <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'error'}>
                        {p.stock}
                      </Badge>
                    )}
                  </td>
                  <td>
                    <Badge variant={p.isActive ? 'success' : 'error'}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleFeatured(p.id, p.isFeatured)}
                      style={{
                        background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
                        filter: p.isFeatured ? 'none' : 'grayscale(1) opacity(0.4)',
                      }}
                      title={p.isFeatured ? 'Unfeature' : 'Feature'}
                    >
                      ⭐
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {editing === p.id ? (
                        <>
                          <ActionButton small variant="primary" onClick={() => saveEdit(p.id)}>Save</ActionButton>
                          <ActionButton small variant="ghost" onClick={() => setEditing(null)}>Cancel</ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton small variant="ghost" onClick={() => startEdit(p)}>Edit</ActionButton>
                          <ActionButton
                            small
                            variant={p.isActive ? 'danger' : 'primary'}
                            onClick={() => toggleActive(p.id, p.isActive)}
                          >
                            {p.isActive ? 'Hide' : 'Show'}
                          </ActionButton>
                        </>
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
