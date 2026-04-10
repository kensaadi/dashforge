# Dashforge Component Documentation System

**Version:** 1.0  
**Last Updated:** 2026-04-05  
**Status:** Official Policy  
**Applies To:** All Dashforge UI component documentation pages

---

## Purpose of This Policy

This document defines the **official Dashforge Component Docs System**—the structural, visual, and copywriting standards for all component documentation pages.

It is based on validated refinements to TextField and Textarea docs and exists to:

1. **Ensure consistency** across all component docs
2. **Prevent improvisation** during future docs alignment
3. **Maintain quality** without drift or degradation
4. **Enable batch alignment** with predictable outcomes

This policy is **mandatory** for all component docs pages. Deviations require explicit justification.

---

## What a Component Docs Page Is (and Isn't)

### A Component Docs Page IS:

- **A developer-facing product page** - Showcases the component's value quickly
- **A practical reference** - Developers can find what they need fast
- **A scan-first experience** - Visual hierarchy and compactness enable quick orientation
- **A place where value becomes obvious** - Benefits are clear within 30 seconds

### A Component Docs Page IS NOT:

- ❌ A blog post (narrative-driven, chronological)
- ❌ An API dump (reference-only, no context)
- ❌ A long tutorial (step-by-step walkthrough)
- ❌ A marketing page (superlatives, emotional language)

**Golden Rule:**  
Every component docs page should make it obvious **when to use the component** and **how to use it** within seconds of landing.

---

## Page Structure (Standard Section Order)

The following structure is the **validated standard** for Dashforge component docs pages.

### Core Sections (Mandatory for All Components)

1. **Hero Section**

   - Component title
   - Component description (1-2 sentences, component-specific)
   - Theme color

2. **Quick Start**

   - Identity hook (1 short line explaining when to use the component)
   - Minimal import + usage example
   - "Copy & Paste" badge
   - Purple-themed card

3. **Examples**

   - Pattern library of common configurations
   - Responsive 2-column grid (desktop) / 1-column (mobile)
   - Compact headers and descriptions

4. **Capabilities**

   - Progressive adoption model (Controlled, React Hook Form Ready, Reactive Visibility)
   - 3-card grid layout (responsive: 1-col mobile, 2-col tablet, 3-col desktop)
   - Component-specific capability descriptions

5. **API Reference**

   - Complete props table
   - Type definitions
   - Comes AFTER exploratory content, BEFORE "Under the hood"

6. **Under the hood**
   - 3 compact blocks (Form integration, Behavior model, Architecture)
   - Explains "why it behaves this way"
   - No numbered badges, no hover effects
   - Clean card design

### Optional Sections (Include When Relevant)

7. **Layout Variants** (for components with multiple visual layouts)

   - Examples: TextField (floating, stacked, inline)
   - Group with Examples section (tighter spacing)

8. **Playground** (for highly configurable components)

   - Interactive prop explorer
   - Live preview
   - Place after Examples/Layout Variants, before Capabilities

9. **Access Control (RBAC)** (for components supporting RBAC)

   - 2-column grid of RBAC patterns (hide, disable, readonly, combined)
   - Group with Capabilities section (tighter spacing)
   - Compact info box for notes

10. **Form Integration / Scenarios** (for form-connected components)
    - Live demos with React Hook Form
    - Conditional visibility examples
    - Place AFTER Capabilities/RBAC, BEFORE API Reference
    - Blue-themed header card

### Section Order Summary

**Exploration Zone:**

1. Hero
2. Quick Start
3. Examples
4. Layout Variants (optional)
5. Playground (optional)

**Capabilities Zone:** 6. Capabilities 7. Access Control / RBAC (optional) 8. Form Integration / Scenarios (optional)

**Reference Zone:** 9. API Reference 10. Under the hood

**Critical:** Exploration content comes first, reference content comes last.

---

## Section Grouping and Rhythm Rules

### Spacing Logic

**Tighter spacing (spacing={6}):**

- Related exploratory sections
  - Examples + Layout Variants
  - Capabilities + RBAC

**Stronger spacing (spacing={8}):**

- Default spacing between major zones
- Used for unrelated sections

**Visual breaks (`<DocsDivider />`):**

- Before Form Integration / Scenarios
- Before API Reference
- Before Under the hood

### Grouping Strategy

