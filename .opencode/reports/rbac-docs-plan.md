# Access Control (RBAC) Documentation Group — PLAN

**Date**: 2026-04-04  
**Status**: PLANNING PHASE (NO IMPLEMENTATION)  
**Policy Reference**: `/dashforge/.opencode/policies/docs-architecture.policies.md`

---

## Executive Summary

This document defines the complete structure for the "ACCESS CONTROL" documentation group. The RBAC system is now implemented in `@dashforge/rbac` and requires comprehensive documentation similar to the existing "FORM SYSTEM" group.

**Scope**: 6 pages covering core concepts, React integration, Dashforge-specific helpers, and interactive playground.

**Policy Compliance**: All pages follow explicit JSX composition. No config-driven sections. No page-level orchestrators. Shared primitives used only for proven patterns.

---

## 1. Group Definition

### Group Label

**ACCESS CONTROL**

### Sidebar Placement

Position the group **AFTER "FORM SYSTEM"** and **BEFORE "COMPONENTS"** in the documentation sidebar.

**Rationale**:

- ACCESS CONTROL is a cross-cutting system like FORM SYSTEM
- It integrates with form components and UI components
- Logical flow: Getting Started → Theme System → Form System → Access Control → Components

### Sidebar Structure

```
GETTING STARTED
  - Overview
  - Installation
  - Usage
  - Project Structure
  - Why Dashforge

THEME SYSTEM
  - Design Tokens

FORM SYSTEM
  - Overview
  - Quick Start
  - Reactions
  - Dynamic Forms
  - Patterns
  - API

ACCESS CONTROL ← NEW GROUP
  - Overview
  - Quick Start
  - Core Concepts
  - React Integration
  - Dashforge Integration
  - Playground

COMPONENTS
  - TextField
  - NumberField
  - Select
  - ...
```

---

## 2. Pages List

### Page 1: Overview

**Route**: `/docs/access-control/overview`  
**Purpose**: Explain what RBAC is, why it exists, and when to use it  
**Similar to**: FormSystemOverview.tsx

### Page 2: Quick Start

**Route**: `/docs/access-control/quick-start`  
**Purpose**: Get users running with RBAC in 5 minutes  
**Similar to**: FormSystemQuickStart.tsx

### Page 3: Core Concepts

**Route**: `/docs/access-control/core-concepts`  
**Purpose**: Deep dive into RBAC fundamentals (roles, permissions, subjects, conditions)  
**Similar to**: FormSystemReactions.tsx (depth of explanation)

### Page 4: React Integration

**Route**: `/docs/access-control/react`  
**Purpose**: Using RBAC in React (RbacProvider, useRbac, useCan, Can component)  
**Similar to**: FormSystemDynamicForms.tsx (integration patterns)

### Page 5: Dashforge Integration

**Route**: `/docs/access-control/dashforge`  
**Purpose**: Dashforge-specific RBAC helpers (resolveAccessState, filterNavigationItems, createAccessGuard)  
**Similar to**: FormSystemPatterns.tsx (practical patterns)

### Page 6: Playground

**Route**: `/docs/access-control/playground`  
**Purpose**: Interactive playground for testing RBAC rules and behaviors  
**Similar to**: TextField Playground (interactive experimentation)

---

## 3. Page Structure Breakdown

### Page 1: Overview (`AccessControlOverview.tsx`)

**File**: `web/src/pages/Docs/access-control/overview/AccessControlOverview.tsx`

#### JSX Structure Outline

```tsx
export function AccessControlOverview() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero - Use DocsHeroSection */}
      <DocsHeroSection
        title="Access Control (RBAC)"
        description="Production-grade role-based access control for securing UI components, routes, and actions."
        themeColor="orange"
      />

      {/* What is RBAC - Use DocsSection */}
      <DocsSection
        id="what-is-rbac"
        title="What is Access Control?"
        description="Understanding the core problem and solution"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* The Problem - Use DocsSection */}
      <DocsSection
        id="the-problem"
        title="The Problem"
        description="Why manual access control isn't enough"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Core Features - Use DocsSection */}
      <DocsSection
        id="core-features"
        title="Core Features"
        description="What you get with Dashforge RBAC"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Architecture Overview - Use DocsSection */}
      <DocsSection
        id="architecture"
        title="Architecture"
        description="Three-layer design: Core → React → Dashforge"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* When to Use - Use DocsSection */}
      <DocsSection
        id="when-to-use"
        title="When to Use RBAC"
        description="Determining if RBAC is right for your application"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Next Steps - Use DocsSection */}
      <DocsSection
        id="next-steps"
        title="Next Steps"
        description="Where to go from here"
      >
        {/* Content */}
      </DocsSection>
    </Stack>
  );
}
```

