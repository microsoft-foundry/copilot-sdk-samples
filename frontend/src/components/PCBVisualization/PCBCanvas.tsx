import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Move, Layers, Eye, EyeOff } from "lucide-react";
import type { PCBBoard, PCBComponent, DRCViolation, Point } from "./types";

interface PCBCanvasProps {
  board: PCBBoard;
  violations: DRCViolation[];
  selectedViolation: DRCViolation | null;
  highlightedComponents: string[];
  onComponentClick?: (component: PCBComponent) => void;
  onViolationClick?: (violation: DRCViolation) => void;
}

const LAYER_COLORS: Record<string, string> = {
  top: "#22c55e",
  L1: "#22c55e",
  L2: "#3b82f6",
  L3: "#f59e0b",
  L4: "#ef4444",
  bottom: "#ef4444",
  power: "#f59e0b",
  ground: "#3b82f6",
};

const PCBCanvas: React.FC<PCBCanvasProps> = ({
  board,
  violations,
  selectedViolation,
  highlightedComponents,
  onComponentClick,
  onViolationClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [showLayers, setShowLayers] = useState({
    top: true,
    inner: true,
    bottom: true,
    traces: true,
    vias: true,
  });
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const scale = useCallback((value: number) => value * zoom * 4, [zoom]);

  const transformPoint = useCallback(
    (p: Point): Point => ({
      x: scale(p.x) + offset.x + 40,
      y: scale(p.y) + offset.y + 40,
    }),
    [scale, offset],
  );

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, rect.width, rect.height);

    const boardStart = transformPoint({ x: 0, y: 0 });
    const boardEnd = transformPoint({ x: board.width, y: board.height });

    ctx.fillStyle = "#1a472a";
    ctx.fillRect(
      boardStart.x,
      boardStart.y,
      boardEnd.x - boardStart.x,
      boardEnd.y - boardStart.y,
    );

    ctx.strokeStyle = "#2d5a3d";
    ctx.lineWidth = 1;
    const gridSize = scale(5);
    for (let x = boardStart.x; x <= boardEnd.x; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, boardStart.y);
      ctx.lineTo(x, boardEnd.y);
      ctx.stroke();
    }
    for (let y = boardStart.y; y <= boardEnd.y; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(boardStart.x, y);
      ctx.lineTo(boardEnd.x, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      boardStart.x,
      boardStart.y,
      boardEnd.x - boardStart.x,
      boardEnd.y - boardStart.y,
    );

    if (showLayers.traces) {
      board.traces.forEach((trace) => {
        if (trace.points.length < 2) return;

        const layerColor = LAYER_COLORS[trace.layer] || "#22c55e";
        ctx.strokeStyle = trace.status === "error" ? "#ef4444" : layerColor;
        ctx.lineWidth = Math.max(scale(trace.width), 1);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        const start = transformPoint(trace.points[0]);
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < trace.points.length; i++) {
          const p = transformPoint(trace.points[i]);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      });
    }

    if (showLayers.vias) {
      board.vias.forEach((via) => {
        const p = transformPoint(via.position);
        const size = scale(via.size);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24";
        ctx.fill();
        ctx.strokeStyle = "#a16207";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, size / 4, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a0a";
        ctx.fill();
      });
    }

    board.components.forEach((comp) => {
      if (comp.layer === "bottom" && !showLayers.bottom) return;
      if (comp.layer === "top" && !showLayers.top) return;

      const p = transformPoint(comp.position);
      const w = scale(comp.width);
      const h = scale(comp.height);

      const isHighlighted = highlightedComponents.includes(comp.id);
      const isHovered = hoveredComponent === comp.id;
      const isCritical = comp.isCritical;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((comp.rotation * Math.PI) / 180);

      let fillColor = "#374151";
      let strokeColor = "#6b7280";

      if (isHighlighted) {
        fillColor = "#7c3aed20";
        strokeColor = "#a78bfa";
      } else if (isHovered) {
        fillColor = "#4b5563";
        strokeColor = "#9ca3af";
      } else if (isCritical) {
        fillColor = "#1e3a5f";
        strokeColor = "#3b82f6";
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isHighlighted || isHovered ? 2 : 1;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      comp.pins.forEach((pin) => {
        const pinSize = scale(0.3);
        const pinX = scale(pin.position.x - comp.position.x);
        const pinY = scale(pin.position.y - comp.position.y);

        ctx.beginPath();
        ctx.arc(pinX, pinY, pinSize, 0, Math.PI * 2);
        ctx.fillStyle = pin.netId ? "#fbbf24" : "#6b7280";
        ctx.fill();
      });

      ctx.restore();

      if (zoom > 0.8) {
        ctx.fillStyle = isHighlighted ? "#a78bfa" : "#d1d5db";
        ctx.font = `${Math.max(10, scale(1.5))}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(comp.designator, p.x, p.y + h / 2 + 4);
      }
    });

    violations.forEach((violation) => {
      const p = transformPoint(violation.location);
      const isSelected = selectedViolation?.id === violation.id;
      const size = isSelected ? 16 : 12;

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

      if (violation.severity === "error") {
        ctx.fillStyle = isSelected ? "#ef4444" : "#ef444480";
        ctx.strokeStyle = "#ef4444";
      } else if (violation.severity === "warning") {
        ctx.fillStyle = isSelected ? "#f59e0b" : "#f59e0b80";
        ctx.strokeStyle = "#f59e0b";
      } else {
        ctx.fillStyle = isSelected ? "#3b82f6" : "#3b82f680";
        ctx.strokeStyle = "#3b82f6";
      }

      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", p.x, p.y);

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff40";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [
    board,
    violations,
    selectedViolation,
    highlightedComponents,
    hoveredComponent,
    showLayers,
    transformPoint,
    scale,
    zoom,
  ]);

  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

  useEffect(() => {
    const handleResize = () => drawBoard();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawBoard]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = false;
    for (const comp of board.components) {
      const p = transformPoint(comp.position);
      const w = scale(comp.width);
      const h = scale(comp.height);

      if (
        x >= p.x - w / 2 &&
        x <= p.x + w / 2 &&
        y >= p.y - h / 2 &&
        y <= p.y + h / 2
      ) {
        setHoveredComponent(comp.id);
        found = true;
        break;
      }
    }
    if (!found) setHoveredComponent(null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const violation of violations) {
      const p = transformPoint(violation.location);
      const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2);
      if (dist <= 16) {
        onViolationClick?.(violation);
        return;
      }
    }

    for (const comp of board.components) {
      const p = transformPoint(comp.position);
      const w = scale(comp.width);
      const h = scale(comp.height);

      if (
        x >= p.x - w / 2 &&
        x <= p.x + w / 2 &&
        y >= p.y - h / 2 &&
        y <= p.y + h / 2
      ) {
        onComponentClick?.(comp);
        return;
      }
    }
  };

  const handleZoom = (delta: number) => {
    setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "relative",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-default)",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "var(--space-2)",
          left: "var(--space-2)",
          display: "flex",
          gap: "var(--space-1)",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => handleZoom(0.2)}
          style={{
            padding: "var(--space-2)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          style={{
            padding: "var(--space-2)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          style={{
            padding: "var(--space-2)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Move size={14} />
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: "var(--space-2)",
          right: "var(--space-2)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "var(--space-2) var(--space-3)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Layers size={12} />
          <span>Layers</span>
        </div>
        {Object.entries(showLayers).map(([layer, visible]) => (
          <button
            key={layer}
            onClick={() =>
              setShowLayers((l) => ({
                ...l,
                [layer]: !l[layer as keyof typeof l],
              }))
            }
            style={{
              padding: "var(--space-1) var(--space-2)",
              background: visible ? "var(--bg-elevated)" : "var(--bg-card)",
              border: `1px solid ${visible ? "var(--border-strong)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: visible ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: "var(--font-size-xs)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              textTransform: "capitalize",
            }}
          >
            {visible ? <Eye size={10} /> : <EyeOff size={10} />}
            {layer}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        style={{
          width: "100%",
          height: "100%",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      />

      {hoveredComponent && (
        <div
          style={{
            position: "absolute",
            bottom: "var(--space-2)",
            left: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
          }}
        >
          {board.components.find((c) => c.id === hoveredComponent)?.designator}{" "}
          - {board.components.find((c) => c.id === hoveredComponent)?.name}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "var(--space-2)",
          right: "var(--space-2)",
          padding: "var(--space-1) var(--space-2)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
    </motion.div>
  );
};

export default PCBCanvas;
