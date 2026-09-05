import { propagateById, staleIds } from '../engine/propagate';
import type { FirmEdge, PropagationResult, Task } from '../types';

export function selectResult(changeId: string, edges: FirmEdge[]): PropagationResult {
  return propagateById(changeId, edges);
}

export function selectStale(
  result: PropagationResult,
  published: boolean,
  replayIndex: number,
): Set<string> {
  if (!published || result.draft) return new Set();
  const all = staleIds(result);
  if (replayIndex < 0) return all;
  const lit = new Set(result.discovery_order.slice(0, replayIndex + 1));
  return new Set([...all].filter((id) => lit.has(id) || id === result.discovery_order[0]));
}

export function selectVerified(tasks: Task[], changeId: string): Set<string> {
  return new Set(
    tasks.filter((t) => t.change_id === changeId && t.state === 'verified').map((t) => t.node_id),
  );
}
