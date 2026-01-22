# EDA PCB Design (SDK)

PCB design analysis and validation for Electronic Design Automation workflows.

## What This Demonstrates

- Board summary and component inventory
- Component placement analysis
- Design Rule Check (DRC) validation
- Routing analysis and auto-routing
- Signal integrity analysis
- Manufacturing file export

## SDK Usage

```typescript
import { runSample, createClient } from "../../../shared/client.js";
import { createEDAConnector } from "./connectors/eda.js";
import { createPCBDesignService } from "./services/pcb-design.js";

await runSample({ name: "eda-pcb" }, async (client) => {
  const connector = createEDAConnector({ mode: "mock" });
  const pcb = createPCBDesignService(connector);
  const health = await pcb.getDesignHealthReport(boardId);
});
```

## Running

```bash
pnpm eda-pcb
```

## Key Files

| File                     | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `index.ts`               | Sample entry point with design analysis demo |
| `services/pcb-design.js` | PCB analysis operations                      |
| `connectors/eda.js`      | EDA tool connector with mock support         |
| `types/index.ts`         | Board, component, routing types              |
