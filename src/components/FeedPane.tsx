import { useMemo } from 'react';
import { issuerOf } from '../data/issuers';
import { changes } from '../data/seed';
import { getNode } from '../engine/graph';
import { propagateById } from '../engine/propagate';
import { formatDate } from '../lib/dates';
import { useCanon } from '../store/useCanon';

/**
 * The horizon feed. Upstream, an ingestion layer watches the sources a partner
 * has chosen and turns each circular into a structured change. That layer is
 * stubbed in this build. These items are seeded, not fetched.
 */
export function FeedPane({ onClose }: { onClose?: () => void }) {
  const edges = useCanon((s) => s.edges);
  const changeId = useCanon((s) => s.selectedChangeId);
  const selectChange = useCanon((s) => s.selectChange);
  const watched = useCanon((s) => s.watchedSourceIds);
  const isolatedWorkflowId = useCanon((s) => s.isolatedWorkflowId);
  const setIsolated = useCanon((s) => s.isolateWorkflow);

  const items = useMemo(
    () =>
      changes.map((c) => {
        const result = propagateById(c.id, edges);
        const flows = result.reached
          .filter((a) => getNode(a.node_id)?.kind === 'workflow')
          .map((a) => a.node_id);
        return { change: c, flows, draft: result.draft };
      }),
    [edges],
  );

  return (
    <aside className="feed">
      <div className="draft-colhead">
        <div>
          <span className="itype">Horizon feed</span>
          <strong className="feed-title">Circulars picked up</strong>
        </div>
        {onClose && <button onClick={onClose}>Close</button>}
      </div>

      <p className="ihint feed-note">
        Seeded for this build. The ingestion layer that would scrape, read the RSS and take the
        subscription email is not wired up.
      </p>

      {items.map(({ change, flows, draft }) => {
        const source = getNode(change.source_node);
        const issuer = issuerOf(source?.props.issuer);
        const onHorizon = watched.includes(change.source_node);
        const live = change.id === changeId;
        return (
          <article key={change.id} className={`feed-item ${live ? 'on' : ''}`}>
            <button className="feed-head" onClick={() => selectChange(change.id)}>
              <span className="feed-issuer">
                {issuer?.logo ? (
                  <img src={issuer.logo} alt="" className="feed-logo" width={44} height={24} />
                ) : (
                  <span className="badge" style={{ borderColor: issuer?.accent, color: issuer?.accent }}>
                    {issuer?.code ?? 'REG'}
                  </span>
                )}
                <span className="itype">
                  {issuer?.label ?? 'Regulator'} · {source?.jurisdiction ?? 'SG'} ·{' '}
                  {formatDate(change.gazetted_at)}
                </span>
              </span>
              <strong>{change.title}</strong>
              <span className="muted">{change.instrument_ref}</span>
              {!onHorizon && <span className="feed-tag">Not on the horizon</span>}
              {draft && <span className="feed-tag">Draft. Mapped, not flagged.</span>}
            </button>

            {live && (
              <div className="feed-body">
                <p className="muted">{change.summary}</p>
                <div className="itype mt-12">
                  Projects this reaches ({flows.length})
                </div>
                <ul className="feed-flows">
                  {flows.map((id) => (
                    <li key={id}>
                      <button
                        className={isolatedWorkflowId === id ? 'primary' : ''}
                        onClick={() => setIsolated(isolatedWorkflowId === id ? null : id)}
                      >
                        {getNode(id)?.title}
                      </button>
                    </li>
                  ))}
                  {flows.length === 0 && <li className="muted">Nothing mapped yet.</li>}
                </ul>
              </div>
            )}
          </article>
        );
      })}
    </aside>
  );
}
