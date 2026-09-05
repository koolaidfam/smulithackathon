import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changes } from '../data/seed';
import { getNode } from '../engine/graph';
import { selectResult, selectStale } from '../store/selectors';
import { useCanon } from '../store/useCanon';
import { BrainGraph } from './BrainGraph';
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
  const replaying = useCanon((s) => s.replaying);
  const replayIndex = useCanon((s) => s.replayIndex);
  const setReplayIndex = useCanon((s) => s.setReplayIndex);
  const stopReplay = useCanon((s) => s.stopReplay);
  const result = useMemo(() => selectResult(changeId, edges), [changeId, edges]);
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [sheet, setSheet] = useState(false);

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
  const flows = result.reached.filter((a) => getNode(a.node_id)?.kind === 'workflow').length;
  const advs = result.reached.filter((a) => getNode(a.node_id)?.kind === 'advisory').length;
  const teamNames = result.teams.map((t) => getNode(t.node_id)?.title).filter(Boolean);

  const readout =
    !published && !result.draft
      ? `${graphCount()} instruments, firm artifacts and teams mapped. Nothing flagged. Publish an amendment to walk the graph.`
      : result.draft
        ? `${change?.title}. Mapped, not flagged. ${result.draft_reason}`
        : `${change?.title} amended. ${docs} documents and playbooks flagged, ${flows} workflows touched, ${advs} published outputs now stale, across ${teamNames.length} teams: ${teamNames.join(', ')}.`;

  return (
    <div className="brain" style={fullHeight ? { height: '100%', display: 'flex', flexDirection: 'column' } : undefined}>
      <div className="brainbar">
        <label htmlFor="src" className="ui">
          Amend an instrument
        </label>
        <select
          id="src"
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
        <button
          className="primary"
          onClick={() => {
            const msg = publishAmendment();
            setNotice(msg);
          }}
        >
          Publish amendment
        </button>
        <button className="primary" type="button" onClick={() => navigate('/draft')}>
          Draft legal update
        </button>
        <button
          onClick={() => {
            clearFlags();
            setNotice(null);
          }}
        >
          Clear
        </button>
        {narrow && (
          <button onClick={() => setSheet(true)}>Open inspector</button>
        )}
      </div>
      {notice && <div className="readout">{notice}</div>}
      <div className="brainbody" style={fullHeight ? { flex: 1, minHeight: 0 } : undefined}>
        <BrainGraph
          edges={edges}
          flagged={flagged}
          selectedId={selectedNodeId}
          watchedSourceIds={watched}
          onSelect={selectNode}
        />
        {narrow && sheet && <div className="sheet-backdrop" onClick={() => setSheet(false)} />}
        {(!narrow || sheet) && <Inspector onClose={narrow ? () => setSheet(false) : undefined} />}
      </div>
      <div className="readout" dangerouslySetInnerHTML={{ __html: emphasize(readout) }} />
      <div className="legend">
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
          Workflow
        </span>
        <span>
          <i
            className="gl"
            style={{ background: 'var(--soft)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)' }}
          />
          Client advisory
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--green)', borderRadius: '50%' }} />
          Team
        </span>
        <span>
          <i className="gl" style={{ background: 'var(--lead)', borderRadius: '50%' }} />
          Flagged by the amendment
        </span>
      </div>
    </div>
  );
}

function graphCount() {
  return '9 watched instruments, 28 firm artifacts and 4 teams';
}

function emphasize(text: string) {
  return text.replace(/(\d+ documents and playbooks)/, '<b>$1</b>');
}
