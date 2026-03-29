# Element Templates for Process Maps

Copy-paste JSON templates for each process map element. Pull colors from `color-palette.md`.

## Three-Part Process Block

The core element of every process map. Contains action name (dominant), actor, and tool (secondary, visually separated).

A block consists of 3 elements grouped together:
1. **Main rectangle** — the container with background color
2. **Action text** — the action name, bold, larger font, bound to the rectangle
3. **Details text** — actor + tool, smaller font, muted color, free-floating below a divider line

### Main rectangle:
```json
{
  "type": "rectangle",
  "id": "step_1_rect",
  "x": 150,
  "y": 100,
  "width": 220,
  "height": 100,
  "strokeColor": "#1e3a5f",
  "backgroundColor": "#dbe4ff",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "angle": 0,
  "seed": 200001,
  "version": 1,
  "versionNonce": 200002,
  "isDeleted": false,
  "groupIds": ["group_step_1"],
  "boundElements": [
    { "id": "step_1_action_text", "type": "text" },
    { "id": "arrow_0_to_1", "type": "arrow" },
    { "id": "arrow_1_to_2", "type": "arrow" }
  ],
  "link": null,
  "locked": false,
  "roundness": { "type": 3 }
}
```

### Action text (bound to rectangle, top half):
```json
{
  "type": "text",
  "id": "step_1_action_text",
  "x": 160,
  "y": 108,
  "width": 200,
  "height": 30,
  "text": "Receive Invoice",
  "originalText": "Receive Invoice",
  "fontSize": 16,
  "fontFamily": 3,
  "textAlign": "center",
  "verticalAlign": "top",
  "strokeColor": "#1e3a5f",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "angle": 0,
  "seed": 200003,
  "version": 1,
  "versionNonce": 200004,
  "isDeleted": false,
  "groupIds": ["group_step_1"],
  "boundElements": null,
  "link": null,
  "locked": false,
  "containerId": "step_1_rect",
  "lineHeight": 1.25
}
```

### Divider line (visual separator within block):
```json
{
  "type": "line",
  "id": "step_1_divider",
  "x": 155,
  "y": 145,
  "width": 210,
  "height": 0,
  "points": [[0, 0], [210, 0]],
  "strokeColor": "#ced4da",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 60,
  "groupIds": ["group_step_1"]
}
```

### Details text (actor + tool, below divider, free-floating):
```json
{
  "type": "text",
  "id": "step_1_details_text",
  "x": 160,
  "y": 152,
  "width": 200,
  "height": 40,
  "text": "Accountant\nEmail",
  "originalText": "Accountant\nEmail",
  "fontSize": 12,
  "fontFamily": 3,
  "textAlign": "center",
  "verticalAlign": "top",
  "strokeColor": "#868e96",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "groupIds": ["group_step_1"]
}
```

**Block text structure:**
- Top section: **Action name** (16px, container stroke color, bold feel)
- Divider line
- Bottom section: **Actor** line + **Tool** line (12px, muted gray)

If actor or tool is unknown, use `?`:
```
Top: Review Document
Bottom: ?
        ?
```

If data is assumed (not from user input), append ⚠️ emoji:
```
Top: Log Ticket
Bottom: BOK Employee
        Ticketing System ⚠️
```

The ⚠️ is more visually distinctive than text markers on diagrams. In the text response, you can write "Ticketing System [assumed]" — but on the diagram itself, use ⚠️.

## Start Node

```json
{
  "type": "rectangle",
  "id": "start_rect",
  "x": 180,
  "y": 20,
  "width": 160,
  "height": 50,
  "strokeColor": "#c2410c",
  "backgroundColor": "#fed7aa",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "angle": 0,
  "seed": 100001,
  "version": 1,
  "versionNonce": 100002,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": [
    { "id": "start_text", "type": "text" },
    { "id": "arrow_start_to_1", "type": "arrow" }
  ],
  "link": null,
  "locked": false,
  "roundness": { "type": 3, "value": 25 }
}
```

```json
{
  "type": "text",
  "id": "start_text",
  "x": 190,
  "y": 32,
  "width": 140,
  "height": 25,
  "text": "START",
  "originalText": "START",
  "fontSize": 16,
  "fontFamily": 3,
  "textAlign": "center",
  "verticalAlign": "middle",
  "strokeColor": "#c2410c",
  "containerId": "start_rect",
  "lineHeight": 1.25
}
```

## End Node

```json
{
  "type": "rectangle",
  "id": "end_rect",
  "strokeColor": "#047857",
  "backgroundColor": "#a7f3d0",
  "roundness": { "type": 3, "value": 25 }
}
```
(Same structure as Start, different colors. Text: "END" or process outcome.)

## Decision / Gateway Node (Diamond)

