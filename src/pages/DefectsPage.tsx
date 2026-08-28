import { useMemo, useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronsUpDown, X, Filter } from 'lucide-react';
import type { Detection, Severity } from '@/types';
import { detections } from '@/lib/mockData';
import { classNames, fmtDateTime, timeAgo } from '@/lib/utils';
import { SeverityBadge, RiskScore, ConfidenceBar, StatusBadge } from '@/components/Badges';
import { EvidenceFrame } from '@/components/EvidenceFrame';

const PAGE_SIZE = 8;
type SortKey = 'id' | 'severity' | 'riskScore' | 'confidence' | 'timestamp';

const SEVERITY_RANK: Record<Severity, number> = { Low: 1, Medium: 2, Severe: 3, Critical: 4 };

export function DefectsPage({ searchQuery }: { searchQuery: string }) {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Detection | null>(null);

  const effectiveQuery = (query || searchQuery).toLowerCase();

  const filtered = useMemo(() => {
    let r = detections.filter((d) => {
      if (effectiveQuery && !`${d.id} ${d.road} ${d.area} ${d.busId} ${d.type}`.toLowerCase().includes(effectiveQuery)) return false;
      if (severity !== 'all' && d.severity !== severity) return false;
      if (status !== 'all' && d.status !== status) return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'severity') cmp = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
      else if (sortKey === 'timestamp') cmp = +new Date(a.timestamp) - +new Date(b.timestamp);
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return r;
  }, [effectiveQuery, severity, status, sortKey, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('desc'); }
  };

  const SortHeader = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => (
    <th className={classNames('px-3 py-3 font-medium', className)}>
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-slate-300">
        {label}
        <ChevronsUpDown className={classNames('h-3 w-3', sortKey === k ? 'text-brand-400' : 'text-slate-600')} />
      </button>
    </th>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Road Defects</h2>
          <p className="mt-1 text-sm text-slate-400">{filtered.length} detections · AI-verified road damage inventory</p>
        </div>
        <button className="btn-outline text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID, road, bus…" className="input pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
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
          </div>
        </div>
      </div>

      {/* table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-ink-900/40 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <SortHeader k="id" label="ID" className="px-5" />
                <th className="px-3 py-3 font-medium">Evidence</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <SortHeader k="severity" label="Severity" />
                <SortHeader k="riskScore" label="Risk" />
                <SortHeader k="confidence" label="Confidence" />
                <th className="px-3 py-3 font-medium">Road</th>
                <th className="px-3 py-3 font-medium">Bus</th>
                <SortHeader k="timestamp" label="Detected" />
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-5 py-16 text-center">
                    <p className="text-sm text-slate-400">No defects match your filters.</p>
                    <button onClick={() => { setQuery(''); setSeverity('all'); setStatus('all'); }} className="btn-ghost mt-3 text-xs">Clear filters</button>
                  </td>
                </tr>
              ) : (
                pageItems.map((d) => (
                  <tr key={d.id} className="table-row-hover cursor-pointer" onClick={() => setSelected(d)}>
                    <td className="px-5 py-3 font-mono text-xs text-slate-300">{d.id}</td>
                    <td className="px-3 py-3">
                      <EvidenceFrame seed={d.evidenceSeed} bbox={d.bbox} className="h-10 w-16" />
                    </td>
                    <td className="px-3 py-3 text-slate-300">{d.type}</td>
                    <td className="px-3 py-3"><SeverityBadge severity={d.severity} size="xs" /></td>
                    <td className="px-3 py-3"><RiskScore score={d.riskScore} compact /></td>
                    <td className="px-3 py-3"><ConfidenceBar value={d.confidence} /></td>
                    <td className="px-3 py-3 text-slate-300">{d.road}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-400">{d.busId}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{timeAgo(d.timestamp)}</td>
                    <td className="px-3 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-3 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(d); }} className="btn-ghost px-2 py-1 text-xs">Inspect</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {pageCount > 0 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs text-slate-500">
            <span>Page {page + 1} of {pageCount} · {filtered.length} results</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="btn-ghost h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} className="btn-ghost h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* detail drawer */}
      {selected && <DefectDrawer defect={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DefectDrawer({ defect, onClose }: { defect: Detection; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto scrollbar-thin border-l border-white/10 bg-ink-900 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{defect.id}</h3>
            <p className="text-xs text-slate-500">{defect.type} · {fmtDateTime(defect.timestamp)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4">
          <EvidenceFrame seed={defect.evidenceSeed} bbox={defect.bbox} label={defect.type.toUpperCase()} className="aspect-video" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <SeverityBadge severity={defect.severity} />
          <StatusBadge status={defect.status} />
          <RiskScore score={defect.riskScore} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <Field label="Confidence" value={`${Math.round(defect.confidence * 100)}%`} />
          <Field label="Est. Size" value={defect.size} />
          <Field label="Est. Depth" value={defect.depth} />
          <Field label="Bus" value={defect.busId} />
          <Field label="Camera" value={defect.cameraId} />
          <Field label="Area" value={defect.area} />
          <Field label="Road" value={defect.road} />
          <Field label="Confirmations" value={`${defect.confirmations} buses`} />
          <Field label="Latitude" value={defect.lat.toFixed(5)} mono />
          <Field label="Longitude" value={defect.lng.toFixed(5)} mono />
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-ink-850/60 p-4">
          <p className="text-xs font-semibold text-slate-300">AI Estimated Severity</p>
          <p className="mt-1 text-[11px] text-slate-500">Estimated from visual analysis — not a physical depth measurement.</p>
          <div className="mt-3 space-y-1.5">
            {defect.riskReasons.length > 0 ? defect.riskReasons.map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {r}
              </div>
            )) : <p className="text-xs text-slate-500">No additional risk factors.</p>}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-ink-850/60 p-4">
          <p className="text-xs font-semibold text-slate-300">Duplicate Detection</p>
          <p className="mt-1 text-xs text-slate-400">Detected by <span className="font-mono text-brand-300">{defect.confirmations}</span> buses</p>
          <p className="mt-1 text-[11px] text-slate-500">Grouped via GPS proximity + visual similarity.</p>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="btn-primary flex-1 text-xs">Assign Repair</button>
          <button className="btn-outline text-xs">Generate Alert</button>
        </div>
      </div>
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
