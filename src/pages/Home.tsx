import { BrainPanel } from '../components/BrainPanel';
import { InstallHint } from '../components/InstallHint';
import { LimitsNote } from '../components/LimitsNote';

export function Home() {
  return (
    <div className="page">
      <div className="wrap">
        <header className="mast">
          <div className="slug">Hackathon submission, Singapore · Hale & Tan LLP</div>
          <h1>The rule changed on Tuesday. What in the firm still assumes otherwise?</h1>
          <p className="lede">
            Horizon scanning already tells a firm that a circular landed. The unanswered question is
            which of its templates, playbooks, checklists, workflows and past advisories were built
            on the version that has just been replaced. We map that, then push the change through.
          </p>
          <div className="credit">
            Working diagram, current state and proposed state, with the underlying knowledge graph
            rendered live. The lawyer chooses the sources. Publishing an amendment is a manual act.
          </div>
        </header>

        <section className="block" id="brain">
          <div className="sechead">
            <div className="secnum">01</div>
            <div>
              <h2>The company brain</h2>
              <p className="secintro sub">
                Every instrument a regulator publishes is a node. Every artifact the firm has built
                on top of it is a node. The edges record the dependency, so a change at the top has
                a computable blast radius. Drag to turn the model. Click any node to read its
                dependencies. Publish an amendment to watch it propagate.
              </p>
            </div>
          </div>
          <BrainPanel />
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">02</div>
            <div>
              <h2>How the work runs today</h2>
              <p className="secintro sub">
                This is the sequence on the whiteboard, drawn honestly. It works, and it depends
                entirely on one associate remembering what the firm has already written.
              </p>
            </div>
          </div>
          <div className="track old">
            <div className="trackhead">
              <h3>Current</h3>
              <span className="tag">Days to weeks, no record of coverage</span>
            </div>
            <div className="steps">
              <div className="step">
                <div className="n">1</div>
                <div className="t">MAS publishes</div>
                <div className="d">A circular, notice or revised guideline is gazetted.</div>
                <div className="who">Regulator</div>
              </div>
              <div className="step">
                <div className="n">2</div>
                <div className="t">Associate reads it</div>
                <div className="d">Whoever is subscribed picks it up, if the day allows.</div>
                <div className="who">Associate</div>
              </div>
              <div className="step">
                <div className="n">3</div>
                <div className="t">Impact assessed from memory</div>
                <div className="d">The associate recalls which documents feel affected and searches the DMS by hand.</div>
                <div className="who">Associate</div>
              </div>
              <div className="step">
                <div className="n">4</div>
                <div className="t">Escalation</div>
                <div className="d">The question goes up to a senior associate for a view.</div>
                <div className="who">Senior associate</div>
              </div>
              <div className="step">
                <div className="n">5</div>
                <div className="t">Changes proposed</div>
                <div className="d">The senior associate decides what the amendment means for the precedents.</div>
                <div className="who">Senior associate</div>
              </div>
              <div className="step">
                <div className="n">6</div>
                <div className="t">Documents amended by hand</div>
                <div className="d">Each affected file is opened and edited individually.</div>
                <div className="who">Associate</div>
              </div>
            </div>
            <div className="faults">
              <div className="fault">Nothing records which documents were checked, so nobody can prove coverage afterwards.</div>
              <div className="fault">The dependency map lives in the heads of the two people who happened to draft the precedent.</div>
              <div className="fault">Client advisories published last quarter keep stating the old position.</div>
              <div className="fault">A gap stays silent until a deal, a filing or a regulator surfaces it.</div>
            </div>
          </div>
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">03</div>
            <div>
              <h2>How the work runs on the brain</h2>
              <p className="secintro sub">
                The same sequence with the graph underneath it. The machine does retrieval,
                comparison and drafting. The lawyer keeps the judgement, and the system records that
                the judgement was made.
              </p>
            </div>
          </div>
          <div className="track">
            <div className="trackhead">
              <h3>Proposed</h3>
              <span className="tag">Minutes to first draft, full coverage record</span>
            </div>
            <div className="steps">
              <div className="step">
                <div className="n">1</div>
                <div className="t">Watchers pull</div>
                <div className="d">MAS, ACRA, SGX and ROC are polled on a schedule. A partner can also push in a market development by hand, including a parallel jurisdiction.</div>
                <div className="who">System, or partner</div>
              </div>
              <div className="step">
                <div className="n">2</div>
                <div className="t">Parse and pin</div>
                <div className="d">Obligations, commencement date and paragraph anchors are extracted, so every later claim points back to a line of text.</div>
                <div className="who">System</div>
              </div>
              <div className="step">
                <div className="n">3</div>
                <div className="t">Resolve the blast radius</div>
                <div className="d">The graph returns every artifact and workflow built on the affected obligation, with the reason it was returned.</div>
                <div className="who">System</div>
              </div>
              <div className="step">
                <div className="n">4</div>
                <div className="t">Draft the redline</div>
                <div className="d">A proposed amendment per artifact, quoting the paragraph that drives it. Substantive calls get no replacement text.</div>
                <div className="who">System</div>
              </div>
              <div className="step">
                <div className="n">5</div>
                <div className="t">Lawyer decides</div>
                <div className="d">Approve, amend or reject. A rejection carries a reason and teaches the graph that the edge was wrong.</div>
                <div className="who">Associate, then senior associate</div>
              </div>
              <div className="step">
                <div className="n">6</div>
                <div className="t">Propagate and version</div>
                <div className="d">Approved wording lands in every dependent artifact. Status flips, the old version is preserved, owning teams are notified.</div>
                <div className="who">System</div>
              </div>
              <div className="step">
                <div className="n">7</div>
                <div className="t">Publish outward</div>
                <div className="d">A client advisory is drafted in the firm's own voice and routed to the partner who owns the relationship.</div>
                <div className="who">Partner signs, firm publishes</div>
              </div>
            </div>
          </div>
          <div className="two">
            <div className="card">
              <h3>Where the judgement sits</h3>
              <p>
                The system is allowed to find, compare and draft. It is not allowed to close the
                loop. Step five is a hard gate, and the gate is the product's honest answer to the
                risk of cognitive offloading.
              </p>
              <p>
                Approval is recorded against a named lawyer, a version and a timestamp, which
                converts an invisible habit into an auditable act.
              </p>
            </div>
            <div className="card">
              <h3>Why the house voice matters</h3>
              <p>
                The firm's past legal updates are sorted by team, and the strongest examples become
                the few-shot prompt for the advisory in step seven.
              </p>
              <p>
                Being first to publish a competent, on-brand note is business development, and the
                same pipeline that protects the precedents produces it at no extra cost.
              </p>
            </div>
          </div>
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">04</div>
            <div>
              <h2>Every artifact carries a state</h2>
              <p className="secintro sub">
                Resilience shows up at the level of a single file. A lawyer opening a template sees
                its standing before drafting a word, and a template that has drifted announces itself.
              </p>
            </div>
          </div>
          <div className="states">
            <div className="state">
              <span className="chip" style={{ background: 'var(--green)' }}>Current</span>
              <p>Verified against every instrument it depends on, as at the last watcher run.</p>
            </div>
            <div className="state">
              <span className="chip" style={{ background: 'var(--lead)' }}>Flagged</span>
              <p>An upstream instrument moved. The artifact is usable, and it now carries a warning at the point of use.</p>
            </div>
            <div className="state">
              <span className="chip" style={{ background: 'var(--ochre)' }}>In review</span>
              <p>A redline is drafted and sitting with a named lawyer for a decision.</p>
            </div>
            <div className="state">
              <span className="chip" style={{ background: 'var(--ink)' }}>Amended</span>
              <p>Approved, versioned, propagated to dependants, owning team notified.</p>
            </div>
            <div className="state">
              <span className="chip" style={{ background: 'var(--grey)' }}>Superseded</span>
              <p>Retired from the precedent bank and kept for the audit trail.</p>
            </div>
          </div>
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">05</div>
            <div>
              <h2>The three questions from the whiteboard</h2>
              <p className="secintro sub">Answered as design decisions, with the part that stays open stated plainly.</p>
            </div>
          </div>
          <div className="qa">
            <h3>Cost</h3>
            <p className="ans">
              Watching is cheap and constant. Reasoning is expensive and rare. Parsing and graph
              resolution run on a small model at a fixed monthly cost, and the frontier model is
              called only at step four, once per affected artifact per amendment.
            </p>
            <p className="open">Open: the per amendment ceiling a firm will accept before it wants a cheaper draft.</p>
          </div>
          <div className="qa">
            <h3>Confidentiality</h3>
            <p className="ans">
              The graph stores structure, meaning document identifiers, clause references and
              dependency edges. Client content stays in the firm's own document system and is
              retrieved at draft time behind the firm's tenancy.
            </p>
            <p className="open">Open: whether the pilot firm accepts a hosted graph or requires it on premise.</p>
          </div>
          <div className="qa">
            <h3>The role of the associate</h3>
            <p className="ans">
              What disappears is the search for affected documents and the retyping of the same
              amendment into eleven files. What remains is the judgement call on whether a proposed
              change is right, which is the part clients pay for and the part that trains a lawyer.
            </p>
            <p className="open">Open: how a firm keeps juniors reading primary sources when the summary arrives first.</p>
          </div>
          <div className="qa">
            <h3>Hallucination</h3>
            <p className="ans">
              Every proposed change cites the paragraph of the instrument that drives it, retrieved
              rather than recalled. A redline with no anchor is not shown to a lawyer. The graph
              constrains retrieval to artifacts with a declared dependency.
            </p>
            <p className="open">Open: detecting the change that affects a document with no edge to it yet.</p>
          </div>
        </section>

        <InstallHint />
        <LimitsNote />
        <footer className="site">
          Diagram built from the team whiteboard. Instruments, templates and teams shown in the
          graph are representative of a Singapore funds and corporate practice. Australia sits off
          the horizon until a lawyer adds it.
        </footer>
      </div>
    </div>
  );
}