```tsx
// Exploration Zone
<Stack spacing={8}>
  <Hero />
  <QuickStart />

  {/* Related: Examples + Layout Variants */}
  <Stack spacing={6}>
    <Examples />
    <LayoutVariants />
  </Stack>

  <Playground />

  {/* Related: Capabilities + RBAC */}
  <Stack spacing={6}>
    <Capabilities />
    <RBAC />
  </Stack>
</Stack>

<DocsDivider />

{/* Form Integration */}
<Scenarios />

<DocsDivider />

{/* Reference Zone */}
<API />

<DocsDivider />

<UnderTheHood />
```

### Why This Rhythm Works

- **Reduces vertical fatigue:** Related sections grouped tightly
- **Clear hierarchy:** Visual breaks signal topic shifts
- **Scannable flow:** User can skip reference sections if exploring
- **Progressive depth:** Shallow → Deep (examples → API → internals)

---

## Examples Section Rules

### Purpose

The Examples section is a **visual pattern library**, not an article. Users should:

- Compare configurations side-by-side
- Quickly identify relevant patterns
- Copy code without reading paragraphs

### Layout Pattern

**Responsive 2-column grid:**

```tsx
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 3,
  }}
>
  {examples.map((example) => (
    <Box
      key={example.title}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Stack spacing={1.5} sx={{ height: '100%' }}>
        {/* Compact Header */}
        <Box>
          <Typography
            variant="h6"
            sx={{ fontSize: 15, fontWeight: 600, mb: 0.25 }}
          >
            {example.title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 13 }}>
            {example.description}
          </Typography>
        </Box>

        {/* Preview Block with Compact Mode */}
        <DocsPreviewBlock code={example.code} badge="" compact>
          {example.component}
        </DocsPreviewBlock>
      </Stack>
    </Box>
  ))}
</Box>
```

### Key Rules

1. **Use responsive grid when:**

   - Component has 4+ examples
   - Examples are visually comparable
   - Side-by-side comparison adds value

2. **Use vertical stack when:**

   - Component has 1-3 examples
   - Examples are complex/large (e.g., full forms)
   - Horizontal comparison doesn't help

3. **Header compactness:**

   - Title: `fontSize: 15, fontWeight: 600, mb: 0.25`
   - Description: `fontSize: 13`
   - No redundant spacing

4. **Use `DocsPreviewBlock` with `compact` prop:**

   - Reduces internal padding
   - Removes unnecessary visual weight
   - Badge should be empty string (`badge=""`)

5. **Example descriptions must:**
   - Explain **usage intent**, not just UI state
   - Be component-specific (not generic)
   - Be concise (6-10 words)

### Description Anti-Patterns

❌ **Generic UI state:**

- "A simple text field with a label"
- "A textarea with placeholder text to guide input"

✅ **Usage intent:**

- "Single-line input for names or emails"
- "Guide users with placeholder text for feedback or comments"

---

## Identity Hook Rule

### What It Is

The **identity hook** is a 1-line statement in the Quick Start section that clarifies **when the component is the right choice**.

### Where It Appears

Inside the Quick Start card, immediately before the code block:

```tsx
<Box id="quick-start" sx={{ /* purple card styles */ }}>
  <Stack spacing={2}>
    <Stack direction="row" /* Quick Start header */ />

    {/* Identity Hook */}
    <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: /* muted */ }}>
      For multiline input—feedback, comments, descriptions, and long-form content.
    </Typography>

    <DocsCodeBlock code={/* ... */} />
  </Stack>
</Box>
```

### Rules

1. **Length:** 10-15 words max
2. **Format:** "For [use case]—[examples], [examples], and [examples]."
3. **Specificity:** Must clarify component's distinct purpose
4. **Placement:** After "Quick Start" header, before code block

### Examples

| Component | Identity Hook                                                                  |
| --------- | ------------------------------------------------------------------------------ |
| TextField | "For single-line input—names, emails, search, and general-purpose fields."     |
| Textarea  | "For multiline input—feedback, comments, descriptions, and long-form content." |
| Select    | "For choosing one option—categories, statuses, and dropdown selections."       |
| Checkbox  | "For multiple selections—preferences, permissions, and opt-ins."               |

### Why This Matters

Without an identity hook:

- Users don't immediately know when to use the component
- Components feel generic and interchangeable
- Mental model formation is slower

With an identity hook:

- Instant clarity about component purpose
- Faster decision-making ("Is this the right component?")
- Stronger component-specific identity

