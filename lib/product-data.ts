/**
 * RUBERRA Product Data — connected object graph
 * Every object links to other objects across chambers.
 */

export interface LabDomain {
  id: string; label: string; tagline: string; researchCount: number;
  linkedTracks: string[]; linkedBlueprints: string[]; experiments: LabExperiment[];
}
export interface LabExperiment {
  id: string; domainId: string; title: string; desc: string; type: string;
  complexity: "Low" | "Medium" | "High"; tools: string[];
  linkedLessons: string[]; linkedBlueprints: string[];
}

export const LAB_DOMAINS: LabDomain[] = [
  {
    id: "dist-systems", label: "Distributed Systems",
    tagline: "Consensus, fault tolerance, data replication, CAP theorem.",
    researchCount: 38, linkedTracks: ["distributed-arch", "ai-engineering"], linkedBlueprints: ["event-driven", "api-gateway"],
    experiments: [
      { id: "exp-raft",    domainId: "dist-systems", title: "Raft Consensus Failure Modes",      desc: "Analyzing leader election behavior under asymmetric network partitions.",             type: "Research",   complexity: "High",   tools: ["Analysis", "Simulate"], linkedLessons: ["lesson-cap", "lesson-raft"],   linkedBlueprints: ["event-driven"] },
      { id: "exp-cqrs",   domainId: "dist-systems", title: "CQRS vs Event Sourcing Trade-offs", desc: "Comparative analysis of write model separation strategies at scale.",                 type: "Analysis",   complexity: "Medium", tools: ["Compare", "Audit"],     linkedLessons: ["lesson-eventsource"],        linkedBlueprints: ["event-driven", "api-gateway"] },
      { id: "exp-replica",domainId: "dist-systems", title: "Read Replica Diminishing Returns",  desc: "Empirical study on replication count vs consistency latency trade-offs.",            type: "Experiment", complexity: "Medium", tools: ["Simulate", "Analysis"], linkedLessons: ["lesson-consistency"],        linkedBlueprints: ["data-pipeline"] },
    ],
  },
  {
    id: "ai-systems", label: "AI Systems Architecture",
    tagline: "LLM serving, inference optimization, RAG, orchestration.",
    researchCount: 27, linkedTracks: ["ai-engineering", "product-engineering"], linkedBlueprints: ["ai-agent", "ai-interface"],
    experiments: [
      { id: "exp-rag",    domainId: "ai-systems", title: "RAG vs Fine-tuning Decision Matrix",  desc: "When to retrieval-augment vs fine-tune — structured decision framework.",             type: "Analysis",   complexity: "High",   tools: ["Framework", "Analysis"], linkedLessons: ["lesson-llm", "lesson-rag"],   linkedBlueprints: ["ai-agent"] },
      { id: "exp-llmops", domainId: "ai-systems", title: "LLM Serving Latency Audit",           desc: "Systematic audit of inference serving latency across model sizes and backends.",      type: "Audit",      complexity: "High",   tools: ["Audit", "Code"],         linkedLessons: ["lesson-llmops"],             linkedBlueprints: ["ai-agent", "ai-interface"] },
      { id: "exp-evals",  domainId: "ai-systems", title: "Evaluation Harness Design",           desc: "Build a principled evaluation framework for LLM output quality and safety.",         type: "Research",   complexity: "Medium", tools: ["Research", "Code"],      linkedLessons: ["lesson-evals"],              linkedBlueprints: ["ai-agent"] },
    ],
  },
  {
    id: "cryptography", label: "Cryptography & Security",
    tagline: "Zero-knowledge proofs, secure MPC, applied cryptography.",
    researchCount: 19, linkedTracks: ["security-crypto", "distributed-arch"], linkedBlueprints: ["api-gateway"],
    experiments: [
      { id: "exp-zk",  domainId: "cryptography", title: "Zero-Knowledge Proof Applications", desc: "Survey of ZK-SNARK and ZK-STARK applications in production systems.",              type: "Research", complexity: "High", tools: ["Research", "Analysis"], linkedLessons: ["lesson-zk"],     linkedBlueprints: ["api-gateway"] },
      { id: "exp-mpc", domainId: "cryptography", title: "Secure Multi-Party Computation",    desc: "Practical limitations and use cases of MPC in privacy-preserving computation.",     type: "Analysis", complexity: "High", tools: ["Research", "Analysis"], linkedLessons: ["lesson-crypto"], linkedBlueprints: [] },
    ],
  },
  {
    id: "data-arch", label: "Data Architecture",
    tagline: "Lakehouses, data mesh, pipelines, streaming.",
    researchCount: 31, linkedTracks: ["data-science", "distributed-arch"], linkedBlueprints: ["data-pipeline"],
    experiments: [
      { id: "exp-mesh",   domainId: "data-arch", title: "Data Mesh vs Data Lake",           desc: "Organizational and technical trade-offs between domain-oriented vs centralized data.", type: "Analysis",   complexity: "Medium", tools: ["Compare", "Framework"], linkedLessons: ["lesson-data-mesh"],  linkedBlueprints: ["data-pipeline"] },
      { id: "exp-stream", domainId: "data-arch", title: "Streaming Pipeline Failure Modes", desc: "Taxonomy of failure modes in Kafka-based streaming pipelines under high load.",       type: "Experiment", complexity: "High",   tools: ["Simulate", "Code"],     linkedLessons: ["lesson-streaming"],  linkedBlueprints: ["data-pipeline", "event-driven"] },
    ],
  },
  {
    id: "interface-eng", label: "Interface Engineering",
    tagline: "State machines, reactive systems, CRDT, interaction patterns.",
    researchCount: 16, linkedTracks: ["product-engineering"], linkedBlueprints: ["ai-interface"],
    experiments: [
      { id: "exp-crdt",   domainId: "interface-eng", title: "CRDT Conflict Resolution Patterns", desc: "Modeling collaborative editing conflicts using CRDT data structures.",      type: "Research",   complexity: "Medium", tools: ["Research", "Code"], linkedLessons: ["lesson-state"], linkedBlueprints: ["ai-interface"] },
      { id: "exp-xstate", domainId: "interface-eng", title: "State Machine UI Architecture",     desc: "Applying XState to eliminate impossible UI states in complex products.",      type: "Experiment", complexity: "Medium", tools: ["Code", "Analysis"],  linkedLessons: ["lesson-state"], linkedBlueprints: ["ai-interface"] },
    ],
  },
  {
    id: "reliability", label: "Reliability Engineering",
    tagline: "SLOs, chaos engineering, on-call posture, observability.",
    researchCount: 22, linkedTracks: ["distributed-arch", "ai-engineering"], linkedBlueprints: ["api-gateway", "event-driven"],
    experiments: [
      { id: "exp-slo",   domainId: "reliability", title: "SLO Definition & Error Budget", desc: "Systematic approach to defining SLOs that align with business reliability goals.",   type: "Framework", complexity: "Low",  tools: ["Framework", "Analysis"], linkedLessons: ["lesson-reliability"], linkedBlueprints: ["api-gateway"] },
      { id: "exp-chaos", domainId: "reliability", title: "Chaos Experiment Design",       desc: "Design principled chaos experiments that reveal real failure modes.",                  type: "Experiment",complexity: "High", tools: ["Simulate", "Research"],  linkedLessons: ["lesson-reliability"], linkedBlueprints: ["event-driven"] },
    ],
  },
];

