import { useState } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, UserPlus, XCircle, Filter } from 'lucide-react';
import type { Alert, AlertStatus } from '@/types';
import { alerts } from '@/lib/mockData';
import { classNames, fmtDateTime, timeAgo } from '@/lib/utils';
import { SeverityBadge, RiskScore, AlertStatusBadge } from '@/components/Badges';

export function AlertsPage() {
  const [items, setItems] = useState(alerts);
  const [filter, setFilter] = useState<'all' | AlertStatus>('all');

  const update = (id: string, status: AlertStatus) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const filtered = filter === 'all' ? items : items.filter((a) => a.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Alerts</h2>
          <p className="mt-1 text-sm text-slate-400">{items.filter((a) => a.status === 'New').length} new · {items.length} total</p>
        </div>
      </div>

      {/* filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {(['all', 'New', 'Acknowledged', 'Assigned', 'Resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={classNames(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition',
              filter === f ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' : 'border border-white/10 text-slate-400 hover:bg-white/5'
            )}
          >
            {f === 'all' ? 'All Alerts' : f}
            {f !== 'all' && <span className="ml-1.5 text-slate-600">{items.filter((a) => a.status === f).length}</span>}
          </button>
        ))}
      </div>

      {/* alert cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success-400" />
            <p className="mt-3 text-sm text-slate-300">No alerts in this category.</p>
          </div>
        ) : (
          filtered.map((a) => (
            <AlertCard key={a.id} alert={a} onUpdate={update} />
          ))
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, onUpdate }: { alert: Alert; onUpdate: (id: string, s: AlertStatus) => void }) {
  return (
    <div className={classNames(
      'card card-hover p-5 border-l-2',
      alert.severity === 'Critical' ? 'border-l-rose-500' : alert.severity === 'Severe' ? 'border-l-orange-500' : 'border-l-amber-500'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={classNames('h-4 w-4', alert.severity === 'Critical' ? 'text-rose-400' : 'text-orange-400')} />
          <span className="text-sm font-semibold text-white">{alert.type}</span>
        </div>
        <AlertStatusBadge status={alert.status} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <SeverityBadge severity={alert.severity} size="xs" />
        <RiskScore score={alert.riskScore} compact />
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-400">
        <p className="flex items-center gap-2"><span className="text-slate-500">Road:</span> {alert.road}</p>
        <p className="flex items-center gap-2"><span className="text-slate-500">Zone:</span> {alert.location}</p>
        <p className="flex items-center gap-2"><span className="text-slate-500">Bus:</span> <span className="font-mono">{alert.busId}</span></p>
        <p className="flex items-center gap-2"><span className="text-slate-500">Time:</span> {fmtDateTime(alert.timestamp)} · {timeAgo(alert.timestamp)}</p>
      </div>

      {alert.status === 'New' && (
        <div className="mt-4 flex gap-2">
          <button onClick={() => onUpdate(alert.id, 'Acknowledged')} className="btn-outline flex-1 text-xs">
            <BellRing className="h-3.5 w-3.5" /> Acknowledge
          </button>
          <button onClick={() => onUpdate(alert.id, 'Dismissed')} className="btn-ghost text-xs px-2">
            <XCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {alert.status === 'Acknowledged' && (
        <button onClick={() => onUpdate(alert.id, 'Assigned')} className="btn-outline mt-4 w-full text-xs">
          <UserPlus className="h-3.5 w-3.5" /> Assign Team
        </button>
      )}
      {alert.status === 'Assigned' && (
        <button onClick={() => onUpdate(alert.id, 'Resolved')} className="btn-primary mt-4 w-full text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
        </button>
      )}
    </div>
  );
}
