import { useNavigate } from 'react-router-dom';
import { getNode } from '../engine/graph';
import { classLabel, kindLabel, stateLabel } from '../lib/labels';
import { useCanon } from '../store/useCanon';

export function Tasks() {
  const tasks = useCanon((s) => s.tasks);
  const published = useCanon((s) => s.published);
  const selectChange = useCanon((s) => s.selectChange);
  const selectNode = useCanon((s) => s.selectNode);
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="wrap">
        <header className="mast">
          <div className="slug">Inbox</div>
          <h1>Routed work</h1>
          <p className="lede">
            Each task belongs to a named person who can dispose of it. An accepted edit is not done
            until someone re-checks the document of record. Step five is a hard gate.
          </p>
        </header>
        <div className="stack mt-24">
          {!published && tasks.length === 0 && (
            <article className="card">
              <p>Nothing is routed until a lawyer publishes an amendment from the brain.</p>
              <button className="primary mt-12" onClick={() => navigate('/')}>
                Open the company brain
              </button>
            </article>
          )}
          {tasks.map((task) => {
            const doc = getNode(task.node_id);
            const owner = getNode(task.owner_id);
            const nominated = getNode(task.nominated_owner_id);
            return (
              <button
                key={task.id}
                className="task-card"
                onClick={() => {
                  selectChange(task.change_id);
                  selectNode(task.node_id);
                  navigate('/');
                }}
              >
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className="itype">
                      {doc ? kindLabel(doc.kind) : 'Artifact'}
                      {doc?.doc_class ? ` · ${classLabel(doc.doc_class)}` : ''}
                    </div>
                    <h2 style={{ fontSize: 28 }}>{doc?.title}</h2>
                  </div>
                  <span
                    className="chip"
                    style={{ background: task.state === 'verified' ? 'var(--green)' : 'var(--lead)' }}
                  >
                    {stateLabel(task.state)}
                  </span>
                </div>
                <p className="muted mt-8">
                  Owner {owner?.title}
                  {task.escalated && nominated
                    ? `. Nominated owner ${nominated.title} could not dispose.`
                    : '.'}
                </p>
                {task.escalation_reason && <p className="mt-8">{task.escalation_reason}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