export function getDomain(id: string) { return LAB_DOMAINS.find(d => d.id === id); }
export function getExperiment(id: string) {
  for (const d of LAB_DOMAINS) { const e = d.experiments.find(e => e.id === id); if (e) return e; }
}

export interface SchoolTrack {
  id: string; title: string; tagline: string; lessonCount: number; duration: string;
  level: "Intermediate" | "Advanced" | "Expert";
  linkedDomains: string[]; linkedBlueprints: string[]; lessons: SchoolLesson[];
}
export interface SchoolLesson {
  id: string; trackId: string; title: string; duration: string;
  status: "locked" | "available" | "in-progress" | "done";
  linkedExperiments: string[]; linkedBlueprints: string[];
}

export const SCHOOL_TRACKS: SchoolTrack[] = [
  {
    id: "ai-engineering", title: "AI Systems Engineering",
    tagline: "Build production AI systems — RAG, evals, LLM ops, serving.",
    lessonCount: 9, duration: "5h 20m", level: "Expert",
    linkedDomains: ["ai-systems", "dist-systems"], linkedBlueprints: ["ai-agent", "ai-interface"],
    lessons: [
      { id: "lesson-llm",    trackId: "ai-engineering", title: "LLM Architecture Fundamentals",    duration: "38m", status: "done",        linkedExperiments: ["exp-llmops"], linkedBlueprints: ["ai-agent"] },
      { id: "lesson-rag",    trackId: "ai-engineering", title: "RAG System Design",                duration: "44m", status: "done",        linkedExperiments: ["exp-rag"],    linkedBlueprints: ["ai-agent"] },
      { id: "lesson-evals",  trackId: "ai-engineering", title: "Evaluation Frameworks for LLMs",  duration: "36m", status: "in-progress", linkedExperiments: ["exp-evals"],  linkedBlueprints: [] },
      { id: "lesson-llmops", trackId: "ai-engineering", title: "LLM Ops & Serving Infrastructure", duration: "52m", status: "available",   linkedExperiments: ["exp-llmops"], linkedBlueprints: ["ai-agent"] },
      { id: "lesson-agents", trackId: "ai-engineering", title: "Agent Orchestration Patterns",     duration: "48m", status: "locked",      linkedExperiments: ["exp-rag"],    linkedBlueprints: ["ai-agent", "ai-interface"] },
    ],
  },
  {
    id: "distributed-arch", title: "Distributed Architecture",
    tagline: "Consensus, fault isolation, data replication, CAP theorem.",
    lessonCount: 8, duration: "4h 40m", level: "Advanced",
    linkedDomains: ["dist-systems", "reliability", "data-arch"], linkedBlueprints: ["event-driven", "api-gateway"],
    lessons: [
      { id: "lesson-cap",        trackId: "distributed-arch", title: "CAP Theorem & PACELC",             duration: "40m", status: "done",        linkedExperiments: ["exp-raft", "exp-replica"], linkedBlueprints: [] },
      { id: "lesson-raft",       trackId: "distributed-arch", title: "Raft & Paxos Consensus",           duration: "52m", status: "done",        linkedExperiments: ["exp-raft"],                linkedBlueprints: ["event-driven"] },
      { id: "lesson-eventsource",trackId: "distributed-arch", title: "Event Sourcing in Practice",       duration: "42m", status: "in-progress", linkedExperiments: ["exp-cqrs"],                linkedBlueprints: ["event-driven"] },
      { id: "lesson-consistency",trackId: "distributed-arch", title: "Consistency Models Deep Dive",     duration: "38m", status: "available",   linkedExperiments: ["exp-replica"],             linkedBlueprints: [] },
      { id: "lesson-reliability",trackId: "distributed-arch", title: "Reliability Engineering & SLOs",  duration: "34m", status: "locked",      linkedExperiments: ["exp-slo", "exp-chaos"],    linkedBlueprints: ["api-gateway"] },
    ],
  },
  {
    id: "security-crypto", title: "Security & Cryptography",
    tagline: "Applied cryptography, ZK proofs, secure system design.",
    lessonCount: 7, duration: "4h 10m", level: "Expert",
    linkedDomains: ["cryptography"], linkedBlueprints: ["api-gateway"],
    lessons: [
      { id: "lesson-crypto", trackId: "security-crypto", title: "Applied Cryptography Foundations", duration: "48m", status: "done",        linkedExperiments: ["exp-mpc"], linkedBlueprints: [] },
      { id: "lesson-zk",     trackId: "security-crypto", title: "Zero-Knowledge Proofs",            duration: "56m", status: "in-progress", linkedExperiments: ["exp-zk"],  linkedBlueprints: [] },
      { id: "lesson-tls",    trackId: "security-crypto", title: "TLS & mTLS at Scale",             duration: "34m", status: "available",   linkedExperiments: [],          linkedBlueprints: ["api-gateway"] },
      { id: "lesson-threat", trackId: "security-crypto", title: "Threat Modeling Systems",          duration: "42m", status: "locked",      linkedExperiments: [],          linkedBlueprints: ["api-gateway"] },
    ],
  },
  {
    id: "data-science", title: "Data Science & ML",
    tagline: "Feature stores, model pipelines, analytics engineering.",
    lessonCount: 10, duration: "6h 20m", level: "Advanced",
    linkedDomains: ["data-arch", "ai-systems"], linkedBlueprints: ["data-pipeline"],
    lessons: [
      { id: "lesson-data-mesh", trackId: "data-science", title: "Data Mesh Architecture",     duration: "44m", status: "done",        linkedExperiments: ["exp-mesh"],   linkedBlueprints: ["data-pipeline"] },
      { id: "lesson-streaming", trackId: "data-science", title: "Streaming Data Pipelines",   duration: "52m", status: "in-progress", linkedExperiments: ["exp-stream"], linkedBlueprints: ["data-pipeline", "event-driven"] },
      { id: "lesson-features",  trackId: "data-science", title: "Feature Store Design",       duration: "38m", status: "available",   linkedExperiments: [],             linkedBlueprints: ["data-pipeline"] },
      { id: "lesson-ml-ops",    trackId: "data-science", title: "MLOps Pipeline Engineering", duration: "46m", status: "locked",      linkedExperiments: ["exp-llmops"], linkedBlueprints: ["ai-agent"] },
    ],
  },
  {
    id: "product-engineering", title: "Product Engineering",
    tagline: "Build real products — state machines, APIs, interface systems.",
    lessonCount: 7, duration: "3h 50m", level: "Advanced",
    linkedDomains: ["interface-eng", "ai-systems"], linkedBlueprints: ["ai-interface", "api-gateway"],
    lessons: [
      { id: "lesson-state",      trackId: "product-engineering", title: "State Machine UI Architecture", duration: "36m", status: "done",        linkedExperiments: ["exp-xstate", "exp-crdt"], linkedBlueprints: ["ai-interface"] },
      { id: "lesson-api-design", trackId: "product-engineering", title: "API Design at Scale",            duration: "42m", status: "in-progress", linkedExperiments: [],                        linkedBlueprints: ["api-gateway"] },
      { id: "lesson-dx",         trackId: "product-engineering", title: "Developer Experience Systems",   duration: "34m", status: "available",   linkedExperiments: [],                        linkedBlueprints: ["ai-interface"] },
      { id: "lesson-product",    trackId: "product-engineering", title: "Product Spec & RFC Writing",     duration: "30m", status: "locked",      linkedExperiments: [],                        linkedBlueprints: ["ai-interface", "api-gateway"] },
    ],
  },
  {
    id: "research-methods", title: "Research Methodology",
    tagline: "Systematic inquiry — evidence hierarchies, analytical writing.",
    lessonCount: 6, duration: "3h 30m", level: "Advanced",
    linkedDomains: ["reliability", "dist-systems"], linkedBlueprints: ["tech-deep-dive", "exec-brief"],
    lessons: [
      { id: "lesson-research-1", trackId: "research-methods", title: "Evidence Hierarchies", duration: "32m", status: "done",      linkedExperiments: [],           linkedBlueprints: ["tech-deep-dive"] },
      { id: "lesson-research-2", trackId: "research-methods", title: "Hypothesis Framing",   duration: "28m", status: "available", linkedExperiments: ["exp-raft"],  linkedBlueprints: ["tech-deep-dive"] },
      { id: "lesson-research-3", trackId: "research-methods", title: "Analytical Writing",   duration: "40m", status: "locked",    linkedExperiments: [],           linkedBlueprints: ["tech-deep-dive", "exec-brief"] },
    ],
  },
];

