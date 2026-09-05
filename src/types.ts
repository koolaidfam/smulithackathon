export type NodeKind =
  | 'source'
  | 'document'
  | 'playbook'
  | 'workflow'
  | 'advisory'
  | 'team'
  | 'person';
export type DocClass = 'internal' | 'formal' | 'bilateral';
export type Rank = 'senior' | 'partner' | 'associate' | 'intern';
export type Relation =
  | 'feeds'
  | 'cites'
  | 'teaches'
  | 'issued_alongside'
  | 'evidence_relied_on_by'
  | 'owned_by'
  | 'supervised_by'
  | 'staffed_by';
export type TaskState =
  | 'open'
  | 'routed'
  | 'accepted'
  | 'amended'
  | 'rejected'
  | 'verified';
export type EditKind = 'mechanical' | 'substantive' | 'none';
export type ActionKind =
  | 'propose_edit'
  | 'procedural'
  | 'flag_exposure'
  | 'already_bound'
  | 'not_affected';
export type ArtifactState = 'current' | 'flagged' | 'in_review' | 'amended' | 'superseded';

export interface FirmNode {
  id: string;
  kind: NodeKind;
  title: string;
  subtitle: string;
  cluster: string;
  doc_class?: DocClass;
  jurisdiction?: string;
  props: Record<string, unknown>;
}

export interface FirmEdge {
  id: string;
  src: string;
  dst: string;
  relation: Relation;
  confidence: number;
  source_system: string;
  created_at: string;
  confirmed_by: string | null;
  confirmed_at: string | null;
}

export interface Parameter {
  id: string;
  name: string;
  value: string;
  previous_value?: string;
  unit: string;
  effective_from: string;
  effective_to: string | null;
  citation: string;
}

export interface DocumentParameter {
  document_id: string;
  parameter_id: string;
  location: string;
  hardcoded: boolean;
  excerpt: string;
  edit_kind: EditKind;
  mechanical_edit?: string;
  why: string;
}

export interface Change {
  id: string;
  source_node: string;
  instrument_ref: string;
  title: string;
  summary: string;
  parameter_id: string;
  gazetted_at: string;
  in_force_at: string;
}

export interface Task {
  id: string;
  change_id: string;
  node_id: string;
  owner_id: string;
  nominated_owner_id: string;
  state: TaskState;
  decided_by: string | null;
  decided_at: string | null;
  reason: string | null;
  disposition: string | null;
  escalated: boolean;
  escalation_path: string[];
  escalation_reason: string | null;
}

export interface Hop {
  node_id: string;
  via: Relation | 'start';
  edge_id: string | null;
  confirmed: boolean;
}

export interface AffectedAsset {
  node_id: string;
  chain: Hop[];
  carried_by: 'confirmed' | 'mixed';
  action: ActionKind;
  edit_kind: EditKind;
  silent_failure: boolean;
}

export interface CoverageGap {
  node_id: string;
  reason: string;
  proposed_edge_id: string | null;
  confidence: number | null;
}

export interface CleanAsset {
  node_id: string;
  reason: string;
  keyword_would_match: boolean;
}

export interface AffectedTeam {
  node_id: string;
  people: string[];
  artifact_ids: string[];
}

export interface PropagationResult {
  change_id: string;
  draft: boolean;
  draft_reason: string | null;
  reached: AffectedAsset[];
  teams: AffectedTeam[];
  clean: CleanAsset[];
  coverage: CoverageGap[];
  discovery_order: string[];
}

export type InspectorTab = 'node' | 'tasks' | 'coverage' | 'teams';
