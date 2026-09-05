import type { DocClass, FirmEdge, Rank } from '../types';
import { getNode, ownerOf, rankOf, supervisorsOf } from './graph';

export interface Escalation {
  nominated_owner_id: string | null;
  owner_id: string;
  path: string[];
  escalated: boolean;
  reason: string | null;
}

function canDispose(rank: Rank | null, docClass: DocClass | undefined, production: boolean): boolean {
  if (!rank) return false;
  if (rank === 'intern') return false;
  if (rank === 'associate') {
    if (production) return false;
    if (docClass === 'formal' || docClass === 'bilateral') return false;
    return true;
  }
  return rank === 'partner' || rank === 'senior';
}

export function cannotDisposeWhy(
  rank: Rank | null,
  docClass: DocClass | undefined,
  production: boolean,
): string {
  if (!rank) return 'No owner is recorded. Walk the supervision chain.';
  if (rank === 'intern') {
    return 'An intern cannot dispose of a regulatory task.';
  }
  if (rank === 'associate' && production) {
    return 'An associate cannot change production automation. A partner must dispose of this.';
  }
  if (rank === 'associate' && (docClass === 'formal' || docClass === 'bilateral')) {
    return 'An associate cannot dispose of a formal instrument or an executed contract.';
  }
  return 'The nominated owner cannot dispose of this task.';
}

export function routeTask(
  documentId: string,
  edges: FirmEdge[],
): Escalation {
  const doc = getNode(documentId);
  const production = Boolean(doc?.props.production_automation);
  const nominated = ownerOf(documentId, edges);
  const fallback = 'person-chen';

  if (!nominated) {
    return {
      nominated_owner_id: null,
      owner_id: fallback,
      path: [fallback],
      escalated: true,
      reason: 'No owner is recorded on this document. Routed to the senior partner.',
    };
  }

  const walk: string[] = [nominated];
  let current = nominated;
  const seen = new Set<string>([current]);

  while (current) {
    const rank = rankOf(current);
    const node = getNode(current);
    const left = Boolean(node?.props.left_firm);
    if (!left && canDispose(rank, doc?.doc_class, production)) {
      return {
        nominated_owner_id: nominated,
        owner_id: current,
        path: walk,
        escalated: current !== nominated,
        reason:
          current === nominated
            ? null
            : cannotDisposeWhy(rankOf(nominated), doc?.doc_class, production),
      };
    }
    const next = supervisorsOf(current, edges).find((id) => !seen.has(id));
    if (!next) break;
    seen.add(next);
    walk.push(next);
    current = next;
  }

  return {
    nominated_owner_id: nominated,
    owner_id: walk[walk.length - 1] ?? fallback,
    path: walk,
    escalated: true,
    reason: cannotDisposeWhy(rankOf(nominated), doc?.doc_class, production),
  };
}
