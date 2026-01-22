import { CopilotClient } from "@github/copilot-sdk";
import { runSample } from "../../../shared/index.js";
import { createEDAConnector } from "../../../shared/connectors/eda/client.js";
import {
  createPCBDesignService,
  BoardSummary,
  ComponentPlacementAnalysis,
  RoutingAnalysis,
  DesignHealthReport,
} from "./pcb-design.js";

async function main() {
  await runSample(
    {
      name: "EDA PCB Design Assistant",
      description:
        "AI-powered PCB design analysis with DRC, auto-routing, and signal integrity checks",
    },
    async (_client: CopilotClient) => {
      const edaConnector = createEDAConnector({ mode: "mock" });
      await edaConnector.initialize();

      const pcbService = createPCBDesignService(edaConnector);

      console.log("=== EDA PCB Design Assistant Demo ===\n");

      const boardId = "BOARD001";

      // 1. Board Summary
      console.log("1. Loading Board Summary...\n");
      const summaryResult = await pcbService.getBoardSummary(boardId);

      if (!summaryResult.success) {
        console.error("Failed to load board:", summaryResult.error?.message);
        await edaConnector.dispose();
        return;
      }

      printBoardSummary(summaryResult.data!);

      // 2. Component Placement Analysis
      console.log("\n2. Analyzing Component Placement...\n");
      const placementResult =
        await pcbService.analyzeComponentPlacement(boardId);

      if (placementResult.success) {
        printPlacementAnalysis(placementResult.data!);
      }

      // 3. Run DRC
      console.log("\n3. Running Design Rule Check (DRC)...\n");
      const drcResult = await pcbService.runDesignRuleCheck(boardId);

      if (drcResult.success) {
        const drc = drcResult.data!;
        const statusIcon = drc.passed ? "✅" : "❌";
        console.log(`  ${statusIcon} DRC ${drc.passed ? "PASSED" : "FAILED"}`);
        console.log(`    Errors: ${drc.summary.errors}`);
        console.log(`    Warnings: ${drc.summary.warnings}`);
        console.log(`    Info: ${drc.summary.info}`);

        if (drc.violations.length > 0) {
          console.log("\n  Violations:");
          for (const v of drc.violations.slice(0, 5)) {
            const icon =
              v.severity === "error"
                ? "🔴"
                : v.severity === "warning"
                  ? "🟡"
                  : "🔵";
            console.log(`    ${icon} [${v.ruleName}] ${v.description}`);
            if (v.suggestedFix) {
              console.log(`       💡 Fix: ${v.suggestedFix}`);
            }
          }
        }
      }

      // 4. Routing Analysis
      console.log("\n4. Analyzing Current Routing...\n");
      const routingAnalysisResult = await pcbService.analyzeRouting(boardId);

      if (routingAnalysisResult.success) {
        printRoutingAnalysis(routingAnalysisResult.data!);
      }

      // 5. Run Auto Router
      console.log("\n5. Running Auto Router (Performance Strategy)...\n");
      const autoRouteResult = await pcbService.runAutoRouting(
        boardId,
        "performance",
      );

      if (autoRouteResult.success) {
        const routing = autoRouteResult.data!;
        console.log(`  ✓ Auto-routing completed`);
        console.log(
          `    Completion Rate: ${routing.completionRate.toFixed(1)}%`,
        );
        console.log(
          `    Total Trace Length: ${routing.statistics.totalLength.toFixed(1)}mm`,
        );
        console.log(`    Vias Used: ${routing.statistics.viaCount}`);

        if (routing.unroutedNets.length > 0) {
          console.log(`    Unrouted Nets: ${routing.unroutedNets.join(", ")}`);
        }
      }

      // 6. Signal Integrity Analysis
      console.log("\n6. Analyzing Signal Integrity...\n");
      const siResult = await pcbService.analyzeSignalIntegrity(boardId);

      if (siResult.success) {
        const siResults = siResult.data!;
        console.log(
          `  Analyzed ${siResults.length} high-speed/differential nets:\n`,
        );

        for (const result of siResults) {
          const icon = result.passed ? "✅" : "⚠️";
          console.log(`  ${icon} ${result.netName}`);
          console.log(
            `      Impedance: ${result.impedance}Ω${result.impedanceTarget ? ` (target: ${result.impedanceTarget}Ω)` : ""}`,
          );
          console.log(`      Crosstalk: ${result.crosstalk}dB`);
          if (result.skew !== null) {
            console.log(`      Diff Pair Skew: ${result.skew.toFixed(1)}ps`);
          }
          if (result.issues.length > 0) {
            console.log(`      Issues: ${result.issues.join("; ")}`);
          }
          console.log();
        }
      }

      // 7. Design Health Report
      console.log("7. Generating Design Health Report...\n");
      const healthResult = await pcbService.getDesignHealthReport(boardId);

      if (healthResult.success) {
        printDesignHealthReport(healthResult.data!);
      }

      // 8. Export Manufacturing Files
      console.log("\n8. Exporting Manufacturing Files...\n");
      const exportResult = await pcbService.exportManufacturingFiles(boardId);

      if (exportResult.success) {
        const { gerber, bom } = exportResult.data!;
        console.log("  Gerber Files Generated:");
        console.log(`    Format: ${gerber.format}`);
        console.log(`    Units: ${gerber.units}`);
        console.log(`    Files: ${gerber.files.length}`);
        for (const file of gerber.files.slice(0, 5)) {
          console.log(`      - ${file.name} (${file.type})`);
        }
        if (gerber.files.length > 5) {
          console.log(`      ... and ${gerber.files.length - 5} more files`);
        }

        console.log("\n  Bill of Materials:");
        console.log(`    Total Components: ${bom.totalComponents}`);
        console.log(`    Unique Parts: ${bom.uniqueParts}`);
        console.log("    Sample Entries:");
        for (const entry of bom.entries.slice(0, 3)) {
          console.log(
            `      - ${entry.designator}: ${entry.description || entry.partNumber} (${entry.package})`,
          );
        }
      }

      await edaConnector.dispose();
      console.log("\n=== Demo Complete ===\n");
    },
  );
}