**Mandatory:** Every component docs page MUST have an identity hook.

---

## Copywriting Rules

### High-Signal, Low-Noise

**Principle:** Every word should earn its place. Remove qualifiers that don't add information.

### Forbidden Qualifiers (Unless Justified)

- ❌ "seamless"
- ❌ "powerful"
- ❌ "flexible"
- ❌ "robust"
- ❌ "designed for"
- ❌ "explicitly"

These are **marketing words**, not developer information.

### Preferred Patterns

| Instead of...                                | Write...                                  |
| -------------------------------------------- | ----------------------------------------- |
| "Designed to integrate with React Hook Form" | "Integrates with React Hook Form"         |
| "Seamlessly works as a controlled component" | "Works as a controlled component"         |
| "Provides powerful validation capabilities"  | "Automatic validation and error handling" |
| "Explicitly supports RBAC"                   | "Supports RBAC"                           |

### Copy Length Guidelines

- **Capability descriptions:** 13-17 words
- **Example descriptions:** 6-10 words
- **Section descriptions:** 8-12 words
- **"Under the hood" blocks:** 2 paragraphs max (use `\n\n` for breaks)

### Paragraph Structure

**Prefer:**

- Short sentences (10-15 words)
- Active voice
- Concrete examples over abstract concepts
- "What you get" over "how it works internally"

**Avoid:**

- Run-on sentences (20+ words)
- Passive voice
- Vague language ("allows you to", "provides the ability to")
- Internal implementation details

### Example Transformation

**Before (verbose, marketing-heavy):**

```
Textarea is designed for progressive adoption and seamlessly integrates
with React Hook Form workflows through DashForm. It's compatible with
existing form-library patterns and provides powerful validation capabilities
out of the box.
```

**After (concise, developer-focused):**

```
Long-form input validation with React Hook Form. Automatic error handling
for feedback, comments, and multiline fields.
```

**Result:** 31 words → 16 words (48% reduction) with higher information density.

---

## "Under the hood" Section Rules

### Purpose

Explain **why the component behaves the way it does** without drowning in internal implementation details.

### Structure: 3 Compact Blocks

Every "Under the hood" section should have exactly **3 blocks**:

1. **Form integration** - How it binds to form state
2. **Behavior model** - Key behavioral characteristics
3. **Architecture** - Foundation and use cases

### Block Pattern

```tsx
const notes = [
  {
    title: 'Form integration',
    content:
      'Automatically binds to form state inside DashForm. No Controller, no manual wiring.\n\nWorks as a standard MUI [Component] when used standalone.',
  },
  {
    title: 'Behavior model',
    content:
      '[Component-specific behavior]. Errors appear only after blur or submit.\n\n[Additional behavior details]. Reacts to form state using visibleWhen.',
  },
  {
    title: 'Architecture',
    content:
      'Built on MUI [BaseComponent]. Fully typed with TypeScript.\n\n[Component-specific purpose and use cases].',
  },
];
```

### Visual Design

- **Card style:** Light background, subtle border
- **Title:** `fontSize: 15, fontWeight: 600`
- **Content:** `fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line'`
- **Spacing:** `spacing={3}` between cards
- **No numbered badges**
- **No hover effects**

### Content Rules

**Include:**

- High-level behavior patterns
- Why certain decisions were made
- When to use specific features
- Component-specific behavioral quirks

**Exclude:**

- Low-value internals (e.g., "uses React.useState internally")
- Lifecycle minutiae
- Implementation details without user value
- Jargon without explanation

### Length Discipline

- **Each block:** 2 paragraphs max (separated by `\n\n`)
- **Each paragraph:** 1-2 sentences
- **Total per block:** ~30-50 words

**Example of good length:**

```
Always renders multiline with 3 rows by default (adjust via minRows for
longer content like bios or feedback). Errors appear only after blur or submit.

Preserves newlines in string values—critical for paragraphs, code snippets,
and formatted text. Reacts to form state using visibleWhen.
```

**Word count:** 47 words, 2 paragraphs, high signal-to-noise ratio.

---

## Component-Specific Truth Rule

### The Problem This Rule Solves

Without this rule, docs pages become **structural clones**:

- TextField and Textarea feel identical
- Select and Autocomplete are indistinguishable
- Components lose their unique identity

### The Rule

**Component docs MUST:**

