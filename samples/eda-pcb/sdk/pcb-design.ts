import { CopilotClient } from "@github/copilot-sdk";
import {
  EDAConnector,
  DRCResult,
  DRCViolation,
  RoutingResult,
  SignalIntegrityResult,
  BOMExport,
  GerberExport,
} from "../../../shared/connectors/eda/client.js";
import {
  ConnectorResult,
  success,
  failure,
} from "../../../shared/connectors/types.js";

// ============================================================================
// Service Types
// ============================================================================

export interface BoardSummary {
  id: string;
  name: string;
  dimensions: { width: number; height: number };
  layerCount: number;
  componentCount: number;
  netCount: number;
  routingCompletion: number;
  lastModified: string;
}

export interface ComponentPlacementAnalysis {
  totalComponents: number;
  byLayer: { top: number; bottom: number };
  byPackage: Map<string, number>;
  criticalComponents: string[];
  placementDensity: number;
  suggestions: string[];
}

export interface RoutingAnalysis {
  completionRate: number;
  totalTraceLength: number;
  viaCount: number;
  layerUtilization: Map<string, number>;
  unroutedNets: string[];
  criticalNets: {
    netId: string;
    netName: string;
    priority: string;
    routed: boolean;
  }[];
}

export interface DesignHealthReport {
  board: BoardSummary;
  drc: {
    passed: boolean;
    errorCount: number;
    warningCount: number;
    criticalViolations: DRCViolation[];
  };
  signalIntegrity: {
    analyzed: number;
    passed: number;
    failed: number;
    issues: string[];
  };
  routing: RoutingAnalysis;
  recommendations: string[];
}

export interface PCBDesignServiceConfig {
  connector: EDAConnector;
  client?: CopilotClient;
}

// ============================================================================
// PCB Design Service
// ============================================================================

export class PCBDesignService {
  private connector: EDAConnector;
  private client?: CopilotClient;

  constructor(config: PCBDesignServiceConfig) {
    this.connector = config.connector;
    this.client = config.client;
  }

  async getBoardSummary(
    boardId: string,
  ): Promise<ConnectorResult<BoardSummary>> {
    const boardResult = await this.connector.getBoard(boardId);
    if (!boardResult.success) {
      return failure(boardResult.error!);
    }

    const board = boardResult.data!;
    const routingStatus = await this.connector.getRoutingStatus(boardId);
    const completionRate = routingStatus.success
      ? routingStatus.data!.completionRate
      : 0;

    return success({
      id: board.id,
      name: board.name,
      dimensions: { width: board.width, height: board.height },
      layerCount: board.layers.length,
      componentCount: board.components.length,
      netCount: board.nets.length,
      routingCompletion: completionRate,
      lastModified: board.updatedAt,
    });
  }

  async analyzeComponentPlacement(
    boardId: string,
  ): Promise<ConnectorResult<ComponentPlacementAnalysis>> {
    const boardResult = await this.connector.getBoard(boardId);
    if (!boardResult.success) {
      return failure(boardResult.error!);
    }

    const board = boardResult.data!;
    const components = board.components;

    const byPackage = new Map<string, number>();
    for (const comp of components) {
      byPackage.set(comp.package, (byPackage.get(comp.package) || 0) + 1);
    }

    const topCount = components.filter((c) => c.layer === "top").length;
    const bottomCount = components.filter((c) => c.layer === "bottom").length;

    // Identify critical components (ICs, connectors, crystals)
    const criticalComponents = components
      .filter(
        (c) =>
          c.package === "LQFP" ||
          c.package === "QFP" ||
          c.package === "BGA" ||
          c.package === "QFN" ||
          c.designator.startsWith("J") ||
          c.designator.startsWith("Y"),
      )
      .map((c) => c.designator);

    // Calculate placement density
    const boardArea = board.width * board.height;
    const componentArea = components.reduce((sum, c) => {
      // Rough area estimates by package
      const pkgAreas: Record<string, number> = {
        LQFP: 100,
        QFP: 100,
        BGA: 144,
        QFN: 25,
        SOIC: 30,
        SMD0402: 1,
        SMD0603: 2,
        SMD0805: 4,
        DIP: 50,
        TQFP: 64,
      };
      return sum + (pkgAreas[c.package] || 10);
    }, 0);
    const placementDensity = (componentArea / boardArea) * 100;

    // Generate placement suggestions
    const suggestions: string[] = [];
    if (placementDensity > 60) {
      suggestions.push(
        "High placement density detected. Consider increasing board size or using smaller packages.",
      );
    }
    if (bottomCount === 0 && topCount > 10) {
      suggestions.push(
        "All components on top layer. Consider using bottom layer for passive components to reduce routing complexity.",
      );
    }
    if (criticalComponents.length > 0) {
      suggestions.push(
        `Critical components identified: ${criticalComponents.join(", ")}. Ensure adequate bypass capacitors are placed nearby.`,
      );
    }

    return success({
      totalComponents: components.length,
      byLayer: { top: topCount, bottom: bottomCount },
      byPackage,
      criticalComponents,
      placementDensity: Math.round(placementDensity * 10) / 10,
      suggestions,
    });
  }

