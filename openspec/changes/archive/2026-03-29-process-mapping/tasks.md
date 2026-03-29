## 1. Create process-mapping skill references

- [x] 1.1 Create `skills/process-mapping/references/json-schema.md` — adapted from coleam00's JSON schema and ooiyeefei's json-format, focused on process-mapping element types (blocks, arrows, decision diamonds as styled rectangles)
- [x] 1.2 Create `skills/process-mapping/references/element-templates.md` — JSON templates for three-part blocks (action/actor/tool), arrows, start/end nodes, decision nodes
- [x] 1.3 Create `skills/process-mapping/references/color-palette.md` — default semantic palette for process elements + instructions for reading project design system (vibe-coding artifacts)
- [x] 1.4 Create `skills/process-mapping/references/arrows-and-layout.md` — arrow routing patterns adapted from ooiyeefei, process-specific layout (vertical flow, swim lanes)
- [x] 1.5 Create `skills/process-mapping/references/validation.md` — validation checklist adapted from both skills, process-specific checks (all blocks have action/actor/tool, arrows connect correctly)

## 2. Create SKILL.md

- [x] 2.1 Create `skills/process-mapping/SKILL.md` with description, instructions, block format spec, three-tier rendering (excalidraw → online API → mermaid), context-aware color loading, AS-IS/TO-BE support
- [x] 2.2 Add Context Dependencies section referencing `context/process-mapping.md` and project design system files

## 3. Create context template and update environment-setup

- [x] 3.1 Create `context/templates/process-mapping.md` — template with preferences: output format, default path, color overrides, API config
- [x] 3.2 Update `skills/environment-setup/SKILL.md` — add `context/process-mapping.md` to audit table and creation flow

## 4. Integrate with business-consultant

- [x] 4.1 Update `skills/business-consultant/SKILL.md` — replace inline mermaid instructions with reference to process-mapping skill
- [x] 4.2 Add note in discovery and analysis sections: "For process maps, invoke process-mapping skill"

## 5. Run skill-creator evaluation

- [x] 5.1 Run `/skill-creator` on `skills/process-mapping/SKILL.md`
- [x] 5.2 Generate 5+ test prompts covering: meeting notes extraction, structured input, AS-IS only, AS-IS+TO-BE, Polish requests, Excalidraw output, Mermaid fallback
- [x] 5.3 Run with-skill and without-skill tests (2 iterations, 10 agents each)
- [x] 5.4 Grade and generate benchmark (iter1: 100% vs 58%, iter2: 98% vs 36%)
- [x] 5.5 Apply fixes based on eval feedback (scope narrowing, LTR layout, diamond decisions, ⚠️ for assumed, clean response)
- [x] 5.6 Optimize description for triggering accuracy (20 trigger eval queries, manual optimization)

## 6. Verify

- [x] 6.1 Verify generated `.excalidraw` file opens correctly in Obsidian Excalidraw plugin (user confirmed via eval viewer)
- [x] 6.2 Verify Mermaid fallback works and shows action/actor/tool (eval 4 mermaid-helpdesk passed)
- [ ] 6.3 Verify context-aware colors load from design system when present (not tested — no design system in test project)
- [x] 6.4 Verify business-consultant correctly references process-mapping skill
- [x] 6.5 Verify environment-setup includes process-mapping in audit
