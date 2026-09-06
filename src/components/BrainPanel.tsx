import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changes } from '../data/seed';
import { allNodes, getNode } from '../engine/graph';
import { isolateWorkflow, workflowNodes } from '../engine/isolate';
import { selectResult, selectStale, selectVerified } from '../store/selectors';
import { useCanon } from '../store/useCanon';
import { BrainGraph } from './BrainGraph';
import { FeedPane } from './FeedPane';
import { IsolatedGraph } from './IsolatedGraph';
import { UploadGate } from './UploadGate';
import { Inspector } from './Inspector';

export function BrainPanel({ fullHeight = false }: { fullHeight?: boolean }) {
  const edges = useCanon((s) => s.edges);
  const changeId = useCanon((s) => s.selectedChangeId);
  const selectChange = useCanon((s) => s.selectChange);
  const selectedNodeId = useCanon((s) => s.selectedNodeId);
  const selectNode = useCanon((s) => s.selectNode);
  const watched = useCanon((s) => s.watchedSourceIds);
  const published = useCanon((s) => s.published);
  const publishAmendment = useCanon((s) => s.publishAmendment);
  const clearFlags = useCanon((s) => s.clearFlags);
  const demoDispose = useCanon((s) => s.demoDispose);
  const resetCount = useCanon((s) => s.resetCount);
  const amendedIds = useCanon((s) => s.amendedNodeIds);
  const sortOnReturn = useCanon((s) => s.sortOnReturn);
  const setSortOnReturn = useCanon((s) => s.setSortOnReturn);
  const isolatedWorkflowId = useCanon((s) => s.isolatedWorkflowId);
  const setIsolated = useCanon((s) => s.isolateWorkflow);
  const replaying = useCanon((s) => s.replaying);
  const replayIndex = useCanon((s) => s.replayIndex);
  const setReplayIndex = useCanon((s) => s.setReplayIndex);
  const stopReplay = useCanon((s) => s.stopReplay);
  const result = useMemo(() => selectResult(changeId, edges), [changeId, edges]);
  const tasks = useCanon((s) => s.tasks);
  const amended = useMemo(() => new Set(amendedIds), [amendedIds]);
  const verified = useMemo(() => {
    const done = selectVerified(tasks, changeId);
    // A team clears once every artifact it was tagged on has been verified.
    for (const team of result.teams) {
      const owned = team.artifact_ids.filter((id) => {
        const kind = getNode(id)?.kind;
        return kind === 'document' || kind === 'playbook' || kind === 'workflow' || kind === 'advisory';
      });
      if (owned.length > 0 && owned.every((id) => done.has(id))) done.add(team.node_id);
    }
    return done;
  }, [tasks, changeId, result]);
  const flows = useMemo(() => workflowNodes(), []);
  const isolated = useMemo(
    () => (isolatedWorkflowId ? isolateWorkflow(isolatedWorkflowId, edges) : null),
    [isolatedWorkflowId, edges],
  );
  const toggleIsolate = useCallback(
    (id: string | null) => setIsolated(id === isolatedWorkflowId ? null : id),
    [isolatedWorkflowId, setIsolated],
  );
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [feedOpen, setFeedOpen] = useState(true);
  const [sorted, setSorted] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const flagged = useMemo(() => {
    if (!published && !result.draft) {
      if (replaying) {
        return new Set(result.discovery_order.slice(0, Math.max(0, replayIndex + 1)));
      }
      return new Set<string>();
    }
    if (result.draft && replaying) {
      return new Set(result.discovery_order.slice(0, Math.max(0, replayIndex + 1)));
    }
    if (result.draft) return new Set(result.discovery_order);
    if (replaying) return new Set(result.discovery_order.slice(0, Math.max(0, replayIndex + 1)));
    return selectStale(result, published, -1);
  }, [published, replaying, replayIndex, result]);

  // Coming back from a sent draft, show the sorted firm once.
  useEffect(() => {
    if (!sortOnReturn) return;
    setSorted(true);
    setSortOnReturn(false);
  }, [sortOnReturn, setSortOnReturn]);

  // Reset demo puts the view back the way a judge first sees it.
  useEffect(() => {
    if (resetCount === 0) return;
    setSorted(false);
    setFeedOpen(true);
    setNotice(null);
    setSheet(false);
  }, [resetCount]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1279px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (narrow && selectedNodeId) setSheet(true);
  }, [narrow, selectedNodeId]);

  useEffect(() => {
    if (!replaying) return;
    if (replayIndex >= result.discovery_order.length - 1) {
      const t = window.setTimeout(() => stopReplay(), 400);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setReplayIndex(replayIndex + 1), 280);
    return () => window.clearTimeout(t);
  }, [replaying, replayIndex, result.discovery_order.length, setReplayIndex, stopReplay]);

  const change = changes.find((c) => c.id === changeId);
  const watchedChanges = changes.filter((c) => {
    const source = getNode(c.source_node);
    return watched.includes(c.source_node) || Boolean(source?.props.draft) || c.id === changeId;
  });
  const docs = result.reached.filter((a) => {
    const k = getNode(a.node_id)?.kind;
    return k === 'document' || k === 'playbook';
  }).length;
  const flowCount = result.reached.filter((a) => getNode(a.node_id)?.kind === 'workflow').length;
  const advs = result.reached.filter((a) => getNode(a.node_id)?.kind === 'advisory').length;
  const teamNames = result.teams.map((t) => getNode(t.node_id)?.title).filter(Boolean);

  const readout =
    !published && !result.draft
      ? `${graphCount()} mapped. Nothing flagged. Refresh to walk the graph from the selected instrument.`
      : result.draft
        ? `${change?.title}. Mapped, not flagged. ${result.draft_reason}`
        : `${change?.title} amended. ${docs} documents and playbooks flagged, ${flowCount} projects touched, ${advs} published outputs now stale, across ${teamNames.length} teams: ${teamNames.join(', ')}.`;

  return (
    <div className="brain" style={fullHeight ? { height: '100%', display: 'flex', flexDirection: 'column' } : undefined}>
      <div className="brainbar">
        {/* What the firm does with documents sits on the left. */}
        <label htmlFor="src" className="ui">
          Amend an instrument
        </label>
        <select
          id="src"
          aria-label="Amend an instrument"
          value={changeId}
          onChange={(e) => {
            selectChange(e.target.value);
            setNotice(null);
          }}
        >
          {watchedChanges.map((c) => (
            <option key={c.id} value={c.id}>
              {getNode(c.source_node)?.title}
              {getNode(c.source_node)?.props.draft ? ' (draft)' : ''}
              {c.source_node === 'src-asic-aml' ? ' (AU)' : ''}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setShowUpload(true)}>
          Upload doc
        </button>
        <button className="primary" type="button" onClick={() => navigate('/publications')}>
          Legal updates
        </button>
        <button
          onClick={() => {
            clearFlags();
            setNotice(null);
          }}
        >
          Clear
        </button>
        {!feedOpen && <button onClick={() => setFeedOpen(true)}>Show the feed</button>}

        {/* What the firm does with the view sits on the right. */}
        <div className="brainbar-right">
          <button
            className="primary"
            onClick={() => {
              const msg = publishAmendment();
              setNotice(msg);
            }}
          >
            Refresh
          </button>
          {isolated && (
            <button type="button" onClick={() => setIsolated(null)}>
              Show the whole firm
            </button>
          )}
          <label htmlFor="iso" className="ui">
            Isolate a project
          </label>
          <select
            id="iso"
            aria-label="Isolate a project"
            value={isolatedWorkflowId ?? ''}
            onChange={(e) => setIsolated(e.target.value || null)}
          >
            <option value="">Whole firm</option>
            {flows.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
        {narrow && (
          <button onClick={() => setSheet(true)}>Open inspector</button>
        )}
      </div>
      {showUpload && (
        <UploadGate
          onClose={() => setShowUpload(false)}
          onReview={() => {
            setShowUpload(false);
            navigate('/draft?doc=upload');
          }}
        />
      )}
      {notice && <div className="readout">{notice}</div>}
      <div
        className={`brainbody ${feedOpen ? 'withfeed' : ''}`}
        style={fullHeight ? { flex: 1, minHeight: 0 } : undefined}
      >
        {feedOpen && <FeedPane onClose={() => setFeedOpen(false)} />}
        <div className="graphwrap">
          {isolated && isolatedWorkflowId ? (
            <IsolatedGraph
              edges={edges}
              nodeIds={isolated}
              flagged={flagged}
              verified={verified}
              amended={amended}
              selectedId={selectedNodeId}
              focusId={isolatedWorkflowId}
              onSelect={selectNode}
              onIsolate={toggleIsolate}
            />
          ) : (
            <BrainGraph
              edges={edges}
              flagged={flagged}
              verified={verified}
              amended={amended}
              selectedId={selectedNodeId}
              watchedSourceIds={watched}
              sorted={sorted}
              onSelect={selectNode}
              onIsolate={toggleIsolate}
            />
          )}
          {!isolated && (
            <button className="sortbtn" type="button" onClick={() => setSorted((v) => !v)}>
              {sorted ? 'Return' : 'Sort'}
            </button>
          )}
          {published && (
            <div className="demobox">
              <span className="itype">Demo shortcut. A lawyer would dispose of these by hand.</span>
              <div className="row">
                <button
                  type="button"
                  disabled={!isolated}
                  onClick={() => {
                    const n = demoDispose(isolated);
                    setNotice(`${n} tasks in this project accepted and verified.`);
                  }}
                >
                  DEMO: Fix this project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const n = demoDispose(null);
                    setNotice(`${n} tasks across the firm accepted and verified.`);
                  }}
                >
                  DEMO: Fix all projects
                </button>
              </div>
            </div>
          )}
        </div>
        {narrow && sheet && <div className="sheet-backdrop" onClick={() => setSheet(false)} />}
        {(!narrow || sheet) && <Inspector onClose={narrow ? () => setSheet(false) : undefined} />}
      </div>
      {!isolated && (
        <div className="readout" dangerouslySetInnerHTML={{ __html: emphasize(readout) }} />
      )}
      <div className="legend">
        {isolated ? (
          <>
            <span>Reading left to right: instrument, template or playbook, project, team.</span>
            <span className="lead-note">Red marks what the amendment reached.</span>
            <span>A dashed line is an unconfirmed edge.</span>
            <span className="amber-note">Amber is amended and waiting on a reviewer.</span>
            <span className="green-note">Green is verified by a lawyer.</span>
          </>
        ) : (
          <>
        <span>
          <i className="gl" style={{ background: 'var(--ink)', borderRadius: '50%' }} />
          Regulatory instrument
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--soft)', borderRadius: '50%' }} />
          Template, clause or checklist
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--soft)' }} />
          Playbook
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--soft)', clipPath: 'polygon(50% 0,100% 100%,0 100%)' }} />
          Project
        </span>
        <span>
          <i
            className="gl"
            style={{ background: 'var(--soft)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }}
          />
          Client advisory
        </span>
        <span>
          <i
            className="gl"
            style={{
              background: 'transparent',
              border: '1.5px solid var(--soft)',
              borderRadius: '50%',
            }}
          />
          Team
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--lead)', borderRadius: '50%' }} />
          Flagged by the amendment
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--ochre)' }} />
          Amended, pending review
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--green)' }} />
          Verified by a lawyer
        </span>
          </>
        )}
      </div>
    </div>
  );
}

function graphCount() {
  // Counted from the graph rather than typed by hand, so it cannot drift.
  const all = allNodes();
  const instruments = all.filter((n) => n.kind === 'source').length;
  const artifacts = all.filter((n) =>
    ['document', 'playbook', 'workflow', 'advisory'].includes(n.kind),
  ).length;
  const teams = all.filter((n) => n.kind === 'team').length;
  return `${instruments} instruments, ${artifacts} firm artifacts and ${teams} teams`;
}

function emphasize(text: string) {
  return text.replace(/(\d+ documents and playbooks)/, '<b>$1</b>');
}
