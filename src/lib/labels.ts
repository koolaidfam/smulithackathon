import type { ArtifactState, DocClass, NodeKind, Relation, TaskState } from '../types';

export function kindLabel(kind: NodeKind): string {
  switch (kind) {
    case 'source':
      return 'Regulatory instrument';
    case 'document':
      return 'Template, clause or checklist';
    case 'playbook':
      return 'Playbook';
    case 'workflow':
      return 'Project';
    case 'advisory':
      return 'Client facing or internal publication';
    case 'team':
      return 'Team';
    case 'person':
      return 'Person';
  }
}

export function classLabel(docClass?: DocClass): string {
  if (docClass === 'formal') return 'Formal';
  if (docClass === 'bilateral') return 'Bilateral';
  if (docClass === 'internal') return 'Internal';
  return 'Artifact';
}

export function relationLabel(relation: Relation | 'start'): string {
  switch (relation) {
    case 'start':
      return 'Instrument';
    case 'feeds':
      return 'feeds';
    case 'cites':
      return 'cites';
    case 'teaches':
      return 'teaches';
    case 'issued_alongside':
      return 'issued alongside';
    case 'evidence_relied_on_by':
      return 'evidence relied on by';
    case 'owned_by':
      return 'owned by';
    case 'supervised_by':
      return 'supervised by';
    case 'staffed_by':
      return 'staffed by';
  }
}

export function stateLabel(state: TaskState): string {
  switch (state) {
    case 'open':
      return 'Open';
    case 'routed':
      return 'In review';
    case 'accepted':
      return 'Accepted';
    case 'amended':
      return 'Amended';
    case 'rejected':
      return 'Rejected';
    case 'verified':
      return 'Current';
  }
}

export function artifactStateLabel(state: ArtifactState): string {
  switch (state) {
    case 'current':
      return 'Current';
    case 'flagged':
      return 'Flagged';
    case 'in_review':
      return 'In review';
    case 'amended':
      return 'Amended';
    case 'superseded':
      return 'Superseded';
  }
}

export function rankLabel(rank: unknown): string {
  if (rank === 'senior') return 'Senior partner';
  if (rank === 'partner') return 'Partner';
  if (rank === 'associate') return 'Associate';
  if (rank === 'intern') return 'Intern';
  return 'Person';
}
