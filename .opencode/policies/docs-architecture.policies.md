# Dashforge Docs Architecture Policies

**Version**: 1.0  
**Status**: ENFORCED  
**Last Updated**: 2026-03-28

---

## Overview

The Dashforge documentation system is built on **explicit React composition** with **minimal shared primitives**. Docs pages MUST remain readable React components with visible structure. Hidden orchestration, config-driven sections, and page-level abstraction layers are strictly forbidden.

**Philosophy**:

- Explicit composition over hidden frameworks
- Readable structure over clever abstraction
- Primitives for repetition, local code for uniqueness
- Duplication is acceptable when abstraction hides intent

---

## Core Principles

### Mandatory Requirements

1. **Docs pages MUST be explicit React components**

   - Written as standard function components
   - Structure visible in JSX composition
   - No transformation layers
   - No dynamic rendering engines

2. **Docs pages MUST NOT be config-driven**

   - No section config objects
   - No `sections: []` arrays
   - No declarative page definitions
   - Structure MUST be in JSX, not data

3. **Page structure MUST be readable at a glance**

   - Opening a docs file MUST immediately reveal page structure
   - Sections MUST be visible inline
   - Custom sections MUST NOT be hidden behind abstractions
   - No mental mapping to config schemas required

4. **No hidden abstraction layers**

   - No page-level orchestrators
   - No layout engines
   - No "smart" rendering logic
   - Primitives MUST be dumb presentational components

5. **Custom sections MUST remain local**
   - Component-specific sections stay in component files
   - No premature generalization
   - Accept duplication when uniqueness is genuine

---

## Shared Primitives Rules

### Allowed Primitives

The shared primitives layer consists of EXACTLY these components:

1. **DocsHeroSection** - Component title with gradient and description
2. **DocsSection** - Section wrapper with standardized header
3. **DocsDivider** - Theme-aware section divider
4. **DocsCalloutBox** - Success/info/warning/error boxes

**Location**: `web/src/pages/Docs/components/shared/`

### Primitive Requirements

Shared primitives MUST:

- Have a single, clear responsibility
- Accept 2-5 props maximum
- Contain zero conditional rendering logic
- Be pure presentational components
- Not manage state beyond theme awareness
- Not orchestrate child behavior

Shared primitives MUST NOT:

- Accept render props
- Accept callback props (except for interactive elements like buttons)
- Implement complex layout logic
- Contain business logic
- Dynamically alter structure based on props
- Become "smart" components

### Extraction Criteria

A pattern MAY be extracted to shared primitives ONLY when:

1. **Proven duplication**: 3+ components use IDENTICAL structure
2. **Zero variability**: No structural differences across usages
3. **Stable contract**: Props are unlikely to change
4. **Clear boundaries**: Single responsibility is obvious
5. **No flags**: No conditional rendering or variant props needed

If ANY criterion fails → keep pattern local.

### Complexity Management

When a primitive needs more complexity:

- **DO**: Create a new, specialized component
- **DO NOT**: Add props/flags to existing primitive

Example:

```tsx
// CORRECT: New component for new need
<DocsCalloutBoxWithActions type="info" actions={...} />

// WRONG: Prop creep on existing primitive
<DocsCalloutBox type="info" showActions actions={...} />
```

---

## Forbidden Patterns

### Explicitly Rejected Abstractions

The following patterns are **PERMANENTLY FORBIDDEN**:

1. **DocsPageLayout orchestrator**

   ```tsx
   // FORBIDDEN
   <DocsPageLayout
     title="..."
     sections={[...]}
   />
   ```

   **Reason**: Hides page structure, forces single pattern, reduces flexibility

2. **Config-driven sections**

   ```tsx
   // FORBIDDEN
   const sections = [
     { id: 'examples', title: 'Examples', content: <Examples /> },
   ];
   ```

   **Reason**: Page structure not visible, requires mental mapping

