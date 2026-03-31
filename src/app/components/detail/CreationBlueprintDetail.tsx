import { type NavFn } from '../shell-types';

export function CreationBlueprintDetail({ blueprintId: _blueprintId, navigate, onStartChat }: { blueprintId: string; navigate: NavFn; onStartChat: (p: string) => void; }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--r-bg)', gap: '12px' }}>
      <p style={{ fontSize: '13px', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>Blueprint Detail</p>
      <button onClick={() => onStartChat('Build from this blueprint')} style={{ fontSize: '11px', color: 'var(--r-accent)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>→ Build it</button>
      <button onClick={() => navigate('creation', 'home')} style={{ fontSize: '10px', color: 'var(--r-dim)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>← Back</button>
    </div>
  );
}
