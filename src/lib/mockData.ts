import type { Alert, Bus, Detection, Incident, Repair, Severity } from '@/types';

// Base coordinates around a fictional Smart City (Pune-like grid)
const ROADS = [
  { name: 'MG Road', area: 'Central Zone' },
  { name: 'Aundh Road', area: 'North Zone' },
  { name: 'Baner Highway', area: 'North Zone' },
  { name: 'Karve Road', area: 'West Zone' },
  { name: 'Satara Road', area: 'South Zone' },
  { name: 'Airport Road', area: 'East Zone' },
  { name: 'FC Road', area: 'Central Zone' },
  { name: 'Wakad Bridge', area: 'West Zone' },
  { name: 'Hadapsar Bypass', area: 'South Zone' },
  { name: 'Hinjewadi Main', area: 'East Zone' },
  { name: 'Boat Club Road', area: 'Central Zone' },
  { name: 'Pashan Road', area: 'North Zone' },
];

const BUS_IDS = ['BUS-101', 'BUS-102', 'BUS-103', 'BUS-104', 'BUS-105'];
const CAMERAS = ['front', 'rear', 'left', 'right'];

const SEVERITIES: Severity[] = ['Low', 'Medium', 'Severe', 'Critical'];
const TYPES = ['Pothole', 'Cracked Road', 'Broken Pavement', 'Waterlogging', 'Missing Divider', 'Damaged Traffic Sign'] as const;

// Seeded pseudo-random for stable demo data
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260828);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function riskFor(severity: Severity, confirmations: number, area: string): { score: number; reasons: string[] } {
  let base = severity === 'Critical' ? 82 : severity === 'Severe' ? 62 : severity === 'Medium' ? 42 : 18;
  const reasons: string[] = [];
  if (severity === 'Critical' || severity === 'Severe') reasons.push(`${severity} road damage`);
  if (confirmations >= 3) {
    base += 6;
    reasons.push(`Detected by ${confirmations} buses`);
  }
  if (area === 'Central Zone') {
    base += 5;
    reasons.push('High traffic density');
  }
  if (rnd() > 0.7) {
    base += 4;
    reasons.push('Near school zone');
  }
  if (rnd() > 0.8) {
    base += 3;
    reasons.push('Near intersection');
  }
  if (rnd() > 0.85) {
    base += 3;
    reasons.push('Near hospital zone');
  }
  return { score: Math.min(100, Math.round(base)), reasons };
}

const STATUSES = ['Open', 'Reported', 'Assigned', 'In Progress', 'Repaired', 'Verification Pending'] as const;

