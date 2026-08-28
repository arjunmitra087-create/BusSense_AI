import { useState } from 'react';
import { TrendingUp, MapPin, Route, Wrench, Clock, AlertTriangle, Car, Gauge } from 'lucide-react';
import { detections, areaStats, topProblemRoads, busDetections, trafficIntel, repairProgress } from '@/lib/mockData';
import { classNames } from '@/lib/utils';
import { BarChart, LineChart, DonutChart, ProgressBar } from '@/components/Charts';

export function AnalyticsPage() {
  const severityData = (['Critical', 'Severe', 'Medium', 'Low'] as const).map((s) => ({
    label: s,
    value: detections.filter((d) => d.severity === s).length,
    color: s === 'Critical' ? '#f43f5e' : s === 'Severe' ? '#fb923c' : s === 'Medium' ? '#facc15' : '#38bdf8',
  }));

  const areaBars = areaStats.map((a) => ({ label: a.area.replace(' Zone', ''), value: a.count }));
  const busBars = busDetections.map((b) => ({ label: b.busId.replace('BUS-', ''), value: b.detections }));

  const repairRate = Math.round((repairProgress.Repaired / (repairProgress.Open + repairProgress.Reported + repairProgress.Assigned + repairProgress['In Progress'] + repairProgress.Repaired)) * 100);
  const avgRepairDays = 3.4;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Analytics</h2>
        <p className="mt-1 text-sm text-slate-400">Road defect intelligence, repair performance & traffic insights</p>
      </div>

      {/* summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total Detections" value={detections.length} sub="+12% vs last month" color="text-brand-300 bg-brand-500/10" />
        <StatCard icon={Wrench} label="Repair Completion" value={`${repairRate}%`} sub="9 of 32 repaired" color="text-success-400 bg-success-500/10" />
        <StatCard icon={Clock} label="Avg Repair Time" value={`${avgRepairDays}d`} sub="-0.6d vs last month" color="text-amber-300 bg-amber-500/10" />
        <StatCard icon={AlertTriangle} label="Repeat Detections" value="14" sub="across 6 roads" color="text-rose-300 bg-rose-500/10" />
      </div>

      {/* charts row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white">Potholes by Severity</h3>
          <p className="mt-0.5 text-xs text-slate-500">Distribution across all detections</p>
          <div className="mt-5 flex justify-center">
            <DonutChart data={severityData} size={150} />
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Detections Over Time</h3>
          <p className="mt-0.5 text-xs text-slate-500">Weekly detection trend (8-week rolling)</p>
          <div className="mt-5">
            <LineChart data={[
              { label: 'W1', value: 42 }, { label: 'W2', value: 58 }, { label: 'W3', value: 51 },
              { label: 'W4', value: 73 }, { label: 'W5', value: 68 }, { label: 'W6', value: 89 },
              { label: 'W7', value: 76 }, { label: 'W8', value: 94 },
            ]} height={200} />
          </div>
        </div>
      </div>

      {/* charts row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white">Potholes by Area</h3>
          </div>
          <div className="mt-5"><BarChart data={areaBars} height={180} /></div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white">Detections per Bus</h3>
          </div>
          <div className="mt-5"><BarChart data={busBars} height={180} color="#818cf8" /></div>
        </div>
      </div>

      {/* Top 10 problem roads */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/5 p-5">
          <Route className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Top 10 Problem Roads</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-ink-900/40 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Road</th>
                <th className="px-3 py-3 font-medium">Defects</th>
                <th className="px-3 py-3 font-medium">Avg Severity</th>
                <th className="px-3 py-3 font-medium">Avg Risk</th>
                <th className="px-3 py-3 font-medium">Repair %</th>
                <th className="px-3 py-3 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topProblemRoads.map((r) => (
                <tr key={r.road} className="table-row-hover">
                  <td className="px-5 py-3 font-medium text-slate-200">{r.road}</td>
                  <td className="px-3 py-3 font-mono text-slate-300">{r.defects}</td>
                  <td className="px-3 py-3">
                    <span className={classNames('font-mono', r.avgSeverity >= 3 ? 'text-rose-300' : r.avgSeverity >= 2.5 ? 'text-orange-300' : 'text-amber-300')}>
                      {r.avgSeverity.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-300">{r.avgRisk}</td>
                  <td className="px-3 py-3 font-mono text-slate-300">{r.repairPct}%</td>
                  <td className="px-3 py-3 w-40"><ProgressBar value={r.repairPct} color="bg-success-500" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traffic intelligence */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-accent-400" />
            <h3 className="text-sm font-semibold text-white">Traffic Intelligence</h3>
          </div>
          <span className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[10px] text-amber-300">Simulated demo data</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Car} label="Vehicle Density" value={trafficIntel.vehicleDensity.toLocaleString()} sub="vehicles/hr" color="text-brand-300 bg-brand-500/10" />
          <StatCard icon={AlertTriangle} label="Congestion Index" value={trafficIntel.congestionIndex.toFixed(1)} sub="moderate" color="text-amber-300 bg-amber-500/10" />
          <StatCard icon={Gauge} label="Avg Bus Speed" value={`${trafficIntel.avgBusSpeed} km/h`} sub="-4 vs normal" color="text-orange-300 bg-orange-500/10" />
          <StatCard icon={Clock} label="Route Delay" value={`${trafficIntel.routeDelay} min`} sub="+2 min" color="text-rose-300 bg-rose-500/10" />
        </div>
        <div className="mt-5">
          <p className="text-xs text-slate-400">Congestion Hotspots</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {trafficIntel.hotspots.map((h) => (
              <span key={h} className="chip border border-rose-500/20 bg-rose-500/5 text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> {h}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <p className="text-xs text-slate-400">Traffic Trend (12h)</p>
          <div className="mt-3"><LineChart data={trafficIntel.trend} height={160} color="#818cf8" /></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof TrendingUp; label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="card card-hover p-4">
      <div className="flex items-center gap-3">
        <div className={classNames('flex h-9 w-9 items-center justify-center rounded-lg', color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">{sub}</p>
    </div>
  );
}