export function getTrack(id: string) { return SCHOOL_TRACKS.find(t => t.id === id); }
export function getLesson(id: string) {
  for (const t of SCHOOL_TRACKS) { const l = t.lessons.find(l => l.id === id); if (l) return { lesson: l, track: t }; }
}

export interface SchoolRole {
  id: string; title: string; domain: string; demand: "Critical" | "High" | "Emerging";
  skills: string[]; desc: string; requiredTracks: string[]; linkedDomains: string[]; linkedBlueprints: string[];
}

export const SCHOOL_ROLES: SchoolRole[] = [
  { id: "ai-architect",    title: "AI Systems Architect",         domain: "Infrastructure & Intelligence", demand: "Critical", skills: ["LLM Ops", "Systems Design", "MLflow", "RAG"],        desc: "Design and own the technical architecture for AI-native products — from inference serving to evaluation infrastructure.", requiredTracks: ["ai-engineering", "distributed-arch"], linkedDomains: ["ai-systems", "dist-systems"],   linkedBlueprints: ["ai-agent", "ai-interface"] },
  { id: "dist-systems-eng",title: "Distributed Systems Engineer",  domain: "Backend Infrastructure",       demand: "High",     skills: ["Kafka", "Consensus", "Go", "gRPC"],               desc: "Build and maintain high-availability distributed systems.",                                                               requiredTracks: ["distributed-arch", "data-science"],   linkedDomains: ["dist-systems", "reliability"],   linkedBlueprints: ["event-driven", "api-gateway"] },
  { id: "platform-eng",    title: "Platform Engineer",             domain: "Developer Experience",         demand: "High",     skills: ["Kubernetes", "Terraform", "CI/CD", "Observability"],desc: "Build the internal platform that enables product engineers to ship fast and safely.",                                      requiredTracks: ["distributed-arch", "product-engineering"],linkedDomains: ["reliability", "interface-eng"], linkedBlueprints: ["api-gateway"] },
  { id: "data-mesh-arch",  title: "Data Mesh Architect",           domain: "Data Engineering",             demand: "Emerging", skills: ["dbt", "Lakehouse", "Domain Design", "Spark"],       desc: "Architect decentralized data ownership systems.",                                                                         requiredTracks: ["data-science", "distributed-arch"],   linkedDomains: ["data-arch"],                    linkedBlueprints: ["data-pipeline"] },
  { id: "ai-product-eng",  title: "AI Product Engineer",           domain: "Product & Engineering",        demand: "Critical", skills: ["RAG", "Evals", "Product Design", "TypeScript"],    desc: "Bridge AI capabilities and product UX — building AI-native interfaces.",                                                  requiredTracks: ["ai-engineering", "product-engineering"],linkedDomains: ["ai-systems", "interface-eng"],  linkedBlueprints: ["ai-agent", "ai-interface"] },
];