3. **Dynamic rendering engines**

   ```tsx
   // FORBIDDEN
   {
     sections.map((s) => <DocsSection key={s.id} {...s} />);
   }
   ```

   **Reason**: Structure hidden in data, not code

4. **Generic "one-size-fits-all" wrappers**

   ```tsx
   // FORBIDDEN
   <DocsSection variant="wrapped" color="blue" showHeader={false}>
   ```

   **Reason**: Excessive flags hide genuine differences

5. **Smart primitives**
   ```tsx
   // FORBIDDEN: Primitive shouldn't know about routing, context, etc.
   <DocsSection id="api" autoGenerateTOC fetchContent="api-docs">
   ```
   **Reason**: Primitives must be dumb presentational components

### Forbidden Prop Patterns

Primitives MUST NOT accept:

- `variant` props with 3+ variants
- `mode` or `type` props controlling layout
- `config` objects
- `options` objects
- `children` as render props: `children: (data) => ReactNode`
- Callback props that alter structure

---

## Section Ownership Rules

### Always Local (Never Extract)

These sections MUST remain in component files:

1. **Quick Start**

   - Too variable across components (single code block vs multi-step)
   - Custom theming per component (purple, blue, amber)
   - Badge text varies ("Copy & Paste", "2 Steps", "Basic Setup")
   - **Decision**: Keep inline in each `*Docs.tsx` file

2. **Interactive Playground**

   - Unique to form field components (TextField, Select)
   - Completely custom implementation per component
   - Non-standard spacing (3.5 vs 4)
   - **Decision**: Keep local, never extract

3. **Complex wrapped sections**

   - Custom header styling (Form Integration with blue box)
   - Component-specific visual treatment
   - **Decision**: Keep inline with custom styles

4. **Implementation Notes**
   - Significant styling variations across components
   - TextField: numbered cards with purple badges
   - Snackbar: numbered cards with amber badges + highlight variant
   - AppShell: simple blue boxes without numbers
   - **Decision**: Keep in `*Notes.tsx` files, never extract

### Always Shared (Extract When Stable)

Use shared primitives for:

1. **Hero section** - Zero variability beyond title/description/color
2. **Standard section headers** - 100% identical structure
3. **Dividers** - Pure styling, zero logic
4. **Callout boxes** - Type-based styling, stable contract

---

## Composition Pattern

### Canonical Structure

```tsx
import { DocsHeroSection, DocsSection, DocsDivider } from '../shared';

export function ComponentDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero - Use primitive */}
      <DocsHeroSection
        title="Component"
        description="..."
        themeColor="purple"
      />

      {/* Quick Start - Always local */}
      <Box id="quick-start" sx={{...component-specific styles}}>
        <Stack spacing={2}>
          {/* Custom Quick Start content */}
        </Stack>
      </Box>

      {/* Standard section - Use primitive */}
      <DocsSection
        id="examples"
        title="Examples"
        description="Common patterns"
      >
        <ComponentExamples />
      </DocsSection>

      {/* Custom section - Keep local if unique */}
      <Stack spacing={3.5} id="playground">
        <Box>
          <Typography variant="h2" sx={{...}}>
            Interactive Playground
          </Typography>
          <Typography sx={{...}}>
            Description...
          </Typography>
        </Box>
        <ComponentPlayground />
      </Stack>

      {/* Standard section - Use primitive */}
      <DocsSection
        id="capabilities"
        title="Capabilities"
        description="Feature overview"
      >
        <ComponentCapabilities />
      </DocsSection>

      {/* Divider - Use primitive */}
      <DocsDivider />

      {/* Custom wrapped section - Keep local */}
      <Stack spacing={4} id="scenarios">
        <Box sx={{p: 3, borderRadius: 2, bgcolor: '...', border: '...'}}>
          <Typography variant="h2" sx={{...}}>
            Form Integration
          </Typography>
          <Typography sx={{...}}>
            Real-world scenarios...
          </Typography>
        </Box>
        <ComponentScenarios />
      </Stack>

      <DocsDivider />

      {/* Standard section - Use primitive */}
      <DocsSection
        id="api"
        title="API Reference"
        description="Complete props"
      >
        <ComponentApi />
      </DocsSection>

      <DocsDivider />

      {/* Standard section - Use primitive */}
      <DocsSection
        id="notes"
        title="Implementation Notes"
        description="Technical details"
      >
        <ComponentNotes />
      </DocsSection>
    </Stack>
  );
}
```

