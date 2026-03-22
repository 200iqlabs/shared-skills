# Vibe Coding Starter Setup (Tailwind CSS 4)

Get your vibe coding environment ready with this step-by-step setup guide for Tailwind CSS 4.

## Requirements

**Before starting, ensure you have:**
- Node.js 20 or higher
- npm or yarn
- Modern browser for testing (Safari 16.4+, Chrome 111+, Firefox 128+)

## Quick Start with Recommended Starter Kit

The fastest way to start is using the PageAI Vibe Coding Starter Kit:

```bash
# Clone the starter kit
git clone https://github.com/PageAI-Pro/vibe-coding-starter my-project
cd my-project

# Install dependencies
npm install

# Upgrade to Tailwind CSS 4 (if needed)
npx @tailwindcss/upgrade

# Start dev server
npm run dev
```

This gives you:
- ✅ React 19 + Vite 7
- ✅ Tailwind CSS 4 configured
- ✅ shadcn/ui components ready
- ✅ Base design system
- ✅ Example components

---

## Manual Setup from Scratch

If you prefer to set up from scratch with Tailwind CSS 4:

### 1. Create Vite + React Project

```bash
npm create vite@latest my-project -- --template react
cd my-project
npm install
```

### 2. Install Tailwind CSS 4

```bash
npm install tailwindcss @tailwindcss/vite
```

### 3. Configure Vite Plugin

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### 4. Import Tailwind CSS

In Tailwind CSS 4, you use `@import` instead of `@tailwind` directives.

Update `src/index.css`:

```css
@import "tailwindcss";

/* Your custom styles here */
```

**Important:** Remove old v3 directives if upgrading:
```css
/* ❌ Remove these (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ Use this (v4) */
@import "tailwindcss";
```

### 5. Install shadcn/ui

```bash
npx shadcn@latest init
```

Follow the prompts:
- Choose your style (default or custom)
- Choose your base color
- Enable CSS variables: Yes

Install essential components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

### 6. Install Additional Dependencies

```bash
# Framer Motion for animations
npm install framer-motion

# React Icons
npm install react-icons

# Class name utilities
npm install clsx tailwind-merge
```

### 7. Set Up Design Tokens (Tailwind CSS 4 Style)

In Tailwind CSS 4, design tokens are defined using `@theme` in your CSS.

Create or update `src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary-50: #f0fdfa;
  --color-primary-100: #ccfbf1;
  --color-primary-500: #14b8a6;
  --color-primary-900: #134e4a;

  --color-accent-cyan: #22d3ee;
  --color-accent-neon: #00ff9d;

  /* Typography */
  --font-display: "Poppins", "Inter", sans-serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "Fira Code", monospace;

  /* Spacing (optional - Tailwind has defaults) */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;

  /* Shadows */
  --shadow-glow-green: 0 0 30px rgb(0 255 157 / 0.3);
  --shadow-glow-cyan: 0 0 30px rgb(34 211 238 / 0.3);

  /* Custom breakpoints (optional) */
  --breakpoint-3xl: 1920px;
}
```

See [assets/templates/design-tokens.css](../assets/templates/design-tokens.css) for complete template.

---

## Project Structure

Organize your project for scalability:

```
my-project/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── layout/     # Layout components (Header, Footer)
│   │   └── sections/   # Page sections (Hero, Features, etc.)
│   ├── pages/          # Page components
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Main CSS with @theme tokens
├── design-reference.md  # AI design style reference
├── design-brief.md      # Project design brief
└── package.json
```

---

## Tailwind CSS 4 Key Changes

If you're familiar with Tailwind CSS 3, note these important changes:

### Utility Class Renames

| Tailwind v3 | Tailwind v4 |
|-------------|-------------|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `blur-sm` | `blur-xs` |
| `backdrop-blur-sm` | `backdrop-blur-xs` |
| `rounded-sm` | `rounded-xs` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |

### CSS Directives

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import "tailwindcss";
```

### Custom Utilities

```css
/* v3 */
@layer utilities {
  .tab-4 {
    tab-size: 4;
  }
}

/* v4 */
@utility tab-4 {
  tab-size: 4;
}
```

### Configuration

**v3:** `tailwind.config.js` with JavaScript

**v4:** `@theme` in CSS (JavaScript config still works but CSS is preferred)

---

## Configure Your IDE (Cursor Recommended)

### Why Cursor?

Cursor is the recommended IDE for vibe coding because:
- **Full project context** - AI sees your entire codebase
- **Composer mode** - Modify multiple files at once
- **Chat integration** - Ask questions with project awareness
- **Inline editing** - Cmd/Ctrl+K for quick edits

### Cursor Setup

1. **Download Cursor:** https://cursor.sh
2. **Open your project** in Cursor
3. **Configure AI context:**
   - Add `design-reference.md` to chat context
   - Add `src/index.css` with design tokens to chat context
   - Use @-mentions to reference specific files

### Cursor Tips

```
# Ask questions with context
"@design-reference.md How should I style primary buttons?"

# Generate components with full context
"Create a Hero section following @design-reference.md using our @theme tokens"

# Modify multiple files
Use Composer (Cmd+I) to update several components at once
```

---

## Create Your Design System Files

### 1. Design Brief

Create `design-brief.md` using the template from [design-brief-prompt.md](design-brief-prompt.md).

### 2. Design Reference

Create `design-reference.md` using the template from [design-system-template.md](design-system-template.md).

Fill in:
- Visual style preferences
- Color themes
- Layout structures
- Component patterns
- Animation guidelines

### 3. Design Tokens

Add `@theme` block to your `src/index.css` with custom design tokens.

See [assets/templates/design-tokens.css](../assets/templates/design-tokens.css) for complete example.

Customize:
- Color palettes (primary, neutral, accent)
- Typography (fonts, sizes, weights)
- Spacing scale
- Border radius values
- Shadows and effects

---

## Verify Setup

Test your setup with a simple component:

```jsx
// src/App.jsx
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold bg-linear-to-r from-accent-cyan to-accent-neon bg-clip-text text-transparent">
          Vibe Coding
        </h1>
        <p className="text-neutral-400 text-xl mt-4">
          Your Tailwind CSS 4 setup is ready!
        </p>
        <button className="mt-8 px-6 py-3 bg-accent-neon text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-300">
          Get Started
        </button>
      </motion.div>
    </div>
  );
}

export default App;
```

**Note:** If you get errors about `accent-cyan` or `accent-neon`, make sure you've defined these in your `@theme` block.

Run the dev server:

```bash
npm run dev
```

If you see the styled page, you're ready for vibe coding with Tailwind CSS 4!

---

## Upgrading from Tailwind CSS 3

If you have an existing v3 project:

```bash
# Use the automatic upgrade tool
npx @tailwindcss/upgrade

# Or manually:
npm install tailwindcss@latest @tailwindcss/vite

# Update vite.config.js to use @tailwindcss/vite plugin
# Update CSS to use @import "tailwindcss"
# Rename utilities: shadow-sm → shadow-xs, ring → ring-3, etc.
```

---

## Next Steps

1. **Create your design brief** - Define your project's goals and aesthetic
2. **Fill in design reference** - Document your style decisions
3. **Customize design tokens** - Add your `@theme` to `src/index.css`
4. **Start building** - Use implementation prompts to generate components
5. **Iterate** - Refine with AI based on what you see in the browser

Happy vibe coding with Tailwind CSS 4!
