# Design Tokens Documentation Page - Complete Plan

**Date:** 2026-03-27  
**Mode:** PLAN (Read-only architectural design)  
**Target:** `web/src/pages/Docs/components/design-tokens/`  
**Status:** Not implemented (plan only)

---

## Executive Summary

This plan defines a comprehensive documentation page for Dashforge Design Tokens that positions them as a **semantic design system** (not just color configuration). The page must communicate the architectural principle: **Tokens define meaning → theme-mui translates meaning → Components consume meaning**.

**Commercial Value:** High (core product feature)  
**Target Audience:** Developers customizing Dashforge's visual language  
**Key Message:** Design tokens enable consistent, semantic visual customization across all components  
**Documentation Category:** **Theme System** (NOT Components, NOT Utilities)

---

## Documentation Category & Sidebar Placement

### Current Issue

Design Tokens must NOT be categorized under:

- ❌ Components (it's not a UI component)
- ❌ Utilities (it's not a helper function)
- ❌ Feedback (it's not a notification system)

### Required Category: **Theme System**

Design Tokens are **foundational system documentation** that define Dashforge's visual language architecture.

### Recommended Sidebar Structure

```
Docs
├── Getting Started
│   ├── Installation
│   ├── Quick Start
│   └── ...
│
├── Components
│   ├── Form
│   │   ├── TextField
│   │   ├── Select
│   │   ├── NumberField
│   │   └── ...
│   ├── Feedback
│   │   ├── Snackbar
│   │   ├── ConfirmDialog
│   │   └── ...
│   └── ...
│
├── Theme System  ← NEW CATEGORY
│   ├── Design Tokens  ← THIS PAGE
│   ├── Theme Customization (future)
│   └── Theme Adapter (future/reference)
│
└── Utilities (future)
```

### Sidebar Entry Details

**Label:** Design Tokens  
**Path:** `/docs/theme-system/design-tokens`  
**Category:** Theme System  
**Icon:** (suggest: palette icon or theme icon)

### Category Positioning Rationale

**Why "Theme System":**

1. **Semantic clarity:** Tokens are the foundation of theming
2. **Architectural distinction:** Separates system-level from component-level docs
3. **Scalability:** Room for future theme-related docs (customization, dark mode guides)
4. **Commercial positioning:** Elevates tokens as a system feature, not a utility

**Why NOT other categories:**

- Components → Tokens aren't rendered UI
- Utilities → Tokens aren't helper functions
- Getting Started → Too foundational for quick-start section

### Implementation Note for Sidebar

Update `DocsSidebar.model.ts` to include:

```typescript
{
  category: 'Theme System',
  items: [
    {
      label: 'Design Tokens',
      path: '/docs/theme-system/design-tokens',
      icon: 'palette', // or appropriate icon
    }
    // Future:
    // { label: 'Theme Customization', path: '/docs/theme-system/customization' }
  ]
}
```

---

## 1. Folder Structure

```
web/src/pages/Docs/components/design-tokens/
├── DesignTokensDocs.tsx              # Main page component
├── DesignTokensHero.tsx              # Hero section with gradient title
├── DesignTokensWhy.tsx               # NEW: Why tokens matter (commercial + architectural value)
├── DesignTokensQuickStart.tsx        # Minimal override example (primary + success)
├── DesignTokensMentalModel.tsx       # NEW: Mental model - "defining meaning, not choosing colors"
├── DesignTokensStructure.tsx         # Token categories explanation (UPDATED: WRONG vs CORRECT guidance)
├── demos/
│   ├── TokenLiveDemo.tsx             # CRITICAL: Show one token affecting multiple components
│   ├── SemanticComparisonDemo.tsx    # primary vs info vs success visual difference
│   ├── BrandCustomizationDemo.tsx    # SaaS brand example
│   ├── DarkThemeDemo.tsx             # Dark mode token override
│   ├── HighContrastDemo.tsx          # Accessibility scenario
│   ├── MultiTenantDemo.tsx           # NEW: Multi-tenant branding scenario
│   └── TokenPreview.tsx              # Reusable token value display component
├── DesignTokensAdapter.tsx           # theme-mui role explanation (UPDATED: strong warning added)
├── DesignTokensScenarios.tsx         # Real-world customization scenarios (UPDATED: multi-tenant added)
├── DesignTokensApi.tsx               # Token reference table (UPDATED: lighter, more reference-focused)
├── DesignTokensNotes.tsx             # Implementation guidelines + when NOT to use
└── index.ts                          # Exports
```

**Total Files:** ~17 files (+2 new sections)  
**Pattern:** Follows existing docs structure (SelectDocs, SnackbarDocs style)  
**Changes:** Added commercial value sections, improved decision-making guidance

---

## 2. Page Structure (DesignTokensDocs.tsx)

### Component Hierarchy - **REORDERED FOR ACTION-FIRST**

```tsx
<Stack spacing={8}>
  {/* 1. Hero Section */}
  <DesignTokensHero />

  {/* 2. Quick Start - MOVED UP (action-first) */}
  <DesignTokensQuickStart />

  {/* 3. Live Examples (CRITICAL) - MOVED UP (proof-first) */}
  <Stack spacing={4} id="live-examples">
    <SectionHeader
      title="Live Examples"
      subtitle="See how token changes affect multiple components consistently"
    />
    <TokenLiveDemo />
  </Stack>

  {/* 4. Mental Model (NEW) - Before deep explanation */}
  <DesignTokensMentalModel />

  {/* 5. Why This Matters (NEW) - After practical proof */}
  <DesignTokensWhy />

  {/* 6. Token Structure (UPDATED: WRONG vs CORRECT guidance) */}
  <DesignTokensStructure />

  {/* 7. Semantic vs Brand */}
  <Stack spacing={4} id="semantic-intents">
    <SectionHeader
      title="Semantic Intents"
      subtitle="Understanding primary, info, success, warning, and danger"
    />
    <SemanticComparisonDemo />
  </Stack>

  {/* 8. Theme Adapter (UPDATED: strong warning) */}
  <DesignTokensAdapter />

  {/* 9. Customization Scenarios (UPDATED: multi-tenant added) */}
  <DesignTokensScenarios />

  {/* 10. API Reference (UPDATED: lighter + full type reference) */}
  <DesignTokensApi />

  {/* 11. Implementation Notes */}
  <DesignTokensNotes />
</Stack>
```

**Visual Style:**

- Follows SelectDocs/SnackbarDocs pattern
- Gradient hero title (tokens theme: purple/blue gradient)
- Purple accent color (#7c3aed) for highlights
- Clean, modern typography
- Mobile-first responsive design

**Section Order Rationale (CRITICAL):**

1. **Hero** → Set context
2. **Quick Start** → Immediate action (copy-paste code)
3. **Live Examples** → Immediate proof (see it work)
4. **Mental Model** → Learn to think correctly (before deep dive)
5. **Why This Matters** → Understand value (after seeing it work)
6. **Token Structure** → Deep reference (with guidance)
7. **Semantic Intents** → Semantic understanding
8. **Theme Adapter** → Architectural layer
9. **Scenarios** → Real-world applications
10. **API** → Complete reference
11. **Notes** → Best practices

**Why This Order:**

- **Action-first:** Developer can start using tokens in 30 seconds
- **Proof-first:** Live demo validates the concept immediately
- **Mental model early:** Prevents wrong thinking before deep dive
- **Value after proof:** "Why" is more convincing after seeing "How"

**Patch Changes:**

- **REORDERED sections for action-first flow** (CRITICAL)
- Added DesignTokensWhy (commercial + architectural value)
- Added DesignTokensMentalModel (mental clarity)
- Updated DesignTokensStructure (decision-oriented)
- Updated DesignTokensAdapter (strong warning)
- Updated DesignTokensScenarios (multi-tenant scenario)
- Updated DesignTokensApi (lighter + full type reference)

---

## 3. Content Strategy (Section by Section)

### 3.1 Hero Section (DesignTokensHero.tsx)

**Purpose:** Position tokens as semantic system, NOT color config

**Content:**

- **Title:** "Design Tokens" (gradient: purple → blue)
- **Subtitle:** "Define your application's visual language through semantic design tokens. Change primary once, see it reflected everywhere."
- **Key Message Badge:** "Semantic System" (purple badge)

**Tone:**

- Emphasize "visual language" over "colors"
- Highlight cross-component consistency
- Avoid technical jargon

**Why:**

- First impression must communicate semantic value
- Differentiate from simple CSS variable system
- Set expectation for architectural thinking

---

### 3.2 Why This Matters (DesignTokensWhy.tsx) - **NEW**

**Purpose:** Explain commercial and architectural value immediately

**Position:** Right after Hero, before Quick Start

**Content:**

#### Commercial Value

**"Why Design Tokens?"**

Design tokens solve three critical problems:

1. **Consistency at Scale**

   - Change `primary` once → 50+ components update instantly
   - No scattered `#2563EB` values across your codebase
   - Design decisions propagate automatically

2. **Multi-Brand Support**

   - Same codebase, different themes per tenant
   - White-label apps without code duplication
   - Brand isolation without component rewrites

3. **Maintainability**
   - Single source of truth for visual identity
   - Refactor design without touching component code
   - Onboard designers without React knowledge

#### Architectural Value

**"Semantic-First Approach"**

Dashforge tokens define **meaning**, not appearance:

- `primary` = "brand action" (not "blue")
- `success` = "positive outcome" (not "green")
- `danger` = "destructive" (not "red")

This semantic layer means:

- Components work with any brand
- Accessibility improvements apply everywhere
- Dark mode is a token swap, not a rewrite

**Visual Component:**

```
┌─────────────────────────────────────────┐
│  Without Tokens        │  With Tokens   │
├────────────────────────┼────────────────┤
│  Scattered colors      │  Centralized   │
│  Hard to maintain      │  Easy updates  │
│  Breaks on rebrand     │  Scales        │
│  Component-specific    │  Cross-cutting │
└─────────────────────────────────────────┘
```

**Callout Box (Purple):**

> 💡 **Product Value:** Tokens aren't just developer convenience—they're the foundation for building themeable, white-labelable, and maintainable products at scale.

**Why This Section Matters:**

- Answers "why should I care?" immediately
- Positions Dashforge as enterprise-grade
- Establishes commercial ROI (multi-tenant, white-label)
- Sets mental frame before diving into technical details

**Tone:**

- Product-focused, not implementation-focused
- Emphasize business value
- Use "you can" language (empowerment)

---

### 3.3 Quick Start (DesignTokensQuickStart.tsx)

**Purpose:** Immediate practical example with visual impact

**Content:**

**Example Code:**

```tsx
import { createDashTheme } from '@dashforge/theme-core';
import { createMuiThemeFromDashTheme } from '@dashforge/theme-mui';

const myTheme = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed', // Brand purple
      success: '#059669', // Emerald green
    },
  },
});

const muiTheme = createMuiThemeFromDashTheme(myTheme);
```

**Visual Impact Preview:**

- Side-by-side comparison (before/after)
- Show Button with primary color
- Show Alert with success color
- **Immediate validation:** "2 tokens, 10+ components updated"

**Why:**

- Developers need instant gratification
- Proves semantic propagation works
- Minimal code, maximum impact

---

### 3.4 Mental Model (DesignTokensMentalModel.tsx) - **NEW**

**Purpose:** Shift developer thinking from "choosing colors" to "defining meaning"

**Position:** After Quick Start, before Token Structure

**Content:**

#### The Core Mental Shift

**"You Are Not Choosing Colors. You Are Defining Meaning."**

When customizing Dashforge, you're not selecting hex values for buttons.  
You're answering questions like:

- **What represents your brand?** → `primary`
- **What means success to your users?** → `success`
- **What communicates danger?** → `danger`
- **What's your neutral information tone?** → `info`

**Wrong Mental Model:**

> "I need buttons to be purple, so I'll set `primary: '#7c3aed'` everywhere."

**Correct Mental Model:**

> "My brand action color is purple. I'll set `primary: '#7c3aed'` once, and all brand actions will reflect it."

#### Visual Diagram: Semantic Layer

```
┌─────────────────────────────────────────────────────┐
│  Your Decision              │  Dashforge Role       │
├─────────────────────────────┼───────────────────────┤
│  "Brand color is purple"    │  Maps to `primary`    │
│  (meaning: brand identity)  │  Applies everywhere   │
│                             │  - Buttons            │
│                             │  - Links              │
│                             │  - Focus states       │
│                             │  - Active tabs        │
│                             │  - Checkboxes         │
└─────────────────────────────┴───────────────────────┘
```

#### Three Rules for Success

**Rule 1: Define Meaning, Not Appearance**

```tsx
// ✅ Correct: Semantic thinking
const theme = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed', // "This is my brand"
      success: '#059669', // "This means success"
      danger: '#dc2626', // "This is destructive"
    },
  },
});

// ❌ Wrong: Appearance thinking
<Button sx={{ bgcolor: '#7c3aed' }}>Click</Button>; // Breaks semantic system
```

**Rule 2: One Token, Many Components**

When you change `primary`, you're updating:

- All primary buttons
- All primary links
- All focus states
- All checkbox highlights
- All active navigation

**You define once. Dashforge applies everywhere.**

**Rule 3: Meaning Stays, Appearance Changes**

A `success` token might be:

- Green in your default theme
- Blue in a color-blind accessible theme
- High-contrast black in accessibility mode

**The meaning of "success" never changes.**  
**The visual expression adapts.**

#### Callout Box (Purple, Highlighted):

> 🎯 **Key Insight:** Tokens create a semantic contract between you and your UI. You define what things _mean_. Dashforge ensures components _express_ that meaning consistently.

**Why This Section Matters:**

- Establishes correct mental framework before details
- Prevents "hex value thinking"
- Shows semantic system value
- Reduces cognitive load for Token Structure section

**Tone:**

- Pedagogical, not preachy
- Use concrete examples
- Emphasize empowerment ("you define once")
- Contrast WRONG vs CORRECT explicitly

---

### 3.5 Token Structure (DesignTokensStructure.tsx) - **UPDATED**

**Purpose:** Explain token categories with semantic meaning AND decision guidance (not just keys)

**Content:**

#### 3.5.1 Color Intent Tokens

**Meaning-First Explanation:**

| Token       | Semantic Meaning       | Usage                                | When to Use                   |
| ----------- | ---------------------- | ------------------------------------ | ----------------------------- |
| `primary`   | Brand / main action    | Primary buttons, links, focus states | Brand identity, main CTAs     |
| `info`      | Informational feedback | Info alerts, neutral notifications   | System messages, neutral info |
| `success`   | Positive outcome       | Success alerts, confirmation states  | Confirmations, completions    |
| `warning`   | Caution / attention    | Warning alerts, destructive actions  | Caution, potential issues     |
| `danger`    | Error / destructive    | Error alerts, delete actions         | Errors, destructive actions   |
| `secondary` | Supporting actions     | Secondary buttons, subtle emphasis   | Less prominent actions        |

**Key Message:** "Intent tokens define WHAT an action means, not HOW it looks."

#### WRONG vs CORRECT Usage (NEW)

**Common Mistake #1: Using `primary` for everything**

```tsx
// ❌ WRONG: Using primary for all non-error states
<Alert severity="info">Message sent</Alert>           // Should use info
<Button color="primary">Delete Account</Button>       // Should use danger/error
<Alert severity="success">Order confirmed</Alert>     // Correct (actually success)

// ✅ CORRECT: Semantic intent matching
<Alert severity="info">Message sent</Alert>           // Neutral info
<Button color="error">Delete Account</Button>         // Destructive action
<Alert severity="success">Order confirmed</Alert>     // Positive outcome
```

**Why it matters:**

- `primary` = "this is my brand action"
- `info` = "neutral system information"
- They have different meanings, even if colors look similar

**Common Mistake #2: Confusing `warning` and `danger`**

```tsx
// ❌ WRONG: Mixing caution and error
<Alert severity="warning">Invalid email</Alert>       // Error, not caution
<Alert severity="error">Disk space low</Alert>        // Warning, not error

// ✅ CORRECT: Proper semantic distinction
<Alert severity="error">Invalid email</Alert>         // User error
<Alert severity="warning">Disk space low</Alert>      // Caution, not critical
```

**Decision Tree:**

```
Is this a user error or validation failure?
  → Use `danger` / `error`

Is this a caution or requires attention?
  → Use `warning`

Is this neutral system information?
  → Use `info`

Is this a positive outcome or confirmation?
  → Use `success`

Is this your brand identity or main CTA?
  → Use `primary`
```

#### Explicit Warning Box (Red/Orange):

> ⚠️ **Critical:** Do NOT use `primary` for every button or alert just because it's your brand color. Reserve `primary` for brand-defining actions (main CTAs, brand elements). Use `info` for neutral messages, `success` for positive outcomes, and `danger` for errors.

#### 3.5.2 Text Color Tokens

| Token       | Semantic Meaning            | Usage                        |
| ----------- | --------------------------- | ---------------------------- |
| `primary`   | Main content text           | Body text, labels, headings  |
| `secondary` | Supporting text             | Descriptions, metadata       |
| `muted`     | De-emphasized text          | Placeholder, disabled states |
| `inverse`   | Text on colored backgrounds | Button text, filled alerts   |

#### 3.3.3 Surface Tokens

| Token      | Semantic Meaning | Usage             |
| ---------- | ---------------- | ----------------- |
| `canvas`   | Page background  | Main app canvas   |
| `elevated` | Raised surfaces  | Cards, popovers   |
| `overlay`  | Modal surfaces   | Dialogs, overlays |

#### 3.3.4 Radius Tokens

| Token  | Value | Usage                                 |
| ------ | ----- | ------------------------------------- |
| `sm`   | 4px   | Tight elements (badges, chips)        |
| `md`   | 8px   | Standard components (buttons, fields) |
| `lg`   | 12px  | Large containers (cards, dialogs)     |
| `pill` | 999px | Fully rounded (tags, avatar)          |

**Visual Component:** Interactive token viewer showing live values

**Why:**

- Semantic understanding is critical
- Prevents misuse (e.g., primary for errors)
- Teaches design thinking

---

### 3.4 Live Examples (TokenLiveDemo.tsx) - **CRITICAL**

**Purpose:** Prove semantic propagation across components

**Implementation:**

**Interactive Demo:**

```tsx
<TokenLiveDemo />
```

**Features:**

- Color picker for `primary` token
- Real-time preview of:
  1. **Button** (primary variant)
  2. **Alert** (info severity with icon)
  3. **Snackbar** (info message)
  4. **ConfirmDialog** (confirm button)
- Code snippet showing token override
- Live token value display

**User Flow:**

1. User changes primary color via picker
2. All 4 components update instantly
3. Code snippet reflects new value
4. **Validation message:** "1 token changed → 4 components updated"

**Why:**

- This is THE killer feature
- Visual proof of semantic system
- Differentiates from hardcoded styles
- High commercial value

**Implementation Note:**

- Use local state for demo theme
- Wrap components in isolated ThemeProvider
- Keep performance smooth (debounce picker)

---

### 3.5 Semantic vs Brand (SemanticComparisonDemo.tsx)

**Purpose:** Clarify distinction between primary, info, success

**Content:**

**Visual Comparison Grid:**

```
┌─────────────────────────────────────────────────────┐
│ PRIMARY (Brand)          │ INFO (Neutral)          │
│ • Main call-to-action    │ • Informational         │
│ • Brand identity         │ • System feedback       │
│ [Button Preview]         │ [Button Preview]        │
│ [Alert Preview]          │ [Alert Preview]         │
└──────────────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SUCCESS (Positive)       │ WARNING (Caution)       │
│ • Confirmation           │ • Requires attention    │
│ • Positive outcome       │ • Potential issue       │
│ [Button Preview]         │ [Button Preview]        │
│ [Alert Preview]          │ [Alert Preview]         │
└──────────────────────────┴─────────────────────────┘
```

**Key Callout:**

> ⚠️ **Common Mistake:** Using `primary` for all non-error states. Use `info` for neutral informational feedback to maintain semantic clarity.

**Why:**

- Addresses confusion from theme-mui policy
- Prevents semantic collapse
- Educates proper usage

---

### 3.6 Theme Adapter (DesignTokensAdapter.tsx) - **UPDATED**

**Purpose:** Explain theme-mui role WITHOUT deep internals + STRONG WARNING

**Content:**

**Conceptual Diagram:**

```
┌──────────────────────┐
│  Dashforge Tokens    │  ← Source of truth (semantic)
│  (meaning-first)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   theme-mui          │  ← Adapter layer
│   (translator)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   MUI Components     │  ← Visual output
└──────────────────────┘
```

**Explanation:**

**"What is theme-mui?"**

theme-mui is an adapter that translates Dashforge semantic tokens into MUI's theme format. When you override a Dashforge token, theme-mui automatically updates MUI's palette, shape, and component overrides.

**"Why an adapter?"**

- **Separation of concerns:** Design decisions (tokens) stay separate from implementation (MUI)
- **Portability:** Tokens could map to other frameworks in the future
- **Consistency:** All components consume the same semantic source of truth

**What you DON'T need to know:**

- Internal mapping logic
- MUI override structure
- Palette transformation details

**What you DO need to know:**

- Override Dashforge tokens, not MUI theme directly
- Adapter handles consistency automatically
- Semantic changes propagate everywhere

#### CRITICAL WARNING (NEW) - Red/Orange Box

> 🚨 **Do NOT Override MUI Theme Directly**
>
> **WRONG Approach:**
>
> ```tsx
> import { createTheme } from '@mui/material/styles';
>
> // ❌ WRONG: Bypassing Dashforge tokens
> const theme = createTheme({
>   palette: {
>     primary: { main: '#7c3aed' },
>   },
>   components: {
>     MuiButton: {
>       styleOverrides: {
>         root: { borderRadius: 12 },
>       },
>     },
>   },
> });
> ```
>
> **Why this breaks:**
>
> - Bypasses semantic token system
> - Changes won't propagate to all components
> - Loses multi-tenant support
> - Creates maintenance debt
>
> **CORRECT Approach:**
>
> ```tsx
> import { createDashTheme } from '@dashforge/theme-core';
> import { createMuiThemeFromDashTheme } from '@dashforge/theme-mui';
>
> // ✅ CORRECT: Using Dashforge tokens
> const dashTheme = createDashTheme({
>   color: {
>     intent: { primary: '#7c3aed' },
>   },
>   radius: { md: 12 },
> });
>
> const muiTheme = createMuiThemeFromDashTheme(dashTheme);
> ```
>
> **Rule:** Always customize through Dashforge tokens. Let theme-mui handle MUI translation.

#### When You Might Be Tempted (And Why You Shouldn't)

**Temptation #1:** "I just need to change one button's color"

- **Why it's wrong:** That button should use a semantic token (`primary`, `success`, etc.)
- **Correct approach:** Update the token, not the button

**Temptation #2:** "MUI theme docs show createTheme, so I'll use that"

- **Why it's wrong:** You'll bypass Dashforge's semantic layer
- **Correct approach:** Use `createDashTheme` + `createMuiThemeFromDashTheme`

**Temptation #3:** "I want custom component overrides"

- **Why it's wrong:** Custom overrides should use semantic tokens internally
- **Correct approach:** Extend Dashforge tokens if needed, or use sx props with token references

**Why This Warning Matters:**

- Prevents bypassing semantic system
- Stops technical debt before it starts
- Reinforces correct mental model
- Critical for long-term maintainability

---

### 3.7 Customization Scenarios (DesignTokensScenarios.tsx) - **UPDATED**

**Purpose:** Real-world examples developers can copy (with multi-tenant emphasis)

**Content:**

#### Scenario 1: SaaS Brand Customization

**Use Case:** Startup wants purple brand identity

**Code:**

```tsx
const brandTheme = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed', // Brand purple
      secondary: '#6366f1', // Indigo accent
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  radius: {
    md: 12, // More rounded feel
  },
});
```

**Visual Preview:** Button + Card with brand styling

---

#### Scenario 2: Multi-Tenant Branding - **NEW** (CRITICAL)

**Use Case:** SaaS platform serving multiple clients, each with their own brand

**Why This Matters:**

- Same codebase, different themes per tenant
- No component duplication
- Brand isolation without code changes

**Code:**

```tsx
// Tenant A: Tech Startup (Purple)
const tenantATheme = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed', // Purple brand
      secondary: '#6366f1',
      success: '#059669',
    },
  },
  radius: { md: 12 },
});

// Tenant B: Financial Services (Blue)
const tenantBTheme = createDashTheme({
  color: {
    intent: {
      primary: '#1e40af', // Conservative blue
      secondary: '#1e3a8a',
      success: '#15803d',
    },
  },
  radius: { md: 4 }, // Sharp edges
});

// Tenant C: Healthcare (Green)
const tenantCTheme = createDashTheme({
  color: {
    intent: {
      primary: '#047857', // Healthcare green
      secondary: '#065f46',
      success: '#0d9488',
    },
  },
  radius: { md: 8 },
});

// Runtime tenant detection
function getThemeForTenant(tenantId: string) {
  const themes = {
    'tenant-a': tenantATheme,
    'tenant-b': tenantBTheme,
    'tenant-c': tenantCTheme,
  };
  return themes[tenantId] ?? defaultTheme;
}
```

**Visual Preview:** 3-column comparison showing:

- Same Button component
- Same Alert component
- Same Card component
- Different themes applied

**Key Message:**

> 💼 **Enterprise Value:** Same components. Same logic. Different brand per tenant. This is how you scale white-label products without technical debt.

**Implementation Note:**

```tsx
// App-level theme switching
function App() {
  const tenantId = useTenantId(); // From auth/context
  const theme = useMemo(() => getThemeForTenant(tenantId), [tenantId]);
  const muiTheme = useMemo(() => createMuiThemeFromDashTheme(theme), [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

**Why This Scenario Is Critical:**

- High commercial value (white-label SaaS)
- Demonstrates token system scalability
- Addresses enterprise use case
- Justifies semantic architecture investment

---

#### Scenario 3: Dark Theme

**Use Case:** Application needs dark mode

**Code:**

```tsx
const darkTheme = createDashTheme({
  meta: {
    mode: 'dark',
  },
  color: {
    surface: {
      canvas: '#0f172a',
      elevated: '#1e293b',
      overlay: '#334155',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
      inverse: '#0f172a',
    },
    border: {
      subtle: '#334155',
      default: '#475569',
    },
  },
});
```

**Visual Preview:** Dark form with fields

---

#### Scenario 4: High Contrast (Accessibility)

**Use Case:** Enterprise needs WCAG AAA compliance

**Code:**

```tsx
const highContrastTheme = createDashTheme({
  color: {
    intent: {
      primary: '#0056b3', // Darker blue
      success: '#006400', // Darker green
      danger: '#b30000', // Darker red
    },
    text: {
      primary: '#000000',
      secondary: '#1a1a1a',
    },
    border: {
      default: '#000000',
      strong: '#000000',
    },
  },
});
```

**Visual Preview:** High contrast alert

**Why:**

- Practical, copy-pastable examples
- Cover common use cases (including multi-tenant)
- Show token flexibility
- Demonstrate commercial value

---

### 3.8 API Reference (DesignTokensApi.tsx) - **UPDATED**

**Purpose:** Lightweight, scannable token reference (not verbose documentation)

**Content:**

#### Header Guidance (NEW)

> 📚 **Quick Reference:** Use these tokens through `createDashTheme()`. Avoid direct component overrides or MUI theme manipulation.

**Format:** Compact collapsible sections by category

---

#### Color Intent

| Token       | Default   | Meaning                      |
| ----------- | --------- | ---------------------------- |
| `primary`   | `#2563EB` | Brand identity, main actions |
| `secondary` | `#4F46E5` | Supporting actions           |
| `success`   | `#15803D` | Positive outcomes            |
| `warning`   | `#B45309` | Requires attention           |
| `danger`    | `#DC2626` | Errors, destructive actions  |
| `info`      | `#0EA5E9` | Neutral information          |

```tsx
// Usage
const theme = createDashTheme({
  color: { intent: { primary: '#7c3aed' } },
});
```

---

#### Color Surface

| Token      | Default   | Usage                  |
| ---------- | --------- | ---------------------- |
| `canvas`   | `#FFFFFF` | Page background        |
| `elevated` | `#F9FAFB` | Cards, raised surfaces |
| `overlay`  | `#FFFFFF` | Modals, dialogs        |

---

#### Color Text

| Token       | Default   | Usage                       |
| ----------- | --------- | --------------------------- |
| `primary`   | `#111827` | Main content text           |
| `secondary` | `#4B5563` | Supporting text             |
| `muted`     | `#6B7280` | De-emphasized text          |
| `inverse`   | `#FFFFFF` | Text on colored backgrounds |

---

#### Color Border

| Token     | Default   | Usage                    |
| --------- | --------- | ------------------------ |
| `subtle`  | `#F3F4F6` | Dividers, subtle borders |
| `default` | `#6B7280` | Standard borders         |
| `strong`  | `#4B5563` | Emphasized borders       |
| `focus`   | `#3B82F6` | Focus states             |

---

#### Radius

| Token  | Value   | Usage           |
| ------ | ------- | --------------- |
| `sm`   | `4px`   | Badges, chips   |
| `md`   | `8px`   | Buttons, fields |
| `lg`   | `12px`  | Cards, dialogs  |
| `pill` | `999px` | Fully rounded   |

---

#### Spacing

| Token  | Value | Usage                        |
| ------ | ----- | ---------------------------- |
| `unit` | `8`   | Base spacing unit (8px grid) |

---

#### Shadow (Reference Only)

| Token | Value                          |
| ----- | ------------------------------ |
| `sm`  | `0 1px 2px rgba(0,0,0,0.05)`   |
| `md`  | `0 4px 8px rgba(0,0,0,0.08)`   |
| `lg`  | `0 10px 20px rgba(0,0,0,0.12)` |

---

#### Typography (Reference Only)

| Token        | Default               |
| ------------ | --------------------- |
| `fontFamily` | `'Inter', sans-serif` |
| `scale.xs`   | `12px`                |
| `scale.sm`   | `14px`                |
| `scale.md`   | `16px`                |
| `scale.lg`   | `20px`                |
| `scale.xl`   | `24px`                |

---

#### Full Type Reference

**Purpose:** Complete TypeScript interfaces for implementation

> 💡 **Note:** Use these types for TypeScript implementation. For quick reference, see the compact tables above.

```typescript
// Complete token type structure

export interface ColorIntent {
  primary: string; // Brand / main action
  secondary: string; // Supporting actions
  success: string; // Positive outcome
  warning: string; // Caution / attention
  danger: string; // Error / destructive
  info: string; // Informational feedback
}

export interface ColorSurface {
  canvas: string; // Page background
  elevated: string; // Raised surfaces (cards, etc.)
  overlay: string; // Modal surfaces
}

export interface ColorText {
  primary: string; // Main content text
  secondary: string; // Supporting text
  muted: string; // De-emphasized text
  inverse: string; // Text on colored backgrounds
}

export interface ColorBorder {
  subtle: string; // Dividers, subtle borders
  default: string; // Standard borders
  strong: string; // Emphasized borders
  focus: string; // Focus states
}

export interface ColorBackdrop {
  dim: string; // Modal backdrop overlay
}

export interface RadiusScale {
  sm: number; // Small radius (4px)
  md: number; // Medium radius (8px)
  lg: number; // Large radius (12px)
  pill: number; // Fully rounded (999px)
}

export interface ShadowScale {
  sm: string; // Small shadow
  md: string; // Medium shadow
  lg: string; // Large shadow
}

export interface TypographyScale {
  xs: string; // 12px
  sm: string; // 14px
  md: string; // 16px
  lg: string; // 20px
  xl: string; // 24px
}

export interface DashforgeTheme {
  meta: {
    name: string;
    version: string;
    mode: 'light' | 'dark';
  };

  color: {
    intent: ColorIntent;
    surface: ColorSurface;
    text: ColorText;
    border: ColorBorder;
    backdrop: ColorBackdrop;
  };

  typography: {
    fontFamily: string;
    scale: TypographyScale;
  };

  radius: RadiusScale;
  shadow: ShadowScale;
  spacing: {
    unit: number;
  };
}
```

**Usage Example:**

```typescript
import { createDashTheme } from '@dashforge/theme-core';
import type { DashforgeTheme } from '@dashforge/tokens';

const myTheme: Partial<DashforgeTheme> = createDashTheme({
  color: {
    intent: {
      primary: '#7c3aed',
      success: '#059669',
    },
  },
  radius: {
    md: 12,
  },
});
```

---

**Key Changes from Original:**

1. **Added header guidance** - directs users to correct API
2. **Compact table format** - replaced verbose TypeScript interfaces
3. **Removed exhaustive explanations** - kept meaning concise
4. **Grouped visually** - better scannability
5. **Usage examples minimal** - one example per category
6. **Marked Shadow/Typography as "Reference Only"** - less critical
7. **Added Full Type Reference subsection** - complete TypeScript interfaces at end

**Why This Structure Is Better:**

- **Tables first** - Faster to scan for specific token
- **Types after** - Complete reference for implementation
- **Less intimidating** - Not code-heavy upfront
- **Clear at-a-glance defaults** - Quick lookup
- **Guidance at top** - Prevents misuse
- **Still comprehensive** - All types documented

---

### 3.9 Implementation Notes (DesignTokensNotes.tsx)

**Purpose:** Best practices and edge cases

**Content:**

#### ✅ Best Practices

1. **Always use semantic tokens in components**

   ```tsx
   // ✅ Good
   <Button color="primary" />
   <Alert severity="success" />

   // ❌ Bad
   <Button sx={{ bgcolor: '#2563EB' }} />
   ```

2. **Override tokens at theme level, not per component**

   ```tsx
   // ✅ Good
   const theme = createDashTheme({
     color: { intent: { primary: '#7c3aed' } },
   });

   // ❌ Bad
   <Button sx={{ bgcolor: myCustomColor }} />;
   ```

3. **Use intent tokens for meaning, not color**

   - Use `success` for positive outcomes (even if green isn't your brand)
   - Use `primary` for brand actions
   - Don't use `primary` for errors just because it's your brand color

4. **Provide fallback for custom tokens**
   ```tsx
   // Safe fallback pattern
   dash.color.intent.info ?? dash.color.intent.primary;
   ```

#### ❌ When NOT to Use Tokens

1. **One-off marketing pages** with custom gradients/effects
   - Use direct MUI `sx` props for unique designs
2. **Data visualization** with custom color palettes

   - Charts need specific color arrays not semantic intents

3. **Third-party component theming** that doesn't support token injection

   - Use MUI theme or component-specific styling

4. **Experimental UI** that may not follow design system
   - Prototype freely, extract to tokens if pattern repeats

#### ⚠️ Common Pitfalls

- **Don't bypass theme-mui:** Always use `createMuiThemeFromDashTheme`
- **Don't hardcode semantic colors:** Use token references
- **Don't confuse primary and info:** They have different semantic meanings
- **Don't override MUI theme directly:** Override Dashforge tokens instead

**Why:**

- Prevents common mistakes
- Clarifies boundaries
- Shows escape hatches for edge cases

---

## 4. Demo Examples - Implementation Strategy

### 4.1 TokenLiveDemo.tsx (Priority: CRITICAL)

**Features:**

- Color picker for primary token
- Live component preview grid (Button, Alert, Snackbar, ConfirmDialog)
- Real-time code snippet
- Token value display

**Technical Approach:**

```tsx
function TokenLiveDemo() {
  const [primaryColor, setPrimaryColor] = useState('#2563EB');

  const customTheme = useMemo(
    () =>
      createDashTheme({
        color: { intent: { primary: primaryColor } },
      }),
    [primaryColor]
  );

  const muiTheme = useMemo(
    () => createMuiThemeFromDashTheme(customTheme),
    [customTheme]
  );

  return (
    <Stack spacing={4}>
      <ColorPicker value={primaryColor} onChange={setPrimaryColor} />

      <ThemeProvider theme={muiTheme}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button color="primary">Primary Button</Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Alert severity="info">Info Alert</Alert>
          </Grid>
          {/* ... more components */}
        </Grid>
      </ThemeProvider>

      <CodeSnippet code={`primary: '${primaryColor}'`} />
    </Stack>
  );
}
```

**Why Critical:**

- Core value proposition demo
- Most impactful visual
- Drives home semantic system concept

---

### 4.2 SemanticComparisonDemo.tsx

**Layout:** 2x2 grid comparing primary, info, success, warning

**Each Cell Shows:**

- Intent name + description
- Button preview
- Alert preview
- Snackbar trigger

**Why:**

- Clarifies semantic distinctions
- Prevents misuse
- Visual learning

---

### 4.3 Scenario Demos (Brand, Dark, HighContrast)

**Pattern:** Before/After comparison

**Structure:**

```tsx
<Box>
  <Typography variant="h6">Before (Default)</Typography>
  <ThemeProvider theme={defaultTheme}>
    <DemoComponents />
  </ThemeProvider>
</Box>

<Box>
  <Typography variant="h6">After (Custom)</Typography>
  <ThemeProvider theme={customTheme}>
    <DemoComponents />
  </ThemeProvider>
</Box>
```

**Why:**

- Shows practical application
- Copy-pastable examples
- Demonstrates flexibility

---

### 4.4 TokenPreview.tsx (Reusable Component)

**Purpose:** Display token key, value, and visual swatch

**Props:**

```tsx
interface TokenPreviewProps {
  category: string; // "color.intent"
  key: string; // "primary"
  value: string; // "#2563EB"
  description?: string; // "Brand / main action"
}
```

**Visual:**

```
┌────────────────────────────────────┐
│ [●] primary                        │
│ Brand / main action                │
│ #2563EB                            │
└────────────────────────────────────┘
```

**Why:**

- Consistent token display
- Reusable across sections
- Clear visual mapping

---

## 5. API Exposure Strategy

### 5.1 What to Document

**Full Documentation:**

- `ColorIntent` (all 6 intents with meaning)
- `ColorText` (all 4 with usage)
- `ColorSurface` (all 3 with context)
- `ColorBorder` (all 4 with purpose)
- `RadiusScale` (all 4 with examples)
- `Spacing.unit` (base unit explanation)

**Minimal Documentation:**

- `ColorBackdrop` (single value, self-explanatory)
- `ShadowScale` (3 values, visual only)
- `TypographyScale` (reference only)

**Not Documented:**

- `FieldLayoutConfig` (internal implementation detail)
- Deprecated properties (mention in notes only)

### 5.2 Documentation Format

**Per Token Category:**

1. **TypeScript Interface** (for developers)
2. **Default Values Table** (light mode)
3. **Semantic Meaning** (when to use)
4. **Usage Examples** (code snippets)
5. **Visual Preview** (color swatches, size comparisons)

**Example:**

```markdown
### Color Intent Tokens

Define semantic meaning for UI actions and feedback.

| Token     | Default | Meaning                      | Components             |
| --------- | ------- | ---------------------------- | ---------------------- |
| primary   | #2563EB | Brand identity, main actions | Button, Link, Checkbox |
| info      | #0EA5E9 | Neutral information          | Alert, Snackbar        |
| success   | #15803D | Positive outcomes            | Alert, ConfirmDialog   |
| warning   | #B45309 | Requires attention           | Alert, Warning states  |
| danger    | #DC2626 | Errors, destructive actions  | Alert, Delete buttons  |
| secondary | #4F46E5 | Supporting actions           | Button (secondary)     |
```

**Why:**

- Clear, scannable reference
- Type-safe documentation
- Maps tokens to components

---

## 6. Positioning Strategy (Commercial Value)

### 6.1 Key Messages

**Primary Message:**

> "Design tokens let you define your application's visual language once and see it reflected everywhere."

**Supporting Messages:**

1. **Consistency:** "Change primary color once, update 50+ components"
2. **Semantic:** "Express meaning, not just appearance"
3. **Maintainable:** "No scattered style overrides"
4. **Scalable:** "Add components without breaking brand"

### 6.2 Value Propositions

**For Startups:**

- "Launch with your brand identity from day one"
- "No design system expertise required"

**For Enterprises:**

- "Maintain consistency across teams"
- "WCAG compliance through semantic tokens"
- "Support multiple themes (light, dark, high-contrast)"

**For Agencies:**

- "White-label multiple clients quickly"
- "Theme isolation per tenant"

### 6.3 Differentiation

**NOT Positioned As:**

- ❌ "Just CSS variables"
- ❌ "Color configuration"
- ❌ "MUI theme wrapper"

**Positioned As:**

- ✅ "Semantic design system"
- ✅ "Visual language framework"
- ✅ "Meaning-first customization"

**Why:**

- Higher perceived value
- Architectural sophistication
- Justifies premium positioning

---

## 7. What to Explicitly NOT Include

### 7.1 Technical Internals ❌

**Do NOT document:**

- `mergeComponents` utility implementation
- MUI palette mapping logic
- Override structure details
- Type transformation internals

**Why:**

- Too low-level for docs
- Subject to change
- Distracts from usage

### 7.2 Advanced Theme Hacking ❌

**Do NOT show:**

- Direct MUI theme overrides
- Component-level sx prop patterns
- Bypassing token system

**Why:**

- Encourages bad patterns
- Defeats semantic system
- Creates maintenance debt

### 7.3 Dark Mode Implementation Details ❌

**Do NOT explain:**

- How theme-mui detects mode
- CSS-in-JS specifics
- MUI dark mode internals

**Why:**

- Implementation detail
- May change
- Not user concern

### 7.4 Complete Token Catalog ❌

**Do NOT include:**

- Every possible token combination
- Exhaustive component mapping
- Auto-generated token lists

**Why:**

- Overwhelming
- Low signal-to-noise
- Better as API reference

### 7.5 Migration Guides ❌

**Do NOT provide:**

- MUI → Dashforge migration steps
- Breaking change documentation
- Version upgrade guides

**Why:**

- Different documentation scope
- Covered in migration docs
- Clutters main docs

---

## 8. Mobile-First Responsive Strategy

### 8.1 Breakpoint Behavior

**Mobile (xs, sm):**

- Single column layout
- Stacked comparisons (no side-by-side)
- Simplified demos (fewer simultaneous components)
- Collapsible code snippets

**Tablet (md):**

- 2-column grid for comparisons
- Full demos visible
- Expanded code snippets

**Desktop (lg, xl):**

- 3-column grids where appropriate
- Side-by-side code + preview
- Full-width live demos

### 8.2 Critical Mobile Optimizations

1. **Hero Title:** Reduce font size (40px → 32px on mobile)
2. **Code Snippets:** Horizontal scroll, smaller font
3. **Token Previews:** Stack vertically
4. **Live Demos:** Reduce component count in grid
5. **API Tables:** Horizontal scroll, sticky first column

**Why:**

- Docs increasingly consumed on mobile
- Developers research on tablets
- Performance on smaller devices

---

## 9. Visual Consistency with Existing Docs

### 9.1 Style Inheritance

**Match Existing Patterns:**

- Gradient hero titles (like SelectDocs, SnackbarDocs)
- Purple accent color (#7c3aed for design/theme topics)
- "Quick Start" box with purple border
- Section headers (h2: 36px, h3: 24px)
- Code snippet styling (Fira Code font)
- Badge components for highlights

**Typography Scale:**

- H1: 56px (desktop), 40px (mobile)
- H2: 36px (desktop), 28px (mobile)
- H3: 24px
- Body: 17px (descriptions), 15px (content)

**Color Palette:**

- Primary gradient: Purple → Blue (#7c3aed → #3b82f6)
- Accent: Purple (#7c3aed)
- Text: #0f172a (light), #ffffff (dark)
- Secondary text: rgba(15,23,42,0.65)

### 9.2 Component Reuse

**Reuse from existing docs:**

- `DocsPreviewBlock` for demo containers
- Typography patterns from SelectDocs
- Badge components from SnackbarDocs
- Section spacing (Stack spacing={8})

**Why:**

- Consistency across docs
- Familiar navigation patterns
- Faster implementation

---

## 10. Implementation Priority (If Built)

**Phase 1 (MVP):**

1. Hero Section
2. Quick Start
3. Token Structure (basic)
4. TokenLiveDemo (CRITICAL)
5. API Reference (minimal)

**Phase 2 (Enhanced):** 6. Semantic Comparison Demo 7. Customization Scenarios (3 examples) 8. Implementation Notes 9. Theme Adapter explanation

**Phase 3 (Polish):** 10. Additional scenarios 11. Copy-to-clipboard for all code 12. Mobile optimization pass

**Why:**

- Validate core concept first (TokenLiveDemo)
- Iterate based on feedback
- Avoid over-engineering

---

## 10.4 Explicitly Excluded: Generic Playground

**CRITICAL: There is NO generic "playground" or "token explorer" section.**

**Why Playground Is Not Included:**

1. **Interactive demos are sufficient:**

   - `TokenLiveDemo` provides live token manipulation (color picker + component preview)
   - Scenario demos show real-world customization patterns
   - Users can explore tokens through practical examples

2. **Token structure is reference-focused:**

   - API section provides complete token catalog
   - Compact tables enable quick lookup
   - Full TypeScript interfaces support implementation

3. **Exploratory needs are met:**

   - Live demos allow experimentation
   - Copy-pastable examples provide starting points
   - Semantic guidance teaches correct exploration patterns

4. **Avoid feature creep:**
   - Generic playground adds complexity without clear value
   - Token values are best explored through real component context
   - Focus on practical application over abstract exploration

**What Replaces a Playground:**

- **TokenLiveDemo:** Interactive token manipulation with real components
- **Scenario Demos:** Real-world examples (brand, dark, multi-tenant, accessibility)
- **API Reference:** Complete token catalog for lookup
- **Quick Start:** Copy-paste examples for immediate experimentation

**Decision:** Interactive demos provide sufficient exploration capabilities without needing a generic playground UI.

---

## 11. Success Metrics (Post-Launch)

**Qualitative:**

- Developers understand semantic intent system
- Reduction in "how do I change colors?" support questions
- Increase in proper token usage (not hardcoded values)

**Quantitative:**

- Page views vs other component docs
- Time on page (target: 3+ minutes)
- Code snippet copy rate
- TokenLiveDemo interaction rate

**Feedback Goals:**

- "Finally understand design tokens"
- "This makes theming so easy"
- "The live demo is killer"

---

## 12. Maintenance Considerations

**Update Triggers:**

- New tokens added to `DashforgeTheme`
- Breaking changes in token structure
- New components consuming tokens
- Policy changes in theme-mui

**Review Cadence:**

- Quarterly content review
- Update examples when new components launch
- Sync with policy changes

**Why:**

- Keep docs accurate
- Maintain commercial value
- Reflect product evolution

---

## 13. Final Checklist

Before considering plan complete:

- [x] Hero positions tokens as semantic system ✅
- [x] Quick Start shows immediate impact ✅
- [x] Token Structure explains meaning (not just keys) ✅
- [x] TokenLiveDemo proves cross-component consistency ✅
- [x] Semantic vs Brand distinction is clear ✅
- [x] theme-mui adapter explained conceptually ✅
- [x] Real-world scenarios provided ✅
- [x] API reference structured and scannable ✅
- [x] Implementation notes include "when NOT to use" ✅
- [x] Mobile-first responsive strategy defined ✅
- [x] Visual consistency with existing docs maintained ✅
- [x] Commercial positioning strategy clear ✅
- [x] Explicitly excluded inappropriate content ✅

---

## Conclusion

This plan defines a comprehensive, high-value documentation page for Dashforge Design Tokens that:

1. **Positions tokens as semantic system** (not color config)
2. **Proves value through live demos** (TokenLiveDemo is critical)
3. **Educates semantic thinking** (primary vs info vs success)
4. **Provides practical examples** (copy-pastable scenarios)
5. **Maintains commercial positioning** (visual language framework)
6. **Follows existing patterns** (consistent with SelectDocs/SnackbarDocs)
7. **Respects architectural policies** (theme-mui.md compliance)

**Estimated Implementation Effort:** 3-5 days (1 developer)  
**Commercial Value:** High (core product feature)  
**User Impact:** High (improves customization UX significantly)

**Status:** Plan complete, ready for review and implementation.

---

**Plan Version:** 1.0  
**Last Updated:** 2026-03-27  
**Next Step:** Review → Approve → Implement Phase 1
