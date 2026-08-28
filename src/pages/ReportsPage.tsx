import { FileText, Download, Plus, Calendar, MapPin, AlertTriangle, Wrench } from 'lucide-react';
import { detections } from '@/lib/mockData';
import { classNames, fmtDateTime } from '@/lib/utils';

const REPORT_TEMPLATES = [
  { type: 'Daily Road Condition', icon: Calendar, desc: 'Daily snapshot of road health across all zones', color: 'text-brand-300 bg-brand-500/10' },
  { type: 'Weekly Pothole Report', icon: FileText, desc: 'Weekly aggregate of new & resolved potholes', color: 'text-accent-400 bg-accent-500/10' },
  { type: 'Monthly Infrastructure', icon: MapPin, desc: 'Monthly infrastructure health for municipal review', color: 'text-indigo-300 bg-indigo-500/10' },
  { type: 'Critical Incident', icon: AlertTriangle, desc: 'All critical incidents in the reporting period', color: 'text-rose-300 bg-rose-500/10' },
  { type: 'Repair Performance', icon: Wrench, desc: 'Repair completion rate, SLA & team performance', color: 'text-success-400 bg-success-500/10' },
];

const GENERATED = [
  { id: 'RPT-2401', type: 'Daily Road Condition', date: '2026-08-28', area: 'All Zones', defects: 34, critical: 7, rate: 28 },
  { id: 'RPT-2398', type: 'Weekly Pothole Report', date: '2026-08-21', area: 'All Zones', defects: 198, critical: 24, rate: 31 },
  { id: 'RPT-2374', type: 'Monthly Infrastructure', date: '2026-08-01', area: 'Citywide', defects: 842, critical: 96, rate: 34 },
  { id: 'RPT-2369', type: 'Critical Incident', date: '2026-08-15', area: 'Central Zone', defects: 12, critical: 12, rate: 50 },
  { id: 'RPT-2355', type: 'Repair Performance', date: '2026-08-10', area: 'All Zones', defects: 64, critical: 0, rate: 41 },
];

export function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Reports</h2>
        <p className="mt-1 text-sm text-slate-400">Generate and export operational reports for municipal authorities</p>
      </div>

      {/* report templates */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300">Generate Report</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REPORT_TEMPLATES.map((r) => (
            <div key={r.type} className="card card-hover p-5">
              <div className="flex items-start gap-3">
                <div className={classNames('flex h-10 w-10 items-center justify-center rounded-xl', r.color)}>
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{r.type}</h4>
                  <p className="mt-0.5 text-xs text-slate-500">{r.desc}</p>
                </div>
              </div>
              <button className="btn-primary mt-4 w-full text-xs">
                <Plus className="h-3.5 w-3.5" /> Generate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* generated reports */}
      <div className="card overflow-hidden">
        <div className="border-b border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white">Recently Generated Reports</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-ink-900/40 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Report ID</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Generated</th>
                <th className="px-3 py-3 font-medium">Coverage</th>
                <th className="px-3 py-3 font-medium">Defects</th>
                <th className="px-3 py-3 font-medium">Critical</th>
                <th className="px-3 py-3 font-medium">Repair Rate</th>
                <th className="px-3 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {GENERATED.map((r) => (
                <tr key={r.id} className="table-row-hover">
                  <td className="px-5 py-3 font-mono text-xs text-slate-300">{r.id}</td>
                  <td className="px-3 py-3 text-slate-300">{r.type}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{fmtDateTime(r.date)}</td>
                  <td className="px-3 py-3 text-slate-400">{r.area}</td>
                  <td className="px-3 py-3 font-mono text-slate-300">{r.defects}</td>
                  <td className="px-3 py-3 font-mono text-rose-300">{r.critical}</td>
                  <td className="px-3 py-3 font-mono text-success-400">{r.rate}%</td>
                  <td className="px-3 py-3 text-right">
                    <button className="btn-ghost px-2 py-1 text-xs">
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
