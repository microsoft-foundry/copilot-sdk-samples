import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createEDAConnector,
  EDAConnector,
} from "../../../shared/connectors/eda/index.js";
import {
  createPCBDesignService,
  PCBDesignService,
} from "../../../samples/eda-pcb/sdk/pcb-design.js";
import { expectSuccess, expectFailure } from "../../helpers/index.js";
import { ErrorCodes } from "../../../shared/connectors/types.js";

describe("samples/eda-pcb/pcb-design", () => {
  let connector: EDAConnector;
  let service: PCBDesignService;

  beforeEach(async () => {
    connector = createEDAConnector({ mode: "mock" });
    await connector.initialize();
    service = createPCBDesignService(connector);
  });

  afterEach(async () => {
    await connector.dispose();
  });

  describe("getBoardSummary", () => {
    it("should return board summary with basic info", async () => {
      const result = await service.getBoardSummary("BOARD001");

      expectSuccess(result);
      expect(result.data?.id).toBe("BOARD001");
      expect(result.data?.name).toBeTruthy();
      expect(result.data?.dimensions).toBeDefined();
      expect(result.data?.dimensions.width).toBeGreaterThan(0);
      expect(result.data?.dimensions.height).toBeGreaterThan(0);
    });

    it("should include layer and component counts", async () => {
      const result = await service.getBoardSummary("BOARD001");

      expectSuccess(result);
      expect(result.data?.layerCount).toBeGreaterThan(0);
      expect(result.data?.componentCount).toBeGreaterThan(0);
      expect(result.data?.netCount).toBeGreaterThan(0);
    });

    it("should include routing completion percentage", async () => {
      const result = await service.getBoardSummary("BOARD001");

      expectSuccess(result);
      expect(result.data?.routingCompletion).toBeGreaterThanOrEqual(0);
      expect(result.data?.routingCompletion).toBeLessThanOrEqual(100);
    });

    it("should fail for non-existent board", async () => {
      const result = await service.getBoardSummary("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });

  describe("analyzeComponentPlacement", () => {
    it("should return placement analysis", async () => {
      const result = await service.analyzeComponentPlacement("BOARD001");

      expectSuccess(result);
      expect(result.data?.totalComponents).toBeGreaterThan(0);
    });

    it("should separate components by layer", async () => {
      const result = await service.analyzeComponentPlacement("BOARD001");

      expectSuccess(result);
      expect(result.data?.byLayer).toBeDefined();
      expect(result.data?.byLayer.top).toBeGreaterThanOrEqual(0);
      expect(result.data?.byLayer.bottom).toBeGreaterThanOrEqual(0);
    });

    it("should group components by package type", async () => {
      const result = await service.analyzeComponentPlacement("BOARD001");

      expectSuccess(result);
      expect(result.data?.byPackage).toBeInstanceOf(Map);
      expect(result.data?.byPackage.size).toBeGreaterThan(0);
    });

    it("should identify critical components", async () => {
      const result = await service.analyzeComponentPlacement("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data?.criticalComponents)).toBe(true);
    });

    it("should calculate placement density", async () => {
      const result = await service.analyzeComponentPlacement("BOARD001");

      expectSuccess(result);
      expect(result.data?.placementDensity).toBeGreaterThanOrEqual(0);
    });

    it("should generate placement suggestions", async () => {
      const result = await service.analyzeComponentPlacement("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data?.suggestions)).toBe(true);
    });

    it("should fail for non-existent board", async () => {
      const result = await service.analyzeComponentPlacement("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });

  describe("analyzeRouting", () => {
    it("should return routing analysis", async () => {
      const result = await service.analyzeRouting("BOARD001");

      expectSuccess(result);
      expect(result.data?.completionRate).toBeGreaterThanOrEqual(0);
      expect(result.data?.completionRate).toBeLessThanOrEqual(100);
    });

    it("should include trace and via metrics", async () => {
      const result = await service.analyzeRouting("BOARD001");

      expectSuccess(result);
      expect(result.data?.totalTraceLength).toBeGreaterThanOrEqual(0);
      expect(result.data?.viaCount).toBeGreaterThanOrEqual(0);
    });

    it("should provide layer utilization", async () => {
      const result = await service.analyzeRouting("BOARD001");

      expectSuccess(result);
      expect(result.data?.layerUtilization).toBeInstanceOf(Map);
    });

    it("should identify unrouted nets", async () => {
      const result = await service.analyzeRouting("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data?.unroutedNets)).toBe(true);
    });

    it("should identify critical nets with routing status", async () => {
      const result = await service.analyzeRouting("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data?.criticalNets)).toBe(true);
      if (result.data!.criticalNets.length > 0) {
        const criticalNet = result.data!.criticalNets[0];
        expect(criticalNet).toHaveProperty("netId");
        expect(criticalNet).toHaveProperty("netName");
        expect(criticalNet).toHaveProperty("priority");
        expect(criticalNet).toHaveProperty("routed");
      }
    });

    it("should fail for non-existent board", async () => {
      const result = await service.analyzeRouting("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });

  describe("runDesignRuleCheck", () => {
    it("should return DRC result", async () => {
      const result = await service.runDesignRuleCheck("BOARD001");

      expectSuccess(result);
      expect(typeof result.data?.passed).toBe("boolean");
    });

    it("should include violation list", async () => {
      const result = await service.runDesignRuleCheck("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data?.violations)).toBe(true);
    });

    it("should include summary counts", async () => {
      const result = await service.runDesignRuleCheck("BOARD001");

      expectSuccess(result);
      expect(result.data?.summary).toBeDefined();
      expect(typeof result.data?.summary.errors).toBe("number");
      expect(typeof result.data?.summary.warnings).toBe("number");
    });

    it("should fail for non-existent board", async () => {
      const result = await service.runDesignRuleCheck("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });

  describe("runAutoRouting", () => {
    it("should run auto-router with default strategy", async () => {
      const result = await service.runAutoRouting("BOARD001");

      expectSuccess(result);
      expect(result.data?.completionRate).toBeGreaterThanOrEqual(0);
    });

    it("should run auto-router with performance strategy", async () => {
      const result = await service.runAutoRouting("BOARD001", "performance");

      expectSuccess(result);
      expect(result.data?.completionRate).toBeGreaterThanOrEqual(0);
    });

    it("should run auto-router with manufacturability strategy", async () => {
      const result = await service.runAutoRouting(
        "BOARD001",
        "manufacturability",
      );

      expectSuccess(result);
      expect(result.data?.completionRate).toBeGreaterThanOrEqual(0);
    });

    it("should run auto-router with shortest strategy", async () => {
      const result = await service.runAutoRouting("BOARD001", "shortest");

      expectSuccess(result);
      expect(result.data?.completionRate).toBeGreaterThanOrEqual(0);
    });

    it("should fail for non-existent board", async () => {
      const result = await service.runAutoRouting("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });

  describe("analyzeSignalIntegrity", () => {
    it("should return signal integrity results", async () => {
      const result = await service.analyzeSignalIntegrity("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should include pass/fail status for each net", async () => {
      const result = await service.analyzeSignalIntegrity("BOARD001");

      expectSuccess(result);
      if (result.data!.length > 0) {
        const siResult = result.data![0];
        expect(typeof siResult.passed).toBe("boolean");
        expect(siResult.netId).toBeTruthy();
      }
    });

    it("should fail for non-existent board", async () => {
      const result = await service.analyzeSignalIntegrity("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });

  describe("getDesignHealthReport", () => {
    it("should return comprehensive health report", async () => {
      const result = await service.getDesignHealthReport("BOARD001");

      expectSuccess(result);
      expect(result.data?.board).toBeDefined();
      expect(result.data?.drc).toBeDefined();
      expect(result.data?.signalIntegrity).toBeDefined();
      expect(result.data?.routing).toBeDefined();
    });

    it("should include board summary in report", async () => {
      const result = await service.getDesignHealthReport("BOARD001");

      expectSuccess(result);
      expect(result.data?.board.id).toBe("BOARD001");
      expect(result.data?.board.name).toBeTruthy();
    });

    it("should include DRC summary in report", async () => {
      const result = await service.getDesignHealthReport("BOARD001");

      expectSuccess(result);
      expect(typeof result.data?.drc.passed).toBe("boolean");
      expect(typeof result.data?.drc.errorCount).toBe("number");
      expect(typeof result.data?.drc.warningCount).toBe("number");
      expect(Array.isArray(result.data?.drc.criticalViolations)).toBe(true);
    });

    it("should include signal integrity summary in report", async () => {
      const result = await service.getDesignHealthReport("BOARD001");

      expectSuccess(result);
      expect(typeof result.data?.signalIntegrity.analyzed).toBe("number");
      expect(typeof result.data?.signalIntegrity.passed).toBe("number");
      expect(typeof result.data?.signalIntegrity.failed).toBe("number");
      expect(Array.isArray(result.data?.signalIntegrity.issues)).toBe(true);
    });

    it("should include routing analysis in report", async () => {
      const result = await service.getDesignHealthReport("BOARD001");

      expectSuccess(result);
      expect(result.data?.routing.completionRate).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.data?.routing.unroutedNets)).toBe(true);
    });

    it("should generate recommendations", async () => {
      const result = await service.getDesignHealthReport("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data?.recommendations)).toBe(true);
    });

    it("should fail for non-existent board", async () => {
      const result = await service.getDesignHealthReport("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });

  describe("exportManufacturingFiles", () => {
    it("should export Gerber and BOM files", async () => {
      const result = await service.exportManufacturingFiles("BOARD001");

      expectSuccess(result);
      expect(result.data?.gerber).toBeDefined();
      expect(result.data?.bom).toBeDefined();
    });

    it("should include Gerber file details", async () => {
      const result = await service.exportManufacturingFiles("BOARD001");

      expectSuccess(result);
      expect(result.data?.gerber.format).toBe("RS-274X");
      expect(Array.isArray(result.data?.gerber.files)).toBe(true);
      expect(result.data?.gerber.files.length).toBeGreaterThan(0);
    });

    it("should include BOM entries", async () => {
      const result = await service.exportManufacturingFiles("BOARD001");

      expectSuccess(result);
      expect(Array.isArray(result.data?.bom.entries)).toBe(true);
      expect(result.data?.bom.entries.length).toBeGreaterThan(0);
    });

    it("should include BOM summary", async () => {
      const result = await service.exportManufacturingFiles("BOARD001");

      expectSuccess(result);
      expect(typeof result.data?.bom.totalComponents).toBe("number");
      expect(typeof result.data?.bom.uniqueParts).toBe("number");
    });

    it("should fail for non-existent board", async () => {
      const result = await service.exportManufacturingFiles("NONEXISTENT");

      expectFailure(result, ErrorCodes.NOT_FOUND);
    });
  });
});
