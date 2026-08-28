import { useState } from 'react';
import { Siren, ShieldAlert, Car, Eye } from 'lucide-react';
import type { Incident, IncidentStatus } from '@/types';
import { incidents } from '@/lib/mockData';
import { classNames, fmtDateTime, timeAgo } from '@/lib/utils';
import { EvidenceFrame } from '@/components/EvidenceFrame';

const STATUS_STYLE: Record<IncidentStatus, string> = {
  Open: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  Investigating: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Closed: 'bg-success-500/10 text-success-400 border-success-500/30',
};

export function IncidentsPage() {
  const [selected, setSelected] = useState<Incident | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Incidents</h2>
          <p className="mt-1 text-sm text-slate-400">Traffic & safety incidents detected by bus cameras · future-ready module</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-300">
          <ShieldAlert className="h-3.5 w-3.5" /> Sensitive evidence · RBAC protected
        </div>
      </div>

      {/* incident grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {incidents.map((inc) => (
          <div key={inc.id} className="card card-hover cursor-pointer p-5" onClick={() => setSelected(inc)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
                  <Siren className="h-5 w-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{inc.type}</h3>
                  <p className="font-mono text-[10px] text-slate-500">{inc.id}</p>
                </div>
              </div>
              <span className={classNames('chip border', STATUS_STYLE[inc.status])}>{inc.status}</span>
            </div>

            <div className="mt-4 flex gap-3">
              <EvidenceFrame seed={parseInt(inc.id.replace(/\D/g, ''))} className="h-16 w-24 shrink-0" />
              <div className="flex-1 space-y-1.5 text-xs">
                <Row label="Bus" value={inc.busId} />
                <Row label="Time" value={fmtDateTime(inc.timestamp)} />
                <Row label="Confidence" value={`${Math.round(inc.confidence * 100)}%`} />
                {inc.plate && <Row label="Plate (demo)" value={inc.plate} mono />}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{inc.status === 'Open' ? 'Awaiting review' : timeAgo(inc.timestamp)}</span>
              {inc.anprConfidence && <span className="font-mono">ANPR {Math.round(inc.anprConfidence * 100)}%</span>}
            </div>
          </div>
        ))}
      </div>

      {/* detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
                  <Siren className="h-5 w-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.type}</h3>
                  <p className="font-mono text-xs text-slate-500">{selected.id}</p>
                </div>
              </div>
              <span className={classNames('chip border', STATUS_STYLE[selected.status])}>{selected.status}</span>
            </div>

            <div className="mt-4">
              <EvidenceFrame seed={parseInt(selected.id.replace(/\D/g, ''))} className="aspect-video" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Field label="Bus ID" value={selected.busId} />
              <Field label="Timestamp" value={fmtDateTime(selected.timestamp)} />
              <Field label="GPS" value={`${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`} mono />
              <Field label="Confidence" value={`${Math.round(selected.confidence * 100)}%`} />
            </div>

            {selected.plate && (
              <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-[10px] uppercase tracking-wider text-amber-400">ANPR — Demo Plate</p>
                <p className="mt-1 font-mono text-lg font-bold text-amber-300">{selected.plate}</p>
                <p className="mt-1 text-[11px] text-slate-500">ANPR Confidence: {Math.round((selected.anprConfidence ?? 0) * 100)}% · Simulated value for demo</p>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button className="btn-primary flex-1 text-xs">Investigate</button>
              <button onClick={() => setSelected(null)} className="btn-outline text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={classNames('text-slate-300', mono && 'font-mono')}>{value}</span>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-ink-850/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={classNames('mt-1 text-slate-200', mono && 'font-mono')}>{value}</p>
    </div>
  );
}