#### Sections List

1. **Hero** (DocsHeroSection)
2. **What is Access Control?** (DocsSection)
3. **The Problem** (DocsSection)
4. **Core Features** (DocsSection)
5. **Architecture** (DocsSection)
6. **When to Use RBAC** (DocsSection)
7. **Next Steps** (DocsSection)

#### Shared Primitives Usage

- ✅ DocsHeroSection (hero)
- ✅ DocsSection (all sections)
- ✅ DocsDivider (section breaks)
- ✅ DocsCalloutBox (info/warning boxes)
- ✅ DocsCodeBlock (code examples)

#### Local Components

- None required (all sections use standard primitives)

---

### Page 2: Quick Start (`AccessControlQuickStart.tsx`)

**File**: `web/src/pages/Docs/access-control/quick-start/AccessControlQuickStart.tsx`

#### JSX Structure Outline

```tsx
export function AccessControlQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero */}
      <DocsHeroSection
        title="Quick Start"
        description="Get started with RBAC in under 5 minutes."
        themeColor="orange"
      />

      {/* Quick Start Section - KEEP LOCAL (per policy) */}
      <Box
        id="setup"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 2.5,
          bgcolor: isDark ? 'rgba(251,146,60,0.04)' : 'rgba(251,146,60,0.04)',
          border: isDark
            ? '1px solid rgba(251,146,60,0.15)'
            : '1px solid rgba(251,146,60,0.15)',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h2" sx={{...}}>
              Setup
            </Typography>
            <Box sx={{/* Badge */}}>
              <Typography sx={{...}}>
                3 STEPS
              </Typography>
            </Box>
          </Box>
          {/* Step-by-step content */}
        </Stack>
      </Box>

      {/* Complete Example - Use DocsSection */}
      <DocsSection
        id="complete-example"
        title="Complete Example"
        description="Full working implementation"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Key Concepts - Use DocsSection */}
      <DocsSection
        id="key-concepts"
        title="Key Concepts"
        description="Understanding the fundamentals"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Next Steps - Use DocsSection */}
      <DocsSection
        id="next-steps"
        title="Next Steps"
        description="Where to go from here"
      >
        {/* Content */}
      </DocsSection>
    </Stack>
  );
}
```

#### Sections List

1. **Hero** (DocsHeroSection)
2. **Setup** (LOCAL - styled box with orange theme)
3. **Complete Example** (DocsSection)
4. **Key Concepts** (DocsSection)
5. **Next Steps** (DocsSection)

#### Shared Primitives Usage

- ✅ DocsHeroSection (hero)
- ✅ DocsSection (standard sections)
- ✅ DocsDivider (section breaks)
- ✅ DocsCodeBlock (code examples)

#### Local Components

- ✅ **Setup section** - Must stay local (per policy: Quick Start always local)
  - Custom orange-themed box
  - Step counter badge
  - Multi-step layout

---

### Page 3: Core Concepts (`AccessControlCoreConcepts.tsx`)

**File**: `web/src/pages/Docs/access-control/core-concepts/AccessControlCoreConcepts.tsx`

#### JSX Structure Outline

```tsx
export function AccessControlCoreConcepts() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero */}
      <DocsHeroSection
        title="Core Concepts"
        description="Understanding the fundamental building blocks of RBAC."
        themeColor="orange"
      />

      {/* Subjects - Use DocsSection */}
      <DocsSection
        id="subjects"
        title="Subjects"
        description="The actors requesting access"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Permissions - Use DocsSection */}
      <DocsSection
        id="permissions"
        title="Permissions"
        description="Defining what can be done to what"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Roles - Use DocsSection */}
      <DocsSection
        id="roles"
        title="Roles"
        description="Grouping permissions and inheritance"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Policies - Use DocsSection */}
      <DocsSection
        id="policies"
        title="Policies"
        description="The complete RBAC configuration"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Conditions - Use DocsSection */}
      <DocsSection
        id="conditions"
        title="Conditions"
        description="Dynamic permission evaluation"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Effect Precedence - Use DocsSection */}
      <DocsSection
        id="effect-precedence"
        title="Allow vs Deny Precedence"
        description="Understanding how conflicts are resolved"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Wildcards - Use DocsSection */}
      <DocsSection
        id="wildcards"
        title="Wildcard Support"
        description="Using * for action and resource matching"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Best Practices - Use DocsSection */}
      <DocsSection
        id="best-practices"
        title="Best Practices"
        description="Recommendations for effective RBAC design"
      >
        {/* Content */}
      </DocsSection>
    </Stack>
  );
}
```

