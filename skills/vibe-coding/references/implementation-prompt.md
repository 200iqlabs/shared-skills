# Implementation Prompt Template

Use this comprehensive prompt template to generate production-ready React + Tailwind CSS components with AI.

## The Prompt Template

```
I need you to build [specific component/page] using React and Tailwind CSS.

DESIGN CONTEXT:
[Paste your design brief and style reference here]

TECHNICAL REQUIREMENTS:
- Use React functional components with hooks
- Use Tailwind CSS for all styling (no custom CSS)
- Make it fully responsive (mobile-first)
- Follow accessibility best practices (WCAG 2.1 AA)
- Use semantic HTML

SPECIFIC REQUIREMENTS FOR THIS COMPONENT:
- [Describe exactly what it should do]
- [What sections/elements to include]
- [Any special interactions]

VISUAL DETAILS:
- Follow the [specific style] from the design reference
- Use [specific color theme]
- Ensure [specific spacing/typography rules]

Please provide:
1. Complete, production-ready component code
2. Brief explanation of design decisions
3. Any additional dependencies needed

Start with the code, then explain.
```

---

## Example: Hero Section for SaaS Landing Page

```
I need you to build a Hero section for a SaaS landing page using React and Tailwind CSS.

DESIGN CONTEXT:
- Style: Minimalist with gradient background
- Color: Dark mode with cyan accent (#22d3ee)
- Typography: Inter, bold headlines
- Spacing: Generous (p-8, gap-8)

TECHNICAL REQUIREMENTS:
- React functional component
- Tailwind CSS only
- Mobile-first responsive
- WCAG 2.1 AA compliant

SPECIFIC REQUIREMENTS:
- Headline + subheadline + CTA button
- Gradient background (slate to cyan)
- CTA button with hover effect
- Centered content, max-width container

VISUAL DETAILS:
- Use Dark Mode theme from reference
- Cyan accent for CTA
- Bold typography (font-bold, text-5xl for headline)

Start with the code.
```

---

## Example: Glassmorphic Card Component

```
I need you to build a reusable Card component using React and Tailwind CSS.

DESIGN CONTEXT:
- Style: Glassmorphism (frosted glass effect)
- Color: Dark background with white/10 transparency
- Border: Subtle white/10 border
- Hover: Lift effect with green accent glow

TECHNICAL REQUIREMENTS:
- React functional component
- Accept props: image, title, description, tags
- Tailwind CSS only
- Fully responsive
- Keyboard accessible

SPECIFIC REQUIREMENTS:
- Image at top (aspect-video)
- Title + description below
- Tag pills at bottom
- Hover: lift -10px + green glow on border
- Smooth transitions (300ms)

VISUAL DETAILS:
- Background: bg-white/5 backdrop-blur-sm
- Border: border-white/10, hover: border-green-500/30
- Shadow on hover: 0 0 30px rgba(0,255,157,0.15)
- Tags: bg-green-500/10 text-green-400 with border

Start with the code.
```

---

## Example: Navigation Header

```
I need you to build a sticky navigation header using React and Tailwind CSS.

DESIGN CONTEXT:
- Style: Minimalist with backdrop blur
- Color: Dark background (#0a0e1a) with 80% opacity
- Typography: Inter, medium weight for links
- Active state: Green underline

TECHNICAL REQUIREMENTS:
- React functional component with useState for mobile menu
- Tailwind CSS only
- Sticky positioning (fixed top-0)
- Fully responsive with hamburger menu on mobile
- Accessible keyboard navigation

SPECIFIC REQUIREMENTS:
- Logo on left
- Desktop menu links (centered or right)
- Mobile hamburger menu
- Smooth backdrop blur
- Active page indicator
- Border bottom (subtle)

VISUAL DETAILS:
- Background: bg-[#0a0e1a]/80 backdrop-blur-md
- Border: border-b border-white/5
- Links: text-gray-400 hover:text-green-400
- Active: text-green-400 with bottom border
- Mobile menu: slide in from right

Start with the code.
```

---

## Tips for Best Results

### 1. Be Specific About Interactions

Don't say: "Add hover effects"
Do say: "On hover: scale 1.05, add green glow shadow (0 0 30px rgba(0,255,157,0.3)), transition 300ms ease"

### 2. Reference Your Design System

Always mention:
- Specific color values from your design tokens
- Typography choices (font family, weights, sizes)
- Spacing scale (p-8, gap-4, etc.)

### 3. Include Accessibility Requirements

Specify:
- WCAG level (usually AA)
- Keyboard navigation needs
- Screen reader considerations
- Color contrast requirements

### 4. Request Code First, Explanation After

"Start with the code, then explain" ensures you get usable code immediately, with context following.

### 5. Specify Dependencies

If you're using specific libraries:
- shadcn/ui components: "Use shadcn Button component"
- Framer Motion: "Use Framer Motion for animations"
- React Icons: "Use react-icons/fa for icons"

---

## Iteration Prompts

After seeing the first version, refine with specific feedback:

### Size Adjustments
```
Make the headline 20% larger and the button more prominent (add more padding).
```

### Color Changes
```
Change the accent from cyan (#22d3ee) to neon green (#00ff9d) throughout.
```

### Layout Tweaks
```
Switch from centered layout to left-aligned. Move the image to the right side on desktop.
```

### Animation Additions
```
Add a subtle fade-in animation on mount (600ms ease-out). Stagger the title, subtitle, and button by 100ms each.
```

### Responsiveness
```
On mobile, stack the content vertically and make the image full-width.
```

---

## Common Patterns

### Full-Screen Section
```
Create a full-screen section (min-h-screen) with centered content.
Responsive padding: px-4 md:px-8 lg:px-16, py-20.
Max-width container: max-w-7xl mx-auto.
```

### Card Grid
```
Create a responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3.
Gap: gap-8.
Each card: glassmorphic style with hover lift effect.
```

### Split Screen Layout
```
Create a 50/50 split layout on desktop (lg:grid-cols-2), stacked on mobile.
Left side: content (text, CTA). Right side: image or visual.
```

### Form with Validation
```
Create a form with input fields, validation states, and submit button.
Inputs: dark background, green accent border on focus.
Validation: red border for errors, green for success.
Submit button: primary style with loading state.
```

---

## Using the Template

1. **Copy the base template** from the top of this document
2. **Fill in the bracketed sections** with your specific requirements
3. **Attach your design-reference.md** to the conversation context
4. **Paste the prompt** to AI (Cursor, Claude, ChatGPT)
5. **Iterate** with refinement prompts if needed

This structured approach ensures AI generates exactly what you need, following your design system.
