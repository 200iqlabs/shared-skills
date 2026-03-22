---
name: vibe-coding
description: Guide for creating modern, professional UI without UX/UI design knowledge using AI-driven "vibe coding" approach. Use when the user wants to create frontend interfaces, landing pages, web components, or design systems by describing vibes/feelings instead of precise mockups. Supports React + Vite + Tailwind CSS 4 + shadcn/ui workflow with design briefs, style references, design tokens, and production-ready component generation. Ideal for developers without design background who want to build attractive, accessible interfaces.
license: Apache-2.0
---

# Vibe Coding

Create modern, professional UI without UX/UI design knowledge using AI-driven "vibe coding" - describe the vibe and feeling you want, not pixel-perfect designs.

## What is Vibe Coding?

Vibe coding is an approach to creating interfaces where you describe the **vibe and impression** you want to achieve instead of precise mockups. AI translates your description into production-ready code.

This democratizes UI creation - even without design skills, you can create professional-looking interfaces.

## Three Pillars of Successful Vibe Coding

### 1. Good Foundation (Starter Kit)

Never start from scratch. Use a proven boilerplate with:
- Configured tools (Vite, React, Tailwind CSS 4)
- Base design system (colors, typography, spacing)
- Core components

**Recommended:** [Vibe Coding Starter Kit](https://github.com/PageAI-Pro/vibe-coding-starter) - React + Vite + Tailwind CSS 4 + shadcn/ui

**Note:** Tailwind CSS 4 requires Node.js 20+ and modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+).

See [references/starter-setup.md](references/starter-setup.md) for setup instructions.

### 2. Good Prompts

Know **how to communicate with AI** to get sensible results. Use proven prompt templates from:
- **[references/design-brief-prompt.md](references/design-brief-prompt.md)** - Create comprehensive design briefs
- **[references/implementation-prompt.md](references/implementation-prompt.md)** - Generate production-ready components

### 3. Good Context

AI must understand:
- Your design system (colors, fonts, spacing)
- Libraries you use (Tailwind, shadcn/ui)
- Style you're building (minimalist, bold, glassmorphic)

**Without context:** Generic, "AI-looking" design
**With context:** Unique, professional design

See [references/design-system-template.md](references/design-system-template.md) for creating AI design style references.

## Workflow

### Step 1: Define Design Brief

Before requesting code, clarify **what you want**. Use the prompt template from [references/design-brief-prompt.md](references/design-brief-prompt.md) to define:

1. **Design Style & Aesthetic** - Visual style, mood, design movements
2. **Target Audience** - Users, preferences, devices
3. **Key Features & Priorities** - Core features, primary actions, highlights

Result: Clear brief for subsequent prompts.

### Step 2: Create AI Design Style Reference

Create a document that AI uses as reference for the **entire project**. Use [references/design-system-template.md](references/design-system-template.md) to define:

- **Visual Style** - Overall aesthetic, color palette, typography, spacing
- **Layout Structures** - When to use different layout types
- **Color Themes** - Dark/light mode, accent colors

Save as `design-reference.md` and attach in AI context (Cursor, Claude, ChatGPT).

### Step 3: Set Up Design Tokens

In Tailwind CSS 4, design tokens are defined using `@theme` in your CSS file instead of JavaScript config.

Use the template from [assets/templates/design-tokens.css](assets/templates/design-tokens.css).

Design tokens are your **single source of truth** for colors, spacing, typography.

1. Create or import design tokens in your main CSS file using `@theme`
2. Tailwind 4 automatically generates CSS variables from your theme
3. Reference in prompts: "Use colors and spacing from our design tokens"

AI will adhere to your design system.

### Step 4: Implement with AI

Use the implementation prompt template from [references/implementation-prompt.md](references/implementation-prompt.md) to generate production-ready React components.

## Best Practices

### Start with Small Components

Don't generate entire pages. Start with:
- Button
- Card
- Input
- Navigation

With base components, AI easily composes them into larger layouts.

### Iterate on Live Code

Vibe coding is iterative:

1. Generate first version
2. View in browser
3. Refine prompt ("Make button larger, add hover effect")
4. Regenerate
5. Repeat

### Use Screenshots as Input

AI (especially Claude with vision) can recreate designs from images. Find inspiration on Dribbble/Behance, screenshot, paste to AI:

```
Recreate this design using React and Tailwind CSS.
Maintain the layout and color scheme, but adapt it to our design system.
```

### Keep Documentation Alongside

Attach to context:
- `design-reference.md` - Your style guide
- `design-tokens.css` or main CSS file with `@theme` - Design system
- `component-patterns.md` - How you use your components

AI will stay consistent with your project.

## Common Pitfalls

### Generic "AI Design"

Without context, AI generates boring, generic UI. Always:
- Specify style (minimalist, brutalist, glassmorphic)
- Point to inspirations (e.g., "like Stripe's homepage")
- Define colors and typography

### Oversized Components

Don't request "entire landing page". Split into:
- Hero section
- Features section
- Pricing section
- Footer

Smaller pieces = better control.

### No Design System

If every component has different blue shades and border radius, your UI looks like Frankenstein. Create design tokens and stick to them.

## Tools

### Cursor (Recommended IDE)

IDE based on VS Code with built-in AI:
- **Composer** - Creates/modifies multiple files simultaneously
- **Chat** - Conversation with full project context
- **Cmd+K** - Inline code editing

**Why Cursor?** AI sees entire project - knows your components, design system, folder structure. Generates consistent code.

### Shadcn/ui

Component library installable via CLI. Components are **yours** - copied to project for modification.

AI knows shadcn/ui well, so "use shadcn Button component" gives exactly that.

### v0.dev (Optional)

Vercel tool for generating UI from text prompts. Good for quick prototypes, but code often needs refinement.

## Key Takeaways

1. **Vibe coding works** - Even without design skills, create professional UI
2. **3 pillars are key** - Good foundation, good prompts, good context
3. **AI is a tool, not magic** - Needs clear brief and iteration
4. **Design system is foundation** - Create once, use everywhere
5. **Get inspired, don't copy** - AI helps create something unique, not generic

## Resources

All templates and detailed guides:
- **[references/design-brief-prompt.md](references/design-brief-prompt.md)** - Comprehensive design brief template
- **[references/design-system-template.md](references/design-system-template.md)** - AI design style reference structure
- **[references/implementation-prompt.md](references/implementation-prompt.md)** - Production-ready component generation prompt
- **[references/starter-setup.md](references/starter-setup.md)** - Tailwind CSS 4 + Vite setup guide
- **[assets/templates/design-tokens.css](assets/templates/design-tokens.css)** - Design tokens template for Tailwind CSS 4