function makeDetections(n: number): Detection[] {
  const out: Detection[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const road = pick(ROADS);
    const severity = pick(SEVERITIES);
    const confirmations = Math.floor(rnd() * 5) + 1;
    const { score, reasons } = riskFor(severity, confirmations, road.area);
    const hoursAgo = Math.floor(rnd() * 240);
    const ts = new Date(now - hoursAgo * 3600_000).toISOString();
    const status = pick([...STATUSES]);
    out.push({
      id: `PTL-${(2400 + i).toString()}`,
      type: pick([...TYPES]),
      confidence: Math.round((0.62 + rnd() * 0.37) * 100) / 100,
      severity,
      riskScore: score,
      riskReasons: reasons,
      size: `${(0.3 + rnd() * 1.8).toFixed(1)}m`,
      depth: `${(1 + rnd() * 8).toFixed(0)}cm`,
      lat: 18.52 + (rnd() - 0.5) * 0.12,
      lng: 73.85 + (rnd() - 0.5) * 0.12,
      road: road.name,
      area: road.area,
      busId: pick(BUS_IDS),
      cameraId: pick(CAMERAS),
      timestamp: ts,
      status,
      confirmations,
      bbox: { x: 30 + rnd() * 30, y: 35 + rnd() * 25, w: 18 + rnd() * 14, h: 14 + rnd() * 10 },
      evidenceSeed: 100 + i,
    });
  }
  return out.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export const detections: Detection[] = makeDetections(34);

export const buses: Bus[] = BUS_IDS.map((id, i) => {
  const statuses = ['Online', 'Online', 'Processing', 'Online', 'Warning'] as Bus['status'][];
  return {
    id,
    route: `Route ${101 + i} — ${pick(ROADS).name} Loop`,
    lat: 18.52 + (rnd() - 0.5) * 0.1,
    lng: 73.85 + (rnd() - 0.5) * 0.1,
    status: statuses[i],
    speed: Math.round(20 + rnd() * 30),
    camerasActive: 4 + Math.floor(rnd() * 2),
    detectionsToday: Math.floor(rnd() * 9) + 2,
    roadKm: Math.round(120 + rnd() * 80),
    lastUpdate: new Date(Date.now() - Math.floor(rnd() * 20) * 60000).toISOString(),
    zone: pick(ROADS).area,
  };
});

export const alerts: Alert[] = detections
  .filter((d) => d.severity === 'Critical' || d.severity === 'Severe')
  .slice(0, 12)
  .map((d, i) => ({
    id: `ALR-${3000 + i}`,
    type: d.severity === 'Critical' ? 'Critical Pothole' : 'Severe Road Damage',
    severity: d.severity,
    location: d.area,
    road: d.road,
    timestamp: d.timestamp,
    busId: d.busId,
    riskScore: d.riskScore,
    status: pick(['New', 'New', 'Acknowledged', 'Assigned', 'Resolved']),
  }));

export const incidents: Incident[] = Array.from({ length: 8 }, (_, i) => {
  const types: Incident['type'][] = ['Hit and Run', 'Rash Driving', 'Dangerous Pedestrian', 'School Children Crossing', 'Traffic Violation', 'Other Incident'];
  const t = pick(types);
  return {
    id: `INC-${5000 + i}`,
    type: t,
    timestamp: new Date(Date.now() - Math.floor(rnd() * 120) * 3600_000).toISOString(),
    lat: 18.52 + (rnd() - 0.5) * 0.1,
    lng: 73.85 + (rnd() - 0.5) * 0.1,
    busId: pick(BUS_IDS),
    confidence: Math.round((0.6 + rnd() * 0.38) * 100) / 100,
    status: pick(['Open', 'Investigating', 'Closed']),
    plate: t === 'Hit and Run' || t === 'Rash Driving' ? `DEMO-${Math.floor(1000 + rnd() * 8999)}` : null,
    anprConfidence: t === 'Hit and Run' || t === 'Rash Driving' ? Math.round((0.7 + rnd() * 0.28) * 100) / 100 : null,
  };
});

export const repairs: Repair[] = detections.slice(0, 16).map((d) => {
  const teams = ['North Roads Team', 'Central Maintenance', 'Highway Crew', 'West Zone Repair', 'Emergency Response'];
  const assigned = new Date(new Date(d.timestamp).getTime() + 12 * 3600_000);
  return {
    defectId: d.id,
    location: d.area,
    road: d.road,
    severity: d.severity,
    team: pick(teams),
    assignedDate: assigned.toISOString(),
    expectedCompletion: new Date(assigned.getTime() + 72 * 3600_000).toISOString(),
    status: d.status,
    repairDate: d.status === 'Repaired' || d.status === 'Verification Pending' ? new Date(assigned.getTime() + 48 * 3600_000).toISOString() : null,
    afterEvidenceSeed: d.status === 'Repaired' || d.status === 'Verification Pending' ? d.evidenceSeed + 500 : null,
  };
});

export const roadCondition = {
  Excellent: 62,
  Good: 21,
  Damaged: 12,
  Critical: 5,
};

export const repairProgress = {
  Open: 8,
  Reported: 6,
  Assigned: 5,
  'In Progress': 4,
  Repaired: 9,
};

export const detectionTrendDay = Array.from({ length: 14 }, (_, i) => ({
  label: `D${i + 1}`,
  value: Math.floor(8 + rnd() * 18),
}));

export const detectionTrendWeek = Array.from({ length: 8 }, (_, i) => ({
  label: `W${i + 1}`,
  value: Math.floor(50 + rnd() * 80),
}));

export const detectionTrendMonth = Array.from({ length: 6 }, (_, i) => ({
  label: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i],
  value: Math.floor(180 + rnd() * 220),
}));

export const areaStats = [
  { area: 'Central Zone', count: 14, avgRisk: 64 },
  { area: 'North Zone', count: 9, avgRisk: 48 },
  { area: 'South Zone', count: 7, avgRisk: 52 },
  { area: 'West Zone', count: 6, avgRisk: 41 },
  { area: 'East Zone', count: 5, avgRisk: 38 },
];

export const topProblemRoads = [
  { road: 'MG Road', defects: 8, avgSeverity: 3.4, avgRisk: 72, repairPct: 40 },
  { road: 'Baner Highway', defects: 6, avgSeverity: 3.1, avgRisk: 68, repairPct: 33 },
  { road: 'Karve Road', defects: 5, avgSeverity: 2.8, avgRisk: 59, repairPct: 60 },
  { road: 'Satara Road', defects: 4, avgSeverity: 3.0, avgRisk: 63, repairPct: 25 },
  { road: 'FC Road', defects: 4, avgSeverity: 2.5, avgRisk: 51, repairPct: 75 },
];

export const busDetections = buses.map((b) => ({
  busId: b.id,
  detections: b.detectionsToday + Math.floor(rnd() * 20),
  km: b.roadKm,
}));

export const trafficIntel = {
  vehicleDensity: 1840,
  congestionIndex: 6.4,
  avgBusSpeed: 28,
  routeDelay: 14,
  hotspots: ['MG Road × FC Road', 'Baner Highway Junction', 'Hadapsar Bypass'],
  trend: Array.from({ length: 12 }, (_, i) => ({ label: `${i + 8}h`, value: Math.floor(40 + rnd() * 50) })),
};

export const edgeMetrics = {
  bandwidthSaved: 82,
  edgeNodes: 5,
  framesProcessed: 184320,
  detectionsEdge: 3421,
  cloudPayloadMb: 412,
};
