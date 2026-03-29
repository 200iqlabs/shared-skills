# Validation Checklist for Process Maps

Run through this checklist before delivering a process map.

## Process-Specific Checks

- [ ] **Every process block has three parts:** action name, actor, tool — or explicit `?` for unknowns
- [ ] **Start and End nodes exist** — every process has a clear entry and exit
- [ ] **No orphan steps** — every step has at least one incoming or outgoing arrow
- [ ] **Decision branches are labeled** — "Yes"/"No" or descriptive labels on each branch
- [ ] **All branches converge** — branching paths merge back (or lead to separate end nodes)
- [ ] **Steps are in logical order** — the flow makes sense when traced top-to-bottom

## AS-IS / TO-BE Specific

- [ ] **Changed steps are visually distinct** — automated steps use purple palette
- [ ] **Removed steps are marked** — dashed stroke with risk/warning colors
- [ ] **Both maps have same structure where unchanged** — easy to compare side-by-side
- [ ] **Section titles present** — "AS-IS: [name]" and "TO-BE: [name]" headers

## JSON Structure Checks

- [ ] **Every shape with text has `boundElements`** referencing the text element
- [ ] **Every text inside a shape has `containerId`** referencing the shape
- [ ] **No duplicate IDs** — every `id` is unique across the entire file
- [ ] **All arrow bindings reference existing elements** — `startBinding.elementId` and `endBinding.elementId` match real IDs
- [ ] **Elbowed arrows have correct properties** — `elbowed: true`, `roundness: null`, `roughness: 0`
- [ ] **Arrow width/height matches points bounding box** — calculate from min/max of all points
- [ ] **No diamond shapes** — use styled rectangles for decisions (diamonds break arrow bindings)

## Layout Checks

- [ ] **Consistent spacing** — vertical gaps between steps are uniform (40px default)
- [ ] **No overlapping elements** — blocks and arrows don't overlap unintentionally
- [ ] **Text fits in containers** — block text doesn't overflow its rectangle
- [ ] **Arrows don't cross through elements** — route around, not through
- [ ] **Swim lane labels are aligned** — if using lanes, labels are at consistent positions
- [ ] **Balanced composition** — no large empty areas next to cramped areas

## Color Checks

- [ ] **Semantic colors are consistent** — same element type uses same colors throughout
- [ ] **Color palette source is documented** — using project design system, context, or defaults
- [ ] **Sufficient contrast** — text is readable against its background
- [ ] **Start/End use distinct colors** — orange for start, green for end

## Common Fixes

| Issue | Fix |
|-------|-----|
| Text overflows block | Increase block height (add 25px per text line) |
| Arrows cross through blocks | Add intermediate waypoints to route around |
| Labels not visible | Check `containerId` matches shape `id`, ensure `boundElements` includes text |
| Arrow points to wrong element | Verify `startBinding.elementId` and `endBinding.elementId` |
| Decision has no branches | Add at least two outgoing arrows with labels |
| Uneven spacing | Standardize y-coordinates: each row = previous row + element height + 40px gap |
| Block too narrow for text | Minimum width: 200px for three-line block text |
