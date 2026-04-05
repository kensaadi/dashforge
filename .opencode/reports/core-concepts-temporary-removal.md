# Core Concepts Group — Temporary Removal

**Date:** 2026-04-05  
**Application:** web/docs  
**Scope:** Docs sidebar navigation — UX cleanup and perception improvement

---

## Executive Summary

Temporarily removed the **Core Concepts** group from the visible docs sidebar navigation to eliminate UX confusion and improve perceived documentation completeness.

The group structure has been **preserved in code comments** for easy future re-activation when content is ready.

### Why This Matters

The documentation sidebar previously showed:

```
GETTING STARTED
CORE CONCEPTS          ← empty group showing "Coming soon"
UI COMPONENTS
FORM SYSTEM
ACCESS CONTROL
THEME SYSTEM
ARCHITECTURE
```

**Problems this created:**

1. **UX Confusion** — Users see an empty placeholder section and wonder if the docs are incomplete
2. **Perception Issue** — "Coming soon" text signals unfinished product, reducing trust
3. **Navigation Clutter** — Empty section takes up visual space without providing value
4. **Onboarding Friction** — New users don't know if they need to wait for this content before using Dashforge

**After this change:**

```
GETTING STARTED
UI COMPONENTS
FORM SYSTEM
ACCESS CONTROL
THEME SYSTEM
ARCHITECTURE
```

Now the sidebar:

- Feels complete and professional
- Contains only actionable, ready-to-use content
- Reduces cognitive load for new users
- Eliminates "unfinished" perception

---

## What Changed

### Removal Method: Code Comment Preservation

The `Core Concepts` group was **commented out** in the sidebar navigation array while preserving:

- The group structure
- Clear documentation on why it's hidden
- Instructions for re-enabling
- Ideas for future content

This approach is:

- **Minimal** — single file change
- **Reversible** — uncomment to restore
- **No feature flags** — no complex conditional logic
- **Clean** — no runtime overhead
- **Developer-friendly** — clear intent in code

### Modified File

**File:** `/web/src/pages/Docs/components/DocsSidebar.model.ts`

**Before:**

```typescript
export const docsSidebarTree: DocsSidebarGroup[] = [
  {
    title: 'Getting Started',
    items: [
      /* ... */
    ],
  },
  {
    title: 'Core Concepts',
    items: [],
  },
  {
    title: 'UI Components',
    items: [
      /* ... */
    ],
  },
  // ...
];
```

**After:**

```typescript
export const docsSidebarTree: DocsSidebarGroup[] = [
  {
    title: 'Getting Started',
    items: [
      /* ... */
    ],
  },
  /**
   * Core Concepts group - Temporarily hidden until content is ready
   *
   * This group is preserved for future use when the mental model is stable
   * and deeper conceptual explanations are needed.
   *
   * To re-enable: uncomment this block and add it back to the array above.
   *
   * Potential future content:
   * - Form-aware components (how registration works)
   * - Predictive engine (how reactivity works)
   * - Bridge contract (how components integrate)
   * - Form closure (error display logic)
   * - Conditional rendering (visibleWhen mechanics)
   */
  // {
  //   title: 'Core Concepts',
  //   items: [],
  // },
  {
    title: 'UI Components',
    items: [
      /* ... */
    ],
  },
  // ...
];
```

---

## Structure Preservation

### Comment Documentation Includes

1. **Why it's hidden:** "Temporarily hidden until content is ready"
2. **When to bring it back:** "when the mental model is stable and deeper conceptual explanations are needed"
3. **How to re-enable:** "uncomment this block and add it back to the array above"
4. **Future content ideas:** List of 5 potential conceptual topics

This ensures:

- Future developers understand the decision
- Re-enabling is a 2-minute task (remove comment markers)
- No institutional knowledge is lost
- Content planning is captured

---

## Verification: No Broken References

### Checked for Dependencies

**Search performed:**

```bash
grep -r "core-concepts\|Core Concepts" web/src/pages/Docs
```

**Results:**

