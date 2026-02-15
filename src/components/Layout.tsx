import { NavLink, useNavigate } from 'react-router-dom';
import { CSSProperties, ReactNode } from 'react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/drivers', label: 'Drivers', icon: '🚴' },
  { path: '/orders', label: 'Orders', icon: '📦' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/products', label: 'Products', icon: '🛒' },
  { path: '/categories', label: 'Categories', icon: '📁' },
  { path: '/promos', label: 'Promos', icon: '🎫' },
  { path: '/zones', label: 'Delivery Zones', icon: '📍' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={{ fontSize: 24 }}>🇪🇹</span>
          <div>
            <div style={styles.logoTitle}>Habesha</div>
            <div style={styles.logoSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: 240,
    background: '#141414',
    borderRight: '1px solid #2A2A2A',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 20px 24px',
    borderBottom: '1px solid #2A2A2A',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#2ECC71',
  },
  logoSub: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '16px 12px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    color: '#A0A0A0',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  navLinkActive: {
    background: '#1A3D2B',
    color: '#2ECC71',
  },
  logoutBtn: {
    margin: '0 12px',
    padding: '10px 12px',
    background: 'transparent',
    color: '#666',
    border: '1px solid #2A2A2A',
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'left' as const,
  },
  main: {
    flex: 1,
    marginLeft: 240,
    padding: 32,
    minHeight: '100vh',
    overflowY: 'auto' as const,
  },
};