1. ✅ **Align structurally** (same sections, same layout patterns)
2. ✅ **Preserve component-specific meaning** (unique use cases, behaviors, identity)
3. ❌ **NOT become content clones** (no blind copy/paste from other components)

### Application Guidelines

#### Structural Alignment (Do This)

- Use the same section order
- Use the same grid layouts
- Use the same spacing logic
- Use the same visual design

#### Content Differentiation (Also Do This)

- **Identity hooks** must be component-specific

  - TextField: "For single-line input..."
  - Textarea: "For multiline input..."
  - NOT: "For input..." (too generic)

- **Capability descriptions** must reflect component purpose

  - TextField: "Standard React controlled component"
  - Textarea: "Controlled multiline input with standard React patterns"
  - NOT: Same exact wording for both

- **Examples** must show component-specific use cases

  - TextField: names, emails, search
  - Textarea: feedback, comments, descriptions
  - NOT: Generic "input" examples

- **"Under the hood"** must explain component-specific behavior
  - TextField: "foundation for composed behaviors"
  - Textarea: "preserves newlines—critical for paragraphs, code snippets"
  - NOT: Generic form integration explanation

### Testing for Component-Specific Truth

**Ask these questions:**

1. If I swap component names, does the content still make sense? (Should be NO)
2. Does the identity hook clarify when to use THIS component vs others? (Should be YES)
3. Are the examples relevant to THIS component's primary use cases? (Should be YES)
4. Does "Under the hood" explain THIS component's unique behavior? (Should be YES)

**If any answer is wrong, the component-specific truth rule is violated.**

---

## Visual Consistency Rules

### Spacing Values

**Standard spacing multiplier:** Material-UI spacing units (1 unit = 8px)

| Use Case         | Spacing Value                    | Visual Effect            |
| ---------------- | -------------------------------- | ------------------------ |
| Related sections | `spacing={6}`                    | 48px gap (tighter)       |
| Major sections   | `spacing={8}`                    | 64px gap (standard)      |
| Within cards     | `spacing={1.5}` to `spacing={3}` | Compact internal spacing |
| Grid gaps        | `gap: 3`                         | 24px between grid items  |

### Typography Scale

| Element                | Font Size | Font Weight | Line Height |
| ---------------------- | --------- | ----------- | ----------- |
| Section titles (H2)    | 28-36px   | 800         | 1.2         |
| Subsection titles (H3) | 18-20px   | 700         | 1.3         |
| Card titles            | 15px      | 600         | 1.3         |
| Body text              | 14-15px   | 400         | 1.7         |
| Descriptions           | 13px      | 400         | 1.5-1.6     |
| Code                   | 13px      | 400         | 1.5         |
| Labels/badges          | 10-11px   | 700         | 1.2         |

### Color Usage

**Section themes:**

- Quick Start: Purple (`rgba(139,92,246,...)`)
- Form Integration: Blue (`rgba(59,130,246,...)`)
- Info boxes: Blue (`rgba(59,130,246,...)`)
- Success badges: Green (`rgba(34,197,94,...)`)

**Card backgrounds (dark mode):**

- Examples cards: `rgba(17,24,39,0.40)`
- RBAC cards: `rgba(17,24,39,0.40)`
- "Under the hood" cards: `rgba(17,24,39,0.40)`

**Card backgrounds (light mode):**

- Examples cards: `rgba(248,250,252,0.90)`
- RBAC cards: `rgba(248,250,252,0.90)`
- "Under the hood" cards: `rgba(248,250,252,0.90)`

### Card Design Principles

1. **Subtle backgrounds** - Avoid heavy solid colors
2. **Consistent borders** - `1px solid rgba(...)` with low opacity
3. **Gentle shadows** - `0 1px 8px rgba(...)` or `0 2px 12px rgba(...)`
4. **Hover effects (for interactive cards):**
   - Slight shadow increase
   - `transform: translateY(-2px)`
   - `transition: all 0.2s ease`

### Grid Patterns

**2-column responsive grid (Examples, RBAC):**

```tsx
gridTemplateColumns: {
  xs: '1fr',
  md: 'repeat(2, minmax(0, 1fr))',
}
```

**3-column responsive grid (Capabilities):**

```tsx
gridTemplateColumns: {
  xs: '1fr',
  md: 'repeat(2, minmax(0, 1fr))',
  xl: 'repeat(3, minmax(0, 1fr))',
}
```