- ✅ No pages link to a `/docs/core-concepts` route
- ✅ No "Next Steps" sections reference Core Concepts group
- ✅ No TOC logic depends on Core Concepts group
- ⚠️ Two pages mention "Core Concepts" — both are **Access Control > Core Concepts** page references (not the top-level group)

**Access Control references (intentional and correct):**

1. `AccessControlQuickStart.tsx`: "**Core Concepts:** Learn about role inheritance..."
2. `AccessControlOverview.tsx`: "**Core Concepts:** Learn about subjects, roles..."

These references point to `/docs/access-control/core-concepts` (a valid page within the Access Control group), **not** the top-level Core Concepts group. No changes needed.

---

## UX and Perception Impact

### Before This Change

**User Mental Model:**

1. User arrives at docs
2. Sees "Core Concepts" with "Coming soon" text
3. Questions form:
   - "Is this product ready for production use?"
   - "Do I need to wait for Core Concepts before I can use this?"
   - "What am I missing by not having this content?"
   - "Should I come back later when docs are finished?"

**Psychological Impact:**

- **Doubt** — unfinished sections signal unfinished product
- **Hesitation** — unclear if missing critical information
- **Friction** — extra cognitive load evaluating completeness

### After This Change

**User Mental Model:**

1. User arrives at docs
2. Sees complete, actionable navigation
3. Conclusions formed:
   - "This product has comprehensive documentation"
   - "I can get started immediately"
   - "Everything I need is here"
   - "This feels professional and mature"

**Psychological Impact:**

- **Confidence** — documentation feels complete
- **Clarity** — clear onboarding path from Getting Started
- **Momentum** — no barriers to starting
- **Trust** — polish signals product quality

---

## Sidebar Navigation Flow

### Current Sidebar Structure (Post-Change)

```
GETTING STARTED
├── Overview
├── Why Dashforge
├── Installation
└── Usage

UI COMPONENTS
├── Input
│   ├── TextField
│   ├── Textarea
│   ├── NumberField
│   ├── Select
│   ├── Autocomplete
│   ├── Checkbox
│   ├── RadioGroup
│   ├── Switch
│   └── DateTimePicker
├── Layout
│   └── AppShell
├── Navigation
│   ├── Breadcrumbs
│   └── TopBar
├── Utilities
│   ├── ConfirmDialog
│   └── Snackbar
└── Actions
    └── Button

FORM SYSTEM
├── Overview
├── Quick Start
├── Reactions
├── Dynamic Forms
├── Patterns
└── API Reference

ACCESS CONTROL
├── Overview
├── Quick Start
├── Core Concepts        ← This is a page, not the hidden group
├── Dashforge Integration
└── Playground

THEME SYSTEM
└── Design Tokens

ARCHITECTURE
└── Project Structure
```

**Flow feels:**

- Complete (no empty sections)
- Professional (no "coming soon" placeholders)
- Actionable (every section has real content)
- Coherent (logical progression from onboarding to advanced topics)

---

## When to Re-Enable Core Concepts

### Criteria for Restoration

Bring back the `Core Concepts` group when **all** of these conditions are met:

1. **Mental Model Stability**

   - Dashforge's core abstractions are finalized
   - API surface is stable
   - Conceptual framework is proven through real usage

2. **User Demand**

   - Users explicitly ask "how does X work under the hood?"
   - Support questions reveal conceptual gaps
   - Advanced users want deeper understanding

3. **Content Ready**

   - At least 3 complete conceptual articles written
   - Each article provides value beyond API reference
   - Content is tested with real users

4. **Product Maturity**
   - Dashforge has real production users
   - Core patterns are established and validated
   - No major architectural changes expected

### Don't Re-Enable If:

- Only 1-2 conceptual articles are ready (put them in "Architecture" or "Form System" instead)
- Content duplicates what's in component docs (avoid redundancy)
- Concepts are still evolving (wait for stability)

---

## How to Re-Enable

### Step-by-Step Restoration Process

1. **Navigate to file:**

   ```
   web/src/pages/Docs/components/DocsSidebar.model.ts
   ```

