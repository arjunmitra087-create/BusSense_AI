import { useState } from 'react';
import {
  LayoutDashboard, Video, ListTree, Map, Bus, Siren, Wrench, BarChart3, FileText, Bell, Settings,
  Search, Activity, ShieldCheck, ChevronDown, Menu, X, Cpu, Radio,
} from 'lucide-react';
import type { PageKey } from '@/types';
import { classNames } from '@/lib/utils';
import { useClock } from '@/lib/useClock';
import { alerts } from '@/lib/mockData';

const NAV: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'live', label: 'Live Monitoring', icon: Video },
  { key: 'defects', label: 'Road Defects', icon: ListTree },
  { key: 'map', label: 'GIS Map', icon: Map },
  { key: 'buses', label: 'Buses', icon: Bus },
  { key: 'incidents', label: 'Incidents', icon: Siren },
  { key: 'repairs', label: 'Repairs', icon: Wrench },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ page, setPage, mobileOpen, setMobileOpen }: { page: PageKey; setPage: (p: PageKey) => void; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* brand */}
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 shadow-glow">
            <Radio className="h-5 w-5 text-ink-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">BusSense AI</h1>
            <p className="text-[10px] text-slate-500">Urban Road Intelligence</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-thin px-3 py-4">
          {NAV.map((item) => {
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setPage(item.key);
                  setMobileOpen(false);
                }}
                className={classNames(
                  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active ? 'bg-brand-500/10 text-brand-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-400" />}
                <item.icon className={classNames('h-[18px] w-[18px] transition-colors', active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} />
                {item.label}
                {item.key === 'alerts' && (
                  <span className="ml-auto rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">{alerts.filter((a) => a.status === 'New').length}</span>
                )}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
              </button>
            );
          })}
        </nav>

        {/* edge status */}
        <div className="border-t border-white/5 p-3">
          <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
            <div className="flex items-center gap-2 text-xs">
              <Cpu className="h-4 w-4 text-brand-400" />
              <span className="font-medium text-slate-300">Edge AI</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-success-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400" /> Active
              </span>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">Bandwidth saved: <span className="font-mono text-success-400">82%</span></div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar({ setMobileOpen, onSearch }: { setMobileOpen: (v: boolean) => void; onSearch: (q: string) => void }) {
  const now = useClock();
  const [q, setQ] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const newAlerts = alerts.filter((a) => a.status === 'New');

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/5 bg-ink-950/80 px-4 backdrop-blur-xl lg:px-6">
      <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
        <Menu className="h-5 w-5 text-slate-300" />
      </button>

      {/* search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search defects, roads, buses, alerts…"
          className="input pl-9"
        />
      </div>

      {/* zone selector */}
      <button className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 md:flex">
        <span className="h-2 w-2 rounded-full bg-brand-400" />
        Pune Smart City
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {/* AI processing */}
      <div className="hidden items-center gap-2 rounded-lg border border-brand-500/20 bg-brand-500/5 px-3 py-1.5 text-xs md:flex">
        <Activity className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
        <span className="text-slate-300">AI Processing</span>
        <span className="font-mono text-brand-300">3.2k fps</span>
      </div>

      {/* system status */}
      <div className="hidden items-center gap-1.5 rounded-lg border border-success-500/20 bg-success-500/5 px-3 py-1.5 text-xs sm:flex">
        <ShieldCheck className="h-3.5 w-3.5 text-success-400" />
        <span className="text-success-400">Systems Operational</span>
      </div>

      {/* notifications */}
      <div className="relative">
        <button onClick={() => setNotifOpen((v) => !v)} className="relative rounded-lg p-2 text-slate-300 hover:bg-white/5">
          <Bell className="h-5 w-5" />
          {newAlerts.length > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {newAlerts.length}
            </span>
          )}
        </button>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-white/10 bg-ink-850/95 p-2 shadow-card backdrop-blur-xl animate-fade-in">
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="text-[10px] text-slate-500">{newAlerts.length} new</span>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
                {newAlerts.slice(0, 6).map((a) => (
                  <div key={a.id} className="rounded-lg p-2 hover:bg-white/5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span className="text-xs font-medium text-slate-200">{a.type}</span>
                      <span className="ml-auto text-[10px] text-slate-500">{a.road}</span>
                    </div>
                    <p className="mt-1 pl-4 text-[11px] text-slate-500">Risk {a.riskScore} · {a.busId}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* date/time */}
      <div className="hidden flex-col items-end text-right lg:flex">
        <span className="font-mono text-sm text-slate-200">{now.toLocaleTimeString('en-US', { hour12: false })}</span>
        <span className="text-[10px] text-slate-500">{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      {/* profile */}
      <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 text-xs font-bold text-white">RM</div>
        <div className="hidden text-left lg:block">
          <p className="text-xs font-medium text-slate-200">R. Mehta</p>
          <p className="text-[10px] text-slate-500">Municipal Admin</p>
        </div>
      </button>
    </header>
  );
}
