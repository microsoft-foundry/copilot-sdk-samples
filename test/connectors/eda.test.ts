import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createEDAConnector,
  type EDAConnector,
  type PCBProject,
} from "../../shared/connectors/eda/index.js";
import { ErrorCodes } from "../../shared/connectors/types.js";
import { expectSuccess, expectFailure } from "../helpers/index.js";

describe("shared/connectors/eda", () => {
  describe("module exports", () => {
    it("should export createEDAConnector factory function", () => {
      expect(typeof createEDAConnector).toBe("function");
    });

    it("should export type interfaces usable for type annotations", async () => {
      const connector = createEDAConnector({ mode: "mock" });
      await connector.initialize();

      const result = await connector.listProjects();
      expectSuccess(result);

      const projects: PCBProject[] = result.data?.projects ?? [];
      expect(Array.isArray(projects)).toBe(true);

      if (projects.length > 0) {
        const project: PCBProject = projects[0];
        expect(project.id).toBeTruthy();
        expect(project.status).toBeTruthy();
      }

      await connector.dispose();
    });
  });

  describe("MockEDAConnector", () => {
    let connector: EDAConnector;

    beforeEach(async () => {
      connector = createEDAConnector({ mode: "mock" });
    });

    afterEach(async () => {
      await connector.dispose();
    });

    describe("initialization", () => {
      it("should create a mock connector", () => {
        expect(connector.name).toBe("eda");
        expect(connector.mode).toBe("mock");
        expect(connector.isInitialized).toBe(false);
      });

      it("should initialize successfully", async () => {
        const result = await connector.initialize();

        expectSuccess(result);
        expect(connector.isInitialized).toBe(true);
      });

      it("should dispose correctly", async () => {
        await connector.initialize();
        await connector.dispose();

        expect(connector.isInitialized).toBe(false);
      });
    });

    describe("healthCheck", () => {
      it("should return healthy status", async () => {
        await connector.initialize();
        const result = await connector.healthCheck();

        expectSuccess(result);
        expect(result.data?.healthy).toBe(true);
        expect(result.data?.version).toBe("mock-v1");
      });
    });

    describe("listProjects", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should return seeded mock projects", async () => {
        const result = await connector.listProjects();

        expectSuccess(result);
        expect(result.data?.projects.length).toBeGreaterThan(0);
        expect(result.data?.total).toBeGreaterThan(0);
      });

      it("should filter by status", async () => {
        const result = await connector.listProjects({ status: "draft" });

        expectSuccess(result);
        expect(result.data?.projects.every((p) => p.status === "draft")).toBe(
          true,
        );
      });

      it("should paginate results", async () => {
        const result = await connector.listProjects({ limit: 1, offset: 0 });

        expectSuccess(result);
        expect(result.data?.projects.length).toBeLessThanOrEqual(1);
      });

      it("should fail if not initialized", async () => {
        await connector.dispose();
        const result = await connector.listProjects();

        expectFailure(result, ErrorCodes.NOT_INITIALIZED);
      });
    });

    describe("getProject", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should return an existing project", async () => {
        const result = await connector.getProject("PROJ001");

        expectSuccess(result);
        expect(result.data?.id).toBe("PROJ001");
        expect(result.data?.name).toBeTruthy();
      });

      it("should fail for non-existent project", async () => {
        const result = await connector.getProject("NONEXISTENT");

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });

    describe("createProject", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should create a new project", async () => {
        const result = await connector.createProject({
          name: "New Test Project",
          description: "A test project",
        });

        expectSuccess(result);
        expect(result.data?.name).toBe("New Test Project");
        expect(result.data?.status).toBe("draft");
      });
    });

    describe("getBoard", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should return an existing board", async () => {
        const result = await connector.getBoard("BOARD001");

        expectSuccess(result);
        expect(result.data?.id).toBe("BOARD001");
        expect(result.data?.name).toBeTruthy();
        expect(result.data?.layers.length).toBeGreaterThan(0);
        expect(result.data?.components.length).toBeGreaterThan(0);
      });

      it("should fail for non-existent board", async () => {
        const result = await connector.getBoard("NONEXISTENT");

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });

      it("should include board details", async () => {
        const result = await connector.getBoard("BOARD001");

        expectSuccess(result);
        expect(result.data).toHaveProperty("width");
        expect(result.data).toHaveProperty("height");
        expect(result.data).toHaveProperty("layers");
        expect(result.data).toHaveProperty("components");
        expect(result.data).toHaveProperty("nets");
        expect(result.data).toHaveProperty("traces");
      });
    });

    describe("listComponents", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should return board components", async () => {
        const result = await connector.listComponents("BOARD001");

        expectSuccess(result);
        expect(result.data?.components.length).toBeGreaterThan(0);
      });

      it("should filter by layer", async () => {
        const result = await connector.listComponents("BOARD001", {
          layer: "top",
        });

        expectSuccess(result);
        expect(result.data?.components.every((c) => c.layer === "top")).toBe(
          true,
        );
      });

      it("should fail for non-existent board", async () => {
        const result = await connector.listComponents("NONEXISTENT");

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });

    describe("placeComponent", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should place a new component", async () => {
        const result = await connector.placeComponent("BOARD001", {
          name: "Test Resistor",
          designator: "R99",
          package: "SMD0402",
          value: "100K",
          position: { x: 10, y: 10 },
        });

        expectSuccess(result);
        expect(result.data?.designator).toBe("R99");
        expect(result.data?.package).toBe("SMD0402");
      });

      it("should fail for non-existent board", async () => {
        const result = await connector.placeComponent("NONEXISTENT", {
          name: "Test",
          designator: "R1",
          package: "SMD0402",
          position: { x: 0, y: 0 },
        });

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });

    describe("moveComponent", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should move an unlocked component", async () => {
        // COMP004 is unlocked in mock data
        const result = await connector.moveComponent("BOARD001", "COMP004", {
          position: { x: 50, y: 50 },
          rotation: 90,
        });

        expectSuccess(result);
        expect(result.data?.position).toEqual({ x: 50, y: 50 });
        expect(result.data?.rotation).toBe(90);
      });

      it("should fail for locked component", async () => {
        // COMP001 is locked in mock data
        const result = await connector.moveComponent("BOARD001", "COMP001", {
          position: { x: 0, y: 0 },
        });

        expectFailure(result, ErrorCodes.VALIDATION_ERROR);
      });

      it("should fail for non-existent component", async () => {
        const result = await connector.moveComponent(
          "BOARD001",
          "NONEXISTENT",
          {
            position: { x: 0, y: 0 },
          },
        );

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });

    describe("listNets", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should return board nets", async () => {
        const result = await connector.listNets("BOARD001");

        expectSuccess(result);
        expect(result.data?.nets.length).toBeGreaterThan(0);
      });

      it("should filter by priority", async () => {
        const result = await connector.listNets("BOARD001", {
          priority: "critical",
        });

        expectSuccess(result);
        expect(result.data?.nets.every((n) => n.priority === "critical")).toBe(
          true,
        );
      });

      it("should filter by net class", async () => {
        const result = await connector.listNets("BOARD001", {
          netClass: "differential",
        });

        expectSuccess(result);
        expect(
          result.data?.nets.every((n) => n.netClass === "differential"),
        ).toBe(true);
      });
    });

    describe("createNet", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should create a new net", async () => {
        const result = await connector.createNet("BOARD001", {
          name: "TEST_NET",
          pinRefs: ["COMP001:P1", "COMP002:P1"],
          priority: "normal",
        });

        expectSuccess(result);
        expect(result.data?.name).toBe("TEST_NET");
        expect(result.data?.pinRefs.length).toBe(2);
      });
    });

    describe("runDRC", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should run DRC and return results", async () => {
        const result = await connector.runDRC("BOARD001");

        expectSuccess(result);
        expect(result.data).toHaveProperty("passed");
        expect(result.data).toHaveProperty("violations");
        expect(result.data).toHaveProperty("summary");
        expect(result.data?.summary).toHaveProperty("errors");
        expect(result.data?.summary).toHaveProperty("warnings");
      });

      it("should fail for non-existent board", async () => {
        const result = await connector.runDRC("NONEXISTENT");

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });

    describe("getDRCViolations", () => {
      beforeEach(async () => {
        await connector.initialize();
        // Run DRC first to populate violations
        await connector.runDRC("BOARD001");
      });

      it("should return DRC violations", async () => {
        const result = await connector.getDRCViolations("BOARD001");

        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
      });

      it("should filter by severity", async () => {
        const result = await connector.getDRCViolations("BOARD001", {
          severity: "warning",
        });

        expectSuccess(result);
        expect(result.data?.every((v) => v.severity === "warning")).toBe(true);
      });
    });

    describe("runAutoRouter", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should run auto router and return results", async () => {
        const result = await connector.runAutoRouter("BOARD001");

        expectSuccess(result);
        expect(result.data).toHaveProperty("completionRate");
        expect(result.data).toHaveProperty("traces");
        expect(result.data).toHaveProperty("vias");
        expect(result.data).toHaveProperty("statistics");
      });

      it("should accept routing options", async () => {
        const result = await connector.runAutoRouter("BOARD001", {
          strategy: "manufacturability",
          avoidVias: true,
          preferredLayers: ["L1", "L4"],
          maxVias: 50,
          respectDiffPairs: true,
        });

        expectSuccess(result);
        expect(result.data?.completionRate).toBeGreaterThan(0);
      });

      it("should fail for non-existent board", async () => {
        const result = await connector.runAutoRouter("NONEXISTENT");

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });

    describe("getRoutingStatus", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should return routing status", async () => {
        const result = await connector.getRoutingStatus("BOARD001");

        expectSuccess(result);
        expect(result.data).toHaveProperty("completionRate");
        expect(result.data).toHaveProperty("unroutedNets");
        expect(result.data).toHaveProperty("inProgress");
      });
    });

    describe("clearRoutes", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should clear all routes", async () => {
        const result = await connector.clearRoutes("BOARD001");

        expectSuccess(result);

        // Verify routes are cleared
        const boardResult = await connector.getBoard("BOARD001");
        expectSuccess(boardResult);
        expect(boardResult.data?.traces.length).toBe(0);
      });

      it("should clear routes for specific nets", async () => {
        const result = await connector.clearRoutes("BOARD001", ["NET_USB_DP"]);

        expectSuccess(result);
      });
    });

    describe("analyzeSignalIntegrity", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should analyze signal integrity", async () => {
        const result = await connector.analyzeSignalIntegrity("BOARD001");

        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);

        if (result.data && result.data.length > 0) {
          const siResult = result.data[0];
          expect(siResult).toHaveProperty("netId");
          expect(siResult).toHaveProperty("impedance");
          expect(siResult).toHaveProperty("crosstalk");
          expect(siResult).toHaveProperty("passed");
        }
      });

      it("should analyze specific nets", async () => {
        const result = await connector.analyzeSignalIntegrity("BOARD001", [
          "NET_USB_DP",
          "NET_USB_DM",
        ]);

        expectSuccess(result);
        expect(
          result.data?.every((r) =>
            ["NET_USB_DP", "NET_USB_DM"].includes(r.netId),
          ),
        ).toBe(true);
      });
    });

    describe("exportGerber", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should export Gerber files", async () => {
        const result = await connector.exportGerber("BOARD001");

        expectSuccess(result);
        expect(result.data).toHaveProperty("files");
        expect(result.data?.files.length).toBeGreaterThan(0);
        expect(result.data?.format).toBe("RS-274X");
      });

      it("should accept export options", async () => {
        const result = await connector.exportGerber("BOARD001", {
          format: "RS-274X",
          units: "mm",
          layers: ["L1", "L4"],
        });

        expectSuccess(result);
        expect(result.data?.units).toBe("mm");
      });

      it("should fail for non-existent board", async () => {
        const result = await connector.exportGerber("NONEXISTENT");

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });

    describe("exportBOM", () => {
      beforeEach(async () => {
        await connector.initialize();
      });

      it("should export BOM", async () => {
        const result = await connector.exportBOM("BOARD001");

        expectSuccess(result);
        expect(result.data).toHaveProperty("entries");
        expect(result.data).toHaveProperty("totalComponents");
        expect(result.data).toHaveProperty("uniqueParts");
        expect(result.data?.entries.length).toBeGreaterThan(0);
      });

      it("should group by value when specified", async () => {
        const result = await connector.exportBOM("BOARD001", {
          groupByValue: true,
        });

        expectSuccess(result);
        // When grouped, entries count should be <= total components
        expect(result.data!.entries.length).toBeLessThanOrEqual(
          result.data!.totalComponents,
        );
      });

      it("should fail for non-existent board", async () => {
        const result = await connector.exportBOM("NONEXISTENT");

        expectFailure(result, ErrorCodes.NOT_FOUND);
      });
    });
  });

  describe("LiveEDAConnector", () => {
    it("should require credentials for initialization", async () => {
      const connector = createEDAConnector({ mode: "live" });
      const result = await connector.initialize();

      expectFailure(result, ErrorCodes.AUTH_REQUIRED);
    });

    it("should initialize with credentials", async () => {
      const connector = createEDAConnector({
        mode: "live",
        apiToken: "test-token",
      });
      const result = await connector.initialize();

      expectSuccess(result);
      expect(connector.isInitialized).toBe(true);
    });

    it("should return NOT_IMPLEMENTED for operations", async () => {
      const connector = createEDAConnector({
        mode: "live",
        apiToken: "test-token",
      });
      await connector.initialize();

      const result = await connector.listProjects();
      expectFailure(result, ErrorCodes.NOT_IMPLEMENTED);
    });
  });
});
