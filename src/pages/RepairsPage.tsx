import { useState } from 'react';
import { Wrench, Calendar, User, CheckCircle2, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';
import type { Repair, RepairStatus } from '@/types';
import { repairs } from '@/lib/mockData';
import { classNames, fmtDateTime } from '@/lib/utils';
import { SeverityBadge, StatusBadge } from '@/components/Badges';
import { EvidenceFrame } from '@/components/EvidenceFrame';

const FLOW: RepairStatus[] = ['Open', 'Reported', 'Assigned', 'In Progress', 'Repaired', 'Verification Pending'];

export function RepairsPage() {
  const [items, setItems] = useState(repairs);
  const [selected, setSelected] = useState<Repair | null>(null);

  const advance = (defectId: string) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.defectId !== defectId) return r;
        const idx = FLOW.indexOf(r.status);
        const next = FLOW[Math.min(idx + 1, FLOW.length - 1)];
        return {
          ...r,
          status: next,
          repairDate: next === 'Repaired' || next === 'Verification Pending' ? new Date().toISOString() : r.repairDate,
          afterEvidenceSeed: next === 'Repaired' || next === 'Verification Pending' ? (r.afterEvidenceSeed ?? 600) : r.afterEvidenceSeed,
        };
      })
    );
    setSelected((s) => (s && s.defectId === defectId ? { ...s, status: FLOW[Math.min(FLOW.indexOf(s.status) + 1, FLOW.length - 1)] } : s));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Repair Management</h2>
          <p className="mt-1 text-sm text-slate-400">Track repair lifecycle from open to verification</p>
        </div>
      </div>

      {/* repair funnel summary */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white">Repair Pipeline</h3>
        <p className="mt-0.5 text-xs text-slate-500">Current distribution across workflow stages</p>
        <div className="mt-5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {FLOW.map((s, i) => {
            const count = items.filter((r) => r.status === s).length;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className="flex min-w-[120px] flex-col items-center rounded-xl border border-white/5 bg-ink-900/60 p-3">
                  <span className="text-lg font-bold text-white">{count}</span>
                  <span className="text-[10px] text-slate-400">{s}</span>
                </div>
                {i < FLOW.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-slate-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* repair table */}
      <div className="card overflow-hidden">
        <div className="border-b border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white">Active Repair Work Orders</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-ink-900/40 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Defect ID</th>
                <th className="px-3 py-3 font-medium">Road</th>
                <th className="px-3 py-3 font-medium">Severity</th>
                <th className="px-3 py-3 font-medium">Team</th>
                <th className="px-3 py-3 font-medium">Assigned</th>
                <th className="px-3 py-3 font-medium">Expected</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((r) => (
                <tr key={r.defectId} className="table-row-hover cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="px-5 py-3 font-mono text-xs text-slate-300">{r.defectId}</td>
                  <td className="px-3 py-3 text-slate-300">{r.road}</td>
                  <td className="px-3 py-3"><SeverityBadge severity={r.severity} size="xs" /></td>
                  <td className="px-3 py-3 text-slate-400">{r.team}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{fmtDateTime(r.assignedDate)}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{fmtDateTime(r.expectedCompletion)}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 text-right">
                    {r.status !== 'Verification Pending' ? (
                      <button onClick={(e) => { e.stopPropagation(); advance(r.defectId); }} className="btn-ghost px-2 py-1 text-xs">
                        Advance <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-violet-300">Awaiting verification</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto scrollbar-thin border-l border-white/10 bg-ink-900 p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white">{selected.defectId}</h3>
            <p className="text-xs text-slate-500">{selected.road} · {selected.location}</p>

            <div className="mt-4 flex items-center gap-2">
              <SeverityBadge severity={selected.severity} />
              <StatusBadge status={selected.status} />
            </div>

            {/* lifecycle tracker */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-300">Repair Lifecycle</p>
              <div className="mt-3 space-y-2">
                {FLOW.map((s, i) => {
                  const reached = FLOW.indexOf(selected.status) >= i;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <span className={classNames('flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold', reached ? 'bg-brand-500 text-ink-950' : 'bg-ink-800 text-slate-500')}>
                        {reached ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span className={classNames('text-xs', reached ? 'text-slate-200' : 'text-slate-500')}>{s}</span>
                      {reached && <span className="ml-auto text-[10px] text-slate-500">done</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <Field icon={User} label="Team" value={selected.team} />
              <Field icon={Wrench} label="Severity" value={selected.severity} />
              <Field icon={Calendar} label="Assigned" value={fmtDateTime(selected.assignedDate)} />
              <Field icon={Clock} label="Expected" value={fmtDateTime(selected.expectedCompletion)} />
            </div>

            {selected.afterEvidenceSeed && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-slate-300">Repair Verification Pending</p>
                <p className="mt-0.5 text-[11px] text-slate-500">After-repair evidence uploaded · awaiting authority approval</p>
                <div className="mt-3">
                  <EvidenceFrame seed={selected.afterEvidenceSeed} className="aspect-video" />
                </div>
                <button className="btn-primary mt-3 w-full text-xs">
                  <ImageIcon className="h-3.5 w-3.5" /> Verify & Close
                </button>
              </div>
            )}

            {selected.status !== 'Verification Pending' && (
              <button onClick={() => advance(selected.defectId)} className="btn-primary mt-5 w-full text-xs">
                Advance to next stage <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Wrench; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-850/60 p-3">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-slate-200">{value}</p>
    </div>
  );
}
