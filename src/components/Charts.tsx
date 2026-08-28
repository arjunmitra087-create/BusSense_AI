import { classNames } from '@/lib/utils';

export function Sparkline({ data, color = '#22d3ee', height = 36, width = 120 }: { data: number[]; color?: string; height?: number; width?: number }) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data.map((d, i) => `${i * step},${height - ((d - min) / range) * height}`);
  const path = `M ${points.join(' L ')}`;
  const area = `${path} L ${width},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color.replace('#', '')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChart({ data, color = '#22d3ee', height = 180, max, showValues = false }: { data: { label: string; value: number }[]; color?: string; height?: number; max?: number; showValues?: boolean }) {
  const m = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center gap-1.5">
          {showValues && (
            <span className="font-mono text-[10px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">{d.value}</span>
          )}
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md transition-all duration-500 hover:opacity-80 hover:brightness-125"
              style={{ height: `${(d.value / m) * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}40)`, minHeight: 2 }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[10px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, color = '#22d3ee', height = 180 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const w = 600;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = w / (data.length - 1 || 1);
  const points = data.map((d, i) => `${i * step},${height - (d.value / max) * (height - 20) - 10}`);
  const path = `M ${points.join(' L ')}`;
  const area = `${path} L ${w},${height} L 0,${height} Z`;
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={`line-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" y1={height * g} x2={w} y2={height * g} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#line-${color.replace('#', '')})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={i * step} cy={height - (d.value / max) * (height - 20) - 10} r="2.5" fill={color} className="opacity-70" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-slate-500">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data, size = 140 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="-rotate-90">
        {data.map((d) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-300">{d.label}</span>
            <span className="ml-auto font-mono text-slate-400">{d.value}</span>
            <span className="font-mono text-slate-600">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'bg-brand-500' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div className={classNames('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
