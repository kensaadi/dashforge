# Dashforge Docs - Reusable Component Analysis Plan

**Date**: 2026-03-28  
**Status**: 📋 PROPOSAL

---

## Executive Summary

After analyzing the existing documentation structure for TextField, Select, Snackbar, and AppShell components, this document proposes a reusable component architecture to eliminate repetitive boilerplate, ensure visual consistency, and simplify the creation of new component documentation pages.

---

## Current State Analysis

### Documentation Pattern (Standard)

All component docs follow a consistent structure:

```tsx
<Stack spacing={8}>
  {/* 1. Hero Section */}
  <Stack spacing={3}>
    <Typography variant="h1" sx={{...gradient styles}}>ComponentName</Typography>
    <Typography variant="body1">Description...</Typography>
    <OptionalBadge />
  </Stack>

  {/* 2. Quick Start Section */}
  <Stack spacing={4} id="quick-start">
    <SectionHeader title="Quick Start" description="..." />
    <ComponentQuickStart />
  </Stack>

  {/* 3. Examples Section */}
  <Stack spacing={4} id="examples">
    <SectionHeader title="Examples" description="..." />
    <ComponentExamples />
  </Stack>

  {/* 4. Optional Sections (Playground, Layout Variants, Capabilities) */}

  {/* 5. Scenarios Section */}
  <Stack spacing={4} id="scenarios">
    <SectionHeader title="Real-World Scenarios" description="..." />
    <ComponentScenarios />
  </Stack>

  {/* 6. API Reference Section */}
  <Stack spacing={4} id="api">
    <SectionHeader title="API Reference" description="..." />
    <ComponentApi />
  </Stack>

  {/* 7. Implementation Notes Section */}
  <Stack spacing={4} id="notes">
    <SectionHeader title="Implementation Notes" description="..." />
    <ComponentNotes />
  </Stack>
</Stack>
```

### Files Per Component (7-12 files)

**Standard Structure**:

```
component-name/
├── ComponentDocs.tsx          (Main orchestrator - 200-400 lines)
├── ComponentQuickStart.tsx    (Quick start code examples)
├── ComponentExamples.tsx      (Interactive demos)
├── ComponentScenarios.tsx     (Real-world patterns)
├── ComponentApi.tsx           (Props table)
├── ComponentNotes.tsx         (Implementation notes)
└── demos/
    └── ComponentDemo.tsx      (Individual demo components)
```

**Extended Structure** (TextField, Select):

```
component-name/
├── ComponentDocs.tsx
├── ComponentQuickStart.tsx    (NOT a separate file - inline in Docs)
├── ComponentExamples.tsx
├── ComponentLayoutVariants.tsx
├── ComponentCapabilities.tsx
├── ComponentScenarios.tsx
├── ComponentApi.tsx
├── ComponentNotes.tsx
├── ComponentPlayground.tsx
└── demos/
    ├── Demo1.tsx
    ├── Demo2.tsx
    └── Demo3.tsx
```

---

## Code Duplication Analysis

### 1. Hero Section (100% Duplicated)

**Location**: Top of every `*Docs.tsx` file  
**Lines**: ~35 lines per component  
**Duplication Count**: 6+ components

**Repeated Pattern**:

```tsx
<Stack spacing={3}>
  <Typography
    variant="h1"
    sx={{
      fontSize: { xs: 40, md: 56 },
      fontWeight: 800,
      letterSpacing: '-0.04em',
      lineHeight: 1.1,
      color: isDark ? '#ffffff' : '#0f172a',
      background: isDark
        ? 'linear-gradient(135deg, #ffffff 0%, #COLOR1 100%)'
        : 'linear-gradient(135deg, #0f172a 0%, #COLOR2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    {componentName}
  </Typography>
  <Typography
    variant="body1"
    sx={{
      fontSize: 19,
      lineHeight: 1.6,
      color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
      maxWidth: 680,
    }}
  >
    {description}
  </Typography>
  {badge && <BadgeComponent />}
</Stack>
```

**Variations**:

- TextField: Purple gradient (`#a78bfa`, `#7c3aed`)
- Snackbar: Amber gradient (`#fbbf24`, `#f59e0b`) + "Imperative Pattern" badge
- AppShell: Blue gradient (`#60a5fa`, `#3b82f6`)
- Select: Purple gradient (same as TextField)

