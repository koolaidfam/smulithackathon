import { useEffect, useRef, useState } from 'react';
import { draftFindings } from '../data/draft';
import { parameterDelta } from '../engine/actions';
import { changes } from '../data/seed';
import { formatDate } from '../lib/dates';
import { useCanon } from '../store/useCanon';

/**
 * The upload gate.
 *
 * An associate adds a document to the firm's material. The service checks it
 * against the instruments on the horizon before it lands, and stops it when it
 * still carries a value the regulator has moved. Nothing is edited and nothing
 * is rejected outright. A person may override, and the override is recorded
 * with a reason and a name.
 *
 * The check is simulated for this build. No file leaves the browser.
 */
type Phase = 'idle' | 'working' | 'blocked' | 'accepted' | 'overridden';

// Each step carries its own duration. A check that takes the same time for
// every stage reads as a progress bar with nothing behind it.
const STEPS: Array<{ label: string; ms: number }> = [
  { label: 'Uploading the file', ms: 1400 },
  { label: 'Extracting the text', ms: 1300 },
  { label: 'Reading the clause structure', ms: 1100 },
  { label: 'Matching against the watched instruments', ms: 1900 },
  { label: 'Checking the parameters it depends on', ms: 1700 },
];

const TOTAL_MS = STEPS.reduce((sum, s) => sum + s.ms, 0);

export function UploadGate({ onClose, onReview }: { onClose: () => void; onReview: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [file, setFile] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [reason, setReason] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const change = changes[0];
  const watched = useCanon((s) => s.watchedSourceIds).length;
  const delta = parameterDelta(change.parameter_id);
  const hits = draftFindings.filter((f) => f.kind === 'mechanical').slice(0, 2);

  useEffect(() => {
    if (phase !== 'working') return;
    if (step >= STEPS.length) {
      const t = window.setTimeout(() => setPhase('blocked'), 700);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((n) => n + 1), STEPS[step].ms);
    return () => window.clearTimeout(t);
  }, [phase, step]);

  // The bar moves on its own clock, so it creeps through a long step instead
  // of sitting still and then jumping.
  useEffect(() => {
    if (phase !== 'working') return;
    const started = performance.now();
    const id = window.setInterval(() => setElapsed(performance.now() - started), 90);
    return () => window.clearInterval(id);
  }, [phase]);

  function take(name: string | undefined) {
    setFile(name ?? 'engagement-letter-precedent.docx');
    setStep(0);
    setElapsed(0);
    setPhase('working');
  }

  return (
    <div className="gate-backdrop" role="dialog" aria-modal="true" aria-label="Upload a document">
      <div className="gate">
        {phase === 'idle' && (
          <>
            <div className="itype">Add to the firm's material</div>
            <h3>Upload a document</h3>
            <p>
              The service checks a document against the instruments on the horizon before it joins
              the graph. Simulated for this build. Nothing leaves your browser.
            </p>
            <button
              className="gate-drop"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <strong>Choose a file</strong>
              <span className="muted">or continue with a sample precedent</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={(e) => take(e.target.files?.[0]?.name)}
            />
            <div className="row mt-12">
              <button className="primary" onClick={() => take(undefined)}>
                Use the sample precedent
              </button>
              <button onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {phase === 'working' && (
          <>
            <div className="itype">Checking</div>
            <h3>{file}</h3>
            <ol className="gate-steps">
              {STEPS.map((s, i) => (
                <li key={s.label} className={i < step ? 'done' : i === step ? 'on' : ''}>
                  {s.label}
                </li>
              ))}
            </ol>
            <div className="gate-bar">
              <span style={{ width: `${Math.min(99, (elapsed / TOTAL_MS) * 100)}%` }} />
            </div>
            <p className="muted gate-count">
              Checked against {watched} instruments on the horizon
            </p>
          </>
        )}

        {phase === 'blocked' && (
          <>
            <div className="itype lead-note">Upload held</div>
            <h3>This document is not current</h3>
            <p>
              <strong>{file}</strong> still carries a figure that {change.instrument_ref} has moved.
              It has not joined the graph.
            </p>

            {delta && (
              <div className="delta mt-12">
                <div>
                  <div className="itype">The document assumes</div>
                  <b>S${Number(delta.from).toLocaleString('en-SG')}</b>
                </div>
                <span className="muted">now</span>
                <div>
                  <div className="itype">The instrument says</div>
                  <b>S${Number(delta.to).toLocaleString('en-SG')}</b>
                </div>
              </div>
            )}
            <p className="muted mt-8">
              {change.instrument_ref}, in force {formatDate(change.in_force_at)}. {delta?.citation}
            </p>

            <div className="itype mt-16">Where it appears</div>
            <ul className="ilist">
              {hits.map((f) => (
                <li key={f.id}>
                  <span className="dot lead" />
                  <span>
                    {f.location}. {f.excerpt}
                  </span>
                </li>
              ))}
            </ul>

            <div className="disclaim mt-16">
              <strong>Nothing has been changed for you.</strong>
              <p>
                The service will not rewrite the document to make it pass. A person reads the
                passages and redrafts them, or records why the document goes in as it stands.
              </p>
            </div>

            <div className="row mt-16">
              <button className="primary" onClick={onReview}>
                Open the flagged passages
              </button>
              <button onClick={onClose}>Cancel the upload</button>
            </div>

            <details className="gate-override">
              <summary>Upload it anyway</summary>
              <p className="ihint">
                An override is recorded against your name and shown on the document until a lawyer
                clears it.
              </p>
              <label className="field">
                <span className="itype">Why this goes in as it stands</span>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="For example: this precedent is being retired next week and is not in use."
                />
              </label>
              <button
                disabled={reason.trim().length < 8}
                onClick={() => setPhase('overridden')}
              >
                Record the override and upload
              </button>
            </details>
          </>
        )}

        {phase === 'overridden' && (
          <>
            <div className="itype">Uploaded with an override</div>
            <h3>{file}</h3>
            <p>
              Recorded against Jamie Koh on {formatDate('2026-09-05T09:00:00+08:00')}. The document
              is in the graph and carries an open exception until a lawyer clears it.
            </p>
            <div className="excerpt mt-12">{reason}</div>
            <div className="row mt-16">
              <button className="primary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}

        {phase === 'accepted' && (
          <>
            <h3>Uploaded</h3>
            <button className="primary" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
