import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  STATE_LABEL,
  STATE_NOTE,
  seedPublications,
  skeletonFor,
  type Publication,
  type PublicationState,
} from '../data/publications';
import { FIRM_NAME, changes } from '../data/seed';
import { parameterDelta } from '../engine/actions';
import { getNode } from '../engine/graph';
import { propagateById } from '../engine/propagate';
import { formatDate } from '../lib/dates';
import { useCanon } from '../store/useCanon';

const ORDER: PublicationState[] = ['draft', 'in_review', 'client', 'public'];

export function Publications() {
  const edges = useCanon((s) => s.edges);
  const [items, setItems] = useState<Publication[]>(seedPublications);
  const [openId, setOpenId] = useState(seedPublications[0].id);
  const [sourceId, setSourceId] = useState(changes[0].id);

  const open = items.find((p) => p.id === openId) ?? items[0];
  const change = changes.find((c) => c.id === open.change_id) ?? changes[0];

  const reach = useMemo(() => {
    const result = propagateById(open.change_id, edges);
    const teams = result.teams.map((t) => getNode(t.node_id)?.title).filter(Boolean);
    return { result, teams };
  }, [open.change_id, edges]);

  function update(id: string, patch: Partial<Publication>) {
    setItems((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function startFromCircular() {
    const source = changes.find((c) => c.id === sourceId);
    if (!source) return;
    const delta = parameterDelta(source.parameter_id);
    const result = propagateById(source.id, edges);
    const teamNames = result.teams.map((t) => getNode(t.node_id)?.title).filter(Boolean);
    const deltaLine = delta
      ? `The figure in ${delta.citation} moves from S$${Number(delta.from).toLocaleString('en-SG')} to S$${Number(delta.to).toLocaleString('en-SG')}.`
      : source.summary;
    const item: Publication = {
      id: `pub-${Date.now()}`,
      change_id: source.id,
      title: source.title,
      standfirst: 'Working title. The author rewrites this.',
      author_id: 'person-marcus',
      state: 'draft',
      updated_at: '2026-09-05T09:00:00+08:00',
      analysis: skeletonFor(
        source,
        deltaLine,
        teamNames.length
          ? `${result.reached.length} firm artifacts, across ${teamNames.join(', ')}.`
          : 'Nothing mapped yet.',
      ),
    };
    setItems((list) => [item, ...list]);
    setOpenId(item.id);
  }

  return (
    <div className="page">
      <div className="wrap">
        <header className="mast">
          <div className="slug">Legal updates and publications</div>
          <h1>What {FIRM_NAME} says about the change, in its own voice</h1>
          <p className="lede">
            The brain already read the circular and already knows which of the firm's material it
            reaches. That is the expensive half of writing a client update. This page assembles the
            facts the firm can defend and leaves the analysis to a named lawyer, then tracks who the
            piece has been released to.
          </p>
        </header>

        <section className="block">
          <div className="sechead">
            <div className="secnum">01</div>
            <div>
              <h2>Start from a circular</h2>
              <p className="secintro sub">
                The skeleton carries the instrument, the parameter delta, the commencement date and
                the reach inside the firm. Every one of those is a fact with a citation. The
                sections a client actually pays for are left empty on purpose.
              </p>
            </div>
          </div>
          <div className="card row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
              {changes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button className="primary" onClick={startFromCircular}>
              Start an update
            </button>
            <Link to="/" className="draft-back">
              Back to the brain
            </Link>
          </div>
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">02</div>
            <div>
              <h2>The firm's feed</h2>
              <p className="secintro sub">
                One list, four states. Nothing reaches a client until a partner has signed it, and
                nothing is public until someone chooses that deliberately.
              </p>
            </div>
          </div>

          <div className="pub-grid">
            <div className="pub-list">
              {items.map((item) => {
                const author = getNode(item.author_id);
                return (
                  <button
                    key={item.id}
                    className={`pub-row ${item.id === open.id ? 'on' : ''}`}
                    onClick={() => setOpenId(item.id)}
                  >
                    <span className={`chip state-${item.state}`}>{STATE_LABEL[item.state]}</span>
                    <strong>{item.title}</strong>
                    <span className="muted">
                      {author?.title} · {formatDate(item.updated_at)}
                    </span>
                  </button>
                );
              })}
            </div>

            <article className="pub-open card">
              <div className="itype">
                {change.instrument_ref} · in force {formatDate(change.in_force_at)}
              </div>
              <h3>{open.title}</h3>
              <p className="muted">{open.standfirst}</p>

              <div className="itype mt-16">Facts the brain can defend</div>
              <ul className="ilist">
                <li>
                  <span className="dot lead" />
                  <span>{change.summary}</span>
                </li>
                <li>
                  <span className="dot lead" />
                  <span>
                    {reach.result.reached.length} firm artifacts reached, across{' '}
                    {reach.teams.join(', ') || 'no team yet'}.
                  </span>
                </li>
              </ul>

              <div className="itype mt-16">The update</div>
              <textarea
                className="pub-editor"
                rows={14}
                value={open.analysis}
                placeholder="Start an update from a circular, or write from scratch."
                onChange={(e) => update(open.id, { analysis: e.target.value })}
              />
              <p className="ihint">
                The brain will not write the analysis or the recommendation. It assembles the
                citable facts and stops there.
              </p>

              <div className="itype mt-16">Release</div>
              <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
                {ORDER.map((state) => (
                  <button
                    key={state}
                    className={open.state === state ? 'primary' : ''}
                    onClick={() => update(open.id, { state })}
                  >
                    {STATE_LABEL[state]}
                  </button>
                ))}
              </div>
              <p className="mt-8">{STATE_NOTE[open.state]}</p>
            </article>
          </div>
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">03</div>
            <div>
              <h2>What the client sees</h2>
              <p className="secintro sub">
                The client feed carries the firm's own writing. It does not expose the graph, the
                tasks, or which of the firm's own templates were found to be stale.
              </p>
            </div>
          </div>
          <div className="card pub-client">
            <div className="itype">{FIRM_NAME} · client update</div>
            <h3>{open.title}</h3>
            <p className="muted">{open.standfirst}</p>
            <pre className="pub-preview">
              {open.analysis || 'Nothing written yet.'}
            </pre>
            <p className="ihint">
              {open.state === 'client' || open.state === 'public'
                ? `Released. ${STATE_NOTE[open.state]}`
                : 'Not released. This is a preview inside the firm.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
