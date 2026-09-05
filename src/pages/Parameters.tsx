import { documentParameters, nodes, parameters } from '../data/seed';
import { formatDate } from '../lib/dates';

export function Parameters() {
  return (
    <div className="page">
      <div className="wrap">
        <header className="mast">
          <div className="slug">Parameter registry</div>
          <h1>The single copy.</h1>
          <p className="lede">
            Detection is a feature. Reducing hardcoding is the product. Over time each volatile rule
            value should live here, and documents should point at it.
          </p>
        </header>
        <div className="stack mt-24">
          {parameters.map((p) => {
            const bindings =
              p.id === 'param-cdd-prior'
                ? []
                : documentParameters.filter((b) => b.parameter_id === p.id);
            return (
              <article key={p.id} className="card">
                <div className="itype">{p.citation}</div>
                <h2>{p.name}</h2>
                <div className="delta mt-12">
                  <div>
                    <div className="itype">Value</div>
                    <b>
                      {p.unit === 'SGD' ? 'S$' : ''}
                      {Number(p.value).toLocaleString('en-SG')}
                      {p.unit !== 'SGD' ? ` ${p.unit}` : ''}
                    </b>
                  </div>
                  <span />
                  <div>
                    <div className="itype">Effective</div>
                    <b style={{ fontSize: 18 }}>
                      {formatDate(p.effective_from)}
                      {p.effective_to ? ` to ${formatDate(p.effective_to)}` : ''}
                    </b>
                  </div>
                </div>
                {bindings.length > 0 && (
                  <ul className="ilist mt-12">
                    {bindings.map((b) => {
                      const doc = nodes.find((n) => n.id === b.document_id);
                      return (
                        <li key={`${b.document_id}-${b.location}`}>
                          <span className={`dot ${b.hardcoded ? 'lead' : ''}`} />
                          <span>
                            {doc?.title} · {b.location} · {b.hardcoded ? 'hardcoded' : 'bound'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
