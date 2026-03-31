/**
 * RUBERRA Sovereign Bar
 * CSS keyframe animations — no motion/react dependency.
 */

import { Search, Bell, ChevronDown } from 'lucide-react';
import { type Tab, type Theme } from './shell-types';

const SB_KF = `
  @keyframes sb-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
`;

interface SovereignBarProps {
  activeTab:      Tab;
  onTabChange:    (tab: Tab) => void;
  isLive?:        boolean;
  theme?:         Theme;
  onThemeToggle?: () => void;
}

const TABS: { id: Tab; label: string; dot: string }[] = [
  { id: 'lab',      label: 'Lab',      dot: 'var(--r-accent)' },
  { id: 'school',   label: 'School',   dot: 'var(--r-ok)'     },
  { id: 'creation', label: 'Creation', dot: 'var(--r-warn)'   },
];

function Mark() {
  return (
    <div style={{ width: '18px', height: '18px', background: 'var(--r-text)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '1px', height: '9px', background: 'rgba(255,255,255,0.85)', top: '4.5px', left: '50%', transform: 'translateX(-50%)' }} />
      <div style={{ position: 'absolute', width: '5px', height: '1px', background: 'rgba(255,255,255,0.85)', left: '6.5px', top: '7px' }} />
    </div>
  );
}

function IconBtn({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void; }) {
  return (
    <button onClick={onClick} title={title} style={{ width: '28px', height: '28px', borderRadius: '5px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none', color: 'var(--r-subtext)', transition: 'background 0.1s ease', flexShrink: 0 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--r-rail)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >{children}</button>
  );
}

export function SovereignBar({ activeTab, onTabChange, isLive, theme, onThemeToggle }: SovereignBarProps) {
  return (
    <>
      <style>{SB_KF}</style>
      <header style={{ height: '44px', borderBottom: '1px solid var(--r-border)', background: 'var(--r-surface)', position: 'relative', zIndex: 20, flexShrink: 0, display: 'flex', alignItems: 'center', paddingLeft: '16px', paddingRight: '14px', transition: 'background 0.2s ease' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
          <Mark />
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--r-text)', userSelect: 'none', fontFamily: "'Inter', system-ui, sans-serif" }}>RUBERRA</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px', borderLeft: '1px solid var(--r-border)', paddingLeft: '10px' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isLive ? 'var(--r-accent)' : 'var(--r-pulse)', flexShrink: 0, display: 'inline-block', animation: `sb-pulse ${isLive ? '0.9s' : '3.2s'} ease-in-out infinite` }} />
            <span style={{ fontSize: '9px', letterSpacing: '0.10em', color: 'var(--r-subtext)', fontFamily: 'monospace', textTransform: 'uppercase', userSelect: 'none' }}>
              {isLive ? 'Live' : 'Connected'}
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', background: 'var(--r-rail)', borderRadius: '7px', padding: '3px', display: 'flex', gap: '0', border: '1px solid var(--r-border-soft)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                style={{ position: 'relative', padding: '4px 15px', borderRadius: '5px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: isActive ? 500 : 400, color: isActive ? 'var(--r-text)' : 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', letterSpacing: '-0.01em', transition: 'color 0.12s ease', outline: 'none', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--r-surface)', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)', transition: 'all 0.15s ease' }} />
                )}
                {isActive && (
                  <span style={{ position: 'relative', zIndex: 1, width: '4px', height: '4px', borderRadius: '50%', background: tab.dot, flexShrink: 0, display: 'inline-block' }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', minWidth: '160px', justifyContent: 'flex-end' }}>
          {onThemeToggle && (
            <IconBtn title={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={onThemeToggle}>
              {theme === 'dark' ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.2" /><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M10.01 3.99l-1.06 1.06M3.99 10.01l-1.06 1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M12 7.5A5.5 5.5 0 016.5 2 5.5 5.5 0 1012 7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
              )}
            </IconBtn>
          )}
          <div style={{ width: '1px', height: '16px', background: 'var(--r-border)', margin: '0 4px' }} />
          <IconBtn title="Search"><Search size={12} strokeWidth={1.6} /></IconBtn>
          <div style={{ position: 'relative' }}>
            <IconBtn title="Notifications"><Bell size={12} strokeWidth={1.6} /></IconBtn>
            <span style={{ position: 'absolute', top: '8px', right: '7px', width: '3px', height: '3px', borderRadius: '50%', background: 'var(--r-pulse)', pointerEvents: 'none' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 6px 3px 4px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', marginLeft: '2px', transition: 'background 0.1s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--r-rail)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'linear-gradient(135deg, #D4CFC9 0%, #B8B3AC 100%)', flexShrink: 0 }} />
            <ChevronDown size={10} color="var(--r-dim)" strokeWidth={1.6} />
          </button>
        </div>
      </header>
    </>
  );
}