---

### 2. Section Headers (100% Duplicated)

**Location**: Before every section in `*Docs.tsx`  
**Lines**: ~25 lines per section  
**Duplication Count**: 5-7 sections × 6+ components = **30-42 instances**

**Repeated Pattern**:

```tsx
<Box>
  <Typography
    variant="h2"
    sx={{
      fontSize: { xs: 28, md: 36 },
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
      color: isDark ? '#ffffff' : '#0f172a',
      mb: 2,
    }}
  >
    {title}
  </Typography>
  <Typography
    sx={{
      fontSize: 17,
      lineHeight: 1.6,
      color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
    }}
  >
    {description}
  </Typography>
</Box>
```

**Sections**:

- Quick Start
- Examples
- Layout Variants (optional)
- Interactive Playground (optional)
- Dashforge Capabilities (optional)
- Real-World Scenarios
- API Reference
- Implementation Notes

---

### 3. Quick Start Box (100% Duplicated)

**Location**: Quick Start section in TextField, Select (inline in Docs file)  
**Lines**: ~85 lines per component  
**Duplication Count**: 2 components inline, 3 components in separate files

**Pattern A** (TextField, Select - Inline):

```tsx
<Box
  id="quick-start"
  sx={{
    p: 3,
    borderRadius: 2,
    bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
    border: isDark
      ? '1px solid rgba(139,92,246,0.20)'
      : '1px solid rgba(139,92,246,0.15)',
    position: 'relative',
  }}
>
  <Stack spacing={2}>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography sx={{...uppercase label styles}}>Quick Start</Typography>
      <Box sx={{...badge styles}}>
        <Typography sx={{...badge text styles}}>Copy & Paste</Typography>
      </Box>
    </Stack>
    <Box component="pre" sx={{...code block styles}}>
      {code}
    </Box>
  </Stack>
</Box>
```

**Pattern B** (Snackbar, AppShell - Separate File):

```tsx
// In separate *QuickStart.tsx file
export function ComponentQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box sx={{...same container styles}}>
      <Stack spacing={2.5}>
        {/* Header with badge */}
        {/* Multi-step code blocks */}
        {/* Info/success callout box */}
      </Stack>
    </Box>
  );
}
```

---

### 4. Example Item Structure (80% Duplicated)

**Location**: Inside `*Examples.tsx` files  
**Lines**: ~30 lines per example item  
**Duplication Count**: 7-10 examples per component × 6+ components = **42-60 instances**

**Repeated Pattern**:

```tsx
{
  examples.map((example) => (
    <Box key={example.title}>
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: 0.5,
            }}
          >
            {example.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: 14,
              color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,23,42,0.65)',
            }}
          >
            {example.description}
          </Typography>
        </Box>
        <DocsPreviewBlock code={example.code} badge="">
          {example.component}
        </DocsPreviewBlock>
      </Stack>
    </Box>
  ));
}
```

---

### 5. Dividers (100% Duplicated)

**Location**: Between major sections  
**Lines**: ~7 lines per divider  
**Duplication Count**: 2-3 dividers × 6+ components = **12-18 instances**

**Repeated Pattern**:

```tsx
<Divider
  sx={{
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
    my: 4,
  }}
/>
```

---

### 6. Callout Boxes (90% Duplicated)

**Location**: Inside QuickStart, Notes sections  
**Lines**: ~20 lines per callout  
**Duplication Count**: 1-3 per component × 6+ components = **6-18 instances**

**Repeated Pattern**:

```tsx
<Box
  sx={{
    mt: 2,
    p: 2,
    borderRadius: 1.5,
    bgcolor: isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.08)',
    border: isDark
      ? '1px solid rgba(34,197,94,0.25)'
      : '1px solid rgba(34,197,94,0.20)',
  }}
>
  <Stack direction="row" spacing={1.5} alignItems="flex-start">
    <Typography sx={{...icon styles}}>✓</Typography>
    <Typography sx={{...text styles}}>
      {message}
    </Typography>
  </Stack>
</Box>
```

**Variants**:

- Success (green): Checkmark icon
- Info (blue): Info icon (ℹ️)
- Warning (amber): Warning icon
- Error (red): Error icon

---

## Proposed Reusable Components

### Component Hierarchy

