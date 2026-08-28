import { classNames } from '@/lib/utils';

// Generates a deterministic SVG "road scene" placeholder with a pothole bounding box.
// Used for evidence frames and camera feeds so the UI looks alive without external assets.
export function EvidenceFrame({
  seed,
  bbox,
  showBox = true,
  label,
  className,
  detected = true,
}: {
  seed: number;
  bbox?: { x: number; y: number; w: number; h: number };
  showBox?: boolean;
  label?: string;
  className?: string;
  detected?: boolean;
}) {
  const hue = (seed * 47) % 360;
  const roadShade = 20 + (seed % 12);
  const skyShade = 140 + (seed % 30);
  const potholeX = 35 + ((seed * 13) % 30);
  const potholeY = 58 + ((seed * 7) % 18);
  const potholeR = 8 + (seed % 6);
  const hasCrack = seed % 3 === 0;

  return (
    <div className={classNames('relative overflow-hidden rounded-lg bg-ink-900', className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {/* sky */}
        <defs>
          <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue}, 30%, ${skyShade / 2.5}%)`} />
            <stop offset="100%" stopColor={`hsl(${hue}, 20%, ${roadShade + 10}%)`} />
          </linearGradient>
          <linearGradient id={`road-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(0, 0%, ${roadShade + 8}%)`} />
            <stop offset="100%" stopColor={`hsl(0, 0%, ${roadShade - 4}%)`} />
          </linearGradient>
        </defs>
        <rect width="100" height="55" fill={`url(#sky-${seed})`} />
        {/* horizon buildings */}
        <rect x="5" y="35" width="12" height="20" fill={`hsl(0,0%,${roadShade + 14}%)`} />
        <rect x="20" y="28" width="10" height="27" fill={`hsl(0,0%,${roadShade + 10}%)`} />
        <rect x="33" y="32" width="14" height="23" fill={`hsl(0,0%,${roadShade + 16}%)`} />
        <rect x="52" y="25" width="12" height="30" fill={`hsl(0,0%,${roadShade + 12}%)`} />
        <rect x="68" y="30" width="16" height="25" fill={`hsl(0,0%,${roadShade + 15}%)`} />
        <rect x="86" y="34" width="10" height="21" fill={`hsl(0,0%,${roadShade + 11}%)`} />
        {/* road */}
        <rect y="55" width="100" height="45" fill={`url(#road-${seed})`} />
        {/* lane markings */}
        <line x1="50" y1="55" x2="48" y2="100" stroke={`hsl(0,0%,${roadShade + 25}%)`} strokeWidth="0.8" strokeDasharray="4 3" />
        {/* pothole */}
        <ellipse cx={potholeX} cy={potholeY} rx={potholeR} ry={potholeR * 0.6} fill={`hsl(0,0%,${roadShade - 12}%)`} />
        <ellipse cx={potholeX} cy={potholeY} rx={potholeR * 0.6} ry={potholeR * 0.35} fill={`hsl(0,0%,${roadShade - 20}%)`} />
        {hasCrack && (
          <path d={`M ${potholeX + potholeR} ${potholeY} q 8 -2 14 4 q 6 3 12 0`} stroke={`hsl(0,0%,${roadShade + 18}%)`} strokeWidth="0.5" fill="none" />
        )}
        {/* scan line */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="#22d3ee" strokeWidth="0.3" opacity="0.4" />
      </svg>
      {showBox && bbox && detected && (
        <div
          className="absolute rounded border-2 border-brand-400 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${bbox.x}%`, top: `${bbox.y}%`, width: `${bbox.w}%`, height: `${bbox.h}%` }}
        >
          <span className="absolute -top-5 left-0 rounded bg-brand-400 px-1 py-0.5 text-[9px] font-bold text-ink-950 whitespace-nowrap">
            {label ?? 'POTHOLE'}
          </span>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('skeleton rounded-lg', className)} />;
}