export function getRole(id: string) { return SCHOOL_ROLES.find(r => r.id === id); }

export interface CreationBlueprint {
  id: string; title: string; desc: string; category: string; outputType: string;
  tags: string[]; steps: string[]; linkedTracks: string[]; linkedDomains: string[]; linkedEngines: string[];
}

export const CREATION_BLUEPRINTS: CreationBlueprint[] = [
  { id: "ai-agent",      title: "AI Agent Orchestration System",  desc: "End-to-end blueprint for building an AI agent system — from prompt design to tool use, memory, and evaluation.",         category: "AI Systems",           outputType: "System",        tags: ["AI", "Agents", "Architecture"],            steps: ["Define agent scope & capability envelope", "Design tool/function schema", "Build memory & context layer", "Implement evaluation harness", "Production deployment & monitoring"],       linkedTracks: ["ai-engineering", "product-engineering"],    linkedDomains: ["ai-systems"],                      linkedEngines: ["prose-engine", "code-gen"] },
  { id: "event-driven",  title: "Event-Driven Architecture",      desc: "Design a fault-isolated, scalable event-driven system using Kafka or equivalent message brokers.",                      category: "Backend Architecture", outputType: "System",        tags: ["Events", "Kafka", "Distributed"],            steps: ["Map domain events & bounded contexts", "Design event schema & versioning", "Build producer/consumer topology", "Implement dead-letter handling", "Monitor consumer lag & throughput"],       linkedTracks: ["distributed-arch", "data-science"],         linkedDomains: ["dist-systems", "data-arch"],        linkedEngines: ["code-gen"] },
  { id: "api-gateway",   title: "Secure API Gateway Layer",       desc: "Production-ready API gateway with authentication, rate limiting, observability, and mTLS.",                             category: "Infrastructure",       outputType: "System",        tags: ["API", "Security", "Gateway"],                steps: ["Define authentication & authorization model", "Implement rate limiting strategy", "Configure mTLS & certificate management", "Add observability & distributed tracing", "Load testing & capacity planning"], linkedTracks: ["security-crypto", "distributed-arch"],       linkedDomains: ["cryptography", "reliability"],      linkedEngines: ["code-gen"] },
  { id: "data-pipeline", title: "Real-Time Data Pipeline",         desc: "Build a streaming data pipeline from ingestion to serving, with quality guarantees and monitoring.",                  category: "Data Engineering",     outputType: "System",        tags: ["Data", "Streaming", "Pipeline"],              steps: ["Map data sources & ingestion contracts", "Define schema validation & quality rules", "Build transformation & enrichment layer", "Implement serving layer & query APIs", "Alerting, SLOs & data freshness monitoring"], linkedTracks: ["data-science", "distributed-arch"],          linkedDomains: ["data-arch", "dist-systems"],        linkedEngines: ["code-gen", "prose-engine"] },
  { id: "ai-interface",  title: "AI Interface Design System",     desc: "Design and build an AI-native interface — chat surfaces, streaming states, tool surfaces, and interaction patterns.",  category: "Interface Engineering",outputType: "Design System", tags: ["Interface", "AI", "Design"],                  steps: ["Define interaction grammar & affordances", "Design streaming state patterns", "Build component primitive set", "Implement accessibility & keyboard navigation", "Document & publish design tokens"],           linkedTracks: ["product-engineering", "ai-engineering"],    linkedDomains: ["interface-eng", "ai-systems"],     linkedEngines: ["visual-engine", "prose-engine"] },
  { id: "tech-deep-dive",title: "Technical Deep-Dive Essay",       desc: "Structured template for long-form technical analysis with argument arc, evidence layers, and synthesis.",             category: "Writing",              outputType: "Prose",         tags: ["Prose", "Long-form", "Technical"],            steps: ["Frame the central thesis", "Structure evidence hierarchy", "Write the argument arc", "Add counter-argument section", "Synthesize conclusions & forward implications"],                       linkedTracks: ["research-methods"],                          linkedDomains: ["dist-systems", "ai-systems"],      linkedEngines: ["prose-engine"] },
  { id: "exec-brief",    title: "Executive Strategy Brief",        desc: "High-signal, low-noise briefing format for executive decision-making contexts.",                                         category: "Writing",              outputType: "Document",      tags: ["Document", "Executive", "Strategy"],          steps: ["Define decision context in one sentence", "State the recommendation & confidence", "Lay out key trade-offs", "Provide evidence summary", "List next steps & owners"],                         linkedTracks: ["research-methods"],                          linkedDomains: [],                                   linkedEngines: ["prose-engine"] },
];

