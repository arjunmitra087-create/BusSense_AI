import { useState } from 'react';
import type { Detection } from '@/types';
import { classNames, severityColor } from '@/lib/utils';

// A self-contained interactive map using SVG. No external map library needed.
// Renders roads, markers, heatmap, supports zoom/pan, filter, and selection.
export function GisMap({
  detections,
  selectedId,
  onSelect,
  heatmap = false,
  filters,
}: {
  detections: Detection[];
  selectedId?: string | null;
  onSelect?: (d: Detection) => void;
  heatmap?: boolean;
  filters?: { severity?: string; status?: string; busId?: string };
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  const filtered = detections.filter((d) => {
    if (filters?.severity && filters.severity !== 'all' && d.severity !== filters.severity) return false;
    if (filters?.status && filters.status !== 'all' && d.status !== filters.status) return false;
    if (filters?.busId && filters.busId !== 'all' && d.busId !== filters.busId) return false;
    return true;
  });

  // map lat/lng to SVG coords (normalize around city center)
  const cx = 18.52, cy = 73.85;
  const project = (lat: number, lng: number) => ({
    x: ((lng - cy) / 0.14) * 500 + 250,
    y: ((lat - cx) / -0.14) * 500 + 250,
  });

  const onDown = (e: React.MouseEvent) => {
    setDrag({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drag) return;
    setPan({ x: e.clientX - drag.x, y: e.clientY - drag.y });
  };
  const onUp = () => setDrag(null);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-ink-900 grid-bg">
      {/* zoom controls */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
        <button onClick={() => setZoom((z) => Math.min(3, z + 0.2))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-900/80 text-base text-slate-300 backdrop-blur transition hover:bg-white/10 hover:text-white">+</button>
        <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-900/80 text-base text-slate-300 backdrop-blur transition hover:bg-white/10 hover:text-white">−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-ink-900/80 text-xs text-slate-300 backdrop-blur transition hover:bg-white/10 hover:text-white">⟲</button>
      </div>

      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      >
        <svg
          viewBox="0 0 500 500"
          className="h-full w-full"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* zones */}
          {[
            { x: 80, y: 80, label: 'NORTH' },
            { x: 420, y: 80, label: 'EAST' },
            { x: 250, y: 250, label: 'CENTRAL' },
            { x: 80, y: 420, label: 'WEST' },
            { x: 420, y: 420, label: 'SOUTH' },
          ].map((z) => (
            <text key={z.label} x={z.x} y={z.y} fill="rgba(148,163,184,0.15)" fontSize="10" fontWeight="700" textAnchor="middle" className="pointer-events-none">
              {z.label}
            </text>
          ))}

          {/* simulated road network */}
          <g stroke="rgba(148,163,184,0.12)" strokeWidth="3" fill="none">
            <line x1="0" y1="250" x2="500" y2="250" />
            <line x1="250" y1="0" x2="250" y2="500" />
            <line x1="0" y1="120" x2="500" y2="180" />
            <line x1="0" y1="380" x2="500" y2="320" />
            <line x1="120" y1="0" x2="180" y2="500" />
            <line x1="380" y1="0" x2="320" y2="500" />
            <circle cx="250" cy="250" r="180" strokeDasharray="6 4" />
          </g>
          {/* road labels */}
          <text x="60" y="245" fill="rgba(148,163,184,0.25)" fontSize="7" fontWeight="600" className="pointer-events-none">MG Road</text>
          <text x="245" y="40" fill="rgba(148,163,184,0.25)" fontSize="7" fontWeight="600" className="pointer-events-none" transform="rotate(90 248 40)">Airport Rd</text>
          <text x="200" y="165" fill="rgba(148,163,184,0.25)" fontSize="7" fontWeight="600" className="pointer-events-none">Karve Road</text>
          <text x="160" y="395" fill="rgba(148,163,184,0.25)" fontSize="7" fontWeight="600" className="pointer-events-none">Satara Rd</text>

          {/* heatmap */}
          {heatmap &&
            filtered.map((d) => {
              const p = project(d.lat, d.lng);
              const r = d.riskScore / 6;
              const fill = d.severity === 'Critical' ? 'rgba(244,63,94,0.25)' : d.severity === 'Severe' ? 'rgba(251,146,60,0.22)' : d.severity === 'Medium' ? 'rgba(250,204,21,0.18)' : 'rgba(14,165,233,0.15)';
              return <circle key={`h-${d.id}`} cx={p.x} cy={p.y} r={r} fill={fill} />;
            })}

          {/* markers */}
          {filtered.map((d) => {
            const p = project(d.lat, d.lng);
            const sc = severityColor[d.severity];
            const isSel = selectedId === d.id;
            const repaired = d.status === 'Repaired';
            return (
              <g
                key={d.id}
                transform={`translate(${p.x}, ${p.y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(d);
                }}
              >
                {isSel && <circle r="14" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="animate-pulse-ring" />}
                <circle r={isSel ? 7 : 5} className={repaired ? 'fill-success-500' : sc.fill} stroke="#0b1120" strokeWidth="1.5" />
                {d.severity === 'Critical' && !repaired && <circle r="11" fill="none" stroke="rgba(244,63,94,0.5)" strokeWidth="1" className="animate-pulse-ring" />}
              </g>
            );
          })}
        </svg>
      </div>

      {/* legend */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-3 rounded-lg border border-white/10 bg-ink-900/90 px-3.5 py-2.5 text-[10px] backdrop-blur">
        {(['Critical', 'Severe', 'Medium', 'Low'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-slate-400">
            <span className={classNames('h-2 w-2 rounded-full', severityColor[s].dot)} />
            {s}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-success-500" /> Repaired
        </span>
      </div>

      {/* marker count badge */}
      <div className="absolute right-3 bottom-3 z-20 rounded-lg border border-white/10 bg-ink-900/90 px-3 py-1.5 text-[10px] backdrop-blur">
        <span className="font-mono text-slate-300">{filtered.length}</span> <span className="text-slate-500">markers</span>
      </div>
    </div>
  );
}
