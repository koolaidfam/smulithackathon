import { useNavigate } from 'react-router-dom';
import { changes, nodes } from '../data/seed';
import { useCanon } from '../store/useCanon';

export function Watch() {
  const navigate = useNavigate();
  const watched = useCanon((s) => s.watchedSourceIds);
  const toggleWatch = useCanon((s) => s.toggleWatch);
  const selectChange = useCanon((s) => s.selectChange);
  const sources = nodes.filter((n) => n.kind === 'source');

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