function printBoardSummary(summary: BoardSummary): void {
  console.log("  === Board Summary ===");
  console.log(`  Name: ${summary.name}`);
  console.log(
    `  Dimensions: ${summary.dimensions.width}mm x ${summary.dimensions.height}mm`,
  );
  console.log(`  Layers: ${summary.layerCount}`);
  console.log(`  Components: ${summary.componentCount}`);
  console.log(`  Nets: ${summary.netCount}`);
  console.log(`  Routing Completion: ${summary.routingCompletion.toFixed(1)}%`);
  console.log(
    `  Last Modified: ${new Date(summary.lastModified).toLocaleString()}`,
  );
}

function printPlacementAnalysis(analysis: ComponentPlacementAnalysis): void {
  console.log("  === Placement Analysis ===");
  console.log(`  Total Components: ${analysis.totalComponents}`);
  console.log(
    `  Top Layer: ${analysis.byLayer.top} | Bottom Layer: ${analysis.byLayer.bottom}`,
  );
  console.log(`  Placement Density: ${analysis.placementDensity}%`);

  console.log("  By Package:");
  for (const [pkg, count] of analysis.byPackage) {
    console.log(`    ${pkg}: ${count}`);
  }

  if (analysis.criticalComponents.length > 0) {
    console.log(
      `  Critical Components: ${analysis.criticalComponents.join(", ")}`,
    );
  }

  if (analysis.suggestions.length > 0) {
    console.log("\n  Suggestions:");
    for (const suggestion of analysis.suggestions) {
      console.log(`    💡 ${suggestion}`);
    }
  }
}

function printRoutingAnalysis(analysis: RoutingAnalysis): void {
  console.log("  === Routing Analysis ===");
  console.log(`  Completion: ${analysis.completionRate.toFixed(1)}%`);
  console.log(
    `  Total Trace Length: ${analysis.totalTraceLength.toFixed(1)}mm`,
  );
  console.log(`  Via Count: ${analysis.viaCount}`);

  console.log("  Layer Utilization:");
  for (const [layer, util] of analysis.layerUtilization) {
    const bar =
      "█".repeat(Math.floor(util / 10)) +
      "░".repeat(10 - Math.floor(util / 10));
    console.log(`    ${layer}: ${bar} ${util}%`);
  }

  if (analysis.criticalNets.length > 0) {
    console.log("  Critical Nets:");
    for (const net of analysis.criticalNets) {
      const icon = net.routed ? "✅" : "⏳";
      console.log(`    ${icon} ${net.netName} (${net.priority})`);
    }
  }

  if (analysis.unroutedNets.length > 0) {
    console.log(
      `  Unrouted Nets: ${analysis.unroutedNets.slice(0, 5).join(", ")}${analysis.unroutedNets.length > 5 ? "..." : ""}`,
    );
  }
}

function printDesignHealthReport(report: DesignHealthReport): void {
  console.log("  ╔════════════════════════════════════════╗");
  console.log("  ║       DESIGN HEALTH REPORT             ║");
  console.log("  ╠════════════════════════════════════════╣");

  // Overall status
  const overallPassed =
    report.drc.passed &&
    report.signalIntegrity.failed === 0 &&
    report.routing.completionRate >= 95;
  const statusIcon = overallPassed ? "✅" : "⚠️";
  console.log(
    `  ║ Status: ${statusIcon} ${overallPassed ? "READY FOR REVIEW" : "NEEDS ATTENTION"}        ║`,
  );

  console.log("  ╠════════════════════════════════════════╣");
  console.log(
    `  ║ DRC: ${report.drc.passed ? "✅ PASS" : "❌ FAIL"} (${report.drc.errorCount}E/${report.drc.warningCount}W)            ║`,
  );
  console.log(
    `  ║ Signal Integrity: ${report.signalIntegrity.passed}/${report.signalIntegrity.analyzed} passed      ║`,
  );
  console.log(
    `  ║ Routing: ${report.routing.completionRate.toFixed(0)}% complete                ║`,
  );
  console.log("  ╚════════════════════════════════════════╝");

  if (report.recommendations.length > 0) {
    console.log("\n  Recommendations:");
    for (const rec of report.recommendations) {
      console.log(`    → ${rec}`);
    }
  }
}

main().catch(console.error);
