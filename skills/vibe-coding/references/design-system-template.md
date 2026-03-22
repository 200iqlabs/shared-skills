# AI Design Style Reference Template

Create a comprehensive design style reference that AI will use throughout your project. This document becomes your **single source of truth** for design decisions.

Save this as `design-reference.md` in your project and attach it to AI context (Cursor, Claude, ChatGPT).

---

## Visual Style

Define your visual style in a table format. Copy this template and fill in your choices:

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Overall Aesthetic** | [e.g., Minimalist Brutalism] | [Why this style?] |
| **Color Palette** | [e.g., Monochromatic + neon accent] | [Why these colors?] |
| **Typography** | [e.g., Inter (sans-serif)] | [Why this font?] |
| **Spacing** | [e.g., Generous whitespace] | [Why this spacing approach?] |
| **Visual Weight** | [e.g., Bold typography, subtle UI] | [What's the focus?] |

### Example

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Overall Aesthetic** | Minimalist Brutalism | Emphasizes content, modern vibe |
| **Color Palette** | Monochromatic + neon accent | Readable, expressive, tech-forward |
| **Typography** | Inter (sans-serif) | Readable, professional |
| **Spacing** | Generous whitespace | Facilitates focus, premium feel |
| **Visual Weight** | Bold typography, subtle UI | Content > decorations |

---

## Layout Structures

Define when to use different layout patterns:

| Layout Type | When to Use | Characteristics |
|-------------|-------------|-----------------|
| **Hero Full-Screen** | [e.g., Landing pages] | [e.g., Maximum impact, CTA above fold] |
| **Sidebar Layout** | [e.g., Dashboards, apps] | [e.g., Navigation always visible] |
| **Card Grid** | [e.g., Portfolio, galleries] | [e.g., Scannable, responsive] |
| **Split Screen** | [e.g., Comparisons, dual content] | [e.g., 50/50 attention split] |

### Example

| Layout Type | When to Use | Characteristics |
|-------------|-------------|-----------------|
| **Hero Full-Screen** | Landing pages | Maximum impact, CTA above the fold |
| **Sidebar Layout** | Dashboards, applications | Navigation always visible |
| **Card Grid** | Portfolio, galleries | Scannable, responsive |
| **Split Screen** | Comparisons, dual content | 50/50 attention split |

---

## Color Themes

Define your color themes with specific hex values:

| Theme | Primary | Background | Text | Accent |
|-------|---------|------------|------|--------|
| **Dark Mode** | [hex] | [hex] | [hex] | [hex] |
| **Light Mode** | [hex] | [hex] | [hex] | [hex] |
| **Custom Theme** | [hex] | [hex] | [hex] | [hex] |

### Example

| Theme | Primary | Background | Text | Accent |
|-------|---------|------------|------|--------|
| **Dark Mode** | `#0f172a` | `#020617` | `#f1f5f9` | `#22d3ee` |
| **Light Mode** | `#ffffff` | `#f8fafc` | `#0f172a` | `#0ea5e9` |
| **Neon Dark** | `#000000` | `#0a0a0a` | `#ffffff` | `#00ff9d` |

---

## Component Patterns

### Buttons

Define your button hierarchy and styling:

```markdown
**Primary Button**
- Background: [color]
- Text: [color]
- Hover: [effect]
- Use case: [when to use]

**Secondary Button**
- Background: [color]
- Text: [color]
- Hover: [effect]
- Use case: [when to use]

**Ghost Button**
- Background: [color]
- Text: [color]
- Hover: [effect]
- Use case: [when to use]
```

### Cards

Define your card component style:

```markdown
**Card Style**
- Background: [e.g., glassmorphic, solid]
- Border: [e.g., subtle, none, accent]
- Hover effect: [e.g., lift, glow, scale]
- Shadow: [e.g., soft, none, dramatic]
```

### Navigation

Define your navigation approach:

```markdown
**Navigation Style**
- Type: [e.g., sticky header, sidebar, bottom tab]
- Background: [e.g., transparent, solid, blur]
- Active state: [how to indicate current page]
- Mobile: [how navigation changes on mobile]
```

---

## Animation & Interaction

Define how your UI responds to user interaction:

| Interaction | Effect | Duration | Easing |
|-------------|--------|----------|--------|
| **Button Hover** | [e.g., Scale 1.05 + glow] | [e.g., 300ms] | [e.g., ease] |
| **Card Hover** | [e.g., Lift -10px + border glow] | [e.g., 300ms] | [e.g., ease-out] |
| **Link Hover** | [e.g., Color change] | [e.g., 200ms] | [e.g., ease] |
| **Page Transitions** | [e.g., Fade in] | [e.g., 500ms] | [e.g., ease-out] |

---

## Typography Scale

Define your typography hierarchy:

| Element | Font Size | Font Weight | Line Height | Use Case |
|---------|-----------|-------------|-------------|----------|
| **Hero Title** | [e.g., 3rem] | [e.g., Bold] | [e.g., 1.2] | [e.g., Main headlines] |
| **H1** | [e.g., 2.5rem] | [e.g., Bold] | [e.g., 1.3] | [e.g., Page titles] |
| **H2** | [e.g., 2rem] | [e.g., Semibold] | [e.g., 1.4] | [e.g., Section titles] |
| **H3** | [e.g., 1.5rem] | [e.g., Semibold] | [e.g., 1.4] | [e.g., Subsections] |
| **Body** | [e.g., 1rem] | [e.g., Normal] | [e.g., 1.6] | [e.g., Paragraphs] |
| **Small** | [e.g., 0.875rem] | [e.g., Normal] | [e.g., 1.5] | [e.g., Captions, labels] |

---

## Spacing System

Define your spacing scale (8px base recommended):

| Token | Value | Use Case |
|-------|-------|----------|
| **xs** | [e.g., 0.5rem / 8px] | [e.g., Tight spacing within elements] |
| **sm** | [e.g., 1rem / 16px] | [e.g., Related elements] |
| **md** | [e.g., 1.5rem / 24px] | [e.g., Component spacing] |
| **lg** | [e.g., 2rem / 32px] | [e.g., Section padding] |
| **xl** | [e.g., 3rem / 48px] | [e.g., Major sections] |
| **2xl** | [e.g., 4rem / 64px] | [e.g., Page margins] |

---

## Border Radius

Define your border radius system:

| Token | Value | Use Case |
|-------|-------|----------|
| **none** | 0 | [e.g., Brutalist elements] |
| **sm** | [e.g., 0.25rem] | [e.g., Inputs, small buttons] |
| **md** | [e.g., 0.5rem] | [e.g., Cards, buttons] |
| **lg** | [e.g., 1rem] | [e.g., Large cards, modals] |
| **full** | [e.g., 9999px] | [e.g., Pills, rounded buttons] |

---

## Shadows

Define your shadow system:

| Token | Value | Use Case |
|-------|-------|----------|
| **sm** | [e.g., 0 1px 2px rgba(0,0,0,0.05)] | [e.g., Subtle elevation] |
| **md** | [e.g., 0 4px 6px rgba(0,0,0,0.1)] | [e.g., Cards, dropdowns] |
| **lg** | [e.g., 0 10px 15px rgba(0,0,0,0.15)] | [e.g., Modals, popovers] |
| **glow** | [e.g., 0 0 30px accent-color] | [e.g., Hover effects, CTAs] |

---

## Usage Instructions

1. **Copy this template** to a new file called `design-reference.md`
2. **Fill in all tables** with your project-specific choices
3. **Save in your project root** or docs folder
4. **Attach to AI context** whenever requesting UI components
5. **Reference specific sections** in prompts: "Use the Dark Mode theme from design-reference.md"

This reference ensures AI generates consistent, on-brand components throughout your project.