#### Sections List

1. **Hero** (DocsHeroSection)
2. **Subjects** (DocsSection)
3. **Permissions** (DocsSection)
4. **Roles** (DocsSection)
5. **Policies** (DocsSection)
6. **Conditions** (DocsSection)
7. **Allow vs Deny Precedence** (DocsSection)
8. **Wildcard Support** (DocsSection)
9. **Best Practices** (DocsSection)

#### Shared Primitives Usage

- ✅ DocsHeroSection (hero)
- ✅ DocsSection (all sections)
- ✅ DocsDivider (section breaks)
- ✅ DocsCalloutBox (warnings for precedence rules)
- ✅ DocsCodeBlock (code examples)

#### Local Components

- None required (all sections use standard primitives)

---

### Page 4: React Integration (`AccessControlReact.tsx`)

**File**: `web/src/pages/Docs/access-control/react/AccessControlReact.tsx`

#### JSX Structure Outline

```tsx
export function AccessControlReact() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero */}
      <DocsHeroSection
        title="React Integration"
        description="Using RBAC in React applications with hooks and components."
        themeColor="orange"
      />

      {/* RbacProvider - Use DocsSection */}
      <DocsSection
        id="rbac-provider"
        title="RbacProvider"
        description="Setting up RBAC context"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* useRbac Hook - Use DocsSection */}
      <DocsSection
        id="use-rbac"
        title="useRbac Hook"
        description="Accessing the RBAC engine"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* useCan Hook - Use DocsSection */}
      <DocsSection
        id="use-can"
        title="useCan Hook"
        description="Reactive permission checks"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Can Component - Use DocsSection */}
      <DocsSection
        id="can-component"
        title="Can Component"
        description="Declarative access control"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Advanced Patterns - Use DocsSection */}
      <DocsSection
        id="advanced-patterns"
        title="Advanced Patterns"
        description="Multi-check, fallbacks, and composition"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Performance Considerations - Use DocsSection */}
      <DocsSection
        id="performance"
        title="Performance Considerations"
        description="Optimizing RBAC checks in React"
      >
        {/* Content */}
      </DocsSection>
    </Stack>
  );
}
```

#### Sections List

1. **Hero** (DocsHeroSection)
2. **RbacProvider** (DocsSection)
3. **useRbac Hook** (DocsSection)
4. **useCan Hook** (DocsSection)
5. **Can Component** (DocsSection)
6. **Advanced Patterns** (DocsSection)
7. **Performance Considerations** (DocsSection)

#### Shared Primitives Usage

- ✅ DocsHeroSection (hero)
- ✅ DocsSection (all sections)
- ✅ DocsDivider (section breaks)
- ✅ DocsCalloutBox (performance tips)
- ✅ DocsCodeBlock (code examples)

#### Local Components

- None required (all sections use standard primitives)

---

### Page 5: Dashforge Integration (`AccessControlDashforge.tsx`)

**File**: `web/src/pages/Docs/access-control/dashforge/AccessControlDashforge.tsx`

#### JSX Structure Outline

```tsx
export function AccessControlDashforge() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero */}
      <DocsHeroSection
        title="Dashforge Integration"
        description="RBAC helpers for Dashforge components, navigation, and forms."
        themeColor="orange"
      />

      {/* Overview - Use DocsSection */}
      <DocsSection
        id="overview"
        title="Integration Layer Overview"
        description="Dashforge-specific RBAC utilities"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* resolveAccessState - Use DocsSection */}
      <DocsSection
        id="resolve-access-state"
        title="resolveAccessState"
        description="Converting RBAC decisions to UI state"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Form Components - Use DocsSection */}
      <DocsSection
        id="form-components"
        title="Form Component Integration"
        description="Using onUnauthorized with Dashforge form fields"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* filterNavigationItems - Use DocsSection */}
      <DocsSection
        id="filter-navigation"
        title="filterNavigationItems"
        description="Securing LeftNav menu items"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* filterActions - Use DocsSection */}
      <DocsSection
        id="filter-actions"
        title="filterActions"
        description="Securing toolbar buttons and actions"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* createAccessGuard - Use DocsSection */}
      <DocsSection
        id="create-access-guard"
        title="createAccessGuard"
        description="Route and page protection"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Real-World Examples - Use DocsSection */}
      <DocsSection
        id="examples"
        title="Real-World Examples"
        description="Complete integration scenarios"
      >
        {/* Content */}
      </DocsSection>

      <DocsDivider />

      {/* Best Practices - Use DocsSection */}
      <DocsSection
        id="best-practices"
        title="Best Practices"
        description="Recommendations for production use"
      >
        {/* Content */}
      </DocsSection>
    </Stack>
  );
}
```