2. **Locate the commented block:**

   - Search for `Core Concepts group - Temporarily hidden`
   - Should be around line 68-86

3. **Uncomment the group:**

   ```typescript
   // Remove comment markers from these lines:
   {
     title: 'Core Concepts',
     items: [
       // Add your content items here
       {
         type: 'link',
         label: 'Form-Aware Components',
         path: '/docs/core-concepts/form-aware-components',
       },
       {
         type: 'link',
         label: 'Predictive Engine',
         path: '/docs/core-concepts/predictive-engine',
       },
       // etc.
     ],
   },
   ```

4. **Add actual content items:**

   - Create corresponding page components
   - Add routes in `DocsPage.tsx`
   - Add TOC items for each page

5. **Test:**
   - Verify sidebar renders correctly
   - Check navigation works
   - Ensure no layout issues

**Estimated time:** 5-10 minutes (excluding content creation)

---

## Potential Future Content Ideas

When `Core Concepts` is re-enabled, consider these topics:

### 1. Form-Aware Components

**What it covers:**

- How components automatically register with `DashForm`
- The bridge contract between UI layer and form layer
- Why you don't need `Controller` wrappers

**Value:**

- Helps developers understand "magic" behind automatic registration
- Enables building custom form-aware components

### 2. Predictive Engine

**What it covers:**

- How `@dashforge/ui-core` enables reactive form behavior
- Dependency graph and change propagation
- Why field updates don't require `watch()`

**Value:**

- Deep understanding of reactivity model
- Optimization insights for complex forms

### 3. Form Closure

**What it covers:**

- Error display logic (touched + submitCount rules)
- Why errors don't show immediately on keystroke
- How to customize error display timing

**Value:**

- Helps developers reason about UX behavior
- Enables custom error display patterns

### 4. Bridge Contract

**What it covers:**

- Interface between `@dashforge/ui` and `@dashforge/forms`
- Type safety boundaries
- How to build components that integrate cleanly

**Value:**

- Essential for library contributors
- Helps teams extend Dashforge

### 5. Conditional Rendering

**What it covers:**

- How `visibleWhen` works internally
- Performance characteristics
- Best practices for complex conditions

**Value:**

- Optimization guidance
- Advanced conditional logic patterns

---

## Technical Details

### No Runtime Changes

This change only affects:

- **Build time:** TypeScript compiles the sidebar config
- **Render time:** Sidebar component iterates over fewer groups

**Does NOT affect:**

- Route definitions
- Page components
- Navigation logic
- TOC generation

### No Breaking Changes

- ✅ No API changes
- ✅ No route changes
- ✅ No component changes
- ✅ No prop changes
- ✅ No type changes

### Verification

**TypeScript compilation:**

- ✅ No new type errors introduced
- ✅ Sidebar model types unchanged
- ✅ All existing pages still compile

**Pre-existing errors (unrelated):**

- `SelectRuntimeDependentDemo.tsx` — 3 type errors (existed before)
- `app.spec.tsx` — 1 type error (existed before)

---

## Success Metrics

### Immediate UX Improvements

1. **Sidebar cleanliness**

   - ✅ No empty sections visible
   - ✅ No "Coming soon" placeholders
   - ✅ Every visible group contains real content

2. **Professional perception**

   - ✅ Documentation feels complete
   - ✅ Product feels mature
   - ✅ No signals of incompleteness

3. **Navigation clarity**
   - ✅ Clear path from Getting Started to advanced topics
   - ✅ No ambiguity about what's available
   - ✅ Reduced cognitive load

### Potential User Behavior Changes (if analytics exist)

Track these metrics to validate improvement:

1. **Engagement metrics**

   - Time spent on docs (should increase — more confidence to explore)
   - Pages per session (should increase — clearer navigation)
   - Bounce rate from docs (should decrease — feels more complete)

2. **Conversion metrics**

   - Installation → Usage page conversion (should increase — clearer path)
   - Docs → GitHub stars/npm installs (should increase — higher trust)

