export type Severity = 'Low' | 'Medium' | 'Severe' | 'Critical';
export type DetectionType =
  | 'Pothole'
  | 'Cracked Road'
  | 'Broken Pavement'
  | 'Waterlogging'
  | 'Missing Divider'
  | 'Missing Zebra Crossing'
  | 'Damaged Traffic Sign'
  | 'Other Hazard';
export type RepairStatus = 'Open' | 'Reported' | 'Assigned' | 'In Progress' | 'Repaired' | 'Verification Pending';
export type AlertStatus = 'New' | 'Acknowledged' | 'Assigned' | 'Resolved' | 'Dismissed';
export type BusStatus = 'Online' | 'Offline' | 'Processing' | 'Warning';
export type IncidentType =
  | 'Hit and Run'
  | 'Rash Driving'
  | 'Dangerous Pedestrian'
  | 'School Children Crossing'
  | 'Traffic Violation'
  | 'Other Incident';
export type IncidentStatus = 'Open' | 'Investigating' | 'Closed';

export interface Detection {
  id: string;
  type: DetectionType;
  confidence: number;
  severity: Severity;
  riskScore: number;
  riskReasons: string[];
  size: string;
  depth: string;
  lat: number;
  lng: number;
  road: string;
  area: string;
  busId: string;
  cameraId: string;
  timestamp: string;
  status: RepairStatus;
  confirmations: number;
  bbox: { x: number; y: number; w: number; h: number };
  evidenceSeed: number;
}

export interface Bus {
  id: string;
  route: string;
  lat: number;
  lng: number;
  status: BusStatus;
  speed: number;
  camerasActive: number;
  detectionsToday: number;
  roadKm: number;
  lastUpdate: string;
  zone: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: Severity;
  location: string;
  road: string;
  timestamp: string;
  busId: string;
  riskScore: number;
  status: AlertStatus;
}

export interface Incident {
  id: string;
  type: IncidentType;
  timestamp: string;
  lat: number;
  lng: number;
  busId: string;
  confidence: number;
  status: IncidentStatus;
  plate: string | null;
  anprConfidence: number | null;
}

export interface Repair {
  defectId: string;
  location: string;
  road: string;
  severity: Severity;
  team: string;
  assignedDate: string;
  expectedCompletion: string;
  status: RepairStatus;
  repairDate: string | null;
  afterEvidenceSeed: number | null;
}

export type PageKey =
  | 'overview'
  | 'live'
  | 'defects'
  | 'map'
  | 'buses'
  | 'incidents'
  | 'repairs'
  | 'analytics'
  | 'reports'
  | 'alerts'
  | 'settings';
