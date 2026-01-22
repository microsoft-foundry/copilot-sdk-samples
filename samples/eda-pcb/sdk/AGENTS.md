# AGENTS.md - EDA PCB Design

Sample-specific guidance for AI agents.

## Key Patterns

- **Multi-step pipeline**: Board analysis -> DRC -> Routing -> Signal integrity -> Export
- **ConnectorResult pattern**: All methods return `{ success, data?, error? }`
- **Design validation**: Progressive checks before manufacturing export

## Files to Understand

| File                     | Purpose                                                 |
| ------------------------ | ------------------------------------------------------- |
| `services/pcb-design.js` | PCB operations (DRC, routing, signal analysis)          |
| `connectors/eda.js`      | EDA tool abstraction with mock/live modes               |
| `types/index.ts`         | `BoardSummary`, `RoutingAnalysis`, `DesignHealthReport` |

## Testing

```bash
pnpm test samples/eda-pcb
```

Mock connector provides realistic PCB design data for testing.

## Extension Points

- Add analysis methods in `pcb-design.js`
- Extend connector for additional EDA tools (KiCad, Altium, Eagle)
- Add new types for thermal analysis, 3D visualization