```
DocsPageLayout
├── DocsHeroSection
│   ├── DocsTitle
│   ├── DocsDescription
│   └── DocsBadge (optional)
├── DocsSection (repeatable)
│   ├── DocsSectionHeader
│   └── children (section content)
├── DocsQuickStartBox
│   ├── DocsCodeBlock
│   └── DocsCalloutBox (optional)
├── DocsExampleList
│   └── DocsExampleItem
│       ├── DocsExampleHeader
│       └── DocsPreviewBlock (existing)
├── DocsDivider
└── DocsCalloutBox (standalone)
```

---

## Detailed Component Specifications

### 1. `DocsPageLayout`

**Purpose**: Main orchestrator for all component documentation pages  
**Replaces**: Entire `*Docs.tsx` structure

**API**:

```tsx
interface DocsPageLayoutProps {
  /** Component name for hero title */
  title: string;

  /** Component description for hero section */
  description: string;

  /** Theme color for gradients (e.g., 'purple', 'blue', 'amber') */
  themeColor: 'purple' | 'blue' | 'amber' | 'green' | 'red';

  /** Optional badge text in hero section */
  badge?: string;

  /** Array of section configurations */
  sections: DocsSectionConfig[];
}

interface DocsSectionConfig {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  showDividerBefore?: boolean;
  wrapped?: boolean; // Wrap section in colored box (like "Form Integration")
  wrapColor?: string;
}

// Usage
<DocsPageLayout
  title="TextField"
  description="An intelligent input component..."
  themeColor="purple"
  sections={[
    {
      id: 'quick-start',
      title: 'Quick Start',
      description: 'Get started in seconds',
      content: <TextFieldQuickStart />,
    },
    {
      id: 'examples',
      title: 'Examples',
      description: 'Common patterns',
      content: <TextFieldExamples />,
    },
    // ...
  ]}
/>;
```

**Benefits**:

- Eliminates 200+ lines of boilerplate per component
- Enforces consistent spacing and structure
- Centralizes gradient color management
- Automatic section ID anchors

---

### 2. `DocsHeroSection`

**Purpose**: Hero title, description, and optional badge  
**Replaces**: First 35-55 lines of every `*Docs.tsx`

**API**:

```tsx
interface DocsHeroSectionProps {
  title: string;
  description: string;
  themeColor: ThemeColor;
  badge?: string;
  badgeColor?: ThemeColor;
}

// Usage
<DocsHeroSection
  title="Snackbar"
  description="Fire-and-forget notifications..."
  themeColor="amber"
  badge="Imperative Pattern"
  badgeColor="amber"
/>;
```

**Color Mapping**:

```tsx
const gradients = {
  purple: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
  },
  blue: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)',
  },
  amber: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #f59e0b 100%)',
  },
  green: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #4ade80 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #22c55e 100%)',
  },
  red: {
    dark: 'linear-gradient(135deg, #ffffff 0%, #f87171 100%)',
    light: 'linear-gradient(135deg, #0f172a 0%, #ef4444 100%)',
  },
};
```

---

### 3. `DocsSection`

**Purpose**: Wrapper for each major section with header  
**Replaces**: `<Stack spacing={4} id="...">` + header boilerplate (30+ lines per section)

**API**:

```tsx
interface DocsSectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  spacing?: number; // Default: 4
  wrapped?: boolean; // Wrap in colored box
  wrapColor?: ThemeColor;
}

// Usage
<DocsSection
  id="examples"
  title="Examples"
  description="Interactive demos showing common usage patterns"
>
  <TextFieldExamples />
</DocsSection>

// Wrapped variant (like TextField's "Form Integration")
<DocsSection
  id="scenarios"
  title="Form Integration"
  description="Real-world scenarios..."
  wrapped
  wrapColor="blue"
>
  <TextFieldScenarios />
</DocsSection>
```

---

### 4. `DocsQuickStartBox`

**Purpose**: Standardized Quick Start container with code blocks  
**Replaces**: 85+ lines of inline Quick Start code OR separate `*QuickStart.tsx` files

**API**:

