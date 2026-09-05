import { documentParameters, edges, nodes } from '../data/seed';
import type { FirmEdge, FirmNode, NodeKind, Rank, Relation } from '../types';

const nodeById = new Map(nodes.map((n) => [n.id, n]));

export function getNode(id: string): FirmNode | undefined {
  return nodeById.get(id);
}

export function requireNode(id: string): FirmNode {
  const node = nodeById.get(id);
  if (!node) throw new Error(`Unknown node ${id}`);
  return node;
}

export function allNodes(): FirmNode[] {
  return nodes;
}

export function isConfirmed(edge: FirmEdge): boolean {
  return Boolean(edge.confirmed_by && edge.confirmed_at);
}

export const PROPAGATION_RELATIONS: Relation[] = [
  'feeds',
  'cites',
  'teaches',
  'issued_alongside',
  'evidence_relied_on_by',
];

export const TASK_KINDS: NodeKind[] = ['document', 'playbook', 'workflow', 'advisory'];

export function isPropagationRelation(relation: Relation): boolean {
  return PROPAGATION_RELATIONS.includes(relation);
}

export function isTaskKind(kind: NodeKind): boolean {
  return TASK_KINDS.includes(kind);
}

export function ownerOf(documentId: string, list: FirmEdge[] = edges): string | null {
  const owned = list.find((e) => e.src === documentId && e.relation === 'owned_by');
  return owned?.dst ?? null;
}

export function supervisorsOf(personId: string, list: FirmEdge[] = edges): string[] {
  return list.filter((e) => e.src === personId && e.relation === 'supervised_by').map((e) => e.dst);
}

export function staffOf(teamId: string, list: FirmEdge[] = edges): string[] {
  return list.filter((e) => e.src === teamId && e.relation === 'staffed_by').map((e) => e.dst);
}

export function rankOf(personId: string): Rank | null {
  const node = getNode(personId);
  if (!node || node.kind !== 'person') return null;
  return (node.props.rank as Rank | undefined) ?? null;
}

export function bindingsFor(documentId: string) {
  return documentParameters.filter((b) => b.document_id === documentId);
}

export function inbound(id: string, list: FirmEdge[] = edges): FirmEdge[] {
  return list.filter((e) => e.dst === id && isPropagationRelation(e.relation));
}

export function outbound(id: string, list: FirmEdge[] = edges): FirmEdge[] {
  return list.filter((e) => e.src === id && isPropagationRelation(e.relation));
}

export function graphNodes(): FirmNode[] {
  return nodes.filter((n) => n.kind !== 'person');
}
