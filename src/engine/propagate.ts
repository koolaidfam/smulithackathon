import { changes, documentParameters } from '../data/seed';
import type {
  ActionKind,
  AffectedAsset,
  AffectedTeam,
  Change,
  CleanAsset,
  CoverageGap,
  EditKind,
  FirmEdge,
  Hop,
  PropagationResult,
} from '../types';
import { getNode, isConfirmed, isPropagationRelation, isTaskKind, staffOf } from './graph';

const MAX_HOPS = 5;

interface WalkDir {
  from: 'src' | 'dst';
  to: 'src' | 'dst';
}

function directions(relation: FirmEdge['relation']): WalkDir[] {
  if (relation === 'cites') return [{ from: 'dst', to: 'src' }];
  if (relation === 'issued_alongside') {
    return [
      { from: 'src', to: 'dst' },
      { from: 'dst', to: 'src' },
    ];
  }
  return [{ from: 'src', to: 'dst' }];
}

function actionFor(nodeId: string, hardcoded: boolean | null): ActionKind {
  const node = getNode(nodeId);
  if (!node || !isTaskKind(node.kind)) return 'not_affected';
  if (node.props.bound_to_parameter && hardcoded === false) return 'already_bound';
  if (node.doc_class === 'formal') return 'procedural';
  if (node.doc_class === 'bilateral') return 'flag_exposure';
  if (hardcoded) return 'propose_edit';
  if (hardcoded === false) return 'already_bound';
  return 'propose_edit';
}

function editKindFor(nodeId: string, parameterId: string): EditKind {
  const binding = documentParameters.find(
    (b) => b.document_id === nodeId && b.parameter_id === parameterId,
  );
  return binding?.edit_kind ?? 'none';
}

function walkFromSource(
  sourceId: string,
  edgeList: FirmEdge[],
  onlyConfirmed: boolean,
): { assets: Map<string, Hop[]>; order: string[] } {
  const hops = new Map<string, Hop[]>();
  const order: string[] = [sourceId];
  hops.set(sourceId, [{ node_id: sourceId, via: 'start', edge_id: null, confirmed: true }]);

  const queue: { id: string; depth: number }[] = [{ id: sourceId, depth: 0 }];

  while (queue.length) {
    const current = queue.shift();
    if (!current || current.depth >= MAX_HOPS) continue;

    for (const edge of edgeList) {
      if (!isPropagationRelation(edge.relation)) continue;
      if (onlyConfirmed && !isConfirmed(edge)) continue;

      for (const dir of directions(edge.relation)) {
        if (edge[dir.from] !== current.id) continue;
        const nextId = edge[dir.to];
        if (hops.has(nextId)) continue;
        const parent = hops.get(current.id);
        if (!parent) continue;
        const chain: Hop[] = [
          ...parent,
          {
            node_id: nextId,
            via: edge.relation,
            edge_id: edge.id,
            confirmed: isConfirmed(edge),
          },
        ];
        hops.set(nextId, chain);
        order.push(nextId);
        queue.push({ id: nextId, depth: current.depth + 1 });
      }
    }
  }

  return { assets: hops, order };
}

function coverageGaps(
  change: Change,
  reachedIds: Set<string>,
  edgeList: FirmEdge[],
): CoverageGap[] {
  const gaps: CoverageGap[] = [];
  for (const edge of edgeList) {
    if (edge.src !== change.source_node && edge.dst !== change.source_node) continue;
    if (isConfirmed(edge)) continue;
    if (!isPropagationRelation(edge.relation)) continue;
    const other = edge.src === change.source_node ? edge.dst : edge.src;
    if (reachedIds.has(other)) continue;
    const node = getNode(other);
    if (!node || !isTaskKind(node.kind)) continue;
    gaps.push({
      node_id: other,
      reason:
        (node.props.embedding_hint as string | undefined) ??
        'An unconfirmed edge points at this artifact. Until someone confirms the edge, the brain will not flag it.',
      proposed_edge_id: edge.id,
      confidence: edge.confidence,
    });
  }
  return gaps;
}

