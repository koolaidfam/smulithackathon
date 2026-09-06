import { useEffect, useMemo, useRef } from 'react';
import { issuerOf } from '../data/issuers';
import { getNode, isConfirmed, isPropagationRelation } from '../engine/graph';
import { lastScreen } from '../engine/positions';
import type { FirmEdge, FirmNode, NodeKind } from '../types';

/**
 * The isolated view. One workflow, the artifacts that feed it, and the teams
 * staffed on them, laid out flat and still. The orbit view is for orientation.
 * This one is for reading, so it drops the rotation and the perspective.
 */

const COLUMN: Partial<Record<NodeKind, number>> = {
  source: 0,
  document: 1,
  playbook: 1,
  workflow: 2,
  advisory: 3,
  team: 4,
};

const COLUMN_LABEL = [
  'Instruments',
  'Templates and playbooks',
  'Projects',
  'Client advisories',
  'Teams',
];

const INK = '#1B2021';
const SOFT = '#5A625F';
const LEAD = '#B4331F';
const GREEN = '#2F6B4F';
const AMBER = '#A67A16';

interface Placed extends FirmNode {
  x: number;
  y: number;
  col: number;
  list: boolean;
}

/** The plain mark a node wears in the cloud view. */
function cloudMark(ctx: CanvasRenderingContext2D, kind: NodeKind, x: number, y: number, r: number, col: string) {
  ctx.fillStyle = col;
  if (kind === 'playbook') {
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    return;
  }
  if (kind === 'workflow') {
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.2);
    ctx.lineTo(x + r * 1.1, y + r * 0.9);
    ctx.lineTo(x - r * 1.1, y + r * 0.9);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (kind === 'advisory') {
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.25);
    ctx.lineTo(x + r * 1.15, y);
    ctx.lineTo(x, y + r * 1.25);
    ctx.lineTo(x - r * 1.15, y);
    ctx.closePath();
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Line-drawn glyphs. Same visual weight, no fill blobs, no emoji. */
function icon(ctx: CanvasRenderingContext2D, kind: NodeKind, x: number, y: number, s: number, col: string) {
  ctx.save();
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = Math.max(1.1, s * 0.055);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const h = s / 2;

  if (kind === 'document' || kind === 'advisory') {
    // A page with a folded corner. The advisory adds a marker line.
    const w = s * 0.72;
    const t = s * 0.9;
    const fold = s * 0.24;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - t / 2);
    ctx.lineTo(x + w / 2 - fold, y - t / 2);
    ctx.lineTo(x + w / 2, y - t / 2 + fold);
    ctx.lineTo(x + w / 2, y + t / 2);
    ctx.lineTo(x - w / 2, y + t / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - fold, y - t / 2);
    ctx.lineTo(x + w / 2 - fold, y - t / 2 + fold);
    ctx.lineTo(x + w / 2, y - t / 2 + fold);
    ctx.stroke();
    const rows = kind === 'advisory' ? 2 : 3;
    for (let i = 0; i < rows; i++) {
      const ly = y - t * 0.1 + i * s * 0.17;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.28, ly);
      ctx.lineTo(x + w * 0.28, ly);
      ctx.stroke();
    }
    if (kind === 'advisory') {
      ctx.beginPath();
      ctx.moveTo(x - w * 0.28, y + t * 0.3);
      ctx.lineTo(x + w * 0.05, y + t * 0.3);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (kind === 'playbook') {
    // A bound book, seen from the spine side.
    const w = s * 0.78;
    const t = s * 0.86;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - t / 2);
    ctx.lineTo(x + w / 2, y - t / 2);
    ctx.lineTo(x + w / 2, y + t / 2);
    ctx.lineTo(x - w / 2, y + t / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + s * 0.16, y - t / 2);
    ctx.lineTo(x - w / 2 + s * 0.16, y + t / 2);
    ctx.stroke();
    for (let i = 0; i < 2; i++) {
      const ly = y - s * 0.1 + i * s * 0.2;
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + s * 0.3, ly);
      ctx.lineTo(x + w / 2 - s * 0.14, ly);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (kind === 'workflow') {
    // Three linked steps.
    const r = s * 0.13;
    const gap = s * 0.3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(x + i * gap, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = -1; i <= 0; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * gap + r, y);
      ctx.lineTo(x + (i + 1) * gap - r, y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (kind === 'team') {
    // Head and shoulders inside a ring, the way a firm shows a person.
    const r = s * 0.46;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r - ctx.lineWidth * 0.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(x, y - s * 0.11, s * 0.14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + s * 0.35, s * 0.27, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    return;
  }

  // A source instrument. A sealed circle.
  ctx.beginPath();
  ctx.arc(x, y, h * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, h * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function place(nodes: FirmNode[], focusId: string | null): Placed[] {
  const cols = new Map<number, FirmNode[]>();
  for (const n of nodes) {
    const c = COLUMN[n.kind] ?? 1;
    const arr = cols.get(c) ?? [];
    arr.push(n);
    cols.set(c, arr);
  }
  // Only the columns that hold something take up room.
  const used = [...cols.keys()].sort((a, b) => a - b);
  const slot = new Map(used.map((c, i) => [c, i]));

  const placed: Placed[] = [];
  const colX = 330;
  for (const [c, arr] of cols) {
    arr.sort((a, b) => a.title.localeCompare(b.title));
    // Sorting the whole firm puts every column in list form. An isolated
    // workflow has few enough nodes to read as cards, unless a column is long.
    const list = !focusId || arr.length > 6;
    const gapY = list ? 42 : 96;
    const span = (arr.length - 1) * gapY;
    arr.forEach((n, i) => {
      placed.push({
        ...n,
        col: c,
        list,
        x: (slot.get(c) ?? 0) * colX,
        y: n.id === focusId ? 0 : i * gapY - span / 2,
      });
    });
  }
  return placed;
}

export function IsolatedGraph({
  edges,
  nodeIds,
  flagged,
  verified,
  amended,
  selectedId,
  focusId,
  onSelect,
  onIsolate,
}: {
  edges: FirmEdge[];
  nodeIds: Set<string>;
  flagged: Set<string>;
  verified: Set<string>;
  amended: Set<string>;
  selectedId: string | null;
  focusId: string | null;
  onSelect: (id: string | null) => void;
  onIsolate?: (id: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRef = useRef<Array<{ id: string; x: number; y: number; r: number }>>([]);
  const logoRef = useRef(new Map<string, HTMLImageElement>());
  // Read through refs so a change to the flagged set repaints without
  // restarting the entrance animation.
  const flaggedRef = useRef(flagged);
  const verifiedRef = useRef(verified);
  const amendedRef = useRef(amended);
  amendedRef.current = amended;
  const selectedRef = useRef(selectedId);
  verifiedRef.current = verified;
  flaggedRef.current = flagged;
  selectedRef.current = selectedId;

  const nodes = useMemo(
    () =>
      [...nodeIds]
        .map((id) => getNode(id))
        .filter((n): n is FirmNode => Boolean(n) && n?.kind !== 'person'),
    [nodeIds],
  );

  const placed = useMemo(() => place(nodes, focusId), [nodes, focusId]);

  const links = useMemo(
    () =>
      edges.filter(
        (e) =>
          (isPropagationRelation(e.relation) || e.relation === 'staffed_by') &&
          nodeIds.has(e.src) &&
          nodeIds.has(e.dst),
      ),
    [edges, nodeIds],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The entrance. Everything starts stacked on the workflow, then travels out
    // to its column, one rank at a time, so the eye follows the chain backwards.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TRAVEL = 460;
    const STAGGER = 130;
    const start = performance.now();
    // Where the cloud last drew each of these nodes.
    const from = new Map<string, { x: number; y: number }>();
    for (const n of placed) {
      const seen = lastScreen.get(n.id);
      if (seen) from.set(n.id, { ...seen });
    }
    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const progressFor = (col: number, now: number) => {
      if (reduce) return 1;
      const delay = Math.abs(2 - col) * STAGGER;
      const t = (now - start - delay) / TRAVEL;
      return t <= 0 ? 0 : t >= 1 ? 1 : ease(t);
    };

    const draw = (now = performance.now()) => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = r.width;
      const h = r.height;
      ctx.clearRect(0, 0, w, h);
      if (!placed.length) return;

      let minx = 1e9;
      let maxx = -1e9;
      let miny = 1e9;
      let maxy = -1e9;
      for (const n of placed) {
        minx = Math.min(minx, n.x);
        maxx = Math.max(maxx, n.x);
        miny = Math.min(miny, n.y);
        maxy = Math.max(maxy, n.y);
      }
      // The right column keeps its labels inside the canvas, so it gets more room.
      const listy = placed.some((n) => n.list);
      const padLeft = listy ? 120 : 170;
      const padRight = listy ? 230 : 150;
      const padTop = 84;
      const padBottom = listy ? 40 : 118;
      const scale = Math.min(
        1.15,
        Math.min(
          (w - padLeft - padRight) / Math.max(1, maxx - minx),
          (h - padTop - padBottom) / Math.max(1, maxy - miny),
        ),
      );
      const ox = padLeft + (w - padLeft - padRight) / 2 - ((minx + maxx) / 2) * scale;
      const oy = padTop + (h - padTop - padBottom) / 2 - ((miny + maxy) / 2) * scale;
      const focusNode = placed.find((n) => n.id === focusId);
      const home = focusNode
        ? { x: ox + focusNode.x * scale, y: oy + focusNode.y * scale }
        : { x: w / 2, y: h / 2 };
      const at = (n: Placed) => {
        const target = { x: ox + n.x * scale, y: oy + n.y * scale };
        const t = progressFor(n.col, now);
        if (t >= 1) return target;
        const origin = from.get(n.id) ?? home;
        return {
          x: origin.x + (target.x - origin.x) * t,
          y: origin.y + (target.y - origin.y) * t,
        };
      };
      const alphaFor = (n: Placed) => (n.id === focusId ? 1 : Math.min(1, progressFor(n.col, now) * 1.6));
      const size = Math.max(20, Math.min(34, 34 * scale));
      const listSize = Math.max(15, Math.min(22, 22 * scale));
      const colGap = 330 * scale;

      // Column headings, so the reading order is obvious. They sit at the
      // final column position and fade in rather than travelling.
      const seen = new Set<number>();
      ctx.font = '11px Archivo, system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (const n of placed) {
        if (seen.has(n.col)) continue;
        seen.add(n.col);
        const hx = ox + n.x * scale;
        ctx.globalAlpha = Math.max(0, progressFor(n.col, now) * 1.4 - 0.4);
        ctx.fillStyle = SOFT;
        ctx.textAlign = n.list ? 'left' : 'center';
        ctx.fillText(
          (COLUMN_LABEL[n.col] ?? '').toUpperCase(),
          n.list ? hx - 18 : hx,
          padTop * 0.62,
        );
        ctx.globalAlpha = 1;
      }

      const byId = new Map(placed.map((n) => [n.id, n]));
      for (const e of links) {
        const a = byId.get(e.src);
        const b = byId.get(e.dst);
        if (!a || !b) continue;
        const pa = at(a);
        const pb = at(b);
        const done = verifiedRef.current.has(e.src) || verifiedRef.current.has(e.dst);
        const hot =
          !done && flaggedRef.current.has(e.src) && flaggedRef.current.has(e.dst);
        ctx.globalAlpha = Math.min(alphaFor(a), alphaFor(b));
        const near = selectedRef.current === e.src || selectedRef.current === e.dst;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        const mx = (pa.x + pb.x) / 2;
        ctx.bezierCurveTo(mx, pa.y, mx, pb.y, pb.x, pb.y);
        ctx.setLineDash(isConfirmed(e) ? [] : [3, 4]);
        ctx.strokeStyle = hot
          ? 'rgba(180,51,31,0.7)'
          : done
            ? 'rgba(47,107,79,0.6)'
            : near
              ? 'rgba(27,32,33,0.55)'
              : 'rgba(120,128,124,0.35)';
        ctx.lineWidth = hot ? 1.6 : 1;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      const hits: Array<{ id: string; x: number; y: number; r: number }> = [];
      // The issuer badge that sits next to an instrument.
      const badge = (n: Placed, x: number, y: number, mark: number) => {
        if (n.kind !== 'source') return;
        const issuer = issuerOf(n.props.issuer);
        if (!issuer) return;
        if (issuer.logo) {
          let img = logoRef.current.get(issuer.code);
          if (!img) {
            img = new Image();
            img.src = issuer.logo;
            logoRef.current.set(issuer.code, img);
          }
          if (img.complete && img.naturalWidth > 0) {
            // Wordmarks are wide, seals are square, so fit inside a box.
            const boxW = n.list ? mark * 2.4 : mark * 3;
            const boxH = n.list ? mark * 1.25 : mark * 2;
            const fit = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
            const dw = img.naturalWidth * fit;
            const dh = img.naturalHeight * fit;
            ctx.drawImage(img, x - dw / 2, y - dh / 2, dw, dh);
            return;
          }
        }
        ctx.font = '9.5px Archivo, system-ui, sans-serif';
        const tw = ctx.measureText(issuer.code).width;
        const bw = tw + 10;
        const bh = 14;
        ctx.strokeStyle = issuer.accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - bw / 2, y - bh / 2, bw, bh);
        ctx.fillStyle = issuer.accent;
        ctx.textAlign = 'center';
        ctx.fillText(issuer.code, x, y + 3.5);
      };
      for (const n of placed) {
        const p = at(n);
        const isDone = verifiedRef.current.has(n.id);
        const isPending = !isDone && amendedRef.current.has(n.id);
        const isFlagged = !isDone && !isPending && flaggedRef.current.has(n.id);
        const isSel = selectedRef.current === n.id;
        const isFocus = focusId === n.id;
        const mark = n.list ? listSize : size;
        const col = isFlagged
          ? LEAD
          : isPending
            ? AMBER
            : isDone
              ? GREEN
              : n.kind === 'source'
                ? INK
                : SOFT;
        ctx.globalAlpha = alphaFor(n);

        if (isFocus || isSel) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, mark * 0.86, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = isFlagged ? LEAD : INK;
          ctx.lineWidth = isFocus ? 1.6 : 1;
          ctx.stroke();
        }
        const t = progressFor(n.col, now);
        const morph = Math.max(0, Math.min(1, (t - 0.45) / 0.4));
        if (morph < 1) {
          ctx.globalAlpha = alphaFor(n) * (1 - morph);
          cloudMark(ctx, n.kind, p.x, p.y, Math.max(3, mark * 0.22), col);
          ctx.globalAlpha = alphaFor(n) * morph;
        }
        icon(ctx, n.kind, p.x, p.y, mark, col);
        ctx.globalAlpha = alphaFor(n);
        if (n.kind === 'source') {
          badge(n, p.x - mark * 0.86 - 32, p.y, mark);
        }

        ctx.font = `${isFocus ? 13 : n.list ? 11.5 : 12}px Archivo, system-ui, sans-serif`;
        ctx.fillStyle = isFlagged ? LEAD : isPending ? AMBER : isDone ? GREEN : isFocus ? INK : SOFT;
        if (n.list) {
          ctx.textAlign = 'left';
          // Clip to the gap before the next column so nothing runs into it.
          const room = Math.max(70, colGap - mark - 48);
          let label = n.title;
          if (ctx.measureText(label).width > room) {
            while (label.length > 4 && ctx.measureText(`${label}…`).width > room) {
              label = label.slice(0, -1);
            }
            label = `${label.trimEnd()}…`;
          }
          ctx.fillText(label, p.x + mark * 0.8 + 7, p.y + 4);
        } else {
          ctx.textAlign = 'center';
          const words = n.title.split(' ');
          const lines: string[] = [];
          let line = '';
          for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (ctx.measureText(next).width > 128 && line) {
              lines.push(line);
              line = word;
            } else {
              line = next;
            }
          }
          if (line) lines.push(line);
          lines.slice(0, 2).forEach((text, i) => {
            ctx.fillText(text, p.x, p.y + mark * 0.86 + 14 + i * 13);
          });
        }

        ctx.globalAlpha = 1;
        hits.push({ id: n.id, x: p.x, y: p.y, r: mark * 0.95 });
      }
      hitRef.current = hits;
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);

    const click = (ev: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      let best: string | null = null;
      let bd = 1e9;
      for (const hit of hitRef.current) {
        const d = Math.hypot(hit.x - x, hit.y - y);
        if (d < hit.r && d < bd) {
          bd = d;
          best = hit.id;
        }
      }
      onSelect(best);
    };
    const move = (ev: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const over = hitRef.current.some((hit) => Math.hypot(hit.x - x, hit.y - y) < hit.r);
      canvas.style.cursor = over ? 'pointer' : 'default';
    };
    const dbl = (ev: MouseEvent) => {
      if (!onIsolate) return;
      const r = canvas.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const hit = hitRef.current.find((h) => Math.hypot(h.x - x, h.y - y) < h.r);
      if (!hit) {
        onIsolate(null);
        return;
      }
      if (getNode(hit.id)?.kind === 'workflow') onIsolate(hit.id);
    };
    canvas.addEventListener('click', click);
    canvas.addEventListener('dblclick', dbl);
    canvas.addEventListener('mousemove', move);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('click', click);
      canvas.removeEventListener('dblclick', dbl);
      canvas.removeEventListener('mousemove', move);
    };
  }, [placed, links, focusId, onSelect, onIsolate]);

  return (
    <div ref={wrapRef} className="stage isolated">
      <canvas ref={canvasRef} />
    </div>
  );
}
