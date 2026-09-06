import { useEffect, useMemo, useState } from 'react';
import {
  CONNECT_STEPS,
  DEFAULT_LIBRARY_URL,
  DIRECTORY,
  type DirectoryPerson,
} from '../data/directory';
import {
  CUSTOM_SITE_VALUE,
  JURISDICTIONS,
  SITES_BY_JURISDICTION,
  jurisdictionName,
  normalizeUrl,
  type JurisdictionCode,
} from '../data/sites';
import { allNodes } from '../engine/graph';
import { useCanon } from '../store/useCanon';

interface Project {
  id: string;
  title: string;
  team: string;
  staff: string[];
  seeded: boolean;
}

export function Watch() {
  const trackedSites = useCanon((s) => s.trackedSites ?? []);
  const addTrackedSite = useCanon((s) => s.addTrackedSite);
  const removeTrackedSite = useCanon((s) => s.removeTrackedSite);

  /* ---- 01. The document library ---- */
  const [libraryUrl, setLibraryUrl] = useState(DEFAULT_LIBRARY_URL);
  const [phase, setPhase] = useState<'idle' | 'reading' | 'ready'>('idle');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase !== 'reading') return;
    if (step >= CONNECT_STEPS.length) {
      const t = window.setTimeout(() => setPhase('ready'), 600);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((n) => n + 1), 900);
    return () => window.clearTimeout(t);
  }, [phase, step]);

  const teams = useMemo(() => {
    const map = new Map<string, DirectoryPerson[]>();
    for (const person of DIRECTORY) {
      const arr = map.get(person.team) ?? [];
      arr.push(person);
      map.set(person.team, arr);
    }
    return [...map.entries()];
  }, []);

  /* ---- 02. Projects ---- */
  const seededProjects = useMemo<Project[]>(
    () =>
      allNodes()
        .filter((n) => n.kind === 'workflow')
        .map((n) => ({
          id: n.id,
          title: n.title,
          team: n.subtitle,
          staff: [],
          seeded: true,
        })),
    [],
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectTeam, setProjectTeam] = useState('Regulatory and Compliance');
  const [staff, setStaff] = useState<string[]>([]);
  const [staffQuery, setStaffQuery] = useState('');
  const [projectError, setProjectError] = useState<string | null>(null);

  // Type a name, see who it is, then keep only the name.
  const matches = useMemo(() => {
    const q = staffQuery.trim().toLowerCase();
    if (!q) return [];
    return DIRECTORY.filter(
      (person) =>
        !staff.includes(person.id) &&
        (person.name.toLowerCase().includes(q) ||
          person.email.toLowerCase().includes(q) ||
          person.team.toLowerCase().includes(q)),
    ).slice(0, 6);
  }, [staffQuery, staff]);

  function addStaff(id: string) {
    setStaff((list) => (list.includes(id) ? list : [...list, id]));
    setStaffQuery('');
    setProjectError(null);
  }

  function createProject() {
    if (!projectName.trim()) {
      setProjectError('Give the project a name.');
      return;
    }
    if (staff.length === 0) {
      setProjectError('Assign at least one lawyer. A project with no owner cannot be routed.');
      return;
    }
    setProjects((list) => [
      {
        id: `proj-${Date.now()}`,
        title: projectName.trim(),
        team: projectTeam,
        staff,
        seeded: false,
      },
      ...list,
    ]);
    setProjectName('');
    setStaff([]);
    setProjectError(null);
  }

  /* ---- 03. Websites ---- */
  const [jurisdiction, setJurisdiction] = useState<JurisdictionCode>('SG');
  const [siteId, setSiteId] = useState(SITES_BY_JURISDICTION.SG[0].id);
  const [customUrl, setCustomUrl] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sitesOpen, setSitesOpen] = useState(true);

  const options = SITES_BY_JURISDICTION[jurisdiction];
  const isCustom = siteId === CUSTOM_SITE_VALUE;
  const selectedOption = useMemo(() => options.find((s) => s.id === siteId), [options, siteId]);

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
      setSitesOpen(true);
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
    if (!err) setSitesOpen(true);
  }

  const allProjects = [...projects, ...seededProjects];

  return (
    <div className="page">
      <div className="wrap">
        <header className="mast">
          <div className="slug">Horizon · chosen by the firm</div>
          <h1>Connect the firm, then choose the sources it watches</h1>
          <p className="lede">
            The document library already knows who can open what. Jarvis reads those permissions to
            build the people directory and the teams, so nobody types a staff list by hand. The
            horizon itself is never inferred. A partner adds each source deliberately.
          </p>
        </header>

        <section className="block">
          <div className="sechead">
            <div className="secnum">01</div>
            <div>
              <h2>Connect the document library</h2>
              <p className="secintro sub">
                Paste the OneDrive or SharePoint folder the firm keeps its material in. Jarvis reads
                the permissions on it, not the documents, and turns them into people and teams.
                Seeded for this build. Nothing is fetched.
              </p>
            </div>
          </div>

          <div className="card">
            <label className="field">
              <span className="itype">OneDrive or SharePoint folder</span>
              <input
                type="url"
                value={libraryUrl}
                onChange={(e) => setLibraryUrl(e.target.value)}
                spellCheck={false}
              />
            </label>
            <div className="row mt-12">
              <button
                className="primary"
                onClick={() => {
                  setStep(0);
                  setPhase('reading');
                }}
                disabled={phase === 'reading'}
              >
                {phase === 'ready' ? 'Read it again' : 'Connect'}
              </button>
              {phase === 'ready' && (
                <span className="muted">
                  {DIRECTORY.length} people across {teams.length} teams
                </span>
              )}
            </div>

            {phase === 'reading' && (
              <div className="mt-16">
                <ol className="gate-steps">
                  {CONNECT_STEPS.map((label, i) => (
                    <li key={label} className={i < step ? 'done' : i === step ? 'on' : ''}>
                      {label}
                    </li>
                  ))}
                </ol>
                <div className="gate-bar">
                  <span style={{ width: `${(step / CONNECT_STEPS.length) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {phase === 'ready' && (
            <div className="dir mt-16">
              <div className="dir-row dir-head">
                <span>Name</span>
                <span>Email</span>
                <span>Rank</span>
                <span>Team</span>
                <span className="dir-num">Files</span>
              </div>
              {DIRECTORY.map((person) => (
                <div key={person.id} className="dir-row">
                  <span className="dir-name">{person.name}</span>
                  <span className="dir-mail">{person.email}</span>
                  <span className="muted">{person.rank}</span>
                  <span>
                    <span className="chip dir-team">{person.team}</span>
                  </span>
                  <span className="dir-num muted">{person.files}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">02</div>
            <div>
              <h2>Projects</h2>
              <p className="secintro sub">
                A project is the unit the firm actually works in. Assign the lawyers on it and a
                change that reaches the project has someone to route to. A project with no owner
                cannot be routed, so Jarvis will not accept one.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="site-grid">
              <label className="field">
                <span className="itype">Project name</span>
                <input
                  type="text"
                  placeholder="For example: Series B for Meridian Capital"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setProjectError(null);
                  }}
                />
              </label>
              <label className="field">
                <span className="itype">Practice team</span>
                <select value={projectTeam} onChange={(e) => setProjectTeam(e.target.value)}>
                  {teams.map(([team]) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="itype mt-16">Assign lawyers</div>
            {phase === 'ready' ? (
              <div className="pick">
                {staff.length > 0 && (
                  <div className="pick-chosen">
                    {staff.map((id) => {
                      const person = DIRECTORY.find((x) => x.id === id);
                      if (!person) return null;
                      return (
                        <span key={id} className="pick-chip">
                          {person.name}
                          <button
                            type="button"
                            aria-label={`Remove ${person.name}`}
                            onClick={() => setStaff((l) => l.filter((x) => x !== id))}
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <input
                  type="text"
                  className="pick-input"
                  placeholder="Type a name"
                  value={staffQuery}
                  onChange={(e) => setStaffQuery(e.target.value)}
                  autoComplete="off"
                />
                {matches.length > 0 && (
                  <ul className="pick-list">
                    {matches.map((person) => (
                      <li key={person.id}>
                        <button type="button" onClick={() => addStaff(person.id)}>
                          <span className="pick-name">{person.name}</span>
                          <span className="pick-rank">{person.rank}</span>
                          <span className="pick-mail">{person.email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {staffQuery.trim() && matches.length === 0 && (
                  <p className="ihint mt-8">Nobody in the directory matches that.</p>
                )}
              </div>
            ) : (
              <p className="ihint">Connect the document library first. The people come from it.</p>
            )}

            {projectError && <p className="form-error mt-12">{projectError}</p>}
            <button className="primary mt-16" onClick={createProject} disabled={phase !== 'ready'}>
              Create the project
            </button>
          </div>

          <div className="mt-16">
            <div className="itype">Projects on the graph ({allProjects.length})</div>
            {allProjects.map((project) => (
              <div key={project.id} className="watch-item">
                <div>
                  <h3>{project.title}</h3>
                  <p className="muted">
                    {project.team}
                    {project.seeded ? ' · already mapped' : ''}
                  </p>
                  {project.staff.length > 0 && (
                    <div className="pick-chosen mt-8">
                      {project.staff.map((id) => {
                        const person = DIRECTORY.find((x) => x.id === id);
                        if (!person) return null;
                        return (
                          <span key={id} className="pick-chip static">
                            {person.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                {!project.seeded && (
                  <button onClick={() => setProjects((l) => l.filter((p) => p.id !== project.id))}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="block">
          <div className="sechead">
            <div className="secnum">03</div>
            <div>
              <h2>Websites to track</h2>
              <p className="secintro sub">
                Pick a jurisdiction, then a page that actually publishes rules or guidance. If the
                site is not in the short list, enter the address yourself. Jarvis will not invent a
                source.
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

          <div className="mt-16">
            <button className="collapse-head" onClick={() => setSitesOpen((v) => !v)}>
              <span>{sitesOpen ? 'Hide' : 'Show'} tracked websites</span>
              <span className="muted">{trackedSites.length} tracked</span>
            </button>
            {sitesOpen &&
              (trackedSites.length === 0 ? (
                <p className="ihint mt-12">
                  Nothing tracked yet. Until a source is on this list, Jarvis will not walk the
                  graph from it.
                </p>
              ) : (
                trackedSites.map((site) => (
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
                    <button onClick={() => removeTrackedSite(site.id)}>Stop tracking</button>
                  </div>
                ))
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
