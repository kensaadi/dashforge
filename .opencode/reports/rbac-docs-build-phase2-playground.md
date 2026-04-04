# RBAC Docs Build - Phase 2: Playground

**Date**: 2026-04-04  
**Status**: ✅ COMPLETE  
**Phase**: 2 of 6

---

## Objective

Build the interactive **Playground** page for the Access Control (RBAC) documentation, where users can switch between roles (admin, editor, viewer, guest) and see real-time RBAC behavior with live TextField and Button components.

---

## Deliverables

### 1. AccessControlPlayground.tsx

**Location**: `web/src/pages/Docs/access-control/playground/AccessControlPlayground.tsx`

**File Size**: 787 lines

**Structure**:

- Hero section with orange theme
- LOCAL playground section (Stack with id="playground", spacing 3.5)
- Real RbacProvider wrapping demo area
- Role selector (RadioGroup with 4 roles: admin, editor, viewer, guest)
- Subject that updates via useMemo when role changes
- 3 TextField demos:
  - Hidden field (`onUnauthorized: 'hide'`) - requires 'manage booking'
  - Disabled field (`onUnauthorized: 'disable'`) - requires 'edit booking'
  - Readonly field (`onUnauthorized: 'readonly'`) - requires 'edit booking'
- 1 Button/action demo (access-controlled) - requires 'manage booking'
- Current configuration display (shows selected role and permissions)
- DocsSection for "How It Works" explanation
- DocsCodeBlock with full implementation example

**Key Technical Decisions**:

1. **Button Access Control**:

   - MUI Button does NOT support the `access` prop
   - Created a wrapper component `DeleteBookingButton` that uses `useCan` hook
   - Pattern: `const canManage = useCan({ action: 'manage', resource: 'booking' });`
   - Conditionally renders button based on permission check

2. **RBAC Policy**:

   ```typescript
   const playgroundPolicy: RbacPolicy = {
     roles: [
       {
         name: 'admin',
         permissions: [{ action: '*', resource: '*', effect: 'allow' }],
       },
       {
         name: 'editor',
         permissions: [
           { action: 'edit', resource: 'booking', effect: 'allow' },
           { action: 'read', resource: 'booking', effect: 'allow' },
         ],
       },
       {
         name: 'viewer',
         permissions: [
           { action: 'read', resource: 'booking', effect: 'allow' },
         ],
       },
       {
         name: 'guest',
         permissions: [],
       },
     ],
   };
   ```

3. **Subject Management**:

   - Uses `useMemo` to recreate subject when role changes
   - Subject: `{ id: 'playground-user', roles: [selectedRole] }`
   - Ensures RBAC re-evaluates all permissions on role change

4. **Visual Feedback**:
   - Each demo box shows warning messages when access is denied
   - Current configuration panel displays role and permissions
   - Orange-themed callout boxes for tips

**Adherence to Policies**:

- ✅ NO abstraction layers (per docs-architecture.policies.md)
- ✅ NO config-driven docs
- ✅ Explicit JSX composition only
- ✅ Playground section is LOCAL (Stack with id, not DocsSection)
- ✅ Uses shared primitives: DocsHeroSection, DocsSection, DocsDivider, DocsCalloutBox, DocsCodeBlock
- ✅ Orange theme maintained throughout

---

### 2. DocsPage.tsx Integration

**Changes**:

1. **Import Added** (line 45):

   ```typescript
   import { AccessControlPlayground } from './access-control/playground/AccessControlPlayground';
   ```

2. **TOC Items Added** (lines 328-331):

   ```typescript
   const accessControlPlaygroundTocItems: DocsTocItem[] = [
     { id: 'playground', label: 'Interactive Playground' },
     { id: 'how-it-works', label: 'How It Works' },
   ];
   ```

3. **Route Check Added** (lines 387-388):

   ```typescript
   const isAccessControlPlayground =
     location.pathname === '/docs/access-control/playground';
   ```

4. **TOC Selection Wired** (lines 443-444):

   ```typescript
   : isAccessControlPlayground
   ? accessControlPlaygroundTocItems
   ```

5. **Component Rendering Wired** (lines 501-502):
   ```typescript
   ) : isAccessControlPlayground ? (
     <AccessControlPlayground />
   ```

**Result**: Playground page now fully integrated into docs navigation and routing system.

---

### 3. DocsSidebar.model.ts Update

**Changes**:

Added Playground link in Access Control group (lines 186-189):

```typescript
{
  title: 'Access Control',
  items: [
    {
      label: 'Overview',
      path: '/docs/access-control/overview',
    },
    {
      label: 'Quick Start',
      path: '/docs/access-control/quick-start',
    },
    {
      label: 'Playground',
      path: '/docs/access-control/playground',
    },
  ],
},
```

**Result**: Playground link now appears in sidebar navigation under Access Control.

---

## Demo Behaviors Implemented

### Role: Admin