**Gap:** Always use `gap: 3` (24px) for visual consistency.

### Compactness Principles

1. **Reduce vertical space where possible:**

   - Tight spacing within cards
   - Compact headers (`mb: 0.25` between title and description)
   - Strategic grouping of related sections

2. **Avoid noisy decorative UI:**

   - No numbered badges (except where semantically meaningful)
   - No excessive animations
   - No gratuitous icons

3. **Use whitespace intentionally:**
   - Generous spacing between major sections
   - Tight spacing within sections
   - Creates rhythm and hierarchy

---

## RBAC Section Pattern (When Applicable)

### When to Include RBAC Section

Include if the component supports the `access` prop and RBAC integration.

### Structure

1. **Section header**

   - Title: "Access Control (RBAC)"
   - Description: "Control field visibility and interaction based on user permissions..."

2. **2-column grid of 4 patterns:**

   - Hide when unauthorized
   - Disable when cannot edit
   - Readonly for view-only
   - Combined with visibleWhen

3. **Compact info box** (at bottom)
   - Note about visibleWhen + RBAC interaction

### Pattern Code

```tsx
<Stack spacing={4} id="access-control">
  <Box>
    <Typography
      variant="h2"
      sx={
        {
          /* section title styles */
        }
      }
    >
      Access Control (RBAC)
    </Typography>
    <Typography
      sx={
        {
          /* description styles */
        }
      }
    >
      Control field visibility and interaction based on user permissions. Fields
      can be hidden, disabled, or readonly when users lack access.
    </Typography>
  </Box>

  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
      gap: 3,
    }}
  >
    {/* 4 RBAC pattern cards */}
  </Box>

  <Box
    sx={
      {
        /* info box styles */
      }
    }
  >
    <Typography>
      <strong>Note:</strong> When combining visibleWhen with RBAC, both
      conditions must be satisfied. The field shows only if UI logic returns
      true AND the user has required permissions.
    </Typography>
  </Box>
</Stack>
```

### RBAC Card Pattern

```tsx
<Box
  sx={{
    p: 2.5,
    borderRadius: 2,
    bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
    border: isDark
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(15,23,42,0.10)',
  }}
>
  <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>
    [Pattern Title]
  </Typography>
  <DocsCodeBlock code={/* component-specific example */} language="tsx" />
</Box>
```

### Grouping Rule

RBAC section should be grouped with Capabilities section using `spacing={6}` for tighter visual relationship.

---

## Capabilities Section Pattern

### Purpose

Explain the **progressive adoption model** for Dashforge components:

1. Controlled (standard React patterns)
2. React Hook Form Ready (DashForm integration)
3. Reactive Visibility (visibleWhen)

### Structure: 3-Card Grid

Responsive layout:

- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop

### Card Content

Each capability card contains:

1. **Title** (e.g., "Controlled", "React Hook Form Ready", "Reactive Visibility")
2. **Status badge** (e.g., "Available Now", "Integration-Friendly")
3. **Description** (13-17 words, component-specific)
4. **3 bullet points** (benefits/features)
5. **Code example** (component-specific usage)

### Capability Descriptions: Component-Specific Rule

**Generic (violates policy):**

```
Works as a standard React controlled component. No proprietary lock-in—use familiar patterns.
```

**Component-specific (follows policy):**

- **TextField:** "Works as a standard React controlled component. No proprietary lock-in—use familiar patterns."
- **Textarea:** "Controlled multiline input with standard React patterns. No proprietary lock-in—use familiar value/onChange."

**Key difference:** Textarea adds "multiline" qualifier to signal its specific purpose.

### Intro Paragraph

Standard intro (adapt wording to component):

```
Use [Component] as a controlled component, integrate with React Hook Form,
or leverage reactive capabilities. Choose the adoption level that fits
your workflow.
```

**Keep this intro consistent across components** (structural alignment), but ensure examples in capability cards are component-specific (content differentiation).

---

## Form Integration / Scenarios Pattern (When Applicable)

### When to Include

Include for components that:

- Participate in forms (TextField, Textarea, Select, etc.)
- Support React Hook Form integration
- Have meaningful conditional visibility use cases

### Structure

1. **Blue-themed header card**

   - Title: "Form Integration"
   - Description: "Real-world scenarios with React Hook Form and dynamic visibility"