3. **Support metrics**
   - Questions about "when will docs be finished?" (should decrease to zero)
   - Questions about missing content (should not increase — content wasn't there anyway)

---

## Comparison: Before and After

### Before (7 Groups, 1 Empty)

```
GETTING STARTED        ✅ 4 pages
CORE CONCEPTS          ❌ 0 pages — "Coming soon"
UI COMPONENTS          ✅ 11 pages across 5 subgroups
FORM SYSTEM            ✅ 6 pages
ACCESS CONTROL         ✅ 5 pages
THEME SYSTEM           ✅ 1 page
ARCHITECTURE           ✅ 1 page
```

**Completeness:** 28 pages / 29 potential slots = 96.5%  
**Perception:** "Why is one section empty? Is this ready?"

### After (6 Groups, 0 Empty)

```
GETTING STARTED        ✅ 4 pages
UI COMPONENTS          ✅ 11 pages across 5 subgroups
FORM SYSTEM            ✅ 6 pages
ACCESS CONTROL         ✅ 5 pages
THEME SYSTEM           ✅ 1 page
ARCHITECTURE           ✅ 1 page
```

**Completeness:** 28 pages / 28 visible slots = 100%  
**Perception:** "This documentation is complete and ready to use!"

---

## Design Principle Applied

### Optimize for Clarity Over Completeness

**Bad approach (showing all future plans):**

```
GETTING STARTED        ✅ Ready
CORE CONCEPTS          ⏳ Coming soon
ADVANCED PATTERNS      ⏳ Coming soon
PERFORMANCE GUIDE      ⏳ Coming soon
MIGRATION GUIDES       ⏳ Coming soon
TROUBLESHOOTING        ⏳ Coming soon
```

**Result:** User sees 5 empty sections, thinks "This product isn't ready yet"

**Good approach (showing only what exists):**

```
GETTING STARTED        ✅ Ready
UI COMPONENTS          ✅ Ready
FORM SYSTEM            ✅ Ready
```

**Result:** User sees complete documentation, thinks "I can start building now"

### When to Show Future Plans

**Show placeholders when:**

- Content is coming in 1-2 weeks (imminent)
- Users explicitly requested this content
- Placeholder sets clear expectations (e.g., "Mobile SDK - Q2 2026")

**Hide placeholders when:**

- Content timeline is uncertain
- No user demand exists yet
- Placeholder creates doubt about readiness

**Dashforge Core Concepts:** No user demand yet, uncertain timeline → Hide it.

---

## Related Changes

This change is part of a larger docs cleanup effort:

### Previous Changes

1. **Getting Started Funnel Refinement** (2026-04-05)

   - Reordered: Overview → Why → Install → Usage
   - Sharpened copy on all pages
   - Added conversion-focused CTAs

2. **Project Structure Repositioning** (2026-04-05)

   - Moved from `GETTING STARTED` to `ARCHITECTURE`
   - Cleaned onboarding funnel

3. **Core Concepts Removal** (2026-04-05) ← **This change**
   - Removed empty group from sidebar
   - Improved perceived completeness

### Result of Combined Changes

The documentation now has:

- **Clear onboarding funnel** — Overview → Why → Install → Usage (4 linear steps)
- **Complete navigation** — No empty sections or placeholders
- **Logical organization** — Onboarding separate from architecture/advanced content
- **Professional polish** — Every visible section contains real, actionable content

---

## Conclusion

This change achieves the stated goal:

> Temporarily remove the `CORE CONCEPTS` group from the docs sidebar while preserving its structure for future use.

**Method:** Commented out the group definition with clear documentation

**Result:**

- ✅ Core Concepts no longer visible in sidebar
- ✅ Sidebar feels clean and complete
- ✅ No broken references or dependencies
- ✅ Structure preserved for easy future restoration
- ✅ Clear instructions on when and how to re-enable

**Impact:**

- **UX:** Eliminates confusion from empty section
- **Perception:** Documentation feels complete and professional
- **Maintainability:** Future developers understand why it's hidden
- **Extensibility:** 5-minute task to restore when ready

The docs sidebar now presents only finished, actionable content — creating confidence, clarity, and momentum for new users.
