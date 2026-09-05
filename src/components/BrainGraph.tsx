import { useEffect, useMemo, useRef } from 'react';
import { getNode, graphNodes, isConfirmed, isPropagationRelation } from '../engine/graph';
import { lastScreen } from '../engine/positions';
import type { FirmEdge, FirmNode, NodeKind } from '../types';

interface LaidOut extends FirmNode {
  x: number;
  y: number;
  z: number;
  bx: number;
  by: number;
  bz: number;
  _px: number;
  _py: number;
}

/** A stable pseudo-random number per node id, so the ball never reshuffles. */
function hashUnit(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * The firm as it stands. Teams work across each other and workflows overlap, so
 * the artifacts and the people converge into one dense mass. Sorting pulls that
 * mass apart along a single axis: how far a change travels from an instrument.
 */
function ball(nodes: LaidOut[]) {
  const n = nodes.length;
  nodes.forEach((node, i) => {
    const k = i + 0.5;
    const phi = Math.acos(1 - (2 * k) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * k;
    const radius = 190 + hashUnit(node.id, 7) * 135;
    node.bx = radius * Math.sin(phi) * Math.cos(theta);
    node.by = radius * Math.sin(phi) * Math.sin(theta);
    node.bz = radius * Math.cos(phi);
  });
}

const LAYER: Partial<Record<NodeKind, number>> = {
  source: -300,
  document: -80,
  playbook: -80,
  advisory: 150,
  workflow: 120,
  team: 305,
};
const DISC: Partial<Record<NodeKind, number>> = {
  source: 210,
  document: 245,
  playbook: 245,
  advisory: 130,
  workflow: 135,
  team: 120,
};
const LIFT: Partial<Record<NodeKind, number>> = {
  source: 0,
  document: 0,
  playbook: 0,
  advisory: 110,
  workflow: -10,
  team: 0,
};
const COL: Partial<Record<NodeKind, string>> = {
  source: '#1B2021',
  document: '#5A625F',
  playbook: '#5A625F',
  workflow: '#5A625F',
  advisory: '#5A625F',
  team: '#5A625F',
};

function layout(nodes: FirmNode[], edges: FirmEdge[]): { nodes: LaidOut[]; maxXZ: number; maxY: number } {
  const laid: LaidOut[] = nodes.map((n) => ({ ...n, x: 0, y: 0, z: 0, bx: 0, by: 0, bz: 0, _px: 0, _py: 0 }));
  const groups = new Map<string, LaidOut[]>();
  for (const n of laid) {
    const g = n.kind === 'document' || n.kind === 'playbook' ? 'mid' : n.kind;
    const arr = groups.get(g) ?? [];
    arr.push(n);
    groups.set(g, arr);
  }
  for (const arr of groups.values()) {
    const m = arr.length;
    arr.forEach((n, i) => {
      const ang = 2.399963 * i;
      const rad = (DISC[n.kind] ?? 180) * Math.sqrt((i + 0.6) / m);
      n.x = LAYER[n.kind] ?? 0;
      n.y = Math.sin(ang) * rad + (LIFT[n.kind] ?? 0);
      n.z = Math.cos(ang) * rad;
    });
  }

  const vel = new Map<string, { vy: number; vz: number }>();
  for (const n of laid) vel.set(n.id, { vy: 0, vz: 0 });
  const byId = new Map(laid.map((n) => [n.id, n]));

  for (let it = 0; it < 220; it++) {
    for (const arr of groups.values()) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const d2 = dy * dy + dz * dz + 1;
          const d = Math.sqrt(d2);
          const f = 2600 / d2;
          const va = vel.get(a.id);
          const vb = vel.get(b.id);
          if (!va || !vb) continue;
          va.vy -= (dy / d) * f;
          va.vz -= (dz / d) * f;
          vb.vy += (dy / d) * f;
          vb.vz += (dz / d) * f;
        }
      }
    }
    for (const e of edges) {
      const a = byId.get(e.src);
      const b = byId.get(e.dst);
      if (!a || !b) continue;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const d = Math.sqrt(dy * dy + dz * dz) || 0.01;
      const f = d * 0.01;
      const va = vel.get(a.id);
      const vb = vel.get(b.id);
      if (!va || !vb) continue;
      va.vy += (dy / d) * f;
      va.vz += (dz / d) * f;
      vb.vy -= (dy / d) * f;
      vb.vz -= (dz / d) * f;
    }
    for (const n of laid) {
      const v = vel.get(n.id);
      if (!v) continue;
      const cy = n.y - (LIFT[n.kind] ?? 0);
      const r = Math.sqrt(cy * cy + n.z * n.z) || 0.01;
      const pull = ((DISC[n.kind] ?? 180) - r) * 0.05;
      v.vy += (cy / r) * pull;
      v.vz += (n.z / r) * pull;
      n.y += v.vy * 0.3;
      n.z += v.vz * 0.3;
      v.vy *= 0.7;
      v.vz *= 0.7;
    }
  }

  ball(laid);

  let maxXZ = 0;
  let maxY = 0;
  for (const n of laid) {
    maxXZ = Math.max(maxXZ, Math.sqrt(n.x * n.x + n.z * n.z), Math.sqrt(n.bx * n.bx + n.bz * n.bz));
    maxY = Math.max(maxY, Math.abs(n.y), Math.abs(n.by));
  }
  return { nodes: laid, maxXZ, maxY };
}

