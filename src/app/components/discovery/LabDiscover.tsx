/**
 * RUBERRA Lab — Discovery Home (no motion/react)
 */
import {
  Search, BarChart2, Code2, FileSearch, Database, Layers,
} from 'lucide-react';
import { R } from '../tokens';
import { CollectionCard, ExperimentCard, SignalCard } from '../ContentCard';
import { DiscoveryRail, FeaturedHero } from '../DiscoveryRail';
import { type NavFn } from '../shell-types';
import { LAB_DOMAINS } from '../product-data';

const activeExperiments = [
  { id: 1, navId: 'exp-raft',  title: 'Distributed Consensus Failure Modes',    type: 'Research',  domain: 'Systems Engineering', tools: ['Analysis','Research'], complexity: 'High'   as const, pattern: 'dots' as const },
  { id: 2, navId: 'exp-cqrs',  title: 'CQRS vs Event Sourcing: Trade-off Matrix', type: 'Analysis',  domain: 'Architecture',        tools: ['Compare','Audit'],    complexity: 'Medium' as const, pattern: 'grid' as const },
];

const experimentTemplates = [
  { id: 3, navId: 'exp-replica', title: 'Read Replica Diminishing Returns',  type: 'Experiment', domain: 'Distributed Systems', tools: ['Simulate','Code'],      complexity: 'Medium' as const, pattern: 'lines' as const },
  { id: 4, navId: 'exp-rag',     title: 'RAG vs Fine-tuning Decision Matrix',  type: 'Analysis',   domain: 'AI Systems',           tools: ['Framework','Analysis'], complexity: 'High'   as const, pattern: 'dots'  as const },
  { id: 5, navId: 'exp-slo',     title: 'SLO Definition & Error Budget',       type: 'Framework',  domain: 'Reliability',          tools: ['Framework','Analysis'], complexity: 'Low'    as const, pattern: 'solid' as const },
  { id: 6, navId: 'exp-chaos',   title: 'Chaos Experiment Design',              type: 'Experiment', domain: 'Reliability',          tools: ['Simulate','Research'],  complexity: 'High'   as const, pattern: 'grid'  as const },
];

const toolEcosystem = [
  { id: 't1', title: 'Research Engine',   subtitle: 'Search, synthesize, cross-reference', itemCount: 8,  icon: <Search    size={14} color={R.lab} strokeWidth={1.5} /> },
  { id: 't2', title: 'Code Lab',          subtitle: 'Write, run, debug in isolation',       itemCount: 12, icon: <Code2     size={14} color={R.lab} strokeWidth={1.5} /> },
  { id: 't3', title: 'Analysis Suite',    subtitle: 'Evidence, patterns, insights',         itemCount: 6,  icon: <BarChart2 size={14} color={R.lab} strokeWidth={1.5} /> },
  { id: 't4', title: 'Audit Framework',   subtitle: 'Verify, review, source-check',         itemCount: 5,  icon: <FileSearch size={14} color={R.lab} strokeWidth={1.5} /> },
  { id: 't5', title: 'Data Connectors',   subtitle: 'DB, APIs, live feeds',                 itemCount: 9,  icon: <Database  size={14} color={R.lab} strokeWidth={1.5} /> },
];

const signals = [
  { id: 's1', domainId: 'dist-systems', signal: 'Event-driven architectures show 3.4× lower operational coupling in systems above 50 service boundaries, compared to RPC-first designs.', source: 'ACM Queue',   category: 'Architecture', recency: '2d ago', relevance: 'High'   as const },
  { id: 's2', domainId: 'dist-systems', signal: 'Raft consensus latency under leader failure exceeds Paxos by a predictable 1.5–2× election timeout window — a known and acceptable trade-off.',                    source: 'OSDI Paper', category: 'Consensus',    recency: '4d ago', relevance: 'High'   as const },
  { id: 's3', domainId: 'reliability',  signal: 'Service meshes introduce ~0.5ms of overhead per hop in mTLS mode. Teams adopting sidecar injection report 12% increase in debuggability.',                       source: 'CNCF Report',category: 'Observability',recency: '1w ago', relevance: 'Medium' as const },
  { id: 's4', domainId: 'data-arch',    signal: 'Read replicas beyond the third replica provide diminishing returns in eventual consistency scenarios with <300ms acceptable staleness.',                         source: 'Benchmark',  category: 'Data',         recency: '5d ago', relevance: 'Medium' as const },
];

export function LabDiscover({ onStartSession, navigate }: { onStartSession: () => void; navigate: NavFn }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: '24px', paddingBottom: '40px', background: R.ground, scrollbarWidth: 'none' }}>
      <FeaturedHero
        label="ACTIVE INVESTIGATION" badge="Open"
        title="Distributed Consensus Failure Modes"
        description="Analyzing failure taxonomy in Raft and Paxos under asymmetric partitions. Current context: 3 sources loaded, 2 hypotheses pending verification."
        meta="Research · Distributed Systems · Started 2h ago · 14 context items"
        accent={R.lab} accentLight={R.labLight}
        ctaLabel="Continue investigation" onCta={() => navigate('lab', 'experiment', 'exp-raft')}
        secondaryLabel="New session" onSecondary={onStartSession}
        stats={[{ label: 'Open sessions', value: '3' }, { label: 'Artifacts', value: '12' }, { label: 'Findings', value: '7' }]}
      />
      <DiscoveryRail label="Active Investigations" sublabel="Your open sessions" action={{ label: 'View archive', onClick: () => navigate('lab', 'archive') }}>
        {activeExperiments.map(e => <ExperimentCard key={e.id} title={e.title} type={e.type} domain={e.domain} tools={e.tools} complexity={e.complexity} pattern={e.pattern} onClick={() => navigate('lab', 'experiment', e.navId)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Signals" sublabel="High-relevance findings from active research areas" action={{ label: 'Start Analysis', onClick: () => navigate('lab', 'analysis') }} gap={10}>
        {signals.map(s => <SignalCard key={s.id} signal={s.signal} source={s.source} category={s.category} recency={s.recency} relevance={s.relevance} onClick={() => navigate('lab', 'domain', s.domainId)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Experiment Templates" sublabel="Structured investigation frameworks" action={{ label: 'Browse all', onClick: () => navigate('lab', 'archive') }}>
        {experimentTemplates.map(e => <ExperimentCard key={e.id} title={e.title} type={e.type} domain={e.domain} tools={e.tools} complexity={e.complexity} pattern={e.pattern} onClick={() => navigate('lab', 'experiment', e.navId)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Tool Ecosystem" sublabel="Lab-native investigation surfaces" action={{ label: 'Code surface', onClick: () => navigate('lab', 'code') }} gap={10}>
        {toolEcosystem.map(t => <CollectionCard key={t.id} title={t.title} subtitle={t.subtitle} itemCount={t.itemCount} accent={R.lab} accentLight={R.labLight} tag="Tool" icon={t.icon} onClick={onStartSession} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Research Domains" sublabel="Domain knowledge clusters — click to explore" action={{ label: 'All domains', onClick: () => navigate('lab', 'archive') }} gap={10}>
        {LAB_DOMAINS.map(d => <CollectionCard key={d.id} title={d.label} subtitle={d.tagline.slice(0, 60)} itemCount={d.researchCount} accent={R.lab} accentLight={R.labLight} tag="Domain" icon={<Layers size={14} color={R.lab} strokeWidth={1.5} />} onClick={() => navigate('lab', 'domain', d.id)} />)}
      </DiscoveryRail>
    </div>
  );
}
