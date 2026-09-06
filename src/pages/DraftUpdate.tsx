import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SendDraft } from '../components/SendDraft';
import { UploadGate } from '../components/UploadGate';
import { useCanon } from '../store/useCanon';
import {
  SOURCE_PDF,
  SOURCE_PDF_TITLE,
  UPLOAD_TITLE,
  draftFindings,
  draftMatters,
  uploadFindings,
  uploadMatters,
  type DraftStatus,
  type DraftView,
} from '../data/draft';

/** The graph node each scenario amends, and where to land afterwards. */
const AMENDED_ON_PUBLICATION = 'adv-aml';
const AMENDED_ON_UPLOAD = 'doc-template';
const STEPS = [
  { id: 'draft', label: 'Initial draft', hint: 'passages marked' },
  { id: 'review', label: 'Legal review', hint: 'decided by a lawyer' },
] as const;

export function DraftUpdate() {
  // Two scenarios share this layout. A client advisory the firm is drafting,
  // and a precedent an associate has just tried to upload.
  const navigate = useNavigate();
  const markAmended = useCanon((s) => s.markAmended);
  const isolate = useCanon((s) => s.isolateWorkflow);
  const setSortOnReturn = useCanon((s) => s.setSortOnReturn);
  const [params] = useSearchParams();
  const fromUpload = params.get('doc') === 'upload';
  const [mode, setMode] = useState<'publication' | 'upload'>(
    fromUpload ? 'upload' : 'publication',
  );
  const matters = mode === 'upload' ? uploadMatters : draftMatters;
  const findings = mode === 'upload' ? uploadFindings : draftFindings;
  const [matterId, setMatterId] = useState(
    fromUpload ? uploadMatters[0].id : draftMatters[0].id,
  );
  const [index, setIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, DraftStatus>>({});
  const [note, setNote] = useState('');
  const [showMatters, setShowMatters] = useState(false);
  const [showReview, setShowReview] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const [view, setView] = useState<DraftView>('draft');
  const [, setSent] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const draftsRef = useRef<Record<string, string>>({});
  const seededFor = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)');
    const sync = () => {
      setNarrow(mq.matches);
      if (mq.matches) setShowReview(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const finding = findings[Math.min(index, findings.length - 1)];
  const reviewed = Object.values(statuses).filter((s) => s !== 'open').length;
  const accepted = Object.values(statuses).filter((s) => s === 'accepted' || s === 'decided').length;
  const reviewsDone = reviewed === findings.length;
  const activeStep = reviewed > 0 ? 1 : 0;
  const matter = matters.find((m) => m.id === matterId) ?? matters[0];
  const status = statuses[finding.id] ?? 'open';

  const mailBody = useMemo(
    () =>
      [
        'Marcus,',
        '',
        `${matter.title} has been reviewed against MAS Notice 626 as amended on 15 August 2026.`,
        `${accepted} of ${findings.length} marked passages carry a proposed line, which I have taken. The rest are judgement calls and are noted in the document for you.`,
        '',
        'Nothing has been published. The draft is attached as it stands and waits on your sign-off.',
        '',
        'Jamie',
      ].join('\n'),
    [matter.title, accepted, findings.length],
  );

  const stepHint = useMemo(() => {
    if (activeStep === 0) return `${reviewed}/${findings.length} marked`;
    return `${accepted}/${findings.length} decided`;
  }, [accepted, activeStep, reviewed, findings.length]);

  useEffect(() => {
    if (!showSent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSent(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSent]);

  function persistDraft() {
    if (articleRef.current && seededFor.current) {
      draftsRef.current[seededFor.current] = articleRef.current.innerHTML;
    }
  }

  function seedArticle(id: string, html: string) {
    const node = articleRef.current;
    if (!node) return;
    node.innerHTML = draftsRef.current[id] ?? html;
    seededFor.current = id;
  }

  useLayoutEffect(() => {
    if (view !== 'draft') return;
    persistDraft();
    seedArticle(matter.id, matter.html);
  }, [matter.id, matter.html, view]);

  useEffect(() => {
    const root = articleRef.current;
    if (!root || view !== 'draft') return;
    root.querySelectorAll('[data-pass]').forEach((el) => {
      const id = el.getAttribute('data-pass');
      el.classList.toggle('on', id === finding.id);
      const st = id ? statuses[id] : undefined;
      el.classList.toggle('fixed', st === 'accepted');
      el.classList.toggle('held', st === 'held' || st === 'decided');
    });
    root.querySelector(`[data-pass="${finding.id}"]`)?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }, [finding.id, statuses, view, matterId]);

  function applyProposed(root: ParentNode) {
    const el = root.querySelector(`[data-pass="${finding.id}"]`);
    if (!el || !finding.proposed) return;
    el.textContent = finding.proposed;
    el.classList.add('fixed');
    el.classList.remove('pub-flag');
  }

  function mark(next: DraftStatus) {
    if (next === 'accepted' && finding.proposed) {
      const live = articleRef.current?.querySelector(`[data-pass="${finding.id}"]`);
      if (live) {
        applyProposed(articleRef.current as ParentNode);
        persistDraft();
      } else {
        const target = matters[0];
        const frame = document.createElement('div');
        frame.innerHTML = draftsRef.current[target.id] ?? target.html;
        applyProposed(frame);
        draftsRef.current[target.id] = frame.innerHTML;
      }
    } else {
      persistDraft();
    }
    const decided = { ...statuses, [finding.id]: next };
    setStatuses(decided);
    setNote('');
    // Move to the next passage that still needs a look, so the reviewer is
    // never left staring at one they have just disposed of.
    const nextIndex = findings.findIndex(
      (f, i) => i > index && (decided[f.id] ?? 'open') === 'open',
    );
    const anyOpen = findings.findIndex((f) => (decided[f.id] ?? 'open') === 'open');
    const target = nextIndex >= 0 ? nextIndex : anyOpen;
    if (target >= 0) setIndex(target);
  }

  function switchView(next: DraftView) {
    persistDraft();
    setView(next);
  }

  function resetDraft() {
    delete draftsRef.current[matter.id];
    seededFor.current = null;
    setStatuses({});
    setNote('');
    setSent(false);
    setShowSent(false);
    setView('draft');
    requestAnimationFrame(() => seedArticle(matter.id, matter.html));
  }

  function publishDraft() {
    persistDraft();
    setShowSent(true);
  }

  /**
   * The send is the end of this task. The artifact stops being stale, becomes
   * amended and pending a reviewer, and the reviewer is put back where the
   * work lives rather than at the whole firm.
   */
  function afterSend() {
    setSent(true);
    setShowSent(false);
    markAmended(mode === 'upload' ? AMENDED_ON_UPLOAD : AMENDED_ON_PUBLICATION);
    // Land on the sorted firm, where projects, advisories and teams are all
    // in view, rather than on the unsorted ball.
    isolate(null);
    setSortOnReturn(true);
    navigate('/');
  }

  return (
    <div className="draft">
      {showUpload && (
        <UploadGate
          onClose={() => setShowUpload(false)}
          onReview={() => {
            setShowUpload(false);
            setShowReview(true);
            setMode('upload');
            setMatterId(uploadMatters[0].id);
            setStatuses({});
            setIndex(0);
          }}
        />
      )}
      <div className="draft-stepper">
        <Link to="/" className="draft-back">
          Back to the brain
        </Link>
        <ol>
          {STEPS.map((step, i) => (
            <li key={step.id} className={i === activeStep ? 'on' : i < activeStep ? 'done' : ''}>
              <strong>{step.label}</strong>
              <span>
                {i === activeStep
                  ? stepHint
                  : i === 0
                    ? `${reviewed}/${findings.length} marked`
                    : `${accepted}/${findings.length} decided`}
              </span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => setShowUpload(true)}>
          Upload a document
        </button>
        <p className={`draft-pub-status ${reviewsDone ? 'ready' : ''}`}>Ready for publication</p>
      </div>

      <div className="draft-grid">
        <aside className={`draft-matters ${showMatters ? 'open' : ''}`}>
          <div className="draft-colhead">
            <span className="itype">{mode === 'upload' ? 'In this upload' : 'Publications'}</span>
            <button className="draft-hide" onClick={() => setShowMatters(false)}>
              Close
            </button>
          </div>
          {matters.map((item) => (
            <button
              key={item.id}
              className={`draft-matter ${matterId === item.id ? 'on' : ''}`}
              onClick={() => {
                persistDraft();
                setMatterId(item.id);
                setShowMatters(false);
              }}
            >
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <p className="muted">
                {item.flags} flags · {item.when}
              </p>
              <p className="muted">{item.stage}</p>
            </button>
          ))}
        </aside>

        <section className="draft-doc">
          <div className="draft-colhead">
            <button className="draft-toggle" onClick={() => setShowMatters(true)}>
              {mode === 'upload' ? 'In this upload' : 'Publications'}
            </button>
            <div>
              <div className="itype">{matter.title}</div>
              <strong>{mode === 'upload' ? UPLOAD_TITLE : SOURCE_PDF_TITLE}</strong>
              <span className="muted">
                {mode === 'upload'
                  ? ' Held at upload. Click the page and type. Marked passages take a proposed line when you accept it.'
                  : view === 'draft'
                    ? ' Working draft. Click the page and type. Marked passages take a proposed line when you accept it.'
                    : ' Source PDF on screen. Switch to the working draft to edit.'}
              </span>
            </div>
            <div className="row">
              <button
                type="button"
                className={view === 'draft' ? 'primary' : ''}
                onClick={() => switchView('draft')}
              >
                Edit the draft
              </button>
              {mode === 'upload' ? (
                <button type="button" onClick={() => setShowUpload(true)}>
                  Why this was held
                </button>
              ) : (
                <button
                  type="button"
                  className={view === 'source' ? 'primary' : ''}
                  onClick={() => switchView('source')}
                >
                  Open the source PDF
                </button>
              )}
              <button type="button" onClick={resetDraft}>
                Reset the draft
              </button>
              <button className="primary" type="button" onClick={publishDraft}>
                {mode === 'upload' ? 'Add to the graph' : 'Publish draft'}
              </button>
              <button className="draft-toggle" onClick={() => setShowReview(true)}>
                Open the review
              </button>
            </div>
          </div>
          {view === 'source' ? (
            <iframe
              className="draft-pdf"
              title={SOURCE_PDF_TITLE}
              src={`${SOURCE_PDF}#toolbar=1&navpanes=0`}
            />
          ) : (
            <div className="draft-paper">
              <div
                ref={articleRef}
                className="draft-editor"
                contentEditable
                suppressContentEditableWarning
                spellCheck
                role="textbox"
                aria-label="Working draft of the family office legal update"
                onBlur={persistDraft}
              />
            </div>
          )}
        </section>

        {(showMatters || (narrow && showReview)) && (
          <div
            className="sheet-backdrop"
            onClick={() => {
              setShowReview(false);
              setShowMatters(false);
            }}
          />
        )}
        <aside className={`draft-review ${showReview ? 'open' : ''}`}>
          <div className="draft-colhead">
            <span className="itype">
              Passage {index + 1} of {findings.length} · {reviewed}/{findings.length} reviewed
            </span>
            <div className="row">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => setIndex((n) => Math.max(0, n - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={index === findings.length - 1}
                onClick={() => setIndex((n) => Math.min(findings.length - 1, n + 1))}
              >
                Next
              </button>
              <button className="draft-hide" type="button" onClick={() => setShowReview(false)}>
                Close
              </button>
            </div>
          </div>

          <div className={`draft-warn ${finding.kind}`}>
            <strong>{finding.warning}</strong>
            <p>{finding.location}</p>
          </div>

          <div className="draft-block">
            <div className="itype">On the page</div>
            <p className="draft-strike">{finding.excerpt}</p>
            {finding.proposed ? (
              <>
                <div className="itype mt-12">Proposed line for the update</div>
                <p className="draft-add">{finding.proposed}</p>
              </>
            ) : (
              <p className="mt-12">
                The brain will not draft replacement text. {finding.why}
              </p>
            )}
            <p className="muted mt-12">{finding.citation}</p>
          </div>

          <div className="draft-signal">
            <div className="itype">From the circular</div>
            <p className="quote-cite">
              {finding.sourceQuote.instrument} · {finding.sourceQuote.para}
            </p>
            <blockquote className="quote">{finding.sourceQuote.text}</blockquote>
          </div>

          <div className="draft-block">
            <div className="itype">Reviewer call</div>
            <p>{finding.reviewerNote}</p>
            {status !== 'open' && (
              <p className="mt-8">
                Recorded as {status === 'accepted' ? 'accepted' : status === 'held' ? 'held for a partner' : 'a lawyer decision'}.
              </p>
            )}
            <label className="field">
              <span className="itype">Note (optional)</span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="The named lawyer records why this line is accepted, held, or decided."
              />
            </label>
            <div className="row mt-12">
              {finding.proposed ? (
                <button
                  className="primary"
                  type="button"
                  onClick={() => {
                    switchView('draft');
                    requestAnimationFrame(() => mark('accepted'));
                  }}
                >
                  Accept the proposed line
                </button>
              ) : (
                <button className="primary" type="button" onClick={() => mark('decided')}>
                  Record a lawyer decision
                </button>
              )}
              <button type="button" onClick={() => mark('held')}>
                Hold for a partner
              </button>
            </div>
          </div>
        </aside>
      </div>

      {showSent && (
        <SendDraft
          title={`${matter.title} · marked for review`}
          summary={mailBody}
          onClose={() => setShowSent(false)}
          onSent={afterSend}
        />
      )}
    </div>
  );
}