Use a rotated rectangle to create a diamond shape. Set `angle: 0.785` (π/4 radians = 45°) to rotate the square so corners point up/down/left/right.

```json
{
  "type": "rectangle",
  "id": "decision_1_rect",
  "x": 160,
  "y": 300,
  "width": 100,
  "height": 100,
  "strokeColor": "#b45309",
  "backgroundColor": "#fef3c7",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "angle": 0.785,
  "seed": 400001,
  "version": 1,
  "versionNonce": 400002,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": [
    { "id": "decision_1_text", "type": "text" }
  ],
  "roundness": null
}
```

Text inside the diamond — keep short (one line ideally):
```json
{
  "type": "text",
  "id": "decision_1_text",
  "containerId": "decision_1_rect",
  "text": "Valid?",
  "fontSize": 14,
  "textAlign": "center",
  "verticalAlign": "middle",
  "angle": 0
}
```

**Note:** The text element has `angle: 0` (horizontal) even though the container is rotated. This keeps text readable.

**Arrow routing for diamonds — use corners, not edges:**

In a 45° rotated square, the 4 corners become cardinal points. Arrows MUST connect at these corners:

```
        Top corner (Tak/Yes)
           ↑
Left corner → ◇ → Right corner
           ↓
       Bottom corner (Nie/No)
```

- **Incoming arrow** → enters at the **left corner**
- **"Tak/Yes" branch** → exits from the **top corner**
- **"Nie/No" branch** → exits from the **bottom corner**
- **Right corner** → used only if there's a third branch (rare)

For a diamond at position (x, y) with width=100, height=100 and angle=0.785:
- Left corner: `(x, y + height/2)` — arrow entry point
- Top corner: `(x + width/2, y)` — "Tak" exit
- Bottom corner: `(x + width/2, y + height)` — "Nie" exit
- Right corner: `(x + width, y + height/2)` — rarely used

This ensures arrows visually enter and exit at diamond tips, not at flat edges.

## Arrow (Vertical — Top to Bottom)

```json
{
  "type": "arrow",
  "id": "arrow_1_to_2",
  "x": 260,
  "y": 190,
  "width": 0,
  "height": 50,
  "points": [[0, 0], [0, 50]],
  "strokeColor": "#495057",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "angle": 0,
  "seed": 500001,
  "version": 1,
  "versionNonce": 500002,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": null,
  "link": null,
  "locked": false,
  "elbowed": true,
  "roundness": null,
  "startBinding": {
    "elementId": "step_1_rect",
    "focus": 0,
    "gap": 5
  },
  "endBinding": {
    "elementId": "step_2_rect",
    "focus": 0,
    "gap": 5
  },
  "startArrowhead": null,
  "endArrowhead": "arrow"
}
```

## Arrow with Label (Decision Branch)

For "Yes"/"No" branches from decisions, add a free-floating text label near the arrow:

```json
{
  "type": "text",
  "id": "arrow_label_yes",
  "x": 270,
  "y": 375,
  "width": 30,
  "height": 20,
  "text": "Yes",
  "originalText": "Yes",
  "fontSize": 12,
  "fontFamily": 3,
  "textAlign": "left",
  "verticalAlign": "top",
  "strokeColor": "#047857"
}
```

## Automated Step (TO-BE Highlight)

Same as regular process block but with automation colors:

```json
{
  "strokeColor": "#6d28d9",
  "backgroundColor": "#ddd6fe"
}
```

Text format for automated steps:
```
Auto-Generate Invoice
Actor: System
Tool: ERP API
```

## Swim Lane Divider

Horizontal line separating responsibility zones:

```json
{
  "type": "line",
  "id": "lane_divider_1",
  "x": 50,
  "y": 250,
  "width": 500,
  "height": 0,
  "points": [[0, 0], [500, 0]],
  "strokeColor": "#ced4da",
  "strokeWidth": 1,
  "strokeStyle": "dashed",
  "roughness": 0,
  "opacity": 100
}
```

With a lane label (free-floating text):

```json
{
  "type": "text",
  "id": "lane_sales_label",
  "x": 10,
  "y": 255,
  "text": "Sales Team",
  "fontSize": 12,
  "fontFamily": 3,
  "strokeColor": "#868e96"
}
```

## Section Title (Free-Floating)

For AS-IS / TO-BE section headers:

```json
{
  "type": "text",
  "id": "section_asis_title",
  "x": 150,
  "y": 0,
  "width": 220,
  "height": 30,
  "text": "AS-IS: Current Process",
  "originalText": "AS-IS: Current Process",
  "fontSize": 20,
  "fontFamily": 3,
  "textAlign": "center",
  "verticalAlign": "top",
  "strokeColor": "#1e3a5f"
}
```
