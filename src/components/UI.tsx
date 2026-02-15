import { CSSProperties, ReactNode } from 'react';

export function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div style={{ ...cardStyles.card, borderLeft: `3px solid ${color || '#2ECC71'}` }}>
      <div style={cardStyles.top}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <span style={{ ...cardStyles.value, color: color || '#2ECC71' }}>{value}</span>
      </div>
      <div style={cardStyles.label}>{label}</div>
      {sub && <div style={cardStyles.sub}>{sub}</div>}
    </div>
  );
}

const cardStyles: Record<string, CSSProperties> = {
  card: {
    background: '#1A1A1A',
    borderRadius: 12,
    padding: '20px 24px',
    minWidth: 200,
    flex: 1,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  sub: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
};

export function Badge({ children, variant = 'default' }: {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}) {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: '#1A3D2B', text: '#2ECC71' },
    warning: { bg: '#3D2E0A', text: '#FF9800' },
    error: { bg: '#3D1A1A', text: '#E74C3C' },
    info: { bg: '#1A2A3D', text: '#3498DB' },
    default: { bg: '#222', text: '#A0A0A0' },
  };
  const c = colors[variant] || colors.default;
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

export function ActionButton({ children, onClick, variant = 'primary', small, disabled }: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'warning';
  small?: boolean;
  disabled?: boolean;
}) {
  const colorMap = {
    primary: { bg: '#2ECC71', text: '#0F0F0F' },
    danger: { bg: '#E74C3C', text: '#fff' },
    warning: { bg: '#FF9800', text: '#0F0F0F' },
    ghost: { bg: 'transparent', text: '#A0A0A0' },
  };
  const c = colorMap[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: c.bg,
        color: c.text,
        border: variant === 'ghost' ? '1px solid #2A2A2A' : 'none',
        borderRadius: 8,
        padding: small ? '6px 12px' : '10px 20px',
        fontSize: small ? 12 : 14,
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, children }: {
  title: string; subtitle?: string; children?: ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 28,
    }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: 8 }}>{children}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      style={{ width: 280 }}
    />
  );
}

export function FilterTabs({ tabs, active, onChange }: {
  tabs: { value: string; label: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            background: active === t.value ? '#1A3D2B' : '#1A1A1A',
            color: active === t.value ? '#2ECC71' : '#666',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16 }}>{message}</div>
    </div>
  );
}

export function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ color: '#2ECC71', fontSize: 16 }}>Loading...</div>
    </div>
  );
}
