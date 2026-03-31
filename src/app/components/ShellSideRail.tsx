import { type Tab, type Message, type SignalStatus, type LabView, type SchoolView, type CreationView, type NavFn } from './shell-types';

interface ShellSideRailProps {
  activeTab:      Tab;
  messages:       Record<Tab, Message[]>;
  signals:        Record<Tab, SignalStatus>;
  labView:        LabView;
  schoolView:     SchoolView;
  creationView:   CreationView;
  onLabView:      (v: LabView) => void;
  onSchoolView:   (v: SchoolView) => void;
  onCreationView: (v: CreationView) => void;
  onNewNote:      () => void;
  onClearTab:     (tab: Tab) => void;
  navigate:       NavFn;
}

const ALL_TABS: Tab[] = ['lab', 'school', 'creation'];
const TAB_ACCENT: Record<Tab, string> = { lab: 'var(--r-accent)', school: 'var(--r-ok)', creation: 'var(--r-warn)' };

function SLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.13em', fontWeight: 600, color: 'var(--r-dim)', marginBottom: '5px', paddingLeft: '1px', fontFamily: 'monospace', userSelect: 'none' }}>{children}</p>;
}

function NavBtn({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void; }) {
  return (
    <button onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 7px', borderRadius: '4px', border: 'none', background: active ? 'var(--r-border-soft)' : 'transparent', color: active ? 'var(--r-text)' : 'var(--r-subtext)', cursor: 'pointer', textAlign: 'left', fontSize: '11px', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: active ? 500 : 400, outline: 'none', transition: 'background 0.1s ease', marginBottom: '1px' }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--r-border-soft)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <span style={{ color: active ? 'var(--r-accent)' : 'var(--r-dim)', flexShrink: 0, display: 'flex', opacity: active ? 1 : 0.8 }}>{icon}</span>
      {label}
    </button>
  );
}

function Divider() { return <div style={{ height: '1px', background: 'var(--r-border-soft)', margin: '0' }} />; }