function cleanAssets(reachedIds: Set<string>): CleanAsset[] {
  const node = getNode('doc-allotment');
  if (!node || reachedIds.has(node.id)) return [];
  return [
    {
      node_id: node.id,
      reason: (node.props.clean_reason as string) ?? 'No stored path from the instrument.',
      keyword_would_match: true,
    },
  ];
}

function collectTeams(reachedIds: Iterable<string>, edgeList: FirmEdge[]): AffectedTeam[] {
  const byTeam = new Map<string, Set<string>>();
  for (const id of reachedIds) {
    const node = getNode(id);
    if (!node) continue;
    if (node.kind === 'team') {
      if (!byTeam.has(id)) byTeam.set(id, new Set());
      continue;
    }
  }
  for (const id of reachedIds) {
    const node = getNode(id);
    if (!node || node.kind === 'team' || node.kind === 'source') continue;
    for (const edge of edgeList) {
      if (edge.src !== id || edge.relation !== 'feeds') continue;
      const dest = getNode(edge.dst);
      if (dest?.kind === 'team') {
        const set = byTeam.get(dest.id) ?? new Set();
        set.add(id);
        byTeam.set(dest.id, set);
      }
    }
  }
  return [...byTeam.entries()].map(([node_id, artifacts]) => ({
    node_id,
    people: staffOf(node_id, edgeList),
    artifact_ids: [...artifacts],
  }));
}

function isDraftInstrument(change: Change): boolean {
  return Boolean(getNode(change.source_node)?.props.draft);
}

export function propagate(change: Change, edgeList: FirmEdge[]): PropagationResult {
  const draft = isDraftInstrument(change);
  const confirmedWalk = walkFromSource(change.source_node, edgeList, true);
  const reached: AffectedAsset[] = [];

  for (const [id, chain] of confirmedWalk.assets) {
    const node = getNode(id);
    if (!node || !isTaskKind(node.kind)) continue;
    const binding = documentParameters.find(
      (b) => b.document_id === id && b.parameter_id === change.parameter_id,
    );
    const hardcoded = binding ? binding.hardcoded : null;
    reached.push({
      node_id: id,
      chain,
      carried_by: chain.every((h) => h.confirmed) ? 'confirmed' : 'mixed',
      action: actionFor(id, hardcoded),
      edit_kind: editKindFor(id, change.parameter_id),
      silent_failure: Boolean(node.props.silent_failure),
    });
  }

  const reachedIds = new Set(confirmedWalk.assets.keys());

  return {
    change_id: change.id,
    draft,
    draft_reason: draft
      ? 'Nothing is marked flagged. This instrument is not in force. The map below is what the change would reach after commencement.'
      : null,
    reached,
    teams: draft ? [] : collectTeams(reachedIds, edgeList),
    clean: draft ? [] : cleanAssets(reachedIds),
    coverage: coverageGaps(change, reachedIds, edgeList),
    discovery_order: confirmedWalk.order,
  };
}

export function propagateById(changeId: string, edgeList: FirmEdge[]): PropagationResult {
  const change = changes.find((c) => c.id === changeId);
  if (!change) {
    throw new Error(`Unknown change ${changeId}`);
  }
  return propagate(change, edgeList);
}

export function assetFor(result: PropagationResult, nodeId: string): AffectedAsset | undefined {
  return result.reached.find((a) => a.node_id === nodeId);
}

export function staleIds(result: PropagationResult): Set<string> {
  if (result.draft) return new Set();
  const ids = new Set<string>();
  for (const asset of result.reached) {
    if (asset.action !== 'already_bound' && asset.action !== 'not_affected') {
      ids.add(asset.node_id);
    }
  }
  for (const team of result.teams) ids.add(team.node_id);
  return ids;
}
