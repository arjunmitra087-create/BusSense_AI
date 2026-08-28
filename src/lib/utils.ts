import type { Severity } from '@/types';

export function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const severityColor: Record<Severity, { dot: string; fill: string; text: string; bg: string; border: string; ring: string }> = {
  Low: { dot: 'bg-sky-400', fill: 'fill-sky-400', text: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/30', ring: 'ring-sky-500/40' },
  Medium: { dot: 'bg-amber-400', fill: 'fill-amber-400', text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', ring: 'ring-amber-500/40' },
  Severe: { dot: 'bg-orange-400', fill: 'fill-orange-400', text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30', ring: 'ring-orange-500/40' },
  Critical: { dot: 'bg-rose-400', fill: 'fill-rose-400', text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/30', ring: 'ring-rose-500/40' },
};

export function riskTier(score: number): { label: string; color: string } {
  if (score >= 81) return { label: 'Critical', color: 'text-rose-300' };
  if (score >= 61) return { label: 'High', color: 'text-orange-300' };
  if (score >= 31) return { label: 'Medium', color: 'text-amber-300' };
  return { label: 'Low', color: 'text-sky-300' };
}

export function confidenceTier(c: number): { label: string; color: string } {
  if (c >= 0.9) return { label: 'Very High', color: 'text-success-400' };
  if (c >= 0.75) return { label: 'High', color: 'text-brand-300' };
  if (c >= 0.6) return { label: 'Moderate', color: 'text-amber-300' };
  return { label: 'Low', color: 'text-slate-400' };
}

export function pctChange(value: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round(((value - prev) / prev) * 100);
}