  async analyzeRouting(
    boardId: string,
  ): Promise<ConnectorResult<RoutingAnalysis>> {
    const boardResult = await this.connector.getBoard(boardId);
    if (!boardResult.success) {
      return failure(boardResult.error!);
    }

    const board = boardResult.data!;
    const routingStatus = await this.connector.getRoutingStatus(boardId);

    const layerUtilization = new Map<string, number>();
    for (const layer of board.layers) {
      const layerTraces = board.traces.filter((t) => t.layer === layer.id);
      const layerLength = layerTraces.reduce((sum, t) => sum + t.length, 0);
      // Rough utilization estimate
      const maxLength = (board.width + board.height) * 10;
      layerUtilization.set(
        layer.name,
        Math.min(100, Math.round((layerLength / maxLength) * 100)),
      );
    }

    const routedNetIds = new Set(board.traces.map((t) => t.netId));
    const criticalNets = board.nets
      .filter((n) => n.priority === "critical" || n.priority === "high")
      .map((n) => ({
        netId: n.id,
        netName: n.name,
        priority: n.priority,
        routed: routedNetIds.has(n.id),
      }));

    return success({
      completionRate: routingStatus.success
        ? routingStatus.data!.completionRate
        : (routedNetIds.size / board.nets.length) * 100,
      totalTraceLength: board.traces.reduce((sum, t) => sum + t.length, 0),
      viaCount: board.vias.length,
      layerUtilization,
      unroutedNets: routingStatus.success
        ? routingStatus.data!.unroutedNets
        : board.nets.filter((n) => !routedNetIds.has(n.id)).map((n) => n.id),
      criticalNets,
    });
  }

  async runDesignRuleCheck(
    boardId: string,
  ): Promise<ConnectorResult<DRCResult>> {
    return this.connector.runDRC(boardId);
  }

  async runAutoRouting(
    boardId: string,
    strategy: "shortest" | "performance" | "manufacturability" = "performance",
  ): Promise<ConnectorResult<RoutingResult>> {
    return this.connector.runAutoRouter(boardId, {
      strategy,
      avoidVias: strategy === "manufacturability",
      preferredLayers: [],
      maxVias: strategy === "manufacturability" ? 50 : null,
      respectDiffPairs: true,
    });
  }

  async analyzeSignalIntegrity(
    boardId: string,
  ): Promise<ConnectorResult<SignalIntegrityResult[]>> {
    return this.connector.analyzeSignalIntegrity(boardId);
  }

  async getDesignHealthReport(
    boardId: string,
  ): Promise<ConnectorResult<DesignHealthReport>> {
    // Get board summary
    const boardSummaryResult = await this.getBoardSummary(boardId);
    if (!boardSummaryResult.success) {
      return failure(boardSummaryResult.error!);
    }

    // Run DRC
    const drcResult = await this.connector.runDRC(boardId);
    const drcData = drcResult.success
      ? drcResult.data!
      : {
          passed: false,
          violations: [],
          summary: { errors: 0, warnings: 0, info: 0 },
        };

    // Analyze signal integrity
    const siResult = await this.connector.analyzeSignalIntegrity(boardId);
    const siData = siResult.success ? siResult.data! : [];

    // Analyze routing
    const routingResult = await this.analyzeRouting(boardId);
    const routingData = routingResult.success
      ? routingResult.data!
      : {
          completionRate: 0,
          totalTraceLength: 0,
          viaCount: 0,
          layerUtilization: new Map(),
          unroutedNets: [],
          criticalNets: [],
        };

    // Generate recommendations
    const recommendations: string[] = [];

    // DRC-based recommendations
    if (drcData.summary.errors > 0) {
      recommendations.push(
        `Fix ${drcData.summary.errors} DRC errors before manufacturing.`,
      );
    }
    if (drcData.summary.warnings > 3) {
      recommendations.push(
        `Review ${drcData.summary.warnings} DRC warnings for potential issues.`,
      );
    }

    // Signal integrity recommendations
    const failedSI = siData.filter((s) => !s.passed);
    if (failedSI.length > 0) {
      recommendations.push(
        `${failedSI.length} nets have signal integrity issues. Review trace widths and spacing.`,
      );
    }

    // Routing recommendations
    if (routingData.completionRate < 100) {
      recommendations.push(
        `${Math.round(100 - routingData.completionRate)}% of nets still unrouted. Consider running auto-router.`,
      );
    }
    const unroutedCritical = routingData.criticalNets.filter((n) => !n.routed);
    if (unroutedCritical.length > 0) {
      recommendations.push(
        `Critical nets unrouted: ${unroutedCritical.map((n) => n.netName).join(", ")}. Route these manually first.`,
      );
    }

    return success({
      board: boardSummaryResult.data!,
      drc: {
        passed: drcData.passed,
        errorCount: drcData.summary.errors,
        warningCount: drcData.summary.warnings,
        criticalViolations: drcData.violations.filter(
          (v) => v.severity === "error",
        ),
      },
      signalIntegrity: {
        analyzed: siData.length,
        passed: siData.filter((s) => s.passed).length,
        failed: failedSI.length,
        issues: failedSI.flatMap((s) => s.issues),
      },
      routing: routingData,
      recommendations,
    });
  }

  async exportManufacturingFiles(boardId: string): Promise<
    ConnectorResult<{
      gerber: GerberExport;
      bom: BOMExport;
    }>
  > {
    const gerberResult = await this.connector.exportGerber(boardId, {
      format: "RS-274X",
      units: "mm",
    });
    if (!gerberResult.success) {
      return failure(gerberResult.error!);
    }

    const bomResult = await this.connector.exportBOM(boardId, {
      groupByValue: true,
      includeUnplaced: false,
    });
    if (!bomResult.success) {
      return failure(bomResult.error!);
    }

    return success({
      gerber: gerberResult.data!,
      bom: bomResult.data!,
    });
  }
}

export function createPCBDesignService(
  connector: EDAConnector,
  options?: Partial<Omit<PCBDesignServiceConfig, "connector">>,
): PCBDesignService {
  return new PCBDesignService({
    connector,
    ...options,
  });
}
