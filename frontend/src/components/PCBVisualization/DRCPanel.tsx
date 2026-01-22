import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin,
  Wrench,
  ChevronRight,
} from "lucide-react";
import type { DRCViolation } from "./types";

interface DRCPanelProps {
  violations: DRCViolation[];
  selectedViolation: DRCViolation | null;
  onViolationSelect: (violation: DRCViolation) => void;
}

const SEVERITY_CONFIG: Record<
  DRCViolation["severity"],
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  error: {
    icon: <AlertCircle size={14} />,
    color: "var(--error)",
    bg: "var(--error-muted)",
    label: "Error",
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    color: "var(--warning)",
    bg: "var(--warning-muted)",
    label: "Warning",
  },
  info: {
    icon: <Info size={14} />,
    color: "var(--info)",
    bg: "var(--info-muted)",
    label: "Info",
  },
};

const TYPE_LABELS: Record<DRCViolation["type"], string> = {
  clearance: "Clearance",
  width: "Trace Width",
  impedance: "Impedance",
  length_match: "Length Match",
  annular_ring: "Annular Ring",
};

const DRCPanel: React.FC<DRCPanelProps> = ({
  violations,
  selectedViolation,
  onViolationSelect,
}) => {
  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warningCount = violations.filter(
    (v) => v.severity === "warning",
  ).length;
  const infoCount = violations.filter((v) => v.severity === "info").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          DRC Violations
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          {errorCount > 0 && (
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                padding: "2px 6px",
                background: "var(--error-muted)",
                color: "var(--error)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
              }}
            >
              {errorCount} errors
            </span>
          )}
          {warningCount > 0 && (
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                padding: "2px 6px",
                background: "var(--warning-muted)",
                color: "var(--warning)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
              }}
            >
              {warningCount} warnings
            </span>
          )}
          {infoCount > 0 && (
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                padding: "2px 6px",
                background: "var(--info-muted)",
                color: "var(--info)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
              }}
            >
              {infoCount} info
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-2)",
        }}
      >
        {violations.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-6)",
              color: "var(--success)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--success-muted)",
                borderRadius: "50%",
                marginBottom: "var(--space-3)",
              }}
            >
              ✓
            </div>
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
              }}
            >
              No DRC Violations
            </span>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
              }}
            >
              Design passes all checks
            </span>
          </div>
        ) : (
          violations.map((violation, index) => {
            const isSelected = selectedViolation?.id === violation.id;
            const severityConfig = SEVERITY_CONFIG[violation.severity];

            return (
              <motion.button
                key={violation.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => onViolationSelect(violation)}
                style={{
                  width: "100%",
                  padding: "var(--space-3)",
                  marginBottom: "var(--space-2)",
                  background: isSelected
                    ? "var(--bg-elevated)"
                    : "var(--bg-surface)",
                  border: `1px solid ${isSelected ? severityConfig.color : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-3)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: severityConfig.bg,
                      borderRadius: "var(--radius-sm)",
                      color: severityConfig.color,
                      flexShrink: 0,
                    }}
                  >
                    {severityConfig.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          fontWeight: 600,
                          color: severityConfig.color,
                          textTransform: "uppercase",
                        }}
                      >
                        {TYPE_LABELS[violation.type]}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                      }}
                    >
                      {violation.description}
                    </p>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        style={{
                          marginTop: "var(--space-3)",
                          paddingTop: "var(--space-2)",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-2)",
                            marginBottom: "var(--space-2)",
                          }}
                        >
                          <MapPin
                            size={12}
                            style={{ color: "var(--text-muted)" }}
                          />
                          <span
                            style={{
                              fontSize: "var(--font-size-xs)",
                              color: "var(--text-muted)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            ({violation.location.x.toFixed(2)},{" "}
                            {violation.location.y.toFixed(2)})
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "var(--space-2)",
                            padding: "var(--space-2)",
                            background: "var(--bg-card)",
                            borderRadius: "var(--radius-sm)",
                            marginBottom: "var(--space-2)",
                          }}
                        >
                          <Wrench
                            size={12}
                            style={{
                              color: "var(--success)",
                              marginTop: 2,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: "var(--font-size-xs)",
                              color: "var(--text-secondary)",
                              lineHeight: 1.4,
                            }}
                          >
                            {violation.suggestedFix}
                          </span>
                        </div>

                        {violation.affectedObjects.length > 0 && (
                          <div>
                            <span
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-muted)",
                              }}
                            >
                              Objects:{" "}
                            </span>
                            {violation.affectedObjects.map((obj, i) => (
                              <span
                                key={obj}
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--text-secondary)",
                                  background: "var(--bg-card)",
                                  padding: "1px 4px",
                                  borderRadius: 2,
                                  marginLeft: i > 0 ? 4 : 0,
                                }}
                              >
                                {obj}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <ChevronRight
                    size={14}
                    style={{
                      color: "var(--text-muted)",
                      transform: isSelected ? "rotate(90deg)" : "none",
                      transition: "transform 0.15s ease",
                      flexShrink: 0,
                    }}
                  />
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default DRCPanel;