2. **2 live scenario demos:**

   - React Hook Form Integration
   - Reactive Conditional Visibility

3. **Each scenario includes:**
   - Interactive demo (users can try it)
   - Complete code example
   - "Why it matters" box

### Visual Design

**Header card:**

- Background: `rgba(59,130,246,0.06)` (dark) / `rgba(59,130,246,0.04)` (light)
- Border: `rgba(59,130,246,0.15)` (dark) / `rgba(59,130,246,0.12)` (light)
- Padding: `p: 3`

**"Why it matters" box:**

- Background: `rgba(139,92,246,0.08)` (dark) / `rgba(139,92,246,0.05)` (light)
- Border: `rgba(139,92,246,0.20)` (dark) / `rgba(139,92,246,0.15)` (light)
- Padding: `p: 2`

### Placement Rule

Form Integration section appears:

- AFTER Capabilities and RBAC
- BEFORE API Reference
- Preceded by `<DocsDivider />`

---

## Execution Checklist

Use this checklist when aligning component docs to this system:

### Structure & Layout

- [ ] Sections follow standard order (Hero → Quick Start → Examples → ... → API → Under the hood)
- [ ] Related sections grouped with `spacing={6}`
- [ ] Major sections separated with `spacing={8}`
- [ ] Visual breaks (`<DocsDivider />`) before Scenarios, API, and "Under the hood"
- [ ] Examples use 2-column grid (when 4+ examples exist)
- [ ] RBAC section uses 2-column grid (if included)
- [ ] Capabilities section uses 3-column responsive grid

### Identity & Content

- [ ] Quick Start includes component-specific identity hook
- [ ] Identity hook is 10-15 words and explains when to use component
- [ ] Example descriptions explain usage intent (not just UI state)
- [ ] Capability descriptions are component-specific (not generic)
- [ ] "Under the hood" has exactly 3 blocks
- [ ] "Under the hood" content is component-specific (not copy/pasted)

### Copywriting Quality

- [ ] No marketing qualifiers ("seamless", "powerful", "flexible") without justification
- [ ] Capability descriptions: 13-17 words
- [ ] Example descriptions: 6-10 words
- [ ] "Under the hood" blocks: 2 paragraphs max, 30-50 words each
- [ ] Active voice, short sentences, concrete examples

### Visual Consistency

- [ ] Typography follows standard scale (titles 28-36px, body 14-15px, descriptions 13px)
- [ ] Card backgrounds consistent with system (light backgrounds, subtle borders)
- [ ] Spacing values align with policy (6 for related, 8 for major sections)
- [ ] Color usage follows theme (purple Quick Start, blue Form Integration, etc.)
- [ ] Compact headers (`fontSize: 15, mb: 0.25`)
- [ ] DocsPreviewBlock uses `compact` prop

### Component-Specific Truth

- [ ] Content wouldn't make sense if component names were swapped
- [ ] Identity hook clarifies THIS component vs others
- [ ] Examples show THIS component's primary use cases
- [ ] "Under the hood" explains THIS component's unique behavior
- [ ] Capability descriptions reflect component-specific purpose

### Optional Sections (If Applicable)

- [ ] Layout Variants included (if component has multiple layouts)
- [ ] Playground included (if component is highly configurable)
- [ ] RBAC section included (if component supports `access` prop)
- [ ] Form Integration included (if component participates in forms)

### Final Verification

- [ ] Page is scannable (user can understand value in 30 seconds)
- [ ] Page preserves component-specific identity
- [ ] No blind copy/paste from other component docs
- [ ] Visual hierarchy guides user: exploration → capabilities → reference
- [ ] Code examples are accurate and runnable

---

## Common Anti-Patterns to Avoid

### 1. Vertical Stack Overload

❌ **Anti-pattern:**

```tsx
<Stack spacing={8}>
  <Example1 />
  <Example2 />
  <Example3 />
  <Example4 />
  <Example5 />
  <Example6 />
</Stack>
```

✅ **Correct:**

```tsx
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
    gap: 3,
  }}
>
  <Example1 />
  <Example2 />
  {/* ... */}
</Box>
```

**Why:** Vertical stacks create fatigue. Grids enable side-by-side comparison and reduce scrolling.

---

### 2. Generic Identity

❌ **Anti-pattern:**

```tsx
// TextField Quick Start
<Typography>For input fields.</Typography>

// Textarea Quick Start
<Typography>For input fields.</Typography>
```

