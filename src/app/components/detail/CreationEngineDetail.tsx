import { type NavFn } from '../shell-types';

export function CreationEngineDetail({ engineId: _engineId, navigate, onStartChat }: { engineId: string; navigate: NavFn; onStartChat: (p: string) => void; }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--r-bg)', gap: '12px' }}>
      <p style={{ fontSize: '13px', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>Engine Detail</p>
      <button onClick={() => onStartChat('Use this engine')} style={{ fontSize: '11px', color: 'var(--r-accent)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>→ Start engine</button>
      <button onClick={() => navigate('creation', 'home')} style={{ fontSize: '10px', color: 'var(--r-dim)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>← Back</button>
    </div>
  );
}
