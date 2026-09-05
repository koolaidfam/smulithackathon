import { getNode, isConfirmed } from '../engine/graph';
import { relationLabel } from '../lib/labels';
import { useCanon } from '../store/useCanon';
import type { Hop } from '../types';

export function ChainView({ chain }: { chain: Hop[] }) {
  const edges = useCanon((s) => s.edges);
  if (chain.length === 0) return null;

  return (
    <ol className="chain">
      {chain.map((hop, i) => {
        const node = getNode(hop.node_id);
        const edge = hop.edge_id ? edges.find((e) => e.id === hop.edge_id) : null;
        const confirmed = hop.edge_id ? (edge ? isConfirmed(edge) : hop.confirmed) : true;
        return (
          <li key={`${hop.node_id}-${i}`}>
            <div className="kicker">
              {i === 0 ? 'Start' : relationLabel(hop.via)}
              {i > 0 && (
                <span className="muted">
                  {' '}
                  · {confirmed ? 'human-confirmed edge' : 'proposed edge, not used to flag'}
                </span>
              )}
            </div>
            <div>{node?.title ?? hop.node_id}</div>
            <div className="muted">{node?.subtitle}</div>
          </li>
        );
      })}
    </ol>
  );
}
