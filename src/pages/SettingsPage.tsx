import { useState } from 'react';
import { Cpu, Bell, MapPin, Brain, Camera, Shield, Sliders, Save } from 'lucide-react';
import { classNames } from '@/lib/utils';

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={classNames('relative h-6 w-11 rounded-full transition', on ? 'bg-brand-500' : 'bg-ink-700')}>
      <span className={classNames('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', on ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );
}

function Slider({ label, value, onChange, min = 0, max = 100, unit = '' }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300">{label}</span>
        <span className="font-mono text-xs text-brand-300">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-brand-500" />
    </div>
  );
}

export function SettingsPage() {
  const [sensitivity, setSensitivity] = useState(75);
  const [alertThreshold, setAlertThreshold] = useState(61);
  const [dupRadius, setDupRadius] = useState(15);
  const [notif, setNotif] = useState({ critical: true, severe: true, email: false, sms: true });
  const [roles, setRoles] = useState({ admin: true, operator: true, viewer: true });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
          <p className="mt-1 text-sm text-slate-400">Configure AI detection, alerts, and system preferences</p>
        </div>
        <button className="btn-primary text-xs"><Save className="h-3.5 w-3.5" /> Save Changes</button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Detection sensitivity */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white">AI Detection</h3>
          </div>
          <div className="mt-5 space-y-4">
            <Slider label="Detection Sensitivity" value={sensitivity} onChange={setSensitivity} unit="%" />
            <Slider label="Confidence Threshold" value={60} onChange={() => {}} min={40} max={95} unit="%" />
            <div>
              <p className="text-xs text-slate-300">Detection Categories</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Pothole', 'Cracked Road', 'Waterlogging', 'Missing Sign', 'Alligator Crack'].map((c) => (
                  <span key={c} className="chip border border-brand-500/20 bg-brand-500/5 text-brand-300">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alert thresholds */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Alert Thresholds</h3>
          </div>
          <div className="mt-5 space-y-4">
            <Slider label="Alert Risk Threshold" value={alertThreshold} onChange={setAlertThreshold} unit="" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-ink-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Critical alerts</span>
                  <Toggle on={notif.critical} onClick={() => setNotif((n) => ({ ...n, critical: !n.critical }))} />
                </div>
              </div>
              <div className="rounded-lg bg-ink-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Severe alerts</span>
                  <Toggle on={notif.severe} onClick={() => setNotif((n) => ({ ...n, severe: !n.severe }))} />
                </div>
              </div>
              <div className="rounded-lg bg-ink-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Email notifications</span>
                  <Toggle on={notif.email} onClick={() => setNotif((n) => ({ ...n, email: !n.email }))} />
                </div>
              </div>
              <div className="rounded-lg bg-ink-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">SMS notifications</span>
                  <Toggle on={notif.sms} onClick={() => setNotif((n) => ({ ...n, sms: !n.sms }))} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Duplicate detection */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-400" />
            <h3 className="text-sm font-semibold text-white">Duplicate Detection</h3>
          </div>
          <div className="mt-5 space-y-4">
            <Slider label="GPS Proximity Radius" value={dupRadius} onChange={setDupRadius} min={5} max={50} unit="m" />
            <div className="rounded-lg bg-ink-900/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Grouping Logic</p>
              <p className="mt-1 text-xs text-slate-300">Detections within {dupRadius}m, same road segment & similar visual signature are grouped as one defect.</p>
            </div>
          </div>
        </div>

        {/* Hardware config */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-indigo-300" />
            <h3 className="text-sm font-semibold text-white">Camera & GPS Configuration</h3>
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-ink-900/60 p-3">
              <div>
                <p className="text-xs text-slate-300">Cameras per bus</p>
                <p className="text-[10px] text-slate-500">Front, Rear, Left, Right, Cabin</p>
              </div>
              <span className="font-mono text-sm text-brand-300">5</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-ink-900/60 p-3">
              <div>
                <p className="text-xs text-slate-300">GPS polling interval</p>
                <p className="text-[10px] text-slate-500">Ready for real GPS hardware</p>
              </div>
              <span className="font-mono text-sm text-brand-300">1s</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-ink-900/60 p-3">
              <div>
                <p className="text-xs text-slate-300">Frame capture rate</p>
                <p className="text-[10px] text-slate-500">Edge inference only</p>
              </div>
              <span className="font-mono text-sm text-brand-300">28 fps</span>
            </div>
          </div>
        </div>

        {/* User roles */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-success-400" />
            <h3 className="text-sm font-semibold text-white">User Roles & Access</h3>
          </div>
          <div className="mt-5 space-y-3">
            {([
              { key: 'admin' as const, role: 'Municipal Admin', desc: 'Full access · manage repairs, alerts, settings' },
              { key: 'operator' as const, role: 'Operations Operator', desc: 'Monitor live feeds · acknowledge alerts' },
              { key: 'viewer' as const, role: 'Read-only Viewer', desc: 'View dashboards & reports only' },
            ]).map((r) => (
              <div key={r.role} className="flex items-center justify-between rounded-lg bg-ink-900/60 p-3">
                <div>
                  <p className="text-xs font-medium text-slate-200">{r.role}</p>
                  <p className="text-[10px] text-slate-500">{r.desc}</p>
                </div>
                <Toggle on={roles[r.key]} onClick={() => setRoles((p) => ({ ...p, [r.key]: !p[r.key] }))} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="text-[11px] text-amber-300">Security note: API keys are stored server-side only. Incident evidence and ANPR data are RBAC-protected and audit-logged.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
