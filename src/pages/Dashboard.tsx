import { useEffect, useState } from 'react';
import api from '../api';
import { StatCard, PageHeader, Loading } from '../components/UI';

interface Stats {
  users: { total: number };
  drivers: { total: number; verified: number; pending: number };
  orders: { total: number; pending: number; active: number; delivered: number; cancelled: number; recentWeek: number };
  products: { total: number };
  categories: { total: number };
  revenue: { total: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Loading />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your Habesha Delivery platform" />

      {/* Revenue + Orders row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatCard icon="💰" label="Total Revenue" value={`${(stats.revenue.total || 0).toLocaleString()} ETB`} color="#FFC107" />
        <StatCard icon="📦" label="Total Orders" value={stats.orders.total} sub={`${stats.orders.recentWeek} this week`} color="#3498DB" />
        <StatCard icon="👥" label="Total Users" value={stats.users.total} color="#9B59B6" />
        <StatCard icon="🛒" label="Products" value={stats.products.total} sub={`${stats.categories.total} categories`} />
      </div>

      {/* Orders breakdown */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatCard icon="⏳" label="Pending Orders" value={stats.orders.pending} color="#FF9800" />
        <StatCard icon="🔄" label="Active Orders" value={stats.orders.active} color="#3498DB" />
        <StatCard icon="✅" label="Delivered" value={stats.orders.delivered} color="#2ECC71" />
        <StatCard icon="❌" label="Cancelled" value={stats.orders.cancelled} color="#E74C3C" />
      </div>

      {/* Drivers */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard icon="🚴" label="Total Drivers" value={stats.drivers.total} />
        <StatCard icon="✔️" label="Verified Drivers" value={stats.drivers.verified} color="#2ECC71" />
        <StatCard icon="⏱" label="Pending Verification" value={stats.drivers.pending} color="#FF9800" sub="Needs your review" />
      </div>
    </div>
  );
}