✅ **Correct:**

```tsx
// TextField Quick Start
<Typography>For single-line input—names, emails, search, and general-purpose fields.</Typography>

// Textarea Quick Start
<Typography>For multiline input—feedback, comments, descriptions, and long-form content.</Typography>
```

**Why:** Generic hooks don't differentiate components. Specific hooks create clear mental models.

---

### 3. Verbose "Under the hood"

❌ **Anti-pattern:**

```tsx
const notes = [
  { title: 'DashForm Integration', content: '...' },
  { title: 'Standalone Usage', content: '...' },
  { title: 'Always Multiline', content: '...' },
  { title: 'Default Rows', content: '...' },
  { title: 'Error Gating', content: '...' },
  { title: 'String Value', content: '...' },
  { title: 'Reactive Visibility', content: '...' },
  { title: 'Built on MUI', content: '...' },
  { title: 'Type Safety', content: '...' },
  { title: 'Textarea vs TextField', content: '...' },
  { title: 'Common Use Cases', content: '...' },
];
```

✅ **Correct:**

```tsx
const notes = [
  {
    title: 'Form integration',
    content:
      'Automatically binds to form state inside DashForm. No Controller, no manual wiring.\n\nWorks as a standard MUI TextField (multiline) when used standalone.',
  },
  {
    title: 'Behavior model',
    content:
      'Always renders multiline with 3 rows by default (adjust via minRows for longer content like bios or feedback). Errors appear only after blur or submit.\n\nPreserves newlines in string values—critical for paragraphs, code snippets, and formatted text. Reacts to form state using visibleWhen.',
  },
  {
    title: 'Architecture',
    content:
      'Built on MUI TextField with multiline={true}. Fully typed with TypeScript.\n\nPurpose-built for comments, feedback, descriptions, issue reports, and any long-form user input.',
  },
];
```

**Why:** 11 blocks are overwhelming. 3 blocks are scannable and digestible.

---

### 4. Marketing Language

❌ **Anti-pattern:**

```
TextField seamlessly integrates with React Hook Form workflows, providing
powerful and flexible validation capabilities. It's explicitly designed for
progressive adoption, offering robust type safety and a seamless developer
experience.
```

✅ **Correct:**

```
Integrates with React Hook Form via DashForm. Automatic validation, error
handling, and familiar RHF patterns.
```

**Why:** Marketing words reduce 信号-to-noise ratio. Developer-focused language is clearer and more trustworthy.

---

### 5. UI State Descriptions (Instead of Usage Intent)

❌ **Anti-pattern:**

```tsx
{
  title: 'Error State',
  description: 'A textarea displaying an error with helper text',
}
```

✅ **Correct:**

```tsx
{
  title: 'Error State',
  description: 'Validation errors for required or length-constrained text',
}
```

**Why:** "Displaying an error" describes what the UI looks like. "Validation errors for required text" explains when to use this pattern.

---

## Policy Enforcement

### When to Deviate

Deviations from this policy are allowed only when:

1. **Component has unique requirements** that don't fit the standard structure

   - Example: A component with no form integration shouldn't force an empty "Form Integration" section

2. **Component-specific truth demands it**

   - Example: Textarea needs "minRows" emphasis in "Under the hood", TextField doesn't

3. **Deviation improves user experience** without breaking consistency
   - Must be justified in PR description
   - Must not create visual inconsistency

### Red Flags (Require Review)

- Adding new section types not in this policy
- Creating new grid layouts (different from 2-col or 3-col patterns)
- Changing typography scale without justification
- Removing mandatory sections (Hero, Quick Start, Examples, API, "Under the hood")
- Using different spacing values

### Approval Required For

- New optional section types
- Changes to standard section order
- New visual patterns (card styles, colors, etc.)
- Changes to copywriting guidelines

---

## Version History

| Version | Date       | Changes                                                |
| ------- | ---------- | ------------------------------------------------------ |
| 1.0     | 2026-04-05 | Initial policy based on TextField/Textarea refinements |

---

## References

**Source implementations:**

- `web/src/pages/Docs/components/text-field/*`
- `web/src/pages/Docs/components/textarea/*`

**Related reports:**

- `.opencode/reports/textfield-docs-visual-refinement.md`
- `.opencode/reports/textarea-docs-alignment-with-textfield.md`
- `.opencode/reports/textarea-identity-boost.md`
