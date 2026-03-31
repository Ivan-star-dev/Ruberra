/**
 * RUBERRA School — Discovery Home (no motion/react)
 */
import { Layers } from 'lucide-react';
import { R } from '../tokens';
import { CollectionCard, CourseCard, RoleCard } from '../ContentCard';
import { DiscoveryRail, FeaturedHero } from '../DiscoveryRail';
import { type NavFn } from '../shell-types';
import { SCHOOL_TRACKS, SCHOOL_ROLES } from '../product-data';

const continueCourses = [
  { id: 1, trackId: 'ai-engineering',   title: 'AI Systems Engineering',    type: 'Track', lessons: 9, duration: '5h 20m', level: 'Expert',   progress: 44, pattern: 'grid'  as const },
  { id: 2, trackId: 'distributed-arch', title: 'Distributed Architecture', type: 'Track', lessons: 8, duration: '4h 40m', level: 'Advanced', progress: 25, pattern: 'lines' as const },
];

const recommendedCourses = [
  { id: 3, trackId: 'security-crypto',     title: 'Security & Cryptography',  type: 'Track', lessons: 7,  duration: '4h 10m', level: 'Expert',   pattern: 'dots'  as const },
  { id: 4, trackId: 'data-science',        title: 'Data Science & ML',        type: 'Track', lessons: 10, duration: '6h 20m', level: 'Advanced', pattern: 'grid'  as const },
  { id: 5, trackId: 'product-engineering', title: 'Product Engineering',      type: 'Track', lessons: 7,  duration: '3h 50m', level: 'Advanced', pattern: 'lines' as const },
  { id: 6, trackId: 'research-methods',    title: 'Research Methodology',     type: 'Track', lessons: 6,  duration: '3h 30m', level: 'Advanced', pattern: 'dots'  as const },
];

const deepStudyAreas = [
  { id: 'd1', trackId: 'distributed-arch', title: 'CAP Theorem Revisited',    type: 'Deep Study',        lessons: 3, duration: '1h 10m', level: 'Expert',   pattern: 'dots'  as const },
  { id: 'd2', trackId: 'distributed-arch', title: 'Consensus Algorithms',     type: 'Deep Study',        lessons: 4, duration: '2h',     level: 'Expert',   pattern: 'grid'  as const },
  { id: 'd3', trackId: 'ai-engineering',   title: 'LLM Evaluation Frameworks', type: 'Visual Explainer', lessons: 2, duration: '40m',    level: 'Advanced', pattern: 'lines' as const },
];

export function SchoolDiscover({ onEnterLesson, navigate }: { onEnterLesson: () => void; navigate: NavFn }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: '24px', paddingBottom: '40px', background: R.ground, scrollbarWidth: 'none' }}>
      <FeaturedHero
        label="CONTINUE LEARNING" badge="In Progress"
        title="AI Systems Engineering"
        description="Lesson 3 of 9 — Evaluation Frameworks for LLMs. Learn how to build principled evaluation infrastructure for language model quality and safety."
        meta="AI Systems Engineering · Lesson 3 · 44% complete"
        accent={R.school} accentLight={R.schoolLight}
        ctaLabel="Resume lesson"     onCta={() => navigate('school', 'lesson', 'lesson-evals')}
        secondaryLabel="View curriculum" onSecondary={() => navigate('school', 'track', 'ai-engineering')}
        stats={[{ label: 'Lessons done', value: '2' }, { label: 'Tracks active', value: '2' }, { label: 'Progress', value: '44%' }]}
      />
      <DiscoveryRail label="Continue Learning" sublabel="Pick up where you left off" action={{ label: 'All tracks', onClick: () => navigate('school', 'browse') }}>
        {continueCourses.map(c => <CourseCard key={c.id} title={c.title} type={c.type} lessons={c.lessons} duration={c.duration} level={c.level} progress={c.progress} pattern={c.pattern} onClick={() => navigate('school', 'track', c.trackId)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Recommended for You" sublabel="Based on your learning path" action={{ label: 'See all', onClick: () => navigate('school', 'browse') }}>
        {recommendedCourses.map(c => <CourseCard key={c.id} title={c.title} type={c.type} lessons={c.lessons} duration={c.duration} level={c.level} pattern={c.pattern} onClick={() => navigate('school', 'track', c.trackId)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Learning Tracks" sublabel="Curated progression paths" action={{ label: 'Browse all tracks', onClick: () => navigate('school', 'browse') }} gap={10}>
        {SCHOOL_TRACKS.map(t => <CollectionCard key={t.id} title={t.title} subtitle={t.tagline.slice(0, 55)} itemCount={t.lessonCount} accent={R.school} accentLight={R.schoolLight} tag="Track" icon={<Layers size={14} color={R.school} strokeWidth={1.5} />} onClick={() => navigate('school', 'track', t.id)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Future Role Tracks" sublabel="AI-era careers and pathways" action={{ label: 'Explore all roles', onClick: () => navigate('school', 'browse') }}>
        {SCHOOL_ROLES.map(r => <RoleCard key={r.id} role={r.title} domain={r.domain} skills={r.skills} demand={r.demand} onClick={() => navigate('school', 'role', r.id)} />)}
      </DiscoveryRail>
      <DiscoveryRail label="Deep Study" sublabel="Expert-grade deep dives" action={{ label: 'View library', onClick: () => navigate('school', 'library') }}>
        {deepStudyAreas.map(c => <CourseCard key={c.id} title={c.title} type={c.type} lessons={c.lessons} duration={c.duration} level={c.level} pattern={c.pattern} onClick={() => navigate('school', 'track', c.trackId)} />)}
      </DiscoveryRail>
    </div>
  );
}