```tsx
interface DocsQuickStartBoxProps {
  themeColor: ThemeColor;
  badgeText?: string; // e.g., "Copy & Paste", "2 Steps", "Basic Setup"
  steps?: QuickStartStep[];
  codeBlock?: string; // Single code block (simple variant)
  callout?: {
    type: 'success' | 'info' | 'warning' | 'error';
    icon?: string;
    message: string;
  };
}

interface QuickStartStep {
  title: string;
  code: string;
}

// Usage - Simple variant (single code block)
<DocsQuickStartBox
  themeColor="purple"
  badgeText="Copy & Paste"
  codeBlock={`import { TextField } from '@dashforge/ui';

<TextField label="Email" name="email" />`}
/>

// Usage - Multi-step variant
<DocsQuickStartBox
  themeColor="amber"
  badgeText="2 Steps"
  steps={[
    {
      title: 'Step 1: Wrap your app',
      code: `<SnackbarProvider><App /></SnackbarProvider>`,
    },
    {
      title: 'Step 2: Use the hook',
      code: `const { success } = useSnackbar();\nsuccess('Saved!');`,
    },
  ]}
  callout={{
    type: 'info',
    icon: 'ℹ️',
    message: 'The snackbar is rendered automatically by the provider.',
  }}
/>
```

**Decision**: Should replace separate `*QuickStart.tsx` files with inline usage OR keep separate files and wrap their content?

**Recommendation**: Keep separate files for complex Quick Starts (multi-step, custom logic), use inline for simple ones.

---

### 5. `DocsExampleList` + `DocsExampleItem`

**Purpose**: Standardized example rendering with title, description, and preview  
**Replaces**: Repeated mapping logic in every `*Examples.tsx` file (30+ lines per example)

**API**:

```tsx
interface DocsExampleListProps {
  examples: DocsExample[];
  spacing?: number; // Default: 3.5
}

interface DocsExample {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
  badge?: string;
}

// Usage
<DocsExampleList
  examples={[
    {
      title: 'Basic',
      description: 'A simple text field with a label',
      code: `<TextField label="Name" name="name" />`,
      component: <TextField label="Name" name="name" />,
    },
    {
      title: 'Error State',
      description: 'A text field displaying an error',
      code: `<TextField label="Email" error helperText="Invalid" />`,
      component: <TextField label="Email" error helperText="Invalid" />,
      badge: 'Validation',
    },
  ]}
/>;
```

**Simplified Examples File**:

```tsx
// Before (159 lines)
export function TextFieldExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [...];

  return (
    <Stack spacing={3.5}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{...}}>...</Typography>
              <Typography variant="body2" sx={{...}}>...</Typography>
            </Box>
            <DocsPreviewBlock code={example.code} badge="">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

// After (15 lines)
export function TextFieldExamples() {
  return (
    <DocsExampleList
      examples={[
        {
          title: 'Basic',
          description: 'A simple text field',
          code: `<TextField label="Name" name="name" />`,
          component: <TextField label="Name" name="name" />,
        },
        // ... more examples
      ]}
    />
  );
}
```

---

### 6. `DocsCalloutBox`

**Purpose**: Reusable callout/alert boxes for tips, warnings, info  
**Replaces**: Repeated callout box styles in QuickStart and Notes sections

**API**:

```tsx
interface DocsCalloutBoxProps {
  type: 'success' | 'info' | 'warning' | 'error';
  icon?: string; // Auto-selected based on type if not provided
  message: string | React.ReactNode;
  title?: string;
}

// Usage
<DocsCalloutBox
  type="success"
  message="AppShell automatically handles responsive layout and drawer state."
/>

<DocsCalloutBox
  type="warning"
  icon="⚠️"
  title="Performance Note"
  message="Avoid re-creating navigation items on every render."
/>
```

**Type Mapping**:

