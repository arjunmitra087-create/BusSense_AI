import { useState } from 'react';
import { X, MapPin, Bus, Calendar, Layers, Flame, Filter } from 'lucide-react';
import type { Detection } from '@/types';
import { detections } from '@/lib/mockData';
import { classNames, fmtDateTime, timeAgo } from '@/lib/utils';
import { SeverityBadge, RiskScore, ConfidenceBar, StatusBadge } from '@/components/Badges';
import { EvidenceFrame } from '@/components/EvidenceFrame';
import { GisMap } from '@/components/GisMap';

export function MapPage() {
  const [selected, setSelected] = useState<Detection | null>(null);
  const [heatmap, setHeatmap] = useState(false);
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [busId, setBusId] = useState('all');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">GIS Map</h2>
          <p className="mt-1 text-sm text-slate-400">Geographic view of all road defects across the city</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHeatmap((v) => !v)}
            className={classNames('btn text-xs', heatmap ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30' : 'btn-outline')}
          >
            <Flame className="h-3.5 w-3.5" /> Heatmap
          </button>
        </div>
      </div>

      {/* filter bar */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <Filter className="h-4 w-4 text-slate-500" />
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-slate-500" />
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="input w-auto py-2 text-xs">
            <option value="all">All severities</option>
            <option value="Critical">Critical</option>
            <option value="Severe">Severe</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto py-2 text-xs">
            <option value="all">All statuses</option>
            <option value="Open">Open</option>
            <option value="Reported">Reported</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Repaired">Repaired</option>
            <option value="Verification Pending">Verification Pending</option>
          </select>
          <select value={busId} onChange={(e) => setBusId(e.target.value)} className="input w-auto py-2 text-xs">
            <option value="all">All buses</option>
            <option value="BUS-101">BUS-101</option>
            <option value="BUS-102">BUS-102</option>
            <option value="BUS-103">BUS-103</option>
            <option value="BUS-104">BUS-104</option>
            <option value="BUS-105">BUS-105</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span><span className="font-mono text-slate-300">{detections.length}</span> total markers</span>
          <span>·</span>
          <span>Click a marker to inspect</span>
        </div>
      </div>

      {/* map + detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-[600px] lg:col-span-2">
          <GisMap detections={detections} selectedId={selected?.id} onSelect={setSelected} heatmap={heatmap} filters={{ severity, status, busId }} />
        </div>

        {/* side panel */}
        <div className="card flex h-[600px] flex-col p-5">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{selected.id}</h3>
                  <p className="text-xs text-slate-500">{selected.type} · {fmtDateTime(selected.timestamp)}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white/5"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4">
                <EvidenceFrame seed={selected.evidenceSeed} bbox={selected.bbox} label={selected.type.toUpperCase()} className="aspect-video" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={selected.severity} />
                <StatusBadge status={selected.status} />
                <RiskScore score={selected.riskScore} />
              </div>
              <div className="mt-4 flex-1 space-y-2 overflow-y-auto scrollbar-thin">
                <Row icon={MapPin} label="GPS" value={`${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`} />
                <Row icon={MapPin} label="Road" value={`${selected.road} · ${selected.area}`} />
                <Row icon={Bus} label="Bus" value={`${selected.busId} · ${selected.cameraId} cam`} />
                <Row icon={Calendar} label="Detected" value={fmtDateTime(selected.timestamp)} />
                <div className="rounded-lg bg-ink-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</p>
                  <div className="mt-1.5"><ConfidenceBar value={selected.confidence} /></div>
                </div>
                <div className="rounded-lg bg-ink-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Duplicate Detection</p>
                  <p className="mt-1 text-xs text-slate-300">Detected by <span className="font-mono text-brand-300">{selected.confirmations}</span> buses</p>
                </div>
                <div className="rounded-lg bg-ink-900/60 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Risk Factors</p>
                  <div className="mt-1.5 space-y-1">
                    {selected.riskReasons.map((r) => (
                      <div key={r} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800/60">
                <MapPin className="h-6 w-6 text-slate-600" />
              </div>
              <p className="mt-3 text-sm text-slate-400">Select a marker to inspect</p>
              <p className="mt-1 text-xs text-slate-500">Click any defect marker on the map to view details, evidence, and risk breakdown.</p>
              <div className="mt-4 w-full space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-600">Recent critical</p>
                {detections.filter((d) => d.severity === 'Critical').slice(0, 3).map((d) => (
                  <button key={d.id} onClick={() => setSelected(d)} className="flex w-full items-center gap-2 rounded-lg border border-white/5 bg-ink-900/40 p-2 text-left hover:border-rose-500/30">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="font-mono text-[10px] text-slate-400">{d.id}</span>
                    <span className="truncate text-xs text-slate-300">{d.road}</span>
                    <span className="ml-auto text-[10px] text-slate-500">{timeAgo(d.timestamp)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-ink-900/60 p-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-xs text-slate-200">{value}</p>
      </div>
    </div>
  );
}
