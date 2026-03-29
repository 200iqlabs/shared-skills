# Arrows and Layout for Process Maps

## Layout Patterns

### Horizontal Flow (Default — Left to Right)

Standard left-to-right process flow. Default for all process maps.

```
START → Step 1 → Step 2 → Decision → Step 3a → Step 4 → END
   (x:20)  (x:240) (x:460)  (x:680)    ↘         ↗
                                      Step 3b
```

**Coordinates:**
- Element width: 220px
- Element height: 100px (process blocks), 100px (decision diamonds), 50px (start/end)
- Horizontal gap between elements: 40px
- Main row Y: 100px
- For branching: main row y: 100px, alternate branch y: 260px
- Each element x = previous element x + previous width + 40px gap

### Vertical Flow (On Request Only)

Use only when the user requests top-to-bottom, or for very short processes (≤4 steps).

```
START (y: 20)
  ↓ gap: 40px
Step 1 (y: 110)
  ↓ gap: 40px
Step 2 (y: 250)
```

**Coordinates:**
- Same element sizes as horizontal
- Vertical gap: 40px
- Center X for single column: 150px

### Swim Lane Layout

Horizontal lanes separating actors/departments. Best when showing handoffs between teams.

```
         Lane: Sales        Lane: Finance       Lane: IT
         (x: 50-270)       (x: 300-520)        (x: 550-770)
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
         [Step 1]  ─────→  [Step 2]
                                    ─────→      [Step 3]
                            [Step 4]  ←─────    [Step 5]
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
```

**Coordinates:**
- Lane width: 250px per lane
- Lane gap: 30px
- Lane label: free-floating text at top of each lane
- Lane divider: dashed horizontal line

### Side-by-Side (AS-IS vs TO-BE)

Both flows on one canvas, AS-IS on top, TO-BE below. Both flow left-to-right.

```
  AS-IS: Current Process (y: 0)
  START → [Step 1] → [Step 2] → [Step 3] → END

  ─ ─ ─ ─ ─ ─ horizontal divider ─ ─ ─ ─ ─ ─

  TO-BE: Target Process (y: 300)
  START → [Step 1] → [Step 2 - Auto ★] → END
                      (Step 3 eliminated ✗)
```

**Coordinates:**
- AS-IS flow: y: 50 (elements), title at y: 0
- Horizontal divider: y: 220 (dashed line spanning full width)
- TO-BE flow: y: 280 (elements), title at y: 240
- Both flows use standard LTR horizontal layout
- Section titles are free-floating text at left edge

## Arrow Routing

### Straight Down (Most Common)

Source bottom center → Target top center.

```json
{
  "x": 260,
  "y": 200,
  "points": [[0, 0], [0, 40]],
  "width": 0,
  "height": 40
}
```

Arrow `x` = source.x + source.width/2
Arrow `y` = source.y + source.height

### Elbow Arrow (L-Shape)

For branching from decisions. Goes down then sideways, or sideways then down.

**Down then right:**
```json
{
  "x": 260,
  "y": 370,
  "points": [[0, 0], [0, 30], [200, 30], [200, 70]],
  "width": 200,
  "height": 70
}
```

**Down then left:**
```json
{
  "x": 260,
  "y": 370,
  "points": [[0, 0], [0, 30], [-200, 30], [-200, 70]],
  "width": 200,
  "height": 70
}
```

### Horizontal Arrow (Swim Lane Handoff)

For cross-lane flow:

```json
{
  "x": 270,
  "y": 145,
  "points": [[0, 0], [80, 0]],
  "width": 80,
  "height": 0
}
```

### Convergence Arrow (Merge Back)

Two branches merging into one step. Use L-shape from each branch.

```json
// Left branch converging right
{
  "points": [[0, 0], [0, 30], [150, 30], [150, 70]]
}

// Right branch converging left
{
  "points": [[0, 0], [0, 30], [-150, 30], [-150, 70]]
}
```

### Feedback Loop Arrow (Return to Earlier Step)

When a step loops back to an earlier step (e.g., "fix and retry"), route the arrow **below** the main flow to avoid crossing elements:

```
Step A → Step B → Step C → Decision
                              ↓ (Nie)
                          Fix Step
                              ↓
         ←←←←←←←←←←←←←←←←←←←←  (arrow goes below, enters Step B from bottom)
```

The return arrow should:
1. Exit the fix step going **down**
2. Route **below** the main flow line
3. Enter the target step from the **bottom edge**

This keeps the main LTR flow clean and readable. Use `strokeStyle: "dashed"` for feedback loops to distinguish them from main flow.

## Arrow Edge Calculations

Arrows must start/end at shape edges, not centers:

| Edge | Formula |
|------|---------|
| Top center | `(x + width/2, y)` |
| Bottom center | `(x + width/2, y + height)` |
| Left center | `(x, y + height/2)` |
| Right center | `(x + width, y + height/2)` |

## Staggering Multiple Arrows

When multiple arrows leave the same edge, stagger their positions:

| Count | Positions (% of edge width) |
|-------|---------------------------|
| 2 arrows | 35%, 65% |
| 3 arrows | 25%, 50%, 75% |
| 4 arrows | 20%, 40%, 60%, 80% |

## Critical Rules

1. **Always set `elbowed: true`** for multi-point arrows (90-degree corners)
2. **Always set `roundness: null`** for elbowed arrows (sharp corners)
3. **Always set `roughness: 0`** for clean process maps
4. **Arrow points are relative** to the arrow's `x, y` position
5. **Width and height** of arrow = bounding box of all points
6. **Both bindings** must reference existing element IDs
7. **Gap: 5** between arrow endpoint and shape edge for visual clarity
