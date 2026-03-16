## 1. Create process-mapping skill

- [ ] 1.1 Create `skills/process-mapping/SKILL.md` with description, instructions, block format spec, and Excalidraw/Mermaid rendering logic
- [ ] 1.2 Research Excalidraw API via context7 — determine best approach for generating diagrams programmatically
- [ ] 1.3 Create `skills/process-mapping/references/block-format.md` with examples of three-part blocks (action/actor/tool) in both Excalidraw and Mermaid formats
- [ ] 1.4 Create `skills/process-mapping/references/excalidraw-api.md` with API usage patterns and authentication setup

## 2. Integrate with business-consultant

- [ ] 2.1 Update `skills/business-consultant/SKILL.md` — replace inline mermaid instructions with reference to process-mapping skill
- [ ] 2.2 Add note in discovery and analysis sections: "For process maps, invoke process-mapping skill"

## 3. Run skill-creator evaluation

- [ ] 3.1 Run `/skill-creator` on `skills/process-mapping/SKILL.md`
- [ ] 3.2 Generate 5+ test prompts covering: meeting notes extraction, structured input, AS-IS only, AS-IS+TO-BE, Polish requests
- [ ] 3.3 Run with-skill and without-skill tests
- [ ] 3.4 Grade and generate benchmark
- [ ] 3.5 Apply fixes based on eval feedback
- [ ] 3.6 Optimize description for triggering accuracy

## 4. Verify

- [ ] 4.1 Verify Mermaid fallback works without Excalidraw configuration
- [ ] 4.2 Verify block format shows action/actor/tool in both rendering modes
- [ ] 4.3 Verify business-consultant correctly references process-mapping skill