function shape(
  ctx: CanvasRenderingContext2D,
  kind: NodeKind,
  x: number,
  y: number,
  r: number,
  col: string,
) {
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
  if (kind === 'source') {
    ctx.beginPath();
    ctx.arc(x, y, r + 2.4, 0, Math.PI * 2);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function BrainGraph({
  edges,
  flagged,
  verified,
  selectedId,
  watchedSourceIds,
  visibleIds,
  focusId,
  sorted = false,
  onSelect,
  onIsolate,
}: {
  edges: FirmEdge[];
  flagged: Set<string>;
  verified?: Set<string>;
  selectedId: string | null;
  watchedSourceIds: string[];
  visibleIds?: Set<string> | null;
  focusId?: string | null;
  sorted?: boolean;
  onSelect: (id: string | null) => void;
  onIsolate?: (id: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flaggedRef = useRef(flagged);
  const verifiedRef = useRef(verified ?? new Set<string>());
  verifiedRef.current = verified ?? new Set<string>();
  const selectedRef = useRef(selectedId);
  const sortRef = useRef(sorted ? 1 : 0);
  const targetRef = useRef(sorted ? 1 : 0);
  targetRef.current = sorted ? 1 : 0;
  const focusRef = useRef(focusId ?? null);
  flaggedRef.current = flagged;
  selectedRef.current = selectedId;
  focusRef.current = focusId ?? null;
  const state = useRef({
    yaw: 0.34,
    pitch: -0.22,
    zoom: 1,
    dragging: false,
    moved: 0,
    lx: 0,
    ly: 0,
    hover: null as string | null,
    w: 800,
    h: 560,
  });

  const visible = useMemo(() => {
    const watched = new Set(watchedSourceIds);
    return graphNodes().filter((n) => {
      if (n.kind === 'source' && n.jurisdiction === 'AU' && !watched.has(n.id)) return false;
      if (visibleIds && !visibleIds.has(n.id)) return false;
      return true;
    });
  }, [watchedSourceIds, visibleIds]);

  const graphEdges = useMemo(
    () =>
      edges.filter(
        (e) =>
          isPropagationRelation(e.relation) &&
          visible.some((n) => n.id === e.src) &&
          visible.some((n) => n.id === e.dst),
      ),
    [edges, visible],
  );

  const laid = useMemo(() => layout(visible, graphEdges), [visible, graphEdges]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let auto = !reduce;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.current.w = r.width;
      state.current.h = r.height;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (r.width < 700) state.current.yaw = 0.95;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const project = (n: LaidOut) => {
      const { yaw, pitch, zoom, w, h } = state.current;
      const t = sortRef.current;
      const nx = n.bx + (n.x - n.bx) * t;
      const ny = n.by + (n.y - n.by) * t;
      const nz = n.bz + (n.z - n.bz) * t;
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const x1 = nx * cy - nz * sy;
      const z1 = nx * sy + nz * cy;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const y1 = ny * cp - z1 * sp;
      const z2 = ny * sp + z1 * cp;
      const narrow = w < 700;
      const fit = Math.min((w * 0.44) / (laid.maxXZ * (narrow ? 0.82 : 1)), (h * (narrow ? 0.44 : 0.46)) / (laid.maxY + 30));
      const D = 1500;
      const f = D * fit * zoom;
      const s = f / (D + z2);
      return { x: w / 2 + x1 * s, y: h / 2 + y1 * s, s, z: z2 };
    };

    const draw = () => {
      const { w, h, hover } = state.current;
      ctx.clearRect(0, 0, w, h);
      const pts = new Map<string, ReturnType<typeof project>>();
      for (const n of laid.nodes) pts.set(n.id, project(n));
      let minx = 1e9;
      let maxx = -1e9;
      let miny = 1e9;
      let maxy = -1e9;
      for (const p of pts.values()) {
        minx = Math.min(minx, p.x);
        maxx = Math.max(maxx, p.x);
        miny = Math.min(miny, p.y);
        maxy = Math.max(maxy, p.y);
      }
      // Centre on the focus node when one is set, otherwise on the whole cloud.
      // Pull back toward the centroid only as far as needed to keep every node on screen.
      const cx = w / 2 - (minx + maxx) / 2;
      const cy2 = h / 2 - (miny + maxy) / 2;
      const focus = focusRef.current ? pts.get(focusRef.current) : undefined;
      let ox = cx;
      let oy = cy2;
      if (focus) {
        const pad = 26;
        const fx = w / 2 - focus.x;
        const fy = h / 2 - focus.y;
        const fit = (target: number, centre: number, lo: number, hi: number, size: number) => {
          if (lo + target >= pad && hi + target <= size - pad) return target;
          const room = size - pad * 2;
          if (hi - lo > room) return centre;
          const clamped = Math.min(pad - lo, Math.max(size - pad - hi, target));
          return clamped;
        };
        ox = fit(fx, cx, minx, maxx, w);
        oy = fit(fy, cy2, miny, maxy, h);
      }
      for (const p of pts.values()) {
        p.x += ox;
        p.y += oy;
      }

      const es = graphEdges
        .map((e) => {
          const a = pts.get(e.src);
          const b = pts.get(e.dst);
          if (!a || !b) return null;
          return {
            a,
            b,
            z: (a.z + b.z) / 2,
            f:
              flaggedRef.current.has(e.src) &&
              flaggedRef.current.has(e.dst) &&
              !verifiedRef.current.has(e.src) &&
              !verifiedRef.current.has(e.dst),
            hi: selectedRef.current === e.src || selectedRef.current === e.dst,
            dashed: !isConfirmed(e),
          };
        })
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
        .sort((p, q) => q.z - p.z);

      for (const e of es) {
        const depth = Math.max(0.12, Math.min(1, (420 - e.z) / 800));
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        if (e.dashed) ctx.setLineDash([3, 4]);
        else ctx.setLineDash([]);
        if (e.f) {
          ctx.strokeStyle = `rgba(180,51,31,${0.55 * depth + 0.15})`;
          ctx.lineWidth = 1.3;
        } else if (e.hi) {
          ctx.strokeStyle = `rgba(27,32,33,${0.7 * depth})`;
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = `rgba(120,128,124,${0.2 * depth})`;
          ctx.lineWidth = 0.7;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const order = [...laid.nodes].sort((a, b) => (pts.get(b.id)?.z ?? 0) - (pts.get(a.id)?.z ?? 0));
      const labelBoxes: number[][] = [];
      const labelQueue: Array<{ n: LaidOut; p: ReturnType<typeof project>; rad: number; isF: boolean; pri: number }> = [];
      const anyFlag = flaggedRef.current.size > 0;

      for (const n of order) {
        const p = pts.get(n.id);
        if (!p) continue;
        n._px = p.x;
        n._py = p.y;
        lastScreen.set(n.id, { x: p.x, y: p.y });
        const isDone = verifiedRef.current.has(n.id);
        const isF = flaggedRef.current.has(n.id) && !isDone;
        const isSel = selectedRef.current === n.id;
        const isHov = hover === n.id;
        const base = n.kind === 'source' ? 5.4 : n.kind === 'team' ? 5 : 3.8;
        const rad = base * p.s * (isSel || isHov ? 1.5 : 1);
        const col = isF ? '#B4331F' : isDone ? '#2F6B4F' : (COL[n.kind] ?? '#5A625F');
        ctx.globalAlpha = isF
          ? Math.max(0.6, Math.min(1, (460 - p.z) / 760))
          : Math.max(0.32, Math.min(1, (460 - p.z) / 760));
        shape(ctx, n.kind, p.x, p.y, rad, col);
        ctx.globalAlpha = 1;
        if (isF) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad + 4.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(180,51,31,0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        const showLabel = isSel || isHov || (anyFlag ? isF : n.kind === 'source' || n.kind === 'team');
        if (showLabel) {
          labelQueue.push({
            n,
            p,
            rad,
            isF,
            pri: isSel || isHov ? -1e9 : p.z,
          });
        }
      }

      labelQueue
        .sort((a, b) => a.pri - b.pri)
        .forEach((q) => {
          const forced = q.pri < -1e8;
          const fs = forced ? 12.5 : 11.5;
          ctx.font = `${fs}px Archivo, system-ui, sans-serif`;
          const tw = ctx.measureText(q.n.title).width;
          let bx = q.p.x + q.rad + 6;
          const by = q.p.y - fs * 0.72;
          if (bx + tw > w - 10) bx = q.p.x - q.rad - 6 - tw;
          if (bx < 6) bx = 6;
          let clash = false;
          for (const o of labelBoxes) {
            if (bx < o[0] + o[2] + 4 && bx + tw + 4 > o[0] && by < o[1] + o[3] && by + fs * 1.4 > o[1]) {
              clash = true;
              break;
            }
          }
          if (clash && !forced) return;
          labelBoxes.push([bx, by, tw, fs * 1.4]);
          ctx.fillStyle = q.isF ? '#B4331F' : q.n.kind === 'source' || forced ? '#1B2021' : '#5A625F';
          ctx.globalAlpha = q.isF
            ? Math.max(0.85, Math.min(1, (460 - q.p.z) / 700))
            : Math.max(0.55, Math.min(1, (460 - q.p.z) / 700));
          ctx.fillText(q.n.title, bx, q.p.y + 3.5);
          ctx.globalAlpha = 1;
        });
    };

    const loop = () => {
      // Ease toward whichever shape is asked for.
      const gap = targetRef.current - sortRef.current;
      if (Math.abs(gap) > 0.001) sortRef.current += gap * (reduce ? 1 : 0.075);
      else sortRef.current = targetRef.current;
      if (auto && !state.current.dragging && !selectedRef.current && !focusRef.current)
        state.current.yaw += 0.0016;
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const pos = (ev: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in ev ? ev.touches[0] : ev;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    };
    const pick = (x: number, y: number) => {
      let best: string | null = null;
      let bd = 16;
      for (const n of laid.nodes) {
        const d = Math.hypot(n._px - x, n._py - y);
        if (d < bd) {
          bd = d;
          best = n.id;
        }
      }
      return best;
    };
    const down = (ev: MouseEvent | TouchEvent) => {
      state.current.dragging = true;
      state.current.moved = 0;
      const p = pos(ev);
      state.current.lx = p.x;
      state.current.ly = p.y;
      canvas.classList.add('dragging');
    };
    const move = (ev: MouseEvent | TouchEvent) => {
      const p = pos(ev);
      if (state.current.dragging) {
        const dx = p.x - state.current.lx;
        const dy = p.y - state.current.ly;
        state.current.moved += Math.abs(dx) + Math.abs(dy);
        state.current.yaw += dx * 0.006;
        state.current.pitch = Math.max(-1.2, Math.min(1.2, state.current.pitch + dy * 0.005));
        state.current.lx = p.x;
        state.current.ly = p.y;
        if ('cancelable' in ev && ev.cancelable) ev.preventDefault();
      } else {
        state.current.hover = pick(p.x, p.y);
        canvas.style.cursor = state.current.hover ? 'pointer' : 'grab';
      }
    };
    const up = () => {
      state.current.dragging = false;
      canvas.classList.remove('dragging');
    };
    const click = (ev: MouseEvent) => {
      if (state.current.moved > 6) return;
      const p = pos(ev);
      onSelect(pick(p.x, p.y));
    };
    // Double click a workflow to isolate it. Double click empty space to clear.
    const dbl = (ev: MouseEvent) => {
      if (!onIsolate) return;
      const p = pos(ev);
      const hit = pick(p.x, p.y);
      if (!hit) {
        onIsolate(null);
        return;
      }
      if (getNode(hit)?.kind === 'workflow') onIsolate(hit);
    };

    canvas.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', down, { passive: true });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    canvas.addEventListener('click', click);
    canvas.addEventListener('dblclick', dbl);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousedown', down);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      canvas.removeEventListener('touchstart', down);
      canvas.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      canvas.removeEventListener('click', click);
      canvas.removeEventListener('dblclick', dbl);
    };
  }, [graphEdges, laid, onSelect, onIsolate]);

  return (
    <div ref={wrapRef} className="stage">
      <canvas ref={canvasRef} />
    </div>
  );
}