#### Sections List

1. **Hero** (DocsHeroSection)
2. **Integration Layer Overview** (DocsSection)
3. **resolveAccessState** (DocsSection)
4. **Form Component Integration** (DocsSection)
5. **filterNavigationItems** (DocsSection)
6. **filterActions** (DocsSection)
7. **createAccessGuard** (DocsSection)
8. **Real-World Examples** (DocsSection)
9. **Best Practices** (DocsSection)

#### Shared Primitives Usage

- ✅ DocsHeroSection (hero)
- ✅ DocsSection (all sections)
- ✅ DocsDivider (section breaks)
- ✅ DocsCalloutBox (security warnings)
- ✅ DocsCodeBlock (code examples)

#### Local Components

- None required (all sections use standard primitives)

---

### Page 6: Playground (`AccessControlPlayground.tsx`)

**File**: `web/src/pages/Docs/access-control/playground/AccessControlPlayground.tsx`

#### JSX Structure Outline

```tsx
export function AccessControlPlayground() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero */}
      <DocsHeroSection
        title="RBAC Playground"
        description="Experiment with roles, permissions, and access control behaviors in real-time."
        themeColor="orange"
      />

      {/* Playground Section - KEEP LOCAL (per policy) */}
      <Stack spacing={3.5} id="playground">
        <Box>
          <Typography variant="h2" sx={{...}}>
            Interactive Playground
          </Typography>
          <Typography sx={{...}}>
            Test RBAC rules and see how they affect UI components in real-time.
          </Typography>
        </Box>

        {/* Playground Controls */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.8)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <Stack spacing={4}>
            {/* Role Selector */}
            <Box>
              <Typography variant="h6" sx={{...}}>
                Current Role
              </Typography>
              {/* Role selection controls */}
            </Box>

            {/* Policy Editor (optional) */}
            <Box>
              <Typography variant="h6" sx={{...}}>
                Policy Configuration
              </Typography>
              {/* Policy editing controls */}
            </Box>

            {/* Live Demo Components */}
            <Box>
              <Typography variant="h6" sx={{...}}>
                Component Behavior
              </Typography>
              {/* Demo components showing hide/disable/readonly */}
            </Box>
          </Stack>
        </Box>
      </Stack>

      <DocsDivider />

      {/* How It Works - Use DocsSection */}
      <DocsSection
        id="how-it-works"
        title="How It Works"
        description="Understanding the playground mechanics"
      >
        {/* Content */}
      </DocsSection>
    </Stack>
  );
}
```

#### Sections List

1. **Hero** (DocsHeroSection)
2. **Interactive Playground** (LOCAL - custom spacing and controls)
3. **How It Works** (DocsSection)

#### Shared Primitives Usage

- ✅ DocsHeroSection (hero)
- ✅ DocsSection (explanation section)
- ✅ DocsDivider (section breaks)
- ✅ DocsCodeBlock (generated code output)

#### Local Components

- ✅ **Playground Section** - Must stay local (per policy: Playground always local)
  - Role selector (Select or RadioGroup)
  - Policy configuration (optional JSON editor or preset selector)
  - Live demo area (TextField, Button, etc. with different onUnauthorized values)
  - Generated code display (shows current policy + subject)
  - Custom spacing (3.5 vs standard 4)

---

## 4. Playground Design

### Role Switching Mechanism

**Approach**: Use RadioGroup or Select for role selection

**Available Roles** (Predefined for playground):

1. **Admin** - Full access (all permissions)
2. **Editor** - Can edit and read, cannot delete
3. **Viewer** - Read-only access
4. **Guest** - Minimal access (public resources only)
5. **Custom** - User-defined role (advanced mode)

### Components Used in Playground

**Live Demo Components**:

