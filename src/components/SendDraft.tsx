import { useEffect, useState } from 'react';
import { FIRM_NAME } from '../data/seed';

/**
 * Publishing a draft inside a firm is an email. The reviewer sends the marked
 * document to the people who have to sign it, and the send is the record.
 */
type Phase = 'compose' | 'sending' | 'sent';

export function SendDraft({
  title,
  summary,
  onClose,
  onSent,
}: {
  title: string;
  summary: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('compose');
  const [to, setTo] = useState('marcus.hale@haletan.com.sg');
  const [cc, setCc] = useState('priya.nair@haletan.com.sg; knowledge@haletan.com.sg');
  const [bcc, setBcc] = useState('records@haletan.com.sg');
  const [subject, setSubject] = useState(title);
  const [body, setBody] = useState(summary);
  const [showCc, setShowCc] = useState(true);

  useEffect(() => {
    if (phase !== 'sending') return;
    const t = window.setTimeout(() => setPhase('sent'), 1900);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'sent') return;
    const t = window.setTimeout(onSent, 1500);
    return () => window.clearTimeout(t);
  }, [phase, onSent]);

  if (phase !== 'compose') {
    return (
      <div className="gate-backdrop" role="dialog" aria-modal="true" aria-label="Sending">
        <div className="gate mail-status">
          {phase === 'sending' ? (
            <>
              <div className="mail-plane" aria-hidden="true">
                <span className="mail-envelope" />
              </div>
              <h3>Sending</h3>
              <p className="muted">{subject}</p>
            </>
          ) : (
            <>
              <div className="mail-tick" aria-hidden="true">
                <svg viewBox="0 0 48 48" width="48" height="48">
                  <circle cx="24" cy="24" r="21" fill="none" stroke="#2F6B4F" strokeWidth="2" />
                  <path
                    className="mail-tick-path"
                    d="M14 24.5 L21 31.5 L34 17.5"
                    fill="none"
                    stroke="#2F6B4F"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Sent</h3>
              <p className="muted">
                To {to.split('@')[0].replace('.', ' ')}, copied to {cc.split(';').length} others.
                The draft is marked as sent for review.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="gate-backdrop" role="dialog" aria-modal="true" aria-label="Send the draft">
      <div className="gate mail">
        <div className="mail-head">
          <span className="itype">New message</span>
          <button className="draft-hide" onClick={onClose}>
            Close
          </button>
        </div>

        <label className="mail-row">
          <span>To</span>
          <input value={to} onChange={(e) => setTo(e.target.value)} />
          {!showCc && (
            <button type="button" className="mail-toggle" onClick={() => setShowCc(true)}>
              Cc Bcc
            </button>
          )}
        </label>

        {showCc && (
          <>
            <label className="mail-row">
              <span>Cc</span>
              <input value={cc} onChange={(e) => setCc(e.target.value)} />
            </label>
            <label className="mail-row">
              <span>Bcc</span>
              <input value={bcc} onChange={(e) => setBcc(e.target.value)} />
            </label>
          </>
        )}

        <label className="mail-row">
          <span>Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>

        <textarea
          className="mail-body"
          rows={9}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <p className="ihint mail-note">
          The marked document is attached as it stands. {FIRM_NAME} records the send against the
          draft, so the review has a trail.
        </p>

        <div className="mail-foot">
          <button className="primary" type="button" onClick={() => setPhase('sending')}>
            Send
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <span className="muted mail-attach">1 attachment</span>
        </div>
      </div>
    </div>
  );
}
