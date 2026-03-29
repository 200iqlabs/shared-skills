# Excalidraw JSON Schema for Process Maps

## File Structure

Every `.excalidraw` file follows this structure:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [...],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

## Element Types Used in Process Maps

| Type | Use For | Key Properties |
|------|---------|----------------|
| `rectangle` | Process blocks, decision nodes, start/end | width, height, fillStyle, roundness |
| `text` | Labels inside blocks (action/actor/tool), annotations | fontSize, fontFamily, containerId |
| `arrow` | Flow between steps | points, elbowed, startBinding, endBinding |
| `ellipse` | Start/end markers (optional) | width, height |
| `line` | Swim lane dividers, grouping separators | points, strokeStyle |

## Required Properties for Every Element

```json
{
  "type": "rectangle",
  "id": "unique_string_id",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 120,
  "strokeColor": "#1e3a5f",
  "backgroundColor": "#dbe4ff",
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
  "boundElements": [],
  "link": null,
  "locked": false,
  "roundness": { "type": 3 }
}
```

## Text Binding (Critical)

Labels do NOT work via a `label` property. Every labeled shape requires TWO elements:

### 1. Shape with boundElements reference:
```json
{
  "id": "step_1_rect",
  "type": "rectangle",
  "boundElements": [
    { "id": "step_1_text", "type": "text" }
  ]
}
```

### 2. Text element with containerId:
```json
{
  "id": "step_1_text",
  "type": "text",
  "containerId": "step_1_rect",
  "text": "Receive Invoice\nActor: Accountant\nTool: Email",
  "originalText": "Receive Invoice\nActor: Accountant\nTool: Email",
  "fontSize": 14,
  "fontFamily": 3,
  "textAlign": "center",
  "verticalAlign": "middle",
  "lineHeight": 1.25
}
```

The text element's `x`, `y`, `width`, `height` should be inset from the container (typically ~10px padding on each side).

## Arrow Properties

Arrows connecting process steps:

```json
{
  "id": "arrow_1_to_2",
  "type": "arrow",
  "x": 300,
  "y": 260,
  "width": 0,
  "height": 60,
  "points": [[0, 0], [0, 60]],
  "strokeColor": "#495057",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
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

**Critical:** For elbow (90-degree) arrows, set `elbowed: true` AND `roundness: null` AND `roughness: 0`.

## ID Naming Convention

Use descriptive string IDs for readability:

| Element | ID Pattern | Example |
|---------|-----------|---------|
| Process block | `step_N_rect` | `step_1_rect` |
| Block text | `step_N_text` | `step_1_text` |
| Decision | `decision_N_rect` | `decision_1_rect` |
| Arrow | `arrow_N_to_M` | `arrow_1_to_2` |
| Start node | `start_rect` | `start_rect` |
| End node | `end_rect` | `end_rect` |
| Swim lane label | `lane_NAME_label` | `lane_sales_label` |

## Seed Namespacing

Namespace seeds by section to avoid collisions:
- Start/End nodes: 100xxx
- Process steps 1-5: 200xxx
- Process steps 6-10: 300xxx
- Decision nodes: 400xxx
- Arrows: 500xxx
- Labels/annotations: 600xxx

## Decision Diamonds (Rotated Rectangles)

For diamond shapes, use a rectangle with `angle: 0.785` (45° rotation). This creates the classic diamond shape while keeping arrow bindings functional.

```json
{
  "id": "decision_1_rect",
  "type": "rectangle",
  "width": 100,
  "height": 100,
  "strokeColor": "#b45309",
  "backgroundColor": "#fef3c7",
  "strokeWidth": 2,
  "angle": 0.785,
  "roundness": null
}
```

Text inside rotated rectangles should have `angle: 0` to stay horizontal.