1. **TextField** with `onUnauthorized: 'hide'`
2. **TextField** with `onUnauthorized: 'disable'`
3. **TextField** with `onUnauthorized: 'readonly'`
4. **Button** (action that may be filtered)
5. **Navigation Items** (simulated LeftNav filtering)
6. **Access Guard** (simulated route protection)

### Interaction Model

**User Flow**:

```
1. User selects role from RadioGroup/Select
   ↓
2. Subject updates (role changes)
   ↓
3. RBAC engine re-evaluates all components
   ↓
4. Components update visually (hide/disable/readonly)
   ↓
5. Generated code block updates to show current policy + subject
```

**State Management**:

- `currentRole` - Selected role (state)
- `subject` - Derived from currentRole (useMemo)
- `policy` - Predefined (constant or editable in advanced mode)
- `rbac` - RbacProvider wraps playground content

**Visual Feedback**:

- Role selector highlighted
- Components animate state changes (fade in/out for hide, opacity for disable)
- Generated code block shows exact TypeScript for current configuration
- Status indicators (✅ Granted, ❌ Denied) next to each component

### Advanced Mode (Optional)

**Policy Editor**:

- JSON editor (CodeMirror or simple textarea)
- Allows users to define custom policies
- Validation feedback for invalid policies
- Preset templates (Admin, Editor, Viewer)

**Resource Simulation**:

- Checkbox to toggle "resourceData" (e.g., "isOwner: true")
- Demonstrates condition-based permissions

---

## 5. TOC Strategy

### TOC Definition Pattern

**Consistency with DocsPage.tsx**: Each page defines a static TOC array in `DocsPage.tsx`

**Example for Overview**:

```typescript
const accessControlOverviewTocItems: DocsTocItem[] = [
  { id: 'what-is-rbac', label: 'What is Access Control?' },
  { id: 'the-problem', label: 'The Problem' },
  { id: 'core-features', label: 'Core Features' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'when-to-use', label: 'When to Use RBAC' },
  { id: 'next-steps', label: 'Next Steps' },
];
```

**Pattern for All Pages**:

- TOC array name: `accessControl{PageName}TocItems`
- Array type: `DocsTocItem[]`
- Each entry: `{ id: 'section-id', label: 'Display Label' }`
- ID must match section `id` attribute exactly

### TOC Arrays Required in DocsPage.tsx

Add these arrays to `DocsPage.tsx` (lines 309+):

```typescript
// ACCESS CONTROL TOC
const accessControlOverviewTocItems: DocsTocItem[] = [
  { id: 'what-is-rbac', label: 'What is Access Control?' },
  { id: 'the-problem', label: 'The Problem' },
  { id: 'core-features', label: 'Core Features' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'when-to-use', label: 'When to Use RBAC' },
  { id: 'next-steps', label: 'Next Steps' },
];

const accessControlQuickStartTocItems: DocsTocItem[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'complete-example', label: 'Complete Example' },
  { id: 'key-concepts', label: 'Key Concepts' },
  { id: 'next-steps', label: 'Next Steps' },
];

const accessControlCoreConceptsTocItems: DocsTocItem[] = [
  { id: 'subjects', label: 'Subjects' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'roles', label: 'Roles' },
  { id: 'policies', label: 'Policies' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'effect-precedence', label: 'Allow vs Deny Precedence' },
  { id: 'wildcards', label: 'Wildcard Support' },
  { id: 'best-practices', label: 'Best Practices' },
];

const accessControlReactTocItems: DocsTocItem[] = [
  { id: 'rbac-provider', label: 'RbacProvider' },
  { id: 'use-rbac', label: 'useRbac Hook' },
  { id: 'use-can', label: 'useCan Hook' },
  { id: 'can-component', label: 'Can Component' },
  { id: 'advanced-patterns', label: 'Advanced Patterns' },
  { id: 'performance', label: 'Performance Considerations' },
];

const accessControlDashforgeTocItems: DocsTocItem[] = [
  { id: 'overview', label: 'Integration Layer Overview' },
  { id: 'resolve-access-state', label: 'resolveAccessState' },
  { id: 'form-components', label: 'Form Component Integration' },
  { id: 'filter-navigation', label: 'filterNavigationItems' },
  { id: 'filter-actions', label: 'filterActions' },
  { id: 'create-access-guard', label: 'createAccessGuard' },
  { id: 'examples', label: 'Real-World Examples' },
  { id: 'best-practices', label: 'Best Practices' },
];

const accessControlPlaygroundTocItems: DocsTocItem[] = [
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'how-it-works', label: 'How It Works' },
];
```

