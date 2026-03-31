import { type NavFn } from '../shell-types';

export function SchoolTrackDetail({ trackId: _trackId, navigate, onStartChat }: { trackId: string; navigate: NavFn; onStartChat: (p: string) => void; }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--r-bg)', gap: '12px' }}>
      <p style={{ fontSize: '13px', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>Track Detail</p>
      <button onClick={() => onStartChat('Continue this learning track')} style={{ fontSize: '11px', color: 'var(--r-accent)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>→ Start session</button>
      <button onClick={() => navigate('school', 'home')} style={{ fontSize: '10px', color: 'var(--r-dim)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>← Back</button>
    </div>
  );
}
