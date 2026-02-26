Task

Implement Dashforge LeftNav v1 from scratch (collapsed + click flyout, router-agnostic, theme-driven).

Context

We want a framework-level Left Navigation component for Dashforge, inspired by the SaaSable AdminLayout concept, but fully app-agnostic:

No router imports

No auth/roles

No i18n

No global stores

Consumer injects routing via callbacks
Collapsed mode must include click-based Popper flyout for collapsible items.

Scope

Application name: libs/dashforge/ui
Folder: libs/dashforge/ui/src/components/LeftNav/
Files to create:

types.ts

LeftNav.tsx

LeftNav.styled.ts

index.ts

LeftNav.test.tsx

(Optional but recommended next): libs/dashforge/ui/src/components/TopBar/ (not in this task unless time allows)

Goal

Deliver LeftNav with:

Desktop: permanent drawer with animated width (expanded/collapsed)

Mobile (< breakpoint): temporary drawer overlay

Collapsed mode: icon-only + click-to-open Popper flyout for collapse items

Expanded mode: inline collapses using MUI Collapse

Active pill background style (selected state)

Size variants: sm | md | lg

Slots: header, footer

Controlled and uncontrolled state support for open and expandedIds

Accessibility baseline: Enter/Space actions, Esc closes flyout, aria attributes

Rules

Do NOT import any router library (react-router, next/link, next/navigation, etc.)

Do NOT import any auth/i18n/state management libs

Use MUI components + existing Dashforge utilities only

Public types and JSDoc must be in English

Do NOT modify package.json fields version/name/publishConfig

API (Must Implement)
Data model (types.ts)

LeftNavItemType = 'group' | 'collapse' | 'item'

LeftNavSize = 'sm' | 'md' | 'lg'

LeftNavItem with:

id: string

type: LeftNavItemType

label: string (already translated)

key: string (routing key, framework does not navigate)

icon?: ReactNode

disabled?: boolean

badge?: { content: string | number; color?; variant? }

children?: LeftNavItem[]

dividerBefore?: boolean

Router agnostic callbacks

renderLink(item, children): ReactNode (required)

isActive(item): boolean (required)

onItemClick?(item, event)

State

Controlled/uncontrolled open:

open?, defaultOpen?, onOpenChange?(open)

Controlled/uncontrolled expanded ids:

expandedIds?, defaultExpandedIds?, onExpandedIdsChange?(ids)

Responsive + behavior

breakpoint?: 'sm'|'md'|'lg'|'xl' (default 'lg')

mobileVariant?: 'temporary'|'disabled' (default 'temporary')

closeOnNavigateMobile?: boolean (default true)

Style

size?: 'sm'|'md'|'lg' (default 'md')

widthExpanded?: number (default 254)

widthCollapsed?: number (default 77)

sx?, className?

header?, footer?

Interaction spec

Collapsed mode:

click on collapse opens a Popper flyout anchored to the row

click-away closes flyout

Esc closes flyout

opening another collapse closes previous flyout

Expanded mode:

click on collapse toggles inline Collapse

Leaf click:

calls onItemClick if provided

navigation handled by consumer via renderLink

on mobile, if closeOnNavigateMobile=true, close the drawer

Theming

Use theme.vars.palette.\* for colors

Use theme.transitions.\* for animations

Do NOT introduce theme.layout.\*

Support MUI component theming via component name (e.g. DashforgeLeftNav) if the repo pattern exists; otherwise keep props + sx.

Tests (LeftNav.test.tsx)

At minimum:

Applies active pill style when isActive(item) is true

Toggles open state in uncontrolled mode and triggers onOpenChange

Respects controlled open (does not change internally)

Expanded mode toggles collapse inline

Collapsed mode opens Popper flyout on click and closes on click-away / Esc

On mobile variant, clicking leaf closes drawer when closeOnNavigateMobile=true (simulate with breakpoint override or mock media query)

Output

All files implemented + tests passing + typecheck clean.
