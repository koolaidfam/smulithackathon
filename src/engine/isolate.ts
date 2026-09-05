import { edges as seedEdges } from '../data/seed';
import type { FirmEdge, Relation } from '../types';
import { allNodes, getNode, isPropagationRelation } from './graph';

/**
 * Isolation. A workflow is the unit of work a team runs, so isolating one
 * answers a narrow question: which artifacts feed this workflow, and which
 * of them does the change reach. Membership comes from stored edges only.
 */

/** Directed propagation steps, matching the walk in propagate.ts. */
function steps(edge: FirmEdge): Array<{ from: string; to: string }> {
  const r: Relation = edge.relation;
  if (r === 'cites') return [{ from: edge.dst, to: edge.src }];
  if (r === 'issued_alongside') {
    return [
      { from: edge.src, to: edge.dst },
      { from: edge.dst, to: edge.src },
    ];
  }
  return [{ from: edge.src, to: edge.dst }];
}

export function workflowNodes() {
  return allNodes().filter((n) => n.kind === 'workflow');
}

/**
 * Everything upstream of a workflow: the artifacts that feed it, the
 * instruments those artifacts sit under, and the teams staffed on any of it.
 */
export function isolateWorkflow(
  workflowId: string,
  edgeList: FirmEdge[] = seedEdges,
): Set<string> {
  const keep = new Set<string>([workflowId]);
  if (!getNode(workflowId)) return keep;

  const back = new Map<string, string[]>();
  for (const e of edgeList) {
    if (!isPropagationRelation(e.relation)) continue;
    for (const s of steps(e)) {
      const list = back.get(s.to) ?? [];
      list.push(s.from);
      back.set(s.to, list);
    }
  }

  const queue = [workflowId];
  while (queue.length) {
    const current = queue.shift() as string;
    for (const parent of back.get(current) ?? []) {
      if (keep.has(parent)) continue;
      keep.add(parent);
      queue.push(parent);
    }
  }

  // Teams are downstream, not upstream, so the backward walk never reaches
  // them. Add only the ones a stored edge actually connects to something in
  // the set. Staffing is not a connection: an artifact owned by a member of a
  // team does not put that team in this workflow's chain.
  for (const e of edgeList) {
    if (!isPropagationRelation(e.relation)) continue;
    if (!keep.has(e.src)) continue;
    if (getNode(e.dst)?.kind === 'team') keep.add(e.dst);
  }

  return keep;
}