function StatusDot({ status }: { status: SignalStatus }) {
  const color = status === 'streaming' ? 'var(--r-accent)' : status === 'completed' ? 'var(--r-ok)' : status === 'error' ? 'var(--r-err)' : 'var(--r-dim)';
  return <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

function SMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5px 1px' }}>
      <span style={{ fontSize: '9px', color: 'var(--r-dim)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontSize: '9px', color: 'var(--r-subtext)', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

function LabRail({ view, onView, messages, signal, navigate: _navigate }: { view: LabView; onView: (v: LabView) => void; messages: Message[]; signal: SignalStatus; navigate: NavFn; }) {
  const history = messages.filter(m => m.role === 'user').slice().reverse().slice(0, 5);
  return (
    <>
      <section style={{ padding: '11px 10px 10px' }}>
        <SLabel>Navigate</SLabel>
        <NavBtn label="Home"     active={view === 'home'}     onClick={() => onView('home')}     icon={<IHome />} />
        <NavBtn label="Chat"     active={view === 'chat'}     onClick={() => onView('chat')}     icon={<IChat />} />
        <NavBtn label="Analysis" active={view === 'analysis'} onClick={() => onView('analysis')} icon={<IAnalysis />} />
        <NavBtn label="Code"     active={view === 'code'}     onClick={() => onView('code')}     icon={<ICode />} />
        <NavBtn label="Archive"  active={view === 'archive'}  onClick={() => onView('archive')}  icon={<IArchive />} />
      </section>
      <Divider />
      <section style={{ padding: '10px 10px', flex: 1, overflowY: 'auto' }}>
        <SLabel>Session</SLabel>
        {history.length === 0 ? <p style={{ fontSize: '10px', color: 'var(--r-dim)', paddingLeft: '1px', fontFamily: "'Inter', system-ui, sans-serif" }}>—</p>
          : history.map(m => (
            <button key={m.id} onClick={() => onView('chat')} title={m.content}
              style={{ width: '100%', display: 'block', fontSize: '10px', color: 'var(--r-subtext)', padding: '3px 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', system-ui, sans-serif", background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', outline: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--r-text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--r-subtext)'; }}
            >{m.content.slice(0, 38)}{m.content.length > 38 ? '…' : ''}</button>
          ))}
      </section>
      <Divider />
      <section style={{ padding: '9px 10px' }}>
        <SLabel>Kernel</SLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '1px', marginBottom: '4px' }}>
          <StatusDot status={signal} />
          <span style={{ fontSize: '10px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'capitalize' }}>{signal}</span>
        </div>
        <SMeta label="exchanges" value={String(messages.filter(m => m.role === 'assistant' && m.content.length > 0).length)} />
      </section>
    </>
  );
}

function SchoolRail({ view, onView, messages, signal, navigate: _navigate }: { view: SchoolView; onView: (v: SchoolView) => void; messages: Message[]; signal: SignalStatus; navigate: NavFn; }) {
  const history = messages.filter(m => m.role === 'user').slice().reverse().slice(0, 5);
  return (
    <>
      <section style={{ padding: '11px 10px 10px' }}>
        <SLabel>Navigate</SLabel>
        <NavBtn label="Home"    active={view === 'home'}    onClick={() => onView('home')}    icon={<IHome />} />
        <NavBtn label="Chat"    active={view === 'chat'}    onClick={() => onView('chat')}    icon={<IChat />} />
        <NavBtn label="Roles"   active={view === 'browse'}  onClick={() => onView('browse')}  icon={<IRole />} />
        <NavBtn label="Library" active={view === 'library'} onClick={() => onView('library')} icon={<ILibrary />} />
        <NavBtn label="Archive" active={view === 'archive'} onClick={() => onView('archive')} icon={<IArchive />} />
      </section>
      <Divider />
      <section style={{ padding: '10px 10px', flex: 1, overflowY: 'auto' }}>
        <SLabel>Queries</SLabel>
        {history.length === 0 ? <p style={{ fontSize: '10px', color: 'var(--r-dim)', paddingLeft: '1px', fontFamily: "'Inter', system-ui, sans-serif" }}>—</p>
          : history.map(m => (
            <button key={m.id} onClick={() => onView('chat')} title={m.content}
              style={{ width: '100%', display: 'block', fontSize: '10px', color: 'var(--r-subtext)', padding: '3px 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', system-ui, sans-serif", background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', outline: 'none' }}
            >{m.content.slice(0, 38)}{m.content.length > 38 ? '…' : ''}</button>
          ))}
      </section>
      <Divider />
      <section style={{ padding: '9px 10px' }}>
        <SLabel>Status</SLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '1px' }}>
          <StatusDot status={signal} />
          <span style={{ fontSize: '10px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'capitalize' }}>{signal}</span>
        </div>
      </section>
    </>
  );
}

function CreationRail({ view, onView, messages, signal, navigate: _navigate }: { view: CreationView; onView: (v: CreationView) => void; messages: Message[]; signal: SignalStatus; navigate: NavFn; }) {
  const artifacts = messages.filter(m => m.role === 'assistant' && m.content.length > 0).slice().reverse().slice(0, 5);
  return (
    <>
      <section style={{ padding: '11px 10px 10px' }}>
        <SLabel>Navigate</SLabel>
        <NavBtn label="Home"    active={view === 'home'}     onClick={() => onView('home')}     icon={<IHome />} />
        <NavBtn label="Chat"    active={view === 'chat'}     onClick={() => onView('chat')}     icon={<IChat />} />
        <NavBtn label="Build"   active={view === 'terminal'} onClick={() => onView('terminal')} icon={<ITerminal />} />
        <NavBtn label="Archive" active={view === 'archive'}  onClick={() => onView('archive')}  icon={<IArchive />} />
      </section>
      <Divider />
      <section style={{ padding: '10px 10px', flex: 1, overflowY: 'auto' }}>
        <SLabel>Artifacts</SLabel>
        {artifacts.length === 0 ? <p style={{ fontSize: '10px', color: 'var(--r-dim)', paddingLeft: '1px', fontFamily: "'Inter', system-ui, sans-serif" }}>—</p>
          : artifacts.map(m => (
            <button key={m.id} onClick={() => onView('chat')} title={m.content}
              style={{ width: '100%', display: 'block', fontSize: '10px', color: 'var(--r-subtext)', padding: '3px 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', system-ui, sans-serif", background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', outline: 'none' }}
            >{m.content.slice(0, 38)}{m.content.length > 38 ? '…' : ''}</button>
          ))}
      </section>
      <Divider />
      <section style={{ padding: '9px 10px' }}>
        <SLabel>Forge</SLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '1px', marginBottom: '4px' }}>
          <StatusDot status={signal} />
          <span style={{ fontSize: '10px', color: 'var(--r-subtext)', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'capitalize' }}>{signal}</span>
        </div>
        <SMeta label="outputs" value={String(artifacts.length)} />
      </section>
    </>
  );
}

export function ShellSideRail({ activeTab, messages, signals, labView, schoolView, creationView, onLabView, onSchoolView, onCreationView, onNewNote, onClearTab, navigate }: ShellSideRailProps) {
  const accent = TAB_ACCENT[activeTab];
  return (
    <aside style={{ width: '184px', flexShrink: 0, borderRight: '1px solid var(--r-border)', background: 'var(--r-rail)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'background 0.2s ease' }}>
      <div style={{ padding: '10px 11px 9px', borderBottom: '1px solid var(--r-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color: 'var(--r-text)', fontFamily: 'monospace', userSelect: 'none' }}>{activeTab}</span>
        </div>
        <button onClick={onNewNote} title="New floating note"
          style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--r-dim)', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none', padding: '2px 3px', borderRadius: '3px', letterSpacing: '0.04em', transition: 'color 0.1s ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--r-subtext)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--r-dim)'; }}
        >+ note</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'lab'      && <LabRail      view={labView}      onView={onLabView}      messages={messages.lab}      signal={signals.lab}      navigate={navigate} />}
        {activeTab === 'school'   && <SchoolRail   view={schoolView}   onView={onSchoolView}   messages={messages.school}   signal={signals.school}   navigate={navigate} />}
        {activeTab === 'creation' && <CreationRail view={creationView} onView={onCreationView} messages={messages.creation} signal={signals.creation} navigate={navigate} />}
      </div>

      <div style={{ borderTop: '1px solid var(--r-border)', padding: '8px 10px 7px' }}>
        <SLabel>Sessions</SLabel>
        {ALL_TABS.map(tab => {
          const count = messages[tab].filter(m => m.role === 'assistant' && m.content.length > 0).length;
          const isActive = tab === activeTab;
          return (
            <div key={tab} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 1px', marginBottom: '1px' }}>
              <span style={{ fontSize: '10px', fontFamily: "'Inter', system-ui, sans-serif", color: isActive ? 'var(--r-text)' : 'var(--r-subtext)', textTransform: 'capitalize', fontWeight: isActive ? 500 : 400 }}>{tab}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isActive ? TAB_ACCENT[tab] : 'var(--r-dim)' }}>{count > 0 ? count : '—'}</span>
                {count > 0 && (
                  <button onClick={() => onClearTab(tab)} title={`Clear ${tab}`}
                    style={{ fontSize: '8px', color: 'var(--r-dim)', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none', lineHeight: 1, padding: '1px', borderRadius: '2px', opacity: 0.6, transition: 'opacity 0.1s ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
                  >✕</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '5px 11px 7px', borderTop: '1px solid var(--r-border-soft)' }}>
        <span style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.10em', color: 'var(--r-dim)', textTransform: 'uppercase', userSelect: 'none' }}>
          mode · <span style={{ color: accent }}>{activeTab}</span>
        </span>
      </div>
    </aside>
  );
}

function IChat()     { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 1h10v7H7l-3 2.5V8H1V1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /></svg>; }
function IAnalysis() { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 10l3-4 2.5 2L9 4l2 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ICode()     { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3.5 3.5L1 6l2.5 2.5M8.5 3.5L11 6l-2.5 2.5M6.5 2.5l-1 7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function IArchive()  { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="3" rx=".5" stroke="currentColor" strokeWidth="1.1" /><path d="M1.5 4v6.5h9V4" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /><path d="M4.5 7h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>; }
function ILibrary()  { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 2h2v8H1zM5 2h2v8H5zM9 2l2 1v7l-2-1V2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /></svg>; }
function ITerminal() { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="1.5" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.1" /><path d="M3 5l2 1.5L3 8M6.5 8h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function IHome()    { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 5.5L6 1l5 4.5V11H7.5V8h-3v3H1V5.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /></svg>; }
function IRole()    { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.1" /><path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>; }
