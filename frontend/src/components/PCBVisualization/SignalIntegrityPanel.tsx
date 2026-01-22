import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { SignalIntegrityResult } from "./types";

interface SignalIntegrityPanelProps {
  results: SignalIntegrityResult[];
  selectedNet: string | null;
  onNetSelect: (netId: string) => void;
}

const SignalIntegrityPanel: React.FC<SignalIntegrityPanelProps> = ({
  results,
  selectedNet,
  onNetSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedResult = results.find((r) => r.netId === selectedNet);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedResult) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, rect.width, rect.height);

    const waveform = selectedResult.waveform;
    if (waveform.length === 0) return;

    ctx.strokeStyle = "#1c1c1c";
    ctx.lineWidth = 1;

    const gridXCount = 10;
    const gridYCount = 6;

    for (let i = 0; i <= gridXCount; i++) {
      const x = (i / gridXCount) * rect.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    for (let i = 0; i <= gridYCount; i++) {
      const y = (i / gridYCount) * rect.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();

    const min = Math.min(...waveform);
    const max = Math.max(...waveform);
    const range = max - min || 1;
    const padding = 20;

    const color = selectedResult.passed ? "#22c55e" : "#ef4444";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    waveform.forEach((value, index) => {
      const x = (index / (waveform.length - 1)) * rect.width;
      const normalizedValue = (value - min) / range;
      const y = padding + (1 - normalizedValue) * (rect.height - 2 * padding);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [selectedResult]);

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

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
        <Activity size={16} style={{ color: "var(--info)" }} />
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Signal Integrity
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "2px 6px",
              background: "var(--success-muted)",
              color: "var(--success)",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
            }}
          >
            {passedCount} pass
          </span>
          {failedCount > 0 && (
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
              {failedCount} fail
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          style={{
            width: 180,
            borderRight: "1px solid var(--border-subtle)",
            overflowY: "auto",
            padding: "var(--space-2)",
          }}
        >
          {results.map((result) => (
            <button
              key={result.netId}
              onClick={() => onNetSelect(result.netId)}
              style={{
                width: "100%",
                padding: "var(--space-2) var(--space-3)",
                marginBottom: "var(--space-1)",
                background:
                  selectedNet === result.netId
                    ? "var(--bg-elevated)"
                    : "transparent",
                border:
                  selectedNet === result.netId
                    ? "1px solid var(--border-strong)"
                    : "1px solid transparent",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              {result.passed ? (
                <CheckCircle2
                  size={12}
                  style={{ color: "var(--success)", flexShrink: 0 }}
                />
              ) : (
                <XCircle
                  size={12}
                  style={{ color: "var(--error)", flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {result.netName}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {result.impedance}Ω
                  {result.impedanceTarget && ` / ${result.impedanceTarget}Ω`}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              flex: 1,
              padding: "var(--space-3)",
            }}
          >
            {selectedResult ? (
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-sm)",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Select a net to view waveform
              </div>
            )}
          </div>

          {selectedResult && (
            <div
              style={{
                padding: "var(--space-3)",
                borderTop: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-2)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {selectedResult.netName}
                </span>
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    padding: "2px 8px",
                    background: selectedResult.passed
                      ? "var(--success-muted)"
                      : "var(--error-muted)",
                    color: selectedResult.passed
                      ? "var(--success)"
                      : "var(--error)",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 600,
                  }}
                >
                  {selectedResult.passed ? "PASS" : "FAIL"}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-2)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Impedance
                  </div>
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedResult.impedance}Ω
                  </div>
                </div>
                {selectedResult.impedanceTarget && (
                  <div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-muted)",
                      }}
                    >
                      Target
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-sm)",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {selectedResult.impedanceTarget}Ω
                    </div>
                  </div>
                )}
              </div>

              {selectedResult.issues.length > 0 && (
                <div style={{ marginTop: "var(--space-2)" }}>
                  {selectedResult.issues.map((issue, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--warning)",
                        marginTop: "var(--space-1)",
                      }}
                    >
                      <AlertTriangle size={10} />
                      {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SignalIntegrityPanel;