### Pattern Rules

1. **Hero**: Always use `DocsHeroSection`
2. **Quick Start**: Always keep local (inline in `*Docs.tsx`)
3. **Standard sections**: Use `DocsSection` when header is identical
4. **Custom sections**: Write inline with full control
5. **Dividers**: Use `DocsDivider` for all section breaks
6. **Callouts**: Use `DocsCalloutBox` for info/success/warning/error

---

## Anti-Patterns

### Examples of Forbidden Code

#### Anti-Pattern 1: Over-Abstracted DocsSection

```tsx
// WRONG: Too many props, hiding structure
<DocsSection
  id="examples"
  title="Examples"
  description="..."
  wrapped
  wrapColor="blue"
  headerVariant="large"
  showBadge
  badgeText="New"
>
  <Content />
</DocsSection>
```

**Why forbidden**: Prop creep, hidden styling logic, multiple responsibilities

**Correct approach**: Create new component or keep local with explicit styles

#### Anti-Pattern 2: "Smart" Primitives

```tsx
// WRONG: Primitive shouldn't fetch data or know about routing
<DocsSection
  id="api"
  title="API Reference"
  autoGenerateTOC
  fetchFromSchema="component-api.json"
  scrollSpy
  onNavigate={...}
>
  <Content />
</DocsSection>
```

**Why forbidden**: Primitives must be dumb presentational components

**Correct approach**: Keep TOC, data fetching, and routing logic in parent component

#### Anti-Pattern 3: Hidden Layout Logic

```tsx
// WRONG: Layout controlled by data, not visible in JSX
const layout = [
  { type: 'hero', props: {...} },
  { type: 'section', props: {...} },
  { type: 'divider' },
];

return <DocsLayout sections={layout} />;
```

**Why forbidden**: Page structure hidden in data, not readable

**Correct approach**: Write explicit JSX composition

#### Anti-Pattern 4: Excessive Prop-Driven Behavior

```tsx
// WRONG: Too many variants, hiding genuine differences
<DocsCalloutBox
  type="info"
  variant="bordered" | "filled" | "outline"
  size="small" | "medium" | "large"
  position="top" | "bottom" | "inline"
  dismissible
  icon="custom"
  action={...}
  onDismiss={...}
/>
```

**Why forbidden**: Component trying to be everything, hiding real differences

**Correct approach**: Create specialized components for genuinely different needs

---

## Extension Rules

### When to Add a New Primitive

A new primitive MAY be added ONLY when:

1. **Proven duplication**: 3+ components use IDENTICAL structure
2. **Zero variability**: No structural differences across usages
3. **Stable contract**: Props are unlikely to change
4. **Single responsibility**: Clear, focused purpose
5. **No conditionals**: No `if/else` or variant logic needed

If ANY criterion fails → do NOT extract.

### Preferred: Duplication Over Wrong Abstraction

**Duplication is acceptable when**:

- Sections are genuinely different
- Visual treatment varies intentionally
- Abstraction would require excessive props
- Future changes likely to diverge

**Rule**: Prefer 3 similar but local sections over 1 over-abstracted primitive with flags.

### Abstraction Threshold

Before extracting a pattern:

1. **Count usages**: Minimum 3 identical instances required
2. **Measure stability**: Has pattern been stable for 2+ weeks?
3. **Check variability**: Is structure 100% identical?
4. **Assess props**: Can be modeled with ≤5 simple props?
5. **Verify boundaries**: Single responsibility clear?