```tsx
const calloutStyles = {
  success: {
    icon: '✓',
    bgColor: { dark: 'rgba(34,197,94,0.10)', light: 'rgba(34,197,94,0.08)' },
    borderColor: {
      dark: 'rgba(34,197,94,0.25)',
      light: 'rgba(34,197,94,0.20)',
    },
    iconColor: { dark: '#86efac', light: '#16a34a' },
  },
  info: {
    icon: 'ℹ️',
    bgColor: { dark: 'rgba(59,130,246,0.10)', light: 'rgba(59,130,246,0.08)' },
    borderColor: {
      dark: 'rgba(59,130,246,0.25)',
      light: 'rgba(59,130,246,0.20)',
    },
    iconColor: { dark: '#60a5fa', light: '#2563eb' },
  },
  warning: {
    icon: '⚠️',
    bgColor: { dark: 'rgba(251,191,36,0.10)', light: 'rgba(251,191,36,0.08)' },
    borderColor: {
      dark: 'rgba(251,191,36,0.25)',
      light: 'rgba(251,191,36,0.20)',
    },
    iconColor: { dark: '#fbbf24', light: '#f59e0b' },
  },
  error: {
    icon: '✕',
    bgColor: { dark: 'rgba(239,68,68,0.10)', light: 'rgba(239,68,68,0.08)' },
    borderColor: {
      dark: 'rgba(239,68,68,0.25)',
      light: 'rgba(239,68,68,0.20)',
    },
    iconColor: { dark: '#f87171', light: '#dc2626' },
  },
};
```

---

### 7. `DocsDivider`

**Purpose**: Standardized section divider  
**Replaces**: 7 lines of repeated divider code

**API**:

```tsx
interface DocsDividerProps {
  spacing?: number; // Default: 4
}

// Usage
<DocsDivider />
<DocsDivider spacing={6} />
```

**Implementation**:

```tsx
export function DocsDivider({ spacing = 4 }: DocsDividerProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Divider
      sx={{
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
        my: spacing,
      }}
    />
  );
}
```

---

## Implementation Strategy

### Phase 1: Create Core Components (Week 1)

**Priority Order**:

1. ✅ `DocsDivider` - Simplest, immediate value
2. ✅ `DocsCalloutBox` - High reuse, standalone
3. ✅ `DocsSectionHeader` - Used everywhere
4. ✅ `DocsHeroSection` - High impact, clear API
5. ✅ `DocsCodeBlock` - Reusable in QuickStart and other places

**Deliverables**:

- Create `/web/src/pages/Docs/components/shared/` directory
- Implement 5 components above
- Write unit tests for each (following Dashforge UI Component Policy)
- Document usage in `/web/src/pages/Docs/components/shared/README.md`

---

### Phase 2: Complex Components (Week 2)

**Priority Order**:

1. ✅ `DocsQuickStartBox` - Replace inline Quick Start boilerplate
2. ✅ `DocsExampleItem` + `DocsExampleList` - High duplication reduction
3. ✅ `DocsSection` - Wrapper for section structure

**Deliverables**:

- Implement remaining 3 components
- Create storybook/playground examples
- Migration guide for existing components

---

### Phase 3: Orchestrator Component (Week 3)

**Priority Order**:

1. ✅ `DocsPageLayout` - Ultimate abstraction
2. Refactor 1-2 existing components to use new system
3. Measure before/after (LOC, maintainability)

**Deliverables**:

- Full `DocsPageLayout` implementation
- Migrate TextField and Snackbar docs to new system
- Document results and lessons learned

---

### Phase 4: Migration (Week 4)

**Priority Order**:

1. Migrate remaining components: Select, AppShell, NumberField, Autocomplete, ConfirmDialog
2. Delete old boilerplate code
3. Update component creation template

**Deliverables**:

- All component docs migrated
- Updated `.opencode/templates/create-ui-component.md` to use new system
- Final metrics report

---

## Expected Impact

### Lines of Code Reduction

**Per Component** (Conservative Estimate):

| Area                    | Before        | After        | Saved         |
| ----------------------- | ------------- | ------------ | ------------- |
| Hero Section            | 35 lines      | 5 lines      | **30 lines**  |
| Section Headers (5×)    | 125 lines     | 25 lines     | **100 lines** |
| Quick Start Box         | 85 lines      | 15 lines     | **70 lines**  |
| Example Items (7×)      | 210 lines     | 35 lines     | **175 lines** |
| Dividers (3×)           | 21 lines      | 3 lines      | **18 lines**  |
| Callouts (2×)           | 40 lines      | 10 lines     | **30 lines**  |
| **Total per component** | **516 lines** | **93 lines** | **423 lines** |

**Across 7 Components**:

- Before: 516 × 7 = **3,612 lines**
- After: 93 × 7 = **651 lines**
- Saved: **2,961 lines (~82% reduction)**

---

### Maintainability Improvements

