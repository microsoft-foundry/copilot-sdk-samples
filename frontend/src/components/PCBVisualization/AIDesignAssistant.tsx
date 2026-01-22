import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Cpu,
  Zap,
  AlertTriangle,
  Thermometer,
  Route,
} from "lucide-react";
import type { AIDesignSuggestion } from "./types";

interface AIDesignAssistantProps {
  suggestions: AIDesignSuggestion[];
  onSuggestionSelect: (suggestion: AIDesignSuggestion) => void;
  selectedSuggestion: AIDesignSuggestion | null;
}

const SUGGESTION_ICONS: Record<AIDesignSuggestion["type"], React.ReactNode> = {
  placement: <Cpu size={14} />,
  routing: <Route size={14} />,
  drc: <AlertTriangle size={14} />,
  signal_integrity: <Zap size={14} />,
  thermal: <Thermometer size={14} />,
};

const PRIORITY_CONFIG: Record<
  AIDesignSuggestion["priority"],
  { color: string; bg: string; label: string }
> = {
  high: { color: "var(--error)", bg: "var(--error-muted)", label: "High" },
  medium: {
    color: "var(--warning)",
    bg: "var(--warning-muted)",
    label: "Medium",
  },
  low: { color: "var(--info)", bg: "var(--info-muted)", label: "Low" },
};

const AIDesignAssistant: React.FC<AIDesignAssistantProps> = ({
  suggestions,
  onSuggestionSelect,
  selectedSuggestion,
}) => {
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
        <div
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, var(--brand-primary), var(--color-teams))",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <Sparkles size={12} style={{ color: "white" }} />
        </div>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          AI Design Assistant
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
            background: "var(--bg-surface)",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {suggestions.length} suggestions
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-2)",
        }}
      >
        {suggestions.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-6)",
              color: "var(--text-muted)",
            }}
          >
            <Sparkles size={32} style={{ marginBottom: "var(--space-3)" }} />
            <span style={{ fontSize: "var(--font-size-sm)" }}>
              No suggestions yet
            </span>
          </div>
        ) : (
          suggestions.map((suggestion, index) => {
            const isSelected = selectedSuggestion?.id === suggestion.id;
            const priorityConfig = PRIORITY_CONFIG[suggestion.priority];

            return (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onSuggestionSelect(suggestion)}
                style={{
                  width: "100%",
                  padding: "var(--space-3)",
                  marginBottom: "var(--space-2)",
                  background: isSelected
                    ? "var(--bg-elevated)"
                    : "var(--bg-surface)",
                  border: `1px solid ${isSelected ? "var(--border-strong)" : "var(--border-subtle)"}`,
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
                      background: "var(--bg-card)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    {SUGGESTION_ICONS[suggestion.type]}
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
                          fontSize: "var(--font-size-sm)",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {suggestion.title}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          background: priorityConfig.bg,
                          color: priorityConfig.color,
                          borderRadius: "var(--radius-sm)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                        marginBottom: "var(--space-2)",
                      }}
                    >
                      {suggestion.description}
                    </p>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        style={{
                          marginTop: "var(--space-2)",
                          paddingTop: "var(--space-2)",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          AI Reasoning
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "var(--font-size-xs)",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                            fontStyle: "italic",
                          }}
                        >
                          {suggestion.reasoning}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "var(--space-3)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-2)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-muted)",
                              }}
                            >
                              Confidence:
                            </span>
                            <div
                              style={{
                                width: 60,
                                height: 4,
                                background: "var(--bg-card)",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${suggestion.confidence * 100}%`,
                                  height: "100%",
                                  background:
                                    suggestion.confidence > 0.8
                                      ? "var(--success)"
                                      : suggestion.confidence > 0.5
                                        ? "var(--warning)"
                                        : "var(--error)",
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "var(--font-size-xs)",
                                fontWeight: 600,
                                color:
                                  suggestion.confidence > 0.8
                                    ? "var(--success)"
                                    : suggestion.confidence > 0.5
                                      ? "var(--warning)"
                                      : "var(--error)",
                              }}
                            >
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>

                          {suggestion.actionLabel && (
                            <button
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-1)",
                                padding: "var(--space-1) var(--space-2)",
                                background: "var(--brand-primary)",
                                border: "none",
                                borderRadius: "var(--radius-sm)",
                                color: "white",
                                fontSize: "var(--font-size-xs)",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {suggestion.actionLabel}
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>

                        {suggestion.affectedComponents.length > 0 && (
                          <div style={{ marginTop: "var(--space-2)" }}>
                            <span
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-muted)",
                              }}
                            >
                              Affects:{" "}
                            </span>
                            {suggestion.affectedComponents.map((comp, i) => (
                              <span
                                key={comp}
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--brand-primary)",
                                  background: "var(--brand-muted)",
                                  padding: "1px 4px",
                                  borderRadius: 2,
                                  marginLeft: i > 0 ? 4 : 0,
                                }}
                              >
                                {comp}
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

export default AIDesignAssistant;
