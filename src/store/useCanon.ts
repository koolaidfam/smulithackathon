import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_WATCHED, LIVE_CHANGE_ID, changes, edges as seedEdges } from '../data/seed';
import { routeTask } from '../engine/escalate';
import { getNode, isTaskKind } from '../engine/graph';
import { propagateById } from '../engine/propagate';
import type { FirmEdge, InspectorTab, Task, TaskState } from '../types';

const DEMO_NOW_ISO = '2026-09-05T09:00:00+08:00';

function buildTasks(changeId: string, edgeList: FirmEdge[], existing: Task[]): Task[] {
  const result = propagateById(changeId, edgeList);
  if (result.draft) return existing.filter((t) => t.change_id !== changeId);

  const kept = existing.filter((t) => t.change_id !== changeId);
  const next: Task[] = [];

  for (const asset of result.reached) {
    if (asset.action === 'already_bound' || asset.action === 'not_affected') continue;
    const node = getNode(asset.node_id);
    if (!node || !isTaskKind(node.kind)) continue;
    const prev = existing.find((t) => t.change_id === changeId && t.node_id === asset.node_id);
    if (
      prev &&
      (prev.state === 'accepted' ||
        prev.state === 'amended' ||
        prev.state === 'rejected' ||
        prev.state === 'verified')
    ) {
      next.push(prev);
      continue;
    }
    const route = routeTask(asset.node_id, edgeList);
    next.push({
      id: `task-${changeId}-${asset.node_id}`,
      change_id: changeId,
      node_id: asset.node_id,
      owner_id: route.owner_id,
      nominated_owner_id: route.nominated_owner_id ?? route.owner_id,
      state: 'routed',
      decided_by: prev?.decided_by ?? null,
      decided_at: prev?.decided_at ?? null,
      reason: prev?.reason ?? null,
      disposition: prev?.disposition ?? null,
      escalated: route.escalated,
      escalation_path: route.path,
      escalation_reason: route.reason,
    });
  }

  return [...kept, ...next];
}

interface CanonState {
  edges: FirmEdge[];
  tasks: Task[];
  watchedSourceIds: string[];
  selectedChangeId: string;
  selectedNodeId: string | null;
  inspectorTab: InspectorTab;
  published: boolean;
  replayIndex: number;
  replaying: boolean;
  selectChange: (id: string) => void;
  selectNode: (id: string | null) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  toggleWatch: (sourceId: string) => void;
  publishAmendment: () => string | null;
  clearFlags: () => void;
  disposeTask: (
    taskId: string,
    state: Extract<TaskState, 'accepted' | 'amended' | 'rejected'>,
    reason: string,
    actorId: string,
  ) => void;
  verifyTask: (taskId: string, actorId: string) => void;
  confirmEdge: (edgeId: string, actorId: string) => void;
  startReplay: () => void;
  setReplayIndex: (index: number) => void;
  stopReplay: () => void;
  resetDemo: () => void;
}

export const useCanon = create<CanonState>()(
  persist(
    (set, get) => ({
      edges: seedEdges,
      tasks: [],
      watchedSourceIds: DEFAULT_WATCHED,
      selectedChangeId: LIVE_CHANGE_ID,
      selectedNodeId: null,
      inspectorTab: 'node',
      published: false,
      replayIndex: -1,
      replaying: false,
      selectChange: (id) =>
        set({
          selectedChangeId: id,
          selectedNodeId: changes.find((c) => c.id === id)?.source_node ?? null,
          published: false,
          replayIndex: -1,
          replaying: false,
        }),
      selectNode: (id) => set({ selectedNodeId: id, inspectorTab: 'node' }),
      setInspectorTab: (tab) => set({ inspectorTab: tab }),
      toggleWatch: (sourceId) => {
        const current = get().watchedSourceIds;
        const next = current.includes(sourceId)
          ? current.filter((id) => id !== sourceId)
          : [...current, sourceId];
        set({ watchedSourceIds: next });
      },
      publishAmendment: () => {
        const change = changes.find((c) => c.id === get().selectedChangeId);
        if (!change) return 'No instrument is selected.';
        if (!get().watchedSourceIds.includes(change.source_node)) {
          return 'This source is not on the watch list. A lawyer has to add it before the brain will publish from it.';
        }
        const result = propagateById(change.id, get().edges);
        set({
          published: !result.draft,
          tasks: result.draft ? get().tasks.filter((t) => t.change_id !== change.id) : buildTasks(change.id, get().edges, get().tasks),
          replaying: true,
          replayIndex: 0,
          selectedNodeId: change.source_node,
        });
        return result.draft
          ? result.draft_reason
          : null;
      },
      clearFlags: () =>
        set({
          published: false,
          replayIndex: -1,
          replaying: false,
          selectedNodeId: null,
        }),
      disposeTask: (taskId, state, reason, actorId) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  state,
                  reason,
                  disposition: state,
                  decided_by: actorId,
                  decided_at: DEMO_NOW_ISO,
                }
              : t,
          ),
        }),
      verifyTask: (taskId, actorId) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  state: 'verified',
                  decided_by: actorId,
                  decided_at: DEMO_NOW_ISO,
                  disposition: 'verified',
                  reason: t.reason
                    ? `${t.reason} Re-checked against the document of record.`
                    : 'Re-checked against the document of record. The edit is present.',
                }
              : t,
          ),
        }),
      confirmEdge: (edgeId, actorId) => {
        const edges = get().edges.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                confirmed_by: actorId,
                confirmed_at: DEMO_NOW_ISO,
                source_system: 'confirm:human',
                confidence: 1,
              }
            : e,
        );
        const published = get().published;
        set({
          edges,
          tasks: published ? buildTasks(get().selectedChangeId, edges, get().tasks) : get().tasks,
        });
      },
      startReplay: () => set({ replaying: true, replayIndex: 0 }),
      setReplayIndex: (index) => set({ replayIndex: index }),
      stopReplay: () => set({ replaying: false, replayIndex: -1 }),
      resetDemo: () =>
        set({
          edges: seedEdges,
          tasks: [],
          watchedSourceIds: DEFAULT_WATCHED,
          selectedChangeId: LIVE_CHANGE_ID,
          selectedNodeId: null,
          inspectorTab: 'node',
          published: false,
          replayIndex: -1,
          replaying: false,
        }),
    }),
    {
      name: 'canon-brain-v2',
      partialize: (s) => ({
        edges: s.edges,
        tasks: s.tasks,
        selectedChangeId: s.selectedChangeId,
        watchedSourceIds: s.watchedSourceIds,
        published: s.published,
      }),
    },
  ),
);

export function changeById(id: string) {
  return changes.find((c) => c.id === id);
}
