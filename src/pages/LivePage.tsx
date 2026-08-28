import { useEffect, useState } from 'react';
import { Video, Cpu, Activity, Maximize2, MapPin, Gauge, Radio, ScanLine, AlertTriangle } from 'lucide-react';
import { buses, detections } from '@/lib/mockData';
import { classNames, fmtTime, severityColor } from '@/lib/utils';
import { SeverityBadge, RiskScore } from '@/components/Badges';
import { EvidenceFrame } from '@/components/EvidenceFrame';

const CAMERAS = ['Front', 'Rear', 'Left', 'Right', 'Cabin'];

export function LivePage() {
  const [activeBus, setActiveBus] = useState(buses[0].id);
  const [feed, setFeed] = useState(detections.slice(0, 4));
  const [tick, setTick] = useState(0);

  // Simulate live detection stream
  useEffect(() => {
    const t = setInterval(() => {
      setTick((v) => v + 1);
      setFeed((prev) => {
        const next = detections[Math.floor(Math.random() * detections.length)];
        return [next, ...prev].slice(0, 6);
      });
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const bus = buses.find((b) => b.id === activeBus)!;
  const busDetections = detections.filter((d) => d.busId === activeBus).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Live Monitoring</h2>
          <p className="mt-1 text-sm text-slate-400">Real-time bus camera feeds with AI pothole detection</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-lg border border-success-500/20 bg-success-500/5 px-2.5 py-1 text-success-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400" /> Streaming
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 px-2.5 py-1 text-brand-300">
            <Cpu className="h-3.5 w-3.5" /> Edge AI Active
          </span>
        </div>
      </div>

      {/* bus selector */}
      <div className="flex flex-wrap gap-2">
        {buses.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBus(b.id)}
            className={classNames(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition',
              activeBus === b.id ? 'border-brand-500/40 bg-brand-500/10 text-brand-300' : 'border-white/10 text-slate-400 hover:bg-white/5'
            )}
          >
            <Radio className={classNames('h-3.5 w-3.5', b.status === 'Online' ? 'text-success-400' : b.status === 'Processing' ? 'text-brand-400 animate-pulse' : 'text-amber-400')} />
            {b.id}
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{b.route.split('—')[0]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* camera grid */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CAMERAS.map((cam, i) => {
              const det = busDetections[i % busDetections.length];
              const hasDetection = cam !== 'Cabin' && i < 3;
              return (
                <div key={cam} className="card overflow-hidden">
                  <div className="relative">
                    <EvidenceFrame
                      seed={det.evidenceSeed + i}
                      bbox={hasDetection ? det.bbox : undefined}
                      showBox={hasDetection}
                      label={hasDetection ? 'POTHOLE DETECTED' : undefined}
                      detected={hasDetection}
                      className="aspect-video"
                    />
                    {/* live overlay */}
                    <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-ink-950/70 px-2 py-1 text-[10px] backdrop-blur">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                      <span className="font-mono text-rose-300">LIVE</span>
                    </div>
                    <div className="absolute right-2 top-2 rounded-md bg-ink-950/70 px-2 py-1 text-[10px] font-mono text-slate-300 backdrop-blur">
                      {activeBus} · {cam.toUpperCase()}
                    </div>
                    {/* scan line for processing cams */}
                    {hasDetection && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute inset-x-0 h-0.5 bg-brand-400/40 animate-scan" />
                      </div>
                    )}
                    <button className="absolute bottom-2 right-2 rounded-md bg-ink-950/70 p-1.5 text-slate-300 backdrop-blur hover:text-white">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{det.lat.toFixed(4)}, {det.lng.toFixed(4)}</span>
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{bus.speed} km/h</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{fmtTime(new Date(Date.now() - tick * 100).toISOString())}</span>
                  </div>
                  {hasDetection && (
                    <div className="border-t border-white/5 bg-brand-500/5 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ScanLine className="h-3.5 w-3.5 text-brand-400" />
                          <span className="text-[11px] font-medium text-brand-300">POTHOLE DETECTED</span>
                          <SeverityBadge severity={det.severity} size="xs" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">conf {Math.round(det.confidence * 100)}%</span>
                          <RiskScore score={det.riskScore} compact />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* edge processing panel */}
          <div className="card mt-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Edge Processing Pipeline</h3>
                <p className="mt-0.5 text-xs text-slate-500">Raw video stays on the bus — only metadata is transmitted</p>
              </div>
              <span className="text-[10px] text-slate-500">Simulated · demo data</span>
            </div>
            <div className="mt-4 flex items-center gap-2 overflow-x-auto scrollbar-thin">
              {['Camera Feed', 'Edge AI', 'Detection', 'Metadata', 'Alert/API'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex min-w-[110px] flex-col items-center rounded-lg border border-white/5 bg-ink-900/60 px-3 py-2">
                    <Activity className="h-4 w-4 text-brand-400" />
                    <span className="mt-1 text-[11px] text-slate-300">{s}</span>
                  </div>
                  {i < 4 && <span className="text-slate-600">→</span>}
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-ink-900/60 p-3">
                <p className="text-[10px] text-slate-500">Bandwidth Saved</p>
                <p className="mt-1 font-mono text-lg font-bold text-success-400">82%</p>
              </div>
              <div className="rounded-lg bg-ink-900/60 p-3">
                <p className="text-[10px] text-slate-500">Edge FPS</p>
                <p className="mt-1 font-mono text-lg font-bold text-brand-300">28</p>
              </div>
              <div className="rounded-lg bg-ink-900/60 p-3">
                <p className="text-[10px] text-slate-500">Cloud Payload</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-200">412 MB</p>
              </div>
              <div className="rounded-lg bg-ink-900/60 p-3">
                <p className="text-[10px] text-slate-500">Raw Avoided</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-200">2.3 GB</p>
              </div>
            </div>
          </div>
        </div>

        {/* live detection feed */}
        <div className="card flex flex-col p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Detection Stream</h3>
              <p className="mt-0.5 text-xs text-slate-500">Auto-refreshing AI detections</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-success-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-400" /> real-time
            </span>
          </div>
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto scrollbar-thin">
            {feed.map((d, i) => (
              <div
                key={`${d.id}-${tick}-${i}`}
                className={classNames(
                  'flex gap-3 rounded-xl border p-3 transition animate-fade-in',
                  i === 0 ? 'border-brand-500/30 bg-brand-500/5' : 'border-white/5 bg-ink-900/40'
                )}
              >
                <EvidenceFrame seed={d.evidenceSeed} bbox={d.bbox} className="h-16 w-24 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{d.id}</span>
                    <SeverityBadge severity={d.severity} size="xs" />
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-300">{d.road} · {d.area}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="font-mono">{d.busId}</span>
                    <span>·</span>
                    <span>conf {Math.round(d.confidence * 100)}%</span>
                    <span>·</span>
                    <RiskScore score={d.riskScore} compact />
                  </div>
                </div>
                {i === 0 && <AlertTriangle className="h-4 w-4 shrink-0 text-brand-400" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
