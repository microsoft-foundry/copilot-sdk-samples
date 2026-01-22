/**
 * EDA (Electronic Design Automation) Connector
 *
 * Provides PCB design automation capabilities including:
 * - Project and board management
 * - Component placement and manipulation
 * - Net/connectivity management
 * - Design Rule Checking (DRC)
 * - Auto-routing
 * - Signal integrity analysis
 * - Gerber/BOM export
 */

export {
  // Types
  type LayerType,
  type TraceStatus,
  type DRCSeverity,
  type ComponentPackage,
  type Point,
  type PCBProject,
  type PCBLayer,
  type Pin,
  type PCBComponent,
  type Net,
  type Trace,
  type Via,
  type PCBBoard,
  type DRCRule,
  type DRCViolation,
  type DRCResult,
  type SignalIntegrityResult,
  type RoutingOptions,
  type RoutingResult,
  type GerberExport,
  type BOMEntry,
  type BOMExport,
  // Config and Interface
  type EDAConnectorConfig,
  type EDAConnector,
  // Factory
  createEDAConnector,
} from "./client.js";