### Route Matching Logic

Add route checks to `DocsPage.tsx` (after line 356):

```typescript
const isAccessControlOverview =
  location.pathname === '/docs/access-control/overview';
const isAccessControlQuickStart =
  location.pathname === '/docs/access-control/quick-start';
const isAccessControlCoreConcepts =
  location.pathname === '/docs/access-control/core-concepts';
const isAccessControlReact = location.pathname === '/docs/access-control/react';
const isAccessControlDashforge =
  location.pathname === '/docs/access-control/dashforge';
const isAccessControlPlayground =
  location.pathname === '/docs/access-control/playground';
```

Add TOC assignment logic (after line 408):

```typescript
const tocItems =
  // ... existing checks ...
  : isAccessControlOverview
  ? accessControlOverviewTocItems
  : isAccessControlQuickStart
  ? accessControlQuickStartTocItems
  : isAccessControlCoreConcepts
  ? accessControlCoreConceptsTocItems
  : isAccessControlReact
  ? accessControlReactTocItems
  : isAccessControlDashforge
  ? accessControlDashforgeTocItems
  : isAccessControlPlayground
  ? accessControlPlaygroundTocItems
  : textFieldTocItems;
```

Add component rendering logic (after line 462):

```typescript
const docsContent =
  // ... existing checks ...
  : isAccessControlOverview ? (
    <AccessControlOverview />
  ) : isAccessControlQuickStart ? (
    <AccessControlQuickStart />
  ) : isAccessControlCoreConcepts ? (
    <AccessControlCoreConcepts />
  ) : isAccessControlReact ? (
    <AccessControlReact />
  ) : isAccessControlDashforge ? (
    <AccessControlDashforge />
  ) : isAccessControlPlayground ? (
    <AccessControlPlayground />
  ) : (
    <TextFieldDocs />
  );
```

---

## 6. Folder Structure

### Complete Directory Tree

```
web/src/pages/Docs/access-control/
├── overview/
│   └── AccessControlOverview.tsx
├── quick-start/
│   └── AccessControlQuickStart.tsx
├── core-concepts/
│   └── AccessControlCoreConcepts.tsx
├── react/
│   └── AccessControlReact.tsx
├── dashforge/
│   └── AccessControlDashforge.tsx
└── playground/
    └── AccessControlPlayground.tsx
```

### File Naming Conventions

**Pattern**: `AccessControl{PageName}.tsx`

**Rationale**:

- Matches existing pattern (FormSystem{PageName}.tsx)
- Clear namespace for access control pages
- Autocomplete-friendly
- Consistent with Dashforge naming conventions

### Import Paths

**Example imports** (from DocsPage.tsx):

```typescript
import { AccessControlOverview } from './access-control/overview/AccessControlOverview';
import { AccessControlQuickStart } from './access-control/quick-start/AccessControlQuickStart';
import { AccessControlCoreConcepts } from './access-control/core-concepts/AccessControlCoreConcepts';
import { AccessControlReact } from './access-control/react/AccessControlReact';
import { AccessControlDashforge } from './access-control/dashforge/AccessControlDashforge';
import { AccessControlPlayground } from './access-control/playground/AccessControlPlayground';
```

---

## 7. Constraints & Compliance

### Policy Adherence

✅ **No abstraction layer**

- All pages are explicit React components
- Structure visible in JSX composition
- No config-driven sections

✅ **No config-driven docs**

- No `sections: []` arrays
- No declarative page definitions
- Structure in JSX, not data

✅ **Explicit JSX pages**

- Opening any `*AccessControl*.tsx` file reveals structure immediately
- Custom sections visible inline
- No mental mapping required

✅ **Follow shared primitives rules**

- DocsHeroSection for hero sections
- DocsSection for standard sections
- DocsDivider for section breaks
- DocsCalloutBox for info/warning/error
- DocsCodeBlock for code examples

✅ **Local sections for unique content**

- Quick Start section stays local (orange-themed box)
- Playground section stays local (custom controls)
- No premature extraction

### Forbidden Patterns (Not Used)

❌ DocsPageLayout orchestrator  
❌ Config-driven sections  
❌ Dynamic rendering engines  
❌ Generic one-size-fits-all wrappers  
❌ Smart primitives with routing/context logic  
❌ Variant props with 3+ variants

