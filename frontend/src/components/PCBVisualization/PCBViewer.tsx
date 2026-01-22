import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Route,
  Activity,
} from "lucide-react";
import type {
  PCBDesignAnalysis,
  DRCViolation,
  AIDesignSuggestion,
} from "./types";
import PCBCanvas from "./PCBCanvas";
import AIDesignAssistant from "./AIDesignAssistant";
import DRCPanel from "./DRCPanel";
import SignalIntegrityPanel from "./SignalIntegrityPanel";

interface PCBViewerProps {
  analysis: PCBDesignAnalysis;
}

const PCBViewer: React.FC<PCBViewerProps> = ({ analysis }) => {
  const [selectedViolation, setSelectedViolation] =
    useState<DRCViolation | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AIDesignSuggestion | null>(null);
  const [selectedNet, setSelectedNet] = useState<string | null>(
    analysis.signalIntegrity.length > 0
      ? analysis.signalIntegrity[0].netId
      : null,
  );
  const [activeTab, setActiveTab] = useState<"drc" | "signal">("drc");

  const highlightedComponents = useMemo(() => {
    if (selectedSuggestion) {
      return selectedSuggestion.affectedComponents;
    }
    if (selectedViolation) {
      return selectedViolation.affectedObjects;
    }
    return [];
  }, [selectedSuggestion, selectedViolation]);

  const handleSuggestionSelect = (suggestion: AIDesignSuggestion) => {
    setSelectedSuggestion(
      suggestion.id === selectedSuggestion?.id ? null : suggestion,
    );
    setSelectedViolation(null);
  };

  const handleViolationSelect = (violation: DRCViolation) => {
    setSelectedViolation(
      violation.id === selectedViolation?.id ? null : violation,
    );
    setSelectedSuggestion(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #22c55e, var(--color-teams))",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              <Cpu size={20} style={{ color: "white" }} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {analysis.board.name}
              </h2>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {analysis.board.width}mm × {analysis.board.height}mm •{" "}
                {analysis.board.layers.length} layers
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                background:
                  analysis.summary.drcErrors === 0
                    ? "var(--success-muted)"
                    : "var(--error-muted)",
                borderRadius: "var(--radius-sm)",
                color:
                  analysis.summary.drcErrors === 0
                    ? "var(--success)"
                    : "var(--error)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
              }}
            >
              {analysis.summary.drcErrors === 0 ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {analysis.summary.drcErrors} DRC Errors
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Layers size={12} style={{ color: "var(--text-muted)" }} />
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                {analysis.summary.componentCount} components
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-3)",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Route size={12} style={{ color: "var(--text-muted)" }} />
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                }}
              >
                {analysis.summary.routingCompletion}% routed
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "var(--space-3)",
          }}
        >
          <StatCard
            label="Components"
            value={analysis.summary.componentCount}
            icon={<Cpu size={14} />}
          />
          <StatCard
            label="Nets"
            value={analysis.summary.netCount}
            icon={<Route size={14} />}
          />
          <StatCard
            label="Routing"
            value={`${analysis.summary.routingCompletion}%`}
            icon={<Activity size={14} />}
            color={
              analysis.summary.routingCompletion === 100
                ? "var(--success)"
                : "var(--warning)"
            }
          />
          <StatCard
            label="DRC Errors"
            value={analysis.summary.drcErrors}
            icon={<AlertCircle size={14} />}
            color={
              analysis.summary.drcErrors === 0
                ? "var(--success)"
                : "var(--error)"
            }
          />
          <StatCard
            label="SI Pass"
            value={`${analysis.summary.siPassed}/${analysis.summary.siPassed + analysis.summary.siFailed}`}
            icon={<CheckCircle2 size={14} />}
            color={
              analysis.summary.siFailed === 0
                ? "var(--success)"
                : "var(--warning)"
            }
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "var(--space-4)",
          minHeight: 450,
        }}
      >
        <PCBCanvas
          board={analysis.board}
          violations={analysis.drcViolations}
          selectedViolation={selectedViolation}
          highlightedComponents={highlightedComponents}
          onViolationClick={handleViolationSelect}
        />
        <AIDesignAssistant
          suggestions={analysis.aiSuggestions}
          selectedSuggestion={selectedSuggestion}
          onSuggestionSelect={handleSuggestionSelect}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "calc(-1 * var(--space-2))",
        }}
      >
        <button
          onClick={() => setActiveTab("drc")}
          style={{
            padding: "var(--space-2) var(--space-4)",
            background: activeTab === "drc" ? "var(--bg-card)" : "transparent",
            border:
              activeTab === "drc"
                ? "1px solid var(--border-default)"
                : "1px solid transparent",
            borderBottom: activeTab === "drc" ? "none" : undefined,
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            color:
              activeTab === "drc" ? "var(--text-primary)" : "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <AlertCircle size={14} />
          DRC Violations
          {analysis.summary.drcErrors > 0 && (
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                padding: "1px 6px",
                background: "var(--error-muted)",
                color: "var(--error)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
              }}
            >
              {analysis.summary.drcErrors}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("signal")}
          style={{
            padding: "var(--space-2) var(--space-4)",
            background:
              activeTab === "signal" ? "var(--bg-card)" : "transparent",
            border:
              activeTab === "signal"
                ? "1px solid var(--border-default)"
                : "1px solid transparent",
            borderBottom: activeTab === "signal" ? "none" : undefined,
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            color:
              activeTab === "signal"
                ? "var(--text-primary)"
                : "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Activity size={14} />
          Signal Integrity
        </button>
      </div>

      <div style={{ height: 320 }}>
        {activeTab === "drc" ? (
          <DRCPanel
            violations={analysis.drcViolations}
            selectedViolation={selectedViolation}
            onViolationSelect={handleViolationSelect}
          />
        ) : (
          <SignalIntegrityPanel
            results={analysis.signalIntegrity}
            selectedNet={selectedNet}
            onNetSelect={setSelectedNet}
          />
        )}
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = "var(--text-primary)",
}) => (
  <div
    style={{
      padding: "var(--space-3)",
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-subtle)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        marginBottom: "var(--space-2)",
        color: "var(--text-muted)",
      }}
    >
      {icon}
      <span style={{ fontSize: "var(--font-size-xs)" }}>{label}</span>
    </div>
    <div
      style={{
        fontSize: "var(--font-size-xl)",
        fontWeight: 700,
        color,
        fontFamily: "var(--font-mono)",
      }}
    >
      {value}
    </div>
  </div>
);

export default PCBViewer;
