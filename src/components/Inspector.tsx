import { useMemo, useState } from 'react';
import { changes } from '../data/seed';
import { actionLabel, actionWhy, bindingFor, parameterDelta, silentFailureCopy } from '../engine/actions';
import { getNode, inbound, outbound } from '../engine/graph';
import { assetFor } from '../engine/propagate';
import { formatDate } from '../lib/dates';
import { classLabel, kindLabel, rankLabel, stateLabel } from '../lib/labels';
import { selectResult } from '../store/selectors';
import { useCanon } from '../store/useCanon';
import type { TaskState } from '../types';
import { ChainView } from './ChainView';

export function Inspector({ onClose }: { onClose?: () => void }) {
  const selectedNodeId = useCanon((s) => s.selectedNodeId);
  const changeId = useCanon((s) => s.selectedChangeId);
  const tab = useCanon((s) =>
    (s.inspectorTab as string) === 'coverage' ? 'node' : s.inspectorTab,
  );
  const setTab = useCanon((s) => s.setInspectorTab);
  const edges = useCanon((s) => s.edges);
  const allTasks = useCanon((s) => s.tasks);
  const published = useCanon((s) => s.published);
  const disposeTask = useCanon((s) => s.disposeTask);
  const verifyTask = useCanon((s) => s.verifyTask);
  const selectNode = useCanon((s) => s.selectNode);
  const result = useMemo(() => selectResult(changeId, edges), [changeId, edges]);
  const tasks = allTasks.filter((t) => t.change_id === changeId);

  const change = changes.find((c) => c.id === changeId);
  const node = selectedNodeId ? getNode(selectedNodeId) : null;
  const asset = selectedNodeId ? assetFor(result, selectedNodeId) : undefined;
  const task = tasks.find((t) => t.node_id === selectedNodeId);
  const clean = result.clean.find((c) => c.node_id === selectedNodeId);
  const gap = result.coverage.find((c) => c.node_id === selectedNodeId);
  const team = result.teams.find((t) => t.node_id === selectedNodeId);
  const binding = change && selectedNodeId ? bindingFor(selectedNodeId, change.parameter_id) : undefined;
  const delta = change ? parameterDelta(change.parameter_id) : null;
  const ups = selectedNodeId ? inbound(selectedNodeId, edges) : [];
  const downs = selectedNodeId ? outbound(selectedNodeId, edges) : [];

  return (
    <aside className={`inspector ${onClose ? 'open' : ''}`}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row">
          {(['node', 'tasks', 'teams'] as const).map((id) => (
            <button key={id} className={tab === id ? 'primary' : ''} onClick={() => setTab(id)}>
              {id === 'node' ? 'Selected' : id === 'tasks' ? 'Tasks' : 'Teams'}
            </button>
          ))}
        </div>
        {onClose && <button onClick={onClose}>Close</button>}
      </div>

      {tab === 'tasks' && (
        <div className="stack">
          <div className="itype">{published ? `${tasks.length} routed tasks` : 'Publish an amendment to route work.'}</div>
          {tasks.map((t) => {
            const doc = getNode(t.node_id);
            const owner = getNode(t.owner_id);
            return (
              <button
                key={t.id}
                className={`task-card ${selectedNodeId === t.node_id ? 'selected' : ''}`}
                onClick={() => {
                  selectNode(t.node_id);
                  setTab('node');
                }}
              >
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{doc?.title}</strong>
                  <span className="chip" style={{ background: t.state === 'verified' ? 'var(--green)' : 'var(--lead)', margin: 0 }}>
                    {stateLabel(t.state)}
                  </span>
                </div>
                <div className="muted mt-8">
                  {owner?.title}
                  {t.escalated ? ' · escalated' : ''}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'teams' && (
        <div className="stack">
          <div className="itype">
            Isolate by team. People are tagged from the practice directory, not inferred.
          </div>
          {result.teams.map((item) => {
            const teamNode = getNode(item.node_id);
            return (
              <article key={item.node_id} className="card" style={{ padding: 14 }}>
                <h3>{teamNode?.title}</h3>
                <p>
                  {item.artifact_ids.length} artifacts in this blast radius.
                </p>
                <ul className="ilist">
                  {item.people.map((pid) => (
                    <li key={pid}>
                      <span className="dot" />
                      <span>
                        {getNode(pid)?.title} · {rankLabel(getNode(pid)?.props.rank)}
                      </span>
                    </li>
                  ))}
                  {item.artifact_ids.slice(0, 6).map((aid) => (
                    <li key={aid}>
                      <span className="dot lead" />
                      <span>{getNode(aid)?.title}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-12" onClick={() => selectNode(item.node_id)}>
                  Open this team
                </button>
              </article>
            );
          })}
          {result.teams.length === 0 && <p className="ihint">No teams flagged yet. Publish an amendment.</p>}
        </div>
      )}

      {tab === 'node' && !node && (
        <div>
          <h3>Inspector</h3>
          <div className="itype">Nothing selected</div>
          <p className="ihint">
            Click a node to see what it depends on and what depends on it. Publishing an amendment
            walks the graph outward from the instrument and flags everything downstream.
          </p>
          {delta && change && (
            <div className="mt-16">
              <div className="itype">{change.title}</div>
              <div className="delta">
                <div>
                  <div className="itype">Was</div>
                  <b>S${Number(delta.from).toLocaleString('en-SG')}</b>
                </div>
                <span className="muted">to</span>
                <div>
                  <div className="itype">Now</div>
                  <b>S${Number(delta.to).toLocaleString('en-SG')}</b>
                </div>
              </div>
              <p className="muted mt-8">{delta.citation}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'node' && node && (
        <div className="stack">
          <div>
            <h3>{node.title}</h3>
            <div className="itype">
              {kindLabel(node.kind)}
              {node.doc_class ? ` · ${classLabel(node.doc_class)}` : ''}
              {node.kind === 'person' ? ` · ${rankLabel(node.props.rank)}` : ''}
              {published && asset ? ', flagged' : ''}
              {node.jurisdiction ? ` · ${node.jurisdiction}` : ''}
            </div>
          </div>

          {ups.length > 0 && (
            <div>
              <div className="itype">Built on</div>
              <ul className="ilist">
                {ups.map((e) => (
                  <li key={e.id}>
                    <span className={`dot ${published && (e.src === change?.source_node || e.dst === change?.source_node) ? 'lead' : ''}`} />
                    <span>{getNode(e.src === node.id ? e.dst : e.src)?.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {downs.length > 0 && (
            <div>
              <div className="itype">Feeds</div>
              <ul className="ilist">
                {downs.map((e) => (
                  <li key={e.id}>
                    <span className={`dot ${published ? 'lead' : ''}`} />
                    <span>{getNode(e.dst === node.id ? e.src : e.dst)?.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {clean && (
            <p>{clean.reason}</p>
          )}
          {gap && !asset && <p>{gap.reason}</p>}
          {result.draft && asset && <p>{result.draft_reason}</p>}
          {team && (
            <p>
              This team is in the blast radius. {team.people.map((id) => getNode(id)?.title).join(', ')} are
              tagged on the project.
            </p>
          )}

          {asset && (
            <>
              <div>
                <div className="itype">Why this artifact is reached</div>
                <p className="ihint">
                  Affectedness comes from stored edges. This chain is the only reason the brain can flag it.
                </p>
                <ChainView chain={asset.chain} />
              </div>
              <div>
                <div className="itype">Action from document class</div>
                <h3>{actionLabel(asset.action)}</h3>
                <p className="mt-8">{actionWhy(asset.action, node.doc_class)}</p>
                {silentFailureCopy(asset) && <p className="mt-12">{silentFailureCopy(asset)}</p>}
              </div>
            </>
          )}

          {binding && (
            <div>
              <div className="itype">{binding.location}</div>
              <p>{binding.why}</p>
              <div className="excerpt mt-12">{binding.excerpt}</div>
              {binding.edit_kind === 'mechanical' && binding.mechanical_edit && (
                <>
                  <div className="itype mt-12">Mechanical suggestion</div>
                  <div className="excerpt">{binding.mechanical_edit}</div>
                </>
              )}
              {binding.edit_kind === 'substantive' && (
                <p className="mt-12">
                  This is a judgement call. The brain will not draft replacement text. The parameter
                  moves from S$20,000 to S$5,000. The lawyer named on the task decides the wording
                  of {binding.location}.
                </p>
              )}
            </div>
          )}

          {node.doc_class === 'bilateral' && Boolean(node.props.change_in_law_clause) && (
            <div>
              <div className="itype">Change-in-law clause {String(node.props.change_in_law_clause)}</div>
              <p>{String(node.props.change_in_law_text)}</p>
            </div>
          )}

          {task && (
            <TaskDisposition
              ownerId={task.owner_id}
              nominatedId={task.nominated_owner_id}
              state={task.state}
              escalated={task.escalated}
              path={task.escalation_path}
              why={task.escalation_reason}
              reason={task.reason}
              onDispose={(state, reason, actor) => disposeTask(task.id, state, reason, actor)}
              onVerify={(actor) => verifyTask(task.id, actor)}
            />
          )}
        </div>
      )}
    </aside>
  );
}

function TaskDisposition({
  ownerId,
  nominatedId,
  state,
  escalated,
  path,
  why,
  reason,
  onDispose,
  onVerify,
}: {
  ownerId: string;
  nominatedId: string;
  state: TaskState;
  escalated: boolean;
  path: string[];
  why: string | null;
  reason: string | null;
  onDispose: (state: Extract<TaskState, 'accepted' | 'amended' | 'rejected'>, reason: string, actor: string) => void;
  onVerify: (actor: string) => void;
}) {
  const [note, setNote] = useState('');
  const owner = getNode(ownerId);
  const nominated = getNode(nominatedId);

  return (
    <div>
      <div className="itype">Task · {stateLabel(state)}</div>
      <p>
        Routed to {owner?.title}
        {escalated && nominated ? `, after ${nominated.title} could not dispose` : ''}.
      </p>
      {escalated && why && <p className="mt-8">{why}</p>}
      {path.length > 1 && (
        <p className="muted mt-8">{path.map((id) => getNode(id)?.title ?? id).join(' → ')}</p>
      )}
      {reason && <p className="mt-12">{reason}</p>}
      {(state === 'routed' || state === 'open') && (
        <>
          <label className="field">
            <span className="itype">Disposition note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="The owner records why this is accepted, amended, or rejected."
              rows={3}
            />
          </label>
          <div className="row mt-12">
            <button className="primary" onClick={() => onDispose('accepted', note || 'Owner accepted the proposed action.', ownerId)}>
              Approve the proposed action
            </button>
            <button onClick={() => onDispose('amended', note || 'Owner amended the action and recorded the change.', ownerId)}>
              Amend the draft
            </button>
            <button onClick={() => onDispose('rejected', note || 'Owner rejected the proposed action.', ownerId)}>
              Reject, and teach the graph
            </button>
          </div>
        </>
      )}
      {(state === 'accepted' || state === 'amended') && (
        <button className="primary mt-12" onClick={() => onVerify(ownerId)}>
          Re-check the document of record
        </button>
      )}
      {state === 'verified' && (
        <p className="mt-8">
          Verified on {formatDate('2026-09-05T09:00:00+08:00')}. Detection without this step is
          just a prettier alert.
        </p>
      )}
    </div>
  );
}