### Acceptance Criteria

Before implementing ACCESS CONTROL docs group:

- [ ] All pages use explicit JSX composition
- [ ] Hero uses `DocsHeroSection`
- [ ] Standard sections use `DocsSection`
- [ ] Dividers use `DocsDivider`
- [ ] Quick Start stays local (inline)
- [ ] Playground stays local (custom controls)
- [ ] No new abstraction layers introduced
- [ ] Primitives remain simple (≤5 props)
- [ ] TOC arrays defined in DocsPage.tsx
- [ ] Route matching logic added to DocsPage.tsx
- [ ] All anchor IDs match TOC IDs exactly

---

## 8. Theme Color

### Chosen Color: Orange

**Rationale**:

- **Purple**: Used by Form System (reactive forms)
- **Blue**: Used by components (TextField, Select, etc.)
- **Orange**: Available, visually distinct, conveys "security/access"

**Usage**:

```tsx
<DocsHeroSection title="..." description="..." themeColor="orange" />
```

**Color Values** (from existing DocsHeroSection):

- Light mode: `rgba(251,146,60,0.04)` background, `rgba(251,146,60,0.15)` border
- Dark mode: `rgba(251,146,60,0.04)` background, `rgba(251,146,60,0.15)` border
- Badge: Orange text with orange border

---

## 9. Content Strategy

### Page Content Guidelines

#### Overview Page

**Focus**: High-level understanding
**Audience**: Decision makers, architects
**Tone**: Explanatory, motivational
**Key Questions**:

- What is RBAC?
- Why does it exist?
- When should I use it?
- How does it fit into Dashforge?

#### Quick Start Page

**Focus**: Get running fast
**Audience**: Developers wanting to try RBAC
**Tone**: Action-oriented, minimal explanation
**Key Questions**:

- How do I install it?
- What's the minimal setup?
- What does a complete example look like?

#### Core Concepts Page

**Focus**: Deep understanding
**Audience**: Developers building production RBAC
**Tone**: Educational, detailed
**Key Questions**:

- What are subjects, roles, permissions?
- How does precedence work?
- How do conditions work?
- What are best practices?

#### React Integration Page

**Focus**: React-specific usage
**Audience**: React developers
**Tone**: Practical, pattern-focused
**Key Questions**:

- How do I use RbacProvider?
- When should I use hooks vs components?
- How do I optimize performance?

#### Dashforge Integration Page

**Focus**: Dashforge-specific helpers
**Audience**: Dashforge users
**Tone**: Applied, scenario-driven
**Key Questions**:

- How do I secure form fields?
- How do I filter navigation?
- How do I protect routes?
- What are real-world examples?

#### Playground Page

**Focus**: Experimentation
**Audience**: Learners, evaluators
**Tone**: Interactive, exploratory
**Key Questions**:

- What happens when I change roles?
- How do different behaviors look?
- How do I customize policies?

### Code Example Standards

**All code examples must**:

- Be copy-paste ready
- Include necessary imports
- Use TypeScript
- Follow Dashforge conventions
- Be realistic (not toy examples)
- Be tested (if extracted to playground)

**Example structure**:

```tsx
<DocsCodeBlock
  code={`import { RbacProvider, useCan } from '@dashforge/rbac';

function App() {
  const canEdit = useCan({ action: 'edit', resource: 'booking' });
  
  return (
    <div>
      {canEdit && <Button>Edit</Button>}
    </div>
  );
}`}
  language="tsx"
  isDark={isDark}
/>
```

---

## 10. Cross-References

### Links to Other Docs

**From Access Control to Components**:

- TextField RBAC section → Access Control / Form Components
- Select RBAC section → Access Control / Form Components
- Checkbox RBAC section → Access Control / Form Components

**From Components to Access Control**:

- TextField docs → Link to Access Control / Quick Start
- Form System docs → Link to Access Control / Dashforge Integration

**Internal Links** (within Access Control group):

- Overview → Quick Start (next steps)
- Quick Start → Core Concepts (learn more)
- Core Concepts → React Integration (implementation)
- React Integration → Dashforge Integration (practical usage)
- Dashforge Integration → Playground (try it out)

### Navigation Hints

**"Next Steps" sections** should guide users:

- Overview → Quick Start
- Quick Start → Core Concepts OR Dashforge Integration (skip theory if practical)
- Core Concepts → React Integration
- React Integration → Dashforge Integration
- Dashforge Integration → Playground
- Playground → Back to specific pages for deep dives

