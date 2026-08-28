import type { Severity, RepairStatus, AlertStatus, BusStatus } from '@/types';
import { classNames } from '@/lib/utils';

export function SeverityBadge({ severity, size = 'sm' }: { severity: Severity; size?: 'sm' | 'xs' }) {
  const map: Record<Severity, string> = {
    Low: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    Medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    Severe: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    Critical: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  };
  const dot: Record<Severity, string> = {
    Low: 'bg-sky-400',
    Medium: 'bg-amber-400',
    Severe: 'bg-orange-400',
    Critical: 'bg-rose-400',
  };
  return (
    <span className={classNames('chip border', map[severity], size === 'xs' ? 'px-2 py-0.5 text-[10px]' : '')}>
      <span className={classNames('h-1.5 w-1.5 rounded-full', dot[severity])} />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: RepairStatus }) {
  const map: Record<RepairStatus, string> = {
    Open: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    Reported: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    Assigned: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    'In Progress': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    Repaired: 'bg-success-500/10 text-success-400 border-success-500/30',
    'Verification Pending': 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  };
  return <span className={classNames('chip border', map[status])}>{status}</span>;
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const map: Record<AlertStatus, string> = {
    New: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    Acknowledged: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    Assigned: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    Resolved: 'bg-success-500/10 text-success-400 border-success-500/30',
    Dismissed: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };
  return <span className={classNames('chip border', map[status])}>{status}</span>;
}

export function BusStatusBadge({ status }: { status: BusStatus }) {
  const map: Record<BusStatus, { c: string; dot: string }> = {
    Online: { c: 'bg-success-500/10 text-success-400 border-success-500/30', dot: 'bg-success-400' },
    Offline: { c: 'bg-slate-500/10 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
    Processing: { c: 'bg-brand-500/10 text-brand-300 border-brand-500/30', dot: 'bg-brand-400' },
    Warning: { c: 'bg-amber-500/10 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  };
  const m = map[status];
  return (
    <span className={classNames('chip border', m.c)}>
      <span className={classNames('h-1.5 w-1.5 rounded-full', m.dot, status === 'Processing' && 'animate-pulse')} />
      {status}
    </span>
  );
}

export function RiskScore({ score, compact = false }: { score: number; compact?: boolean }) {
  const color = score >= 81 ? 'text-rose-300' : score >= 61 ? 'text-orange-300' : score >= 31 ? 'text-amber-300' : 'text-sky-300';
  const bg = score >= 81 ? 'bg-rose-500/10' : score >= 61 ? 'bg-orange-500/10' : score >= 31 ? 'bg-amber-500/10' : 'bg-sky-500/10';
  return (
    <div className={classNames('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5', bg)}>
      <span className={classNames('font-mono font-semibold', color, compact ? 'text-xs' : 'text-sm')}>{score}</span>
      {!compact && <span className="text-[10px] text-slate-500">/100</span>}
    </div>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? 'bg-success-500' : pct >= 75 ? 'bg-brand-500' : pct >= 60 ? 'bg-amber-500' : 'bg-slate-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-white/10 overflow-hidden">
        <div className={classNames('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-400">{pct}%</span>
    </div>
  );
}
