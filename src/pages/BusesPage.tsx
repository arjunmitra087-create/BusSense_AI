import { Bus as BusIcon, Gauge, Camera, Route, MapPin, Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { buses, detections } from '@/lib/mockData';
import { classNames, timeAgo } from '@/lib/utils';
import { BusStatusBadge } from '@/components/Badges';
import { GisMap } from '@/components/GisMap';

export function BusesPage() {
  const fleetStats = {
    online: buses.filter((b) => b.status === 'Online').length,
    processing: buses.filter((b) => b.status === 'Processing').length,
    warning: buses.filter((b) => b.status === 'Warning').length,
    offline: buses.filter((b) => b.status === 'Offline').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Fleet Overview</h2>
          <p className="mt-1 text-sm text-slate-400">{buses.length} buses equipped with AI road-sensing cameras</p>
        </div>
      </div>

      {/* fleet status strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Online', value: fleetStats.online, icon: Wifi, color: 'text-success-400 bg-success-500/10' },
          { label: 'Processing', value: fleetStats.processing, icon: Activity, color: 'text-brand-300 bg-brand-500/10' },
          { label: 'Warning', value: fleetStats.warning, icon: AlertTriangle, color: 'text-amber-300 bg-amber-500/10' },
          { label: 'Offline', value: fleetStats.offline, icon: WifiOff, color: 'text-slate-400 bg-slate-500/10' },
        ].map((s) => (
          <div key={s.label} className="card card-hover p-4">
            <div className="flex items-center gap-3">
              <div className={classNames('flex h-9 w-9 items-center justify-center rounded-lg', s.color)}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* fleet map */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white">Fleet Live Map</h3>
        <p className="mt-0.5 text-xs text-slate-500">Real-time bus positions across operating zones</p>
        <div className="mt-4 h-[360px]">
          <GisMap detections={detections.slice(0, 5)} filters={{}} />
        </div>
      </div>

      {/* bus cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {buses.map((b) => (
          <div key={b.id} className="card card-hover p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-brand-500/20">
                  <BusIcon className="h-5 w-5 text-brand-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{b.id}</h3>
                  <p className="text-xs text-slate-500">{b.route}</p>
                </div>
              </div>
              <BusStatusBadge status={b.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Metric icon={Gauge} label="Speed" value={`${b.speed} km/h`} />
              <Metric icon={Camera} label="Cameras" value={`${b.camerasActive}/5 active`} />
              <Metric icon={Route} label="Road-km" value={`${b.roadKm} km`} />
              <Metric icon={Activity} label="Detections" value={`${b.detectionsToday} today`} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.zone}</span>
              <span>Updated {timeAgo(b.lastUpdate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-900/60 p-3">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-slate-200">{value}</p>
    </div>
  );
}