1. **Single Source of Truth**: All styling logic centralized
2. **Type Safety**: Enforced props for consistency
3. **Easy Updates**: Change gradient colors in one place
4. **Faster Onboarding**: New components use simple API
5. **Design System Alignment**: Enforce visual consistency

---

### Development Velocity

**Creating New Component Docs**:

- Before: ~2-3 hours (copying, adapting boilerplate)
- After: ~30 minutes (configure sections, write content)
- **Improvement: 4-6× faster**

---

## Open Questions & Decisions

### 1. Quick Start Files: Inline or Separate?

**Option A**: Keep separate `*QuickStart.tsx` files

- ✅ Pro: Complex logic stays isolated
- ✅ Pro: Easier to test
- ❌ Con: More files to manage

**Option B**: Inline Quick Start in `*Docs.tsx` using `DocsQuickStartBox`

- ✅ Pro: Fewer files
- ✅ Pro: All content in one place
- ❌ Con: Large Docs files for complex Quick Starts

**Recommendation**: **Hybrid approach**

- Simple Quick Starts (1 code block): Inline with `DocsQuickStartBox`
- Complex Quick Starts (multi-step, custom UI): Keep separate files

---

### 2. Section Content: Auto-wrapping or Manual?

**Option A**: Auto-wrap all sections with `<DocsSection>`

```tsx
<DocsPageLayout
  sections={[
    { id: 'examples', title: 'Examples', content: <TextFieldExamples /> },
  ]}
/>
// DocsPageLayout automatically wraps each section
```

**Option B**: Manual wrapping for flexibility

```tsx
<DocsPageLayout>
  <DocsSection id="examples" title="Examples">
    <TextFieldExamples />
  </DocsSection>
  <CustomSection />
</DocsPageLayout>
```

**Recommendation**: **Option A** (Auto-wrapping)

- Enforces consistency
- Simpler API
- Can add escape hatch for custom sections if needed

---

### 3. Playground & Special Sections: Generic or Custom?

Some components have unique sections:

- **TextField/Select**: Interactive Playground, Layout Variants, Capabilities
- **Snackbar**: No playground
- **AppShell**: No playground

**Question**: Should these be:

1. **Custom per component** (current approach)
2. **Genericized** (e.g., `DocsPlayground`, `DocsCapabilities`)
3. **Opt-in sections** passed to `DocsPageLayout`

**Recommendation**: **Option 1** (Custom per component)

- These sections are too component-specific to abstract
- Keep them as separate React components
- Just wrap them in `DocsSection` for consistency

---

### 4. Color Palette: Expand or Constrain?

Current colors:

- Purple (TextField, Select)
- Blue (AppShell)
- Amber (Snackbar)

**Question**: Should we:

1. **Constrain**: Only 3-4 colors to ensure visual cohesion
2. **Expand**: Add green, red, teal, etc. for more variety

**Recommendation**: **Expand to 6 colors**

- Purple, Blue, Amber, Green, Red, Teal
- Document when to use each color in style guide

---

### 5. File Location: Where to Put Shared Components?

**Options**:

1. `/web/src/pages/Docs/components/shared/`
2. `/web/src/pages/Docs/shared/`
3. `/web/src/components/Docs/` (top-level)

**Recommendation**: **Option 1** (`/web/src/pages/Docs/components/shared/`)

- Co-located with usage
- Clear it's only for Docs pages
- Matches existing directory structure

---

## File Structure (Post-Migration)

