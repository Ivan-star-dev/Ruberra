/**
 * RUBERRA Creation — Discovery Home (no motion/react)
 */
import { FileText, Zap, Package, DollarSign, Rocket, Type, Code2, Globe, Briefcase, Layers } from 'lucide-react';
import { R } from '../tokens';
import { BlueprintCard, CollectionCard } from '../ContentCard';
import { DiscoveryRail, FeaturedHero } from '../DiscoveryRail';
import { type NavFn } from '../shell-types';
import { CREATION_BLUEPRINTS, CREATION_ENGINES } from '../product-data';

const recentDrafts = [
  { id: 1, blueprintId: 'ai-agent',     title: 'AI Agent Orchestration System', type: 'Blueprint', outputType: 'System', description: 'End-to-end AI agent blueprint from prompt design to production.', tags: ['AI','Agents'],        pattern: 'lines' as const },
  { id: 2, blueprintId: 'tech-deep-dive',title: 'Technical Deep-Dive Essay',    type: 'Blueprint', outputType: 'Prose',  description: 'Structured template for long-form technical analysis.',        tags: ['Prose','Expert'],      pattern: 'grid'  as const },
];

const bpPatterns: Record<string, 'lines' | 'grid' | 'dots' | 'solid'> = {
  'ai-agent': 'lines', 'event-driven': 'grid', 'api-gateway': 'dots', 'data-pipeline': 'solid', 'ai-interface': 'lines', 'tech-deep-dive': 'grid', 'exec-brief': 'dots',
};

const engineIcons: Record<string, React.ReactNode> = {
  'prose-engine':  <Type   size={14} color={R.creation} strokeWidth={1.5} />,
  'code-gen':      <Code2  size={14} color={R.creation} strokeWidth={1.5} />,
  'visual-engine': <Layers size={14} color={R.creation} strokeWidth={1.5} />,
  'web-copy':      <Globe  size={14} color={R.creation} strokeWidth={1.5} />,
};

const monetizationPaths = [
  { id: 'm1', blueprintId: 'tech-deep-dive', title: 'Digital Product System',      subtitle: 'Ebook, course, toolkit, prompt pack',   itemCount: 14, icon: <Package    size={14} color={R.creation} strokeWidth={1.5} /> },
  { id: 'm2', blueprintId: 'exec-brief',     title: 'Freelance Service Packaging', subtitle: 'Proposals, offers, deliverables',        itemCount: 9,  icon: <Briefcase  size={14} color={R.creation} strokeWidth={1.5} /> },
  { id: 'm3', blueprintId: null,             title: 'Creator Revenue Engine',      subtitle: 'Content monetization systems',           itemCount: 11, icon: <DollarSign size={14} color={R.creation} strokeWidth={1.5} /> },
  { id: 'm4', blueprintId: null,             title: 'Launch Canvas',               subtitle: 'Go-to-market build framework',           itemCount: 7,  icon: <Rocket     size={14} color={R.creation} strokeWidth={1.5} /> },
];

const artifactPacks = [
  { id: 'ap1', title: 'Prompt Library',    type: 'Blueprint', outputType: 'Prompts',  description: '80+ high-leverage prompts organized by use case, role, and domain.', tags: ['Prompts','Toolkit'],     pattern: 'grid'  as const },
  { id: 'ap2', title: 'Brand Voice Kit',   type: 'Blueprint', outputType: 'Brand',    description: 'Tone, style, language system, and vocabulary for consistent brand voice.', tags: ['Brand','Copy'],     pattern: 'lines' as const },
  { id: 'ap3', title: 'SOP Template Pack', type: 'Blueprint', outputType: 'Document', description: 'Standard operating procedure templates for solo operators and teams.',  tags: ['Document','Operations'],pattern: 'dots'  as const },
];

export function CreationDiscover({ onEnterGenerator, navigate }: { onEnterGenerator: () => void; navigate: NavFn }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: '24px', paddingBottom: '40px', background: R.ground, scrollbarWidth: 'none' }}>
      <FeaturedHero
        label="CURRENT BUILD" badge="Draft"
        title="AI Agent Orchestration System"
        description="End-to-end blueprint for building an AI agent system — from prompt design to tool use, memory, and evaluation infrastructure."
        meta="AI Systems · Blueprint · 5 steps · Started today"
        accent={R.creation} accentLight={R.creationLight}
        ctaLabel="Continue build"  onCta={() => navigate('creation', 'blueprint', 'ai-agent')}
        secondaryLabel="New creation" onSecondary={() => navigate('creation', 'terminal')}
        stats={[{ label: 'Drafts', value: '3' }, { label: 'Exported', value: '1' }, { label: 'Words today', value: '1.2k' }]}
      />
      <DiscoveryRail label="Recent Drafts" sublabel="Your active builds" action={{ label: 'View archive', onClick: () => navigate('creation', 'archive') }}>
        {recentDrafts.map(d => <BlueprintCard key={d.id} title={d.title} type={d.type} outputType={d.outputType} description={d.description} tags={d.tags} pattern={d.pattern} onClick={() => navigate('creation', 'blueprint', d.blueprintId)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Blueprints" sublabel="Structured creation frameworks" action={{ label: 'All blueprints', onClick: () => navigate('creation', 'archive') }}>
        {CREATION_BLUEPRINTS.map(b => <BlueprintCard key={b.id} title={b.title} type="Blueprint" outputType={b.outputType} description={b.desc} tags={b.tags} pattern={bpPatterns[b.id] ?? 'dots'} onClick={() => navigate('creation', 'blueprint', b.id)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Content Engines" sublabel="Output-native generation surfaces" action={{ label: 'Build surface', onClick: () => navigate('creation', 'terminal') }} gap={10}>
        {CREATION_ENGINES.map(e => <CollectionCard key={e.id} title={e.title} subtitle={e.desc} itemCount={e.templateCount} accent={R.creation} accentLight={R.creationLight} tag="Engine" icon={engineIcons[e.id] ?? <FileText size={14} color={R.creation} strokeWidth={1.5} />} onClick={() => navigate('creation', 'engine', e.id)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Monetization Paths" sublabel="Turn output into revenue systems" action={{ label: 'Open Build', onClick: () => navigate('creation', 'terminal') }} gap={10}>
        {monetizationPaths.map(m => <CollectionCard key={m.id} title={m.title} subtitle={m.subtitle} itemCount={m.itemCount} accent={R.creation} accentLight={R.creationLight} tag="Path" icon={m.icon} onClick={() => navigate('creation', 'blueprint', m.blueprintId ?? 'exec-brief')} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Artifact Packs" sublabel="Reusable creation assets" action={{ label: 'View archive', onClick: () => navigate('creation', 'archive') }}>
        {artifactPacks.map(a => <BlueprintCard key={a.id} title={a.title} type={a.type} outputType={a.outputType} description={a.description} tags={a.tags} pattern={a.pattern} onClick={() => navigate('creation', 'terminal')} />)}
      </DiscoveryRail>
    </div>
  );
}