export function getBlueprint(id: string) { return CREATION_BLUEPRINTS.find(b => b.id === id); }

export interface CreationEngine {
  id: string; title: string; desc: string; templateCount: number; linkedBlueprints: string[];
}

export const CREATION_ENGINES: CreationEngine[] = [
  { id: "prose-engine",  title: "Prose Engine",          desc: "Essays, articles, analysis, long-form writing.",    templateCount: 18, linkedBlueprints: ["tech-deep-dive", "exec-brief", "ai-agent"] },
  { id: "code-gen",      title: "Code Generator",        desc: "Scripts, functions, modules, system boilerplate.",   templateCount: 22, linkedBlueprints: ["ai-agent", "event-driven", "api-gateway", "data-pipeline"] },
  { id: "visual-engine", title: "Visual Concept Engine", desc: "Diagrams, architecture charts, concept wireframes.", templateCount: 12, linkedBlueprints: ["ai-interface"] },
  { id: "web-copy",      title: "Web Copy Studio",       desc: "Landing pages, headlines, CTAs, product copy.",     templateCount: 15, linkedBlueprints: ["exec-brief"] },
];

export function getEngine(id: string) { return CREATION_ENGINES.find(e => e.id === id); }

export function getBlueprintsForDomain(domainId: string) {
  const d = getDomain(domainId); if (!d) return [];
  return d.linkedBlueprints.map(getBlueprint).filter(Boolean) as CreationBlueprint[];
}
export function getTracksForDomain(domainId: string) {
  const d = getDomain(domainId); if (!d) return [];
  return d.linkedTracks.map(getTrack).filter(Boolean) as SchoolTrack[];
}
export function getBlueprintsForTrack(trackId: string) {
  const t = getTrack(trackId); if (!t) return [];
  return t.linkedBlueprints.map(getBlueprint).filter(Boolean) as CreationBlueprint[];
}
export function getDomainsForTrack(trackId: string) {
  const t = getTrack(trackId); if (!t) return [];
  return t.linkedDomains.map(getDomain).filter(Boolean) as LabDomain[];
}
