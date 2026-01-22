export interface Point {
  x: number;
  y: number;
}

export interface PCBComponent {
  id: string;
  designator: string;
  name: string;
  package: string;
  value: string | null;
  position: Point;
  rotation: number;
  layer: "top" | "bottom";
  width: number;
  height: number;
  pins: PCBPin[];
  isCritical?: boolean;
}

export interface PCBPin {
  id: string;
  name: string;
  position: Point;
  netId: string | null;
}

export interface PCBTrace {
  id: string;
  netId: string;
  netName: string;
  layer: string;
  points: Point[];
  width: number;
  status: "routed" | "pending" | "error";
}

export interface PCBVia {
  id: string;
  netId: string;
  position: Point;
  size: number;
}

export interface DRCViolation {
  id: string;
  type: "clearance" | "width" | "impedance" | "length_match" | "annular_ring";
  severity: "error" | "warning" | "info";
  location: Point;
  description: string;
  affectedObjects: string[];
  suggestedFix: string;
}

export interface SignalIntegrityResult {
  netId: string;
  netName: string;
  impedance: number;
  impedanceTarget: number | null;
  passed: boolean;
  waveform: number[];
  issues: string[];
}

export interface AIDesignSuggestion {
  id: string;
  type: "placement" | "routing" | "drc" | "signal_integrity" | "thermal";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning: string;
  affectedComponents: string[];
  confidence: number;
  actionLabel?: string;
}

export interface PCBBoard {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: string[];
  components: PCBComponent[];
  traces: PCBTrace[];
  vias: PCBVia[];
}

export interface PCBDesignAnalysis {
  board: PCBBoard;
  drcViolations: DRCViolation[];
  signalIntegrity: SignalIntegrityResult[];
  aiSuggestions: AIDesignSuggestion[];
  summary: {
    componentCount: number;
    netCount: number;
    routingCompletion: number;
    drcErrors: number;
    drcWarnings: number;
    siPassed: number;
    siFailed: number;
  };
}
