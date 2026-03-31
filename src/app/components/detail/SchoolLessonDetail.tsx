import { type NavFn } from '../shell-types';

export function SchoolLessonDetail({ lessonId: _lessonId, navigate, onStartChat }: { lessonId: string; navigate: NavFn; onStartChat: (p: string) => void; }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--r-bg)', gap: '12px' }}>
      <p style={{ fontSize: '13px', color: 'var(--r-text)', fontFamily: "'Inter', system-ui, sans-serif" }}>Lesson Detail</p>
      <button onClick={() => onStartChat('Start this lesson')} style={{ fontSize: '11px', color: 'var(--r-accent)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>→ Begin lesson</button>
      <button onClick={() => navigate('school', 'home')} style={{ fontSize: '10px', color: 'var(--r-dim)', fontFamily: 'monospace', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>← Back</button>
    </div>
  );
}