If ANY answer is NO → keep local.

### Refactoring Discipline

When refactoring docs pages:

**DO**:

- Replace hero sections with `DocsHeroSection`
- Replace standard section headers with `DocsSection`
- Replace dividers with `DocsDivider`
- Keep Quick Start, Playground, complex sections local

**DO NOT**:

- Force custom sections into primitives
- Add props to primitives to accommodate variations
- Create page-level orchestrators
- Introduce config-driven patterns

---

## Acceptance Criteria for Future Tasks

### Pre-Implementation Checklist

Before starting work on docs:

- [ ] Read this policy file completely
- [ ] Understand forbidden patterns
- [ ] Identify which sections must stay local
- [ ] Plan explicit JSX composition (not config)

### Implementation Checklist

During implementation:

- [ ] Page structure visible in JSX composition
- [ ] No config objects for sections
- [ ] Hero uses `DocsHeroSection`
- [ ] Standard sections use `DocsSection`
- [ ] Dividers use `DocsDivider`
- [ ] Quick Start stays local (inline)
- [ ] Playground stays local (if present)
- [ ] Custom sections stay local with explicit styles
- [ ] No new abstraction layers introduced
- [ ] Primitives remain simple (≤5 props)

### Post-Implementation Checklist

After completing work:

- [ ] Page remains readable at a glance
- [ ] Custom sections clearly visible inline
- [ ] No hidden orchestration logic
- [ ] No config-driven sections
- [ ] TypeScript passes with no new errors
- [ ] No visual regressions
- [ ] No route/sidebar/TOC regressions
- [ ] Primitives did not gain new props
- [ ] No page-level orchestrator introduced

### Review Checklist

When reviewing docs PRs:

- [ ] Open `*Docs.tsx` file - structure immediately clear?
- [ ] Quick Start local (not extracted)?
- [ ] Playground local (if present)?
- [ ] Custom sections visible inline?
- [ ] No config objects present?
- [ ] No new abstraction layers?
- [ ] Primitives remain simple?
- [ ] No forbidden patterns used?

**If ANY check fails → reject and request refactor.**

---

## Enforcement

### Policy Status

This policy is **MANDATORY** for all docs-related work.

**Applies to**:

- New component documentation pages
- Refactoring existing docs pages
- Creating new shared primitives
- Modifying existing primitives

**Violations**:

- Any introduction of forbidden patterns MUST be reverted
- PRs violating this policy MUST be rejected
- No exceptions without explicit architectural review

### Review Authority

This policy may be modified ONLY by:

- Explicit architectural decision
- Team consensus on policy change
- Documented rationale in policy file

**Individual contributors MUST NOT**:

- Introduce forbidden patterns "temporarily"
- Add exceptions without approval
- Circumvent policies with workarounds

---

## References

### Implementation Examples

**Reference implementation**: `web/src/pages/Docs/components/text-field/TextFieldDocs.tsx`

**Shared primitives**: `web/src/pages/Docs/components/shared/`

**Reports**:

- `.opencode/reports/docs-primitives-textfield-reference-implementation-report.md`
- `.opencode/reports/docs-reusable-component-plan.md`

### Related Components

**Docs pages**:

- TextField (reference implementation)
- Snackbar (simpler structure)
- AppShell (standard structure)
- Select (rich structure with playground)

---

## Version History

### v1.0 (2026-03-28)

**Initial policy establishment**

- Defined core principles (explicit composition, no config-driven)
- Established 4 shared primitives (Hero, Section, Divider, Callout)
- Documented forbidden patterns (DocsPageLayout, config objects)
- Defined section ownership rules (Quick Start always local)
- Created acceptance criteria checklists
- Reference implementation: TextFieldDocs.tsx

**Status**: ENFORCED

---

**End of Policy Document**

All future docs work MUST comply with this policy.  
No exceptions without explicit architectural review.