```
web/src/pages/Docs/components/
├── shared/
│   ├── README.md                      (Usage guide)
│   ├── DocsPageLayout.tsx             (Main orchestrator)
│   ├── DocsHeroSection.tsx            (Hero title + description)
│   ├── DocsSection.tsx                (Section wrapper + header)
│   ├── DocsQuickStartBox.tsx          (Quick start container)
│   ├── DocsExampleList.tsx            (Example list renderer)
│   ├── DocsExampleItem.tsx            (Single example item)
│   ├── DocsCalloutBox.tsx             (Info/warning/success boxes)
│   ├── DocsCodeBlock.tsx              (Code block with syntax highlighting)
│   ├── DocsDivider.tsx                (Section divider)
│   └── docs-components.types.ts       (Shared type definitions)
├── text-field/
│   ├── TextFieldDocs.tsx              (150 lines → 50 lines)
│   ├── TextFieldExamples.tsx          (159 lines → 40 lines)
│   ├── TextFieldLayoutVariants.tsx    (Keep as-is - unique)
│   ├── TextFieldCapabilities.tsx      (Keep as-is - unique)
│   ├── TextFieldScenarios.tsx         (Keep as-is - uses DocsPreviewBlock)
│   ├── TextFieldApi.tsx               (Keep as-is - props table)
│   ├── TextFieldNotes.tsx             (Keep as-is - notes content)
│   └── TextFieldPlayground.tsx        (Keep as-is - unique)
├── snackbar/
│   ├── SnackbarDocs.tsx               (225 lines → 60 lines)
│   ├── SnackbarExamples.tsx           (Reduced by ~70%)
│   ├── SnackbarScenarios.tsx          (Keep as-is)
│   ├── SnackbarApi.tsx                (Keep as-is)
│   └── SnackbarNotes.tsx              (Keep as-is)
└── appshell/
    ├── AppShellDocs.tsx               (203 lines → 55 lines)
    ├── AppShellExamples.tsx           (Reduced by ~60%)
    ├── AppShellScenarios.tsx          (Keep as-is)
    ├── AppShellApi.tsx                (Keep as-is)
    └── AppShellNotes.tsx              (Keep as-is)
```

---

## Success Metrics

### Quantitative

1. **LOC Reduction**: Target 80%+ reduction in boilerplate
2. **File Count**: Stable (new shared files offset by cleaner component files)
3. **Component Creation Time**: 4-6× faster
4. **Bundle Size**: Negligible impact (code splitting still works)

### Qualitative

1. **Consistency**: 100% visual consistency across all component docs
2. **Maintainability**: Single place to update styles
3. **Onboarding**: Faster for new contributors
4. **Accessibility**: Centralized a11y improvements

---

## Risks & Mitigations

### Risk 1: Over-Abstraction

**Risk**: Components become too rigid, limiting flexibility

**Mitigation**:

- Provide escape hatches (e.g., `custom` section type)
- Allow `sx` prop overrides on all components
- Keep complex sections (Playground) as custom components

---

### Risk 2: Migration Effort

**Risk**: Migrating 7+ components takes too long

**Mitigation**:

- Incremental migration (Phase 4 over 2 weeks)
- Backward compatible (old and new can coexist)
- Migrate high-value components first (TextField, Select)

---

### Risk 3: Breaking Changes

**Risk**: Changes to shared components break all docs

**Mitigation**:

- Unit tests for all shared components (TDD-first per policy)
- Visual regression tests (Storybook)
- Semantic versioning for shared component API

---

### Risk 4: Theme Coupling

**Risk**: Hardcoded colors don't work with new themes

**Mitigation**:

- Use theme tokens where possible
- Document color system in style guide
- Make colors configurable via theme context

---

## Next Steps

### Immediate Actions (This Week)

1. ✅ **Review this proposal** with team
2. ✅ **Get approval** on component API designs
3. ✅ **Resolve open questions** (inline vs separate files, color palette, etc.)
4. ✅ **Create GitHub issue** with Phase 1 tasks

### Phase 1 Kickoff (Next Week)

1. Create `/web/src/pages/Docs/components/shared/` directory
2. Implement `DocsDivider` (simplest component)
3. Write unit tests
4. Implement `DocsCalloutBox`
5. Implement `DocsSectionHeader`
6. Update TextField docs to use new components (pilot)
7. Measure impact and iterate

---

## Conclusion

This reusable component architecture will:

- **Reduce boilerplate by ~82%** (2,961 lines saved across 7 components)
- **Enforce visual consistency** across all documentation
- **Speed up development** by 4-6× for new component docs
- **Improve maintainability** with centralized styling logic
- **Align with Dashforge quality standards** (TDD, type safety, no `any` types)

The proposed components are:

1. **Simple to use**: Clear, minimal API
2. **Flexible**: Escape hatches for custom content
3. **Type-safe**: Strict TypeScript interfaces
4. **Tested**: TDD-first per Dashforge UI Component Policy
5. **Maintainable**: Single source of truth for styling

**Recommendation**: Proceed with Phase 1 implementation starting next week.

---

**Status**: 📋 Awaiting approval  
**Next Review**: After Phase 1 completion  
**Owner**: TBD