- ✅ All fields enabled and editable
- ✅ Hidden field (Booking Status) - VISIBLE
- ✅ Disabled field (Customer Email) - ENABLED
- ✅ Readonly field (Employee Salary) - EDITABLE
- ✅ Delete Booking button - VISIBLE

### Role: Editor

- ✅ Hidden field (Booking Status) - HIDDEN (no manage permission)
- ✅ Disabled field (Customer Email) - ENABLED (has edit permission)
- ✅ Readonly field (Employee Salary) - EDITABLE (has edit permission)
- ✅ Delete Booking button - HIDDEN (no manage permission)

### Role: Viewer

- ✅ Hidden field (Booking Status) - HIDDEN
- ✅ Disabled field (Customer Email) - DISABLED (no edit permission)
- ✅ Readonly field (Employee Salary) - READONLY (no edit permission)
- ✅ Delete Booking button - HIDDEN

### Role: Guest

- ✅ Hidden field (Booking Status) - HIDDEN
- ✅ Disabled field (Customer Email) - DISABLED
- ✅ Readonly field (Employee Salary) - READONLY
- ✅ Delete Booking button - HIDDEN

---

## Verification Results

### TypeScript Compilation

```bash
npx tsc --noEmit --project web/tsconfig.json
```

**Result**: ✅ PASS - No errors

### Files Modified

1. ✅ `web/src/pages/Docs/access-control/playground/AccessControlPlayground.tsx` (CREATED)
2. ✅ `web/src/pages/Docs/DocsPage.tsx` (MODIFIED - 5 changes)
3. ✅ `web/src/pages/Docs/components/DocsSidebar.model.ts` (MODIFIED - 1 change)

### Route Access

- ✅ `/docs/access-control/playground` route active
- ✅ Sidebar link navigates correctly
- ✅ TOC items (2) render correctly

---

## Issues Encountered & Resolutions

### Issue 1: Button access prop not supported

**Problem**: MUI Button doesn't have an `access` prop like Dashforge TextField.

**Root Cause**: Only Dashforge UI components support the `access` prop integration. MUI components don't have this feature.

**Resolution**: Created wrapper component `DeleteBookingButton` that:

1. Imports `useCan` hook from `@dashforge/rbac`
2. Checks permission: `const canManage = useCan({ action: 'manage', resource: 'booking' })`
3. Conditionally renders button based on check result
4. Returns `null` if permission denied (hide behavior)

**Code**:

```typescript
function DeleteBookingButton() {
  const canManage = useCan({ action: 'manage', resource: 'booking' });

  if (!canManage) {
    return null;
  }

  return (
    <Button variant="contained" color="error">
      Delete Booking
    </Button>
  );
}
```

This pattern demonstrates how to use RBAC hooks for components that don't have built-in access control.

### Issue 2: LSP false errors for @dashforge/rbac import

**Problem**: LSP reported "Cannot find module '@dashforge/rbac'".

**Root Cause**: LSP out of sync with build system.

**Resolution**: Ran `npx tsc --noEmit` which passed cleanly. LSP errors were false positives. TypeScript compiler correctly resolved the import path.

**Verification**: No errors in production TypeScript compilation.

---

## V1 Scope - What Was NOT Implemented

As per the task instructions, the following were explicitly excluded from V1:

- ❌ Policy editor
- ❌ JSON editor
- ❌ Custom role builder
- ❌ Resource simulation
- ❌ Code generation panel

These features may be considered for future versions but are outside the scope of Phase 2.

---

## Next Steps (Phase 3+)

The following pages remain in the 6-page plan:

4. **Core Concepts** (Phase 3)

   - Deep dive into RBAC architecture
   - Policy structure
   - Permission evaluation
   - Subject management

5. **React Integration** (Phase 4)

   - RbacProvider setup
   - useCan hook
   - useRbac hook
   - Can component
   - Best practices

6. **Dashforge Integration** (Phase 5)
   - TextField access prop
   - Access-aware components
   - Form integration
   - Navigation integration
   - Action filtering

---

## References

- Task specification: `/dashforge/.opencode/reports/rbac-docs-plan.md`
- Architecture policy: `/dashforge/.opencode/policies/docs-architecture.policies.md`
- Phase 1 report: `/dashforge/.opencode/reports/rbac-docs-build-phase1.md`
- RBAC exports: `libs/dashforge/rbac/src/index.ts`
- Component location: `web/src/pages/Docs/access-control/playground/`

---

## Final Status

**Phase 2: COMPLETE ✅**

All deliverables met:

- ✅ Playground page created (787 lines)
- ✅ Hero section with orange theme
- ✅ Interactive role selector (4 roles)
- ✅ Real RBAC provider with live subject
- ✅ 3 TextField demos (hide, disable, readonly)
- ✅ 1 Button demo (using useCan hook)
- ✅ Configuration display
- ✅ "How It Works" explanation section
- ✅ Full code example
- ✅ DocsPage integration (import, route, TOC, rendering)
- ✅ Sidebar link added
- ✅ TypeScript compilation passes

**Ready for**:

- User testing
- Phase 3 planning (Core Concepts page)