---

## 11. Implementation Checklist

### Phase 1: File Structure

- [ ] Create `web/src/pages/Docs/access-control/` directory
- [ ] Create subdirectories: `overview/`, `quick-start/`, `core-concepts/`, `react/`, `dashforge/`, `playground/`
- [ ] Create placeholder files for all 6 pages

### Phase 2: DocsPage.tsx Updates

- [ ] Add TOC arrays for all 6 pages
- [ ] Add route matching logic (6 route checks)
- [ ] Add TOC assignment logic
- [ ] Add component rendering logic
- [ ] Add imports for all 6 components

### Phase 3: Page Implementation (Sequential)

1. [ ] AccessControlOverview.tsx
2. [ ] AccessControlQuickStart.tsx
3. [ ] AccessControlCoreConcepts.tsx
4. [ ] AccessControlReact.tsx
5. [ ] AccessControlDashforge.tsx
6. [ ] AccessControlPlayground.tsx

### Phase 4: Sidebar Integration

- [ ] Update sidebar config to include ACCESS CONTROL group
- [ ] Position group after FORM SYSTEM
- [ ] Add all 6 pages to sidebar
- [ ] Test navigation

### Phase 5: Verification

- [ ] All pages render without errors
- [ ] All TOC entries navigate correctly
- [ ] All anchor links work
- [ ] Dark/light theme support
- [ ] Code examples are accurate
- [ ] Cross-references work
- [ ] Playground is interactive

---

## 12. Risk Assessment

### Potential Issues

**Issue 1: Playground Complexity**

- **Risk**: Playground may become too complex with policy editor
- **Mitigation**: Start with preset roles only, add custom policy editor in v2

**Issue 2: Code Example Accuracy**

- **Risk**: Examples may become outdated as RBAC evolves
- **Mitigation**: Use actual imports from `@dashforge/rbac`, test examples

**Issue 3: Documentation Drift**

- **Risk**: Docs may not match implementation
- **Mitigation**: Link to source code, reference tests

**Issue 4: Sidebar Clutter**

- **Risk**: Too many doc groups may overwhelm users
- **Mitigation**: Keep group concise (6 pages), use clear hierarchy

---

## 13. Future Enhancements (Out of Scope for V1)

**Not included in this plan**:

- Video tutorials
- API reference page (use inline API docs instead)
- Migration guide (no prior RBAC to migrate from)
- Advanced playground features (policy editor, resource simulation)
- Interactive condition builder
- RBAC debugging tools

**Rationale**: Keep V1 focused on core documentation. Add these based on user feedback.

---

## 14. Summary

### Pages to Create (6 Total)

1. **AccessControlOverview.tsx** - What, why, when
2. **AccessControlQuickStart.tsx** - Get started in 5 minutes
3. **AccessControlCoreConcepts.tsx** - Subjects, roles, permissions, policies
4. **AccessControlReact.tsx** - RbacProvider, hooks, Can component
5. **AccessControlDashforge.tsx** - Form integration, navigation filtering, guards
6. **AccessControlPlayground.tsx** - Interactive experimentation

### DocsPage.tsx Changes Required

- 6 TOC arrays
- 6 route checks
- 6 TOC assignments
- 6 component renders
- 6 imports

### Shared Primitives Used

- DocsHeroSection (all pages)
- DocsSection (most sections)
- DocsDivider (all pages)
- DocsCalloutBox (warnings, tips)
- DocsCodeBlock (all pages)

### Local Components Required

- Quick Start section (orange-themed box)
- Playground section (custom controls)

### Theme Color

**Orange** (`themeColor="orange"`)

### Estimated Implementation Time

- File structure: 30 minutes
- DocsPage.tsx updates: 1 hour
- Overview page: 2 hours
- Quick Start page: 2 hours
- Core Concepts page: 4 hours
- React Integration page: 3 hours
- Dashforge Integration page: 3 hours
- Playground page: 4 hours
- Sidebar integration: 1 hour
- Verification & polish: 2 hours

**Total**: ~22 hours

---

## 15. Final Notes

**This is a PLAN document**. No code implementation is included.

**Policy Compliance**: All pages strictly follow `/dashforge/.opencode/policies/docs-architecture.policies.md`.

**Next Step**: Approve this plan, then implement pages sequentially.

**Approval Required Before**:

- Creating files
- Modifying DocsPage.tsx
- Updating sidebar configuration

---

**END OF PLAN**
