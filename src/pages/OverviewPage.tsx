import { useState } from 'react';
import {
  AlertTriangle, CircleAlert, CircleDot, Wrench, Bus, Route, BellRing, TrendingUp, TrendingDown,
  ArrowUpRight, Cpu, Radio, ScanLine, MapPin, Brain, Database, Activity,
} from 'lucide-react';
import type { PageKey } from '@/types';
import { detections, buses, alerts, roadCondition, repairProgress, detectionTrendDay, detectionTrendWeek, detectionTrendMonth, edgeMetrics } from '@/lib/mockData';
import { classNames, fmtDateTime, timeAgo, pctChange } from '@/lib/utils';
import { SeverityBadge, RiskScore, ConfidenceBar, StatusBadge } from '@/components/Badges';
import { Sparkline, BarChart, DonutChart, ProgressBar } from '@/components/Charts';
import { EvidenceFrame } from '@/components/EvidenceFrame';

function KpiCard({ icon: Icon, label, value, change, trend, color }: {
  icon: typeof AlertTriangle; label: string; value: string | number; change: number; trend: number[]; color: string;
}) {
  const up = change >= 0;
  return (
    <div className="kpi-card group">
      <div className="flex items-start justify-between">
        <div className={classNames('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== 0 && (
          <div className={classNames('flex items-center gap-1 text-xs font-medium', up ? 'text-success-400' : 'text-rose-400')}>
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {up ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
      </div>
      <div className="mt-3 -mb-1 opacity-60 transition-opacity group-hover:opacity-100">
        <Sparkline data={trend} color={up ? '#4ade80' : '#fb7185'} width={240} height={28} />
      </div>
    </div>
  );
}

const ARCH_STEPS = [
  { icon: Radio, label: 'Bus Cameras', desc: '5 cameras per bus' },
  { icon: Cpu, label: 'Edge AI / YOLO', desc: 'On-vehicle inference' },
  { icon: ScanLine, label: 'Object Detection', desc: 'Real-time frame analysis' },
  { icon: Brain, label: 'Damage Classification', desc: 'Severity + risk engine' },
  { icon: MapPin, label: 'GPS Association', desc: 'Geo-tag every detection' },
  { icon: Database, label: 'Duplicate Check', desc: 'Cluster repeat detections' },
  { icon: Activity, label: 'Central API', desc: 'Aggregated to dashboard' },
];

export function OverviewPage({ setPage }: { setPage: (p: PageKey) => void }) {
  const [trendRange, setTrendRange] = useState<'day' | 'week' | 'month'>('week');
  const trendData = trendRange === 'day' ? detectionTrendDay : trendRange === 'week' ? detectionTrendWeek : detectionTrendMonth;

  const critical = detections.filter((d) => d.severity === 'Critical');
  const highRisk = detections.filter((d) => d.riskScore >= 61);
  const repaired = detections.filter((d) => d.status === 'Repaired');
  const reported = detections.filter((d) => d.status === 'Reported' || d.status === 'Open');
  const totalKm = buses.reduce((s, b) => s + b.roadKm, 0);

  const conditionDonut = [
    { label: 'Excellent', value: roadCondition.Excellent, color: '#22c55e' },
    { label: 'Good', value: roadCondition.Good, color: '#22d3ee' },
    { label: 'Damaged', value: roadCondition.Damaged, color: '#f59e0b' },
    { label: 'Critical', value: roadCondition.Critical, color: '#f43f5e' },
  ];

  const repairFlow = [
    { label: 'Open', value: repairProgress.Open, color: 'bg-slate-500' },
    { label: 'Reported', value: repairProgress.Reported, color: 'bg-sky-500' },
    { label: 'Assigned', value: repairProgress.Assigned, color: 'bg-indigo-500' },
    { label: 'In Progress', value: repairProgress['In Progress'], color: 'bg-amber-500' },
    { label: 'Repaired', value: repairProgress.Repaired, color: 'bg-success-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Command Overview</h2>
          <p className="mt-1 text-sm text-slate-400">Real-time urban road intelligence across all operating zones</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400" />Live</span>
          <span>·</span>
          <span>Last sync {timeAgo(new Date().toISOString())}</span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard icon={CircleDot} label="Total Potholes" value={detections.length} change={pctChange(detections.length, 28)} trend={[12, 15, 14, 18, 22, 20, 25, 34]} color="bg-brand-500/15 text-brand-300" />
        <KpiCard icon={AlertTriangle} label="Critical" value={critical.length} change={pctChange(critical.length, 4)} trend={[2, 3, 2, 4, 5, 4, 6, 7]} color="bg-rose-500/15 text-rose-300" />
        <KpiCard icon={CircleAlert} label="High-Risk Defects" value={highRisk.length} change={pctChange(highRisk.length, 12)} trend={[8, 10, 9, 12, 14, 13, 15, 18]} color="bg-orange-500/15 text-orange-300" />
        <KpiCard icon={BellRing} label="Reported" value={reported.length} change={pctChange(reported.length, 8)} trend={[5, 6, 7, 6, 8, 9, 10, 11]} color="bg-sky-500/15 text-sky-300" />
        <KpiCard icon={Wrench} label="Repaired" value={repaired.length} change={pctChange(repaired.length, 6)} trend={[3, 4, 4, 5, 6, 7, 8, 9]} color="bg-success-500/15 text-success-400" />
        <KpiCard icon={Bus} label="Active Buses" value={buses.filter((b) => b.status !== 'Offline').length} change={0} trend={[5, 5, 5, 5, 5, 5, 5, 5]} color="bg-accent-500/15 text-accent-400" />
        <KpiCard icon={Route} label="Road-km Monitored" value={`${totalKm}`} change={pctChange(totalKm, 580)} trend={[500, 520, 540, 560, 580, 600, 610, 620]} color="bg-indigo-500/15 text-indigo-300" />
        <KpiCard icon={BellRing} label="Alerts Generated" value={alerts.length} change={pctChange(alerts.length, 8)} trend={[6, 8, 7, 9, 10, 8, 11, 12]} color="bg-amber-500/15 text-amber-300" />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Road condition + repair progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Road Condition Overview</h3>
            <span className="text-[10px] text-slate-500">% of road network</span>
          </div>
          <div className="mt-5 flex justify-center">
            <DonutChart data={conditionDonut} size={160} />
          </div>
          <div className="mt-5 space-y-2">
            {conditionDonut.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="w-16 text-xs text-slate-400">{c.label}</span>
                <div className="flex-1"><ProgressBar value={c.value} color={c.label === 'Excellent' ? 'bg-success-500' : c.label === 'Good' ? 'bg-brand-500' : c.label === 'Damaged' ? 'bg-amber-500' : 'bg-rose-500'} /></div>
                <span className="w-8 text-right font-mono text-xs text-slate-300">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Repair progress funnel */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white">Repair Workflow Progress</h3>
          <p className="mt-0.5 text-xs text-slate-500">Open → Reported → Assigned → In Progress → Repaired</p>
          <div className="mt-5 space-y-3">
            {repairFlow.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className={classNames('flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white', s.color)}>{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">{s.label}</span>
                    <span className="font-mono text-xs text-slate-400">{s.value}</span>
                  </div>
                  <div className="mt-1"><ProgressBar value={s.value} max={10} color={s.color} /></div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setPage('repairs')} className="btn-ghost mt-4 w-full text-xs">
            View repair queue <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Detection trends */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Detection Trends</h3>
            <div className="flex rounded-lg border border-white/10 p-0.5 text-[10px]">
              {(['day', 'week', 'month'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={classNames('rounded-md px-2 py-1 capitalize transition', trendRange === r ? 'bg-brand-500/20 text-brand-300' : 'text-slate-500 hover:text-slate-300')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <BarChart data={trendData} height={180} showValues />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Avg {Math.round(trendData.reduce((s, d) => s + d.value, 0) / trendData.length)}/period</span>
            <span className="flex items-center gap-1 text-success-400"><TrendingUp className="h-3 w-3" /> +12% vs last</span>
          </div>
        </div>
      </div>

      {/* AI pipeline architecture */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">AI Detection Pipeline</h3>
            <p className="text-xs text-slate-500">Edge-to-cloud architecture · simulated demo data</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 rounded-lg border border-success-500/20 bg-success-500/5 px-2.5 py-1 text-success-400">
              <Cpu className="h-3.5 w-3.5" /> Edge: {edgeMetrics.edgeNodes} nodes
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 px-2.5 py-1 text-brand-300">
              <Activity className="h-3.5 w-3.5" /> {edgeMetrics.framesProcessed.toLocaleString()} frames
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-amber-300">
              <TrendingUp className="h-3.5 w-3.5" /> BW saved {edgeMetrics.bandwidthSaved}%
            </span>
          </div>
        </div>
        <div className="mt-5 flex items-stretch gap-2 overflow-x-auto scrollbar-thin pb-2">
          {ARCH_STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex min-w-[140px] flex-col items-center rounded-xl border border-white/5 bg-ink-900/60 p-3 text-center transition hover:border-brand-500/30">
                <s.icon className="h-5 w-5 text-brand-400" />
                <span className="mt-2 text-xs font-medium text-slate-200">{s.label}</span>
                <span className="mt-0.5 text-[10px] text-slate-500">{s.desc}</span>
              </div>
              {i < ARCH_STEPS.length - 1 && <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent detections + high priority alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent detections */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">Recent Detections</h3>
            <button onClick={() => setPage('defects')} className="btn-ghost text-xs">View all <ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-3 py-3 font-medium">Road</th>
                  <th className="px-3 py-3 font-medium">Severity</th>
                  <th className="px-3 py-3 font-medium">Risk</th>
                  <th className="px-3 py-3 font-medium">Confidence</th>
                  <th className="px-3 py-3 font-medium">Bus</th>
                  <th className="px-3 py-3 font-medium">Time</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {detections.slice(0, 7).map((d) => (
                  <tr key={d.id} className="table-row-hover">
                    <td className="px-5 py-3 font-mono text-xs text-slate-300">{d.id}</td>
                    <td className="px-3 py-3 text-slate-300">{d.road}</td>
                    <td className="px-3 py-3"><SeverityBadge severity={d.severity} size="xs" /></td>
                    <td className="px-3 py-3"><RiskScore score={d.riskScore} compact /></td>
                    <td className="px-3 py-3"><ConfidenceBar value={d.confidence} /></td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-400">{d.busId}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{timeAgo(d.timestamp)}</td>
                    <td className="px-3 py-3"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* High priority alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">High Priority Alerts</h3>
            <button onClick={() => setPage('alerts')} className="btn-ghost text-xs"><ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="mt-4 space-y-3">
            {alerts.filter((a) => a.severity === 'Critical').slice(0, 5).map((a) => (
              <div key={a.id} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 transition hover:border-rose-500/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-semibold text-rose-300">{a.type}</span>
                  </div>
                  <RiskScore score={a.riskScore} compact />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">{a.road} · {a.location}</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono">{a.busId}</span>
                  <span>{fmtDateTime(a.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence preview strip */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Latest Evidence Captures</h3>
          <span className="text-xs text-slate-500">AI-verified frames</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {detections.slice(0, 6).map((d) => (
            <div key={d.id} className="group cursor-pointer" onClick={() => setPage('defects')}>
              <EvidenceFrame seed={d.evidenceSeed} bbox={d.bbox} label={d.type.toUpperCase()} className="aspect-video" />
              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400">{d.id}</span>
                <SeverityBadge severity={d.severity} size="xs" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
