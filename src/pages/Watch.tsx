import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CUSTOM_SITE_VALUE,
  JURISDICTIONS,
  SITES_BY_JURISDICTION,
  jurisdictionName,
  normalizeUrl,
  type JurisdictionCode,
} from '../data/sites';
import { changes, nodes } from '../data/seed';
import { useCanon } from '../store/useCanon';

export function Watch() {
  const navigate = useNavigate();
  const watched = useCanon((s) => s.watchedSourceIds);
  const toggleWatch = useCanon((s) => s.toggleWatch);
  const selectChange = useCanon((s) => s.selectChange);
  const trackedSites = useCanon((s) => s.trackedSites ?? []);
  const addTrackedSite = useCanon((s) => s.addTrackedSite);
  const removeTrackedSite = useCanon((s) => s.removeTrackedSite);
  const sources = nodes.filter((n) => n.kind === 'source');

  const [jurisdiction, setJurisdiction] = useState<JurisdictionCode>('SG');
  const [siteId, setSiteId] = useState(SITES_BY_JURISDICTION.SG[0].id);
  const [customUrl, setCustomUrl] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const options = SITES_BY_JURISDICTION[jurisdiction];
  const isCustom = siteId === CUSTOM_SITE_VALUE;
  const selectedOption = useMemo(
    () => options.find((s) => s.id === siteId),
    [options, siteId],
  );

  function onJurisdictionChange(code: JurisdictionCode) {
    setJurisdiction(code);
    setSiteId(SITES_BY_JURISDICTION[code][0].id);
    setError(null);
  }

  function addWebsite() {
    if (isCustom) {
      const url = normalizeUrl(customUrl);
      if (!url) {
        setError('Enter a full website address, for example https://www.mas.gov.sg/regulation.');
        return;
      }
      const err = addTrackedSite({
        id: `site-${Date.now()}`,
        jurisdiction,
        label: customLabel.trim() || url,
        url,
        issuer: 'Custom source',
        custom: true,
      });
      if (err) {
        setError(err);
        return;
      }
      setCustomUrl('');
      setCustomLabel('');
      setError(null);
      return;
    }
    if (!selectedOption) {
      setError('Choose a website from the list.');
      return;
    }
    const err = addTrackedSite({
      id: `site-${selectedOption.id}-${Date.now()}`,
      jurisdiction,
      label: selectedOption.label,
      url: selectedOption.url,
      issuer: selectedOption.issuer,
      custom: false,
    });
    setError(err);
  }

  return (
    <div className="page">
      <div className="wrap">
        <header className="mast">
          <div className="slug">Horizon · chosen by the lawyer</div>
          <h1>Which sources of rules is this firm concerned with?</h1>
          <p className="lede">
            The brain does not decide the horizon. A partner adds a jurisdiction or a regulator by
            hand. Until Australia is on this list, an AUSTRAC change will not integrate itself into
            the scan, and Publish amendment will refuse to fire from it.
          </p>
        </header>

        <section className="block">
          <div className="sechead">
            <div className="secnum">01</div>
            <div>
              <h2>Websites to track</h2>
              <p className="secintro sub">
                Pick a jurisdiction, then a page that actually publishes rules or guidance. If the
                site is not in the short list, enter the address yourself. The brain will not invent
                a source.
              </p>
            </div>
          </div>

          <div className="card site-form">
            <div className="site-grid">
              <label className="field">
                <span className="itype">Jurisdiction</span>
                <select
                  value={jurisdiction}
                  onChange={(e) => onJurisdictionChange(e.target.value as JurisdictionCode)}
                >
                  {JURISDICTIONS.map((j) => (
                    <option key={j.code} value={j.code}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="itype">Official website</span>
                <select
                  value={siteId}
                  onChange={(e) => {
                    setSiteId(e.target.value);
                    setError(null);
                  }}
                >
                  {options.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.label}
                    </option>
                  ))}
                  <option value={CUSTOM_SITE_VALUE}>Other. Enter a website</option>
                </select>
              </label>
            </div>
            {!isCustom && selectedOption && (
              <p className="muted mt-12">
                {selectedOption.issuer} · {selectedOption.url}
              </p>
            )}
            {isCustom && (
              <div className="site-grid mt-12">
                <label className="field">
                  <span className="itype">Website address</span>
                  <input
                    type="url"
                    inputMode="url"
                    placeholder="https://www.example.gov/guidance"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setError(null);
                    }}
                  />
                </label>
                <label className="field">
                  <span className="itype">Label (optional)</span>
                  <input
                    type="text"
                    placeholder="House name for this source"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                  />
                </label>
              </div>
            )}
            {error && <p className="form-error mt-12">{error}</p>}
            <button className="primary mt-16" onClick={addWebsite}>
              Add this website to the horizon
            </button>
          </div>

          {trackedSites.length > 0 && (
            <div className="mt-16">
              {trackedSites.map((site) => (
                <div key={site.id} className="watch-item">
                  <div>
                    <h3>{site.label}</h3>
                    <p className="muted">
                      {jurisdictionName(site.jurisdiction)} · {site.issuer}
                      {site.custom ? ' · entered by hand' : ''}
                    </p>
                    <a className="site-url" href={site.url} target="_blank" rel="noreferrer">
                      {site.url}
                    </a>
                  </div>
                  <button onClick={() => removeTrackedSite(site.id)}>Stop tracking this website</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">02</div>
            <div>
              <h2>Instruments already on the graph</h2>
              <p className="secintro sub">
                These are the sources the brain already knows. Watching one lets you publish from it.
              </p>
            </div>
          </div>
          {sources.map((source) => {
            const on = watched.includes(source.id);
            const change = changes.find((c) => c.source_node === source.id);
            return (
              <div key={source.id} className={`watch-item ${on ? '' : 'off'}`}>
                <div>
                  <h3>{source.title}</h3>
                  <p className="muted">
                    {source.subtitle}
                    {source.jurisdiction ? ` · ${source.jurisdiction}` : ''}
                    {source.props.draft ? ' · draft, will not flag' : ''}
                  </p>
                </div>
                <div className="row">
                  <button className={on ? 'primary' : ''} onClick={() => toggleWatch(source.id)}>
                    {on ? 'Watching' : 'Add to the horizon'}
                  </button>
                  {change && on && (
                    <button
                      onClick={() => {
                        selectChange(change.id);
                        navigate('/');
                      }}
                    >
                      Open in the brain
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
