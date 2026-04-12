# Dashforge Release 0.1.1-alpha Recovery Plan

**Date:** 2026-04-12  
**Current Version:** 0.1.0-alpha  
**Target Version:** 0.1.1-alpha  
**Status:** Recovery & Enhancement

---

## Executive Summary

This document provides a comprehensive recovery plan for Dashforge after analyzing the 0.1.0-alpha release. Key findings:

- **BLOCKER:** Type definition files point to non-existent `./src/` paths in dist
- **WARNING:** Missing peerDependency on `@dashforge/forms` in `@dashforge/ui`
- **WARNING:** Component architecture requires `name` prop universally (blocks standalone usage)
- **OPPORTUNITY:** Clear path to dual-mode (standalone + form-connected) architecture

**Decision:** 0.1.1-alpha will focus on **packaging fixes only**. Input dual-mode is deferred to 0.2.0-alpha.

---

## 1. Package Audit Results

### 1.1 Package Manifest Summary

| Package               | main                   | module                 | types                    | Actual Types Path          | Status     |
| --------------------- | ---------------------- | ---------------------- | ------------------------ | -------------------------- | ---------- |
| @dashforge/tokens     | ✅ ./dist/index.js     | ✅ ./dist/index.js     | ⚠️ ./dist/index.d.ts     | Points to ./dist/src/index | ⚠️ BLOCKER |
| @dashforge/theme-core | ✅ ./dist/index.js     | ✅ ./dist/index.js     | ⚠️ ./dist/index.d.ts     | Points to ./dist/src/index | ⚠️ BLOCKER |
| @dashforge/theme-mui  | ✅ ./dist/index.esm.js | ✅ ./dist/index.esm.js | ⚠️ ./dist/index.esm.d.ts | Points to ./dist/src/index | ⚠️ BLOCKER |
| @dashforge/forms      | ✅ ./dist/index.esm.js | ✅ ./dist/index.esm.js | ⚠️ ./dist/index.esm.d.ts | Points to ./dist/src/index | ⚠️ BLOCKER |
| @dashforge/ui-core    | ✅ ./dist/index.esm.js | ✅ ./dist/index.esm.js | ⚠️ ./dist/index.esm.d.ts | Points to ./dist/src/index | ⚠️ BLOCKER |
| @dashforge/ui         | ✅ ./dist/index.esm.js | ✅ ./dist/index.esm.js | ⚠️ ./dist/index.esm.d.ts | Points to ./dist/src/index | ⚠️ BLOCKER |
| @dashforge/rbac       | ✅ ./dist/index.esm.js | ✅ ./dist/index.esm.js | ⚠️ ./dist/index.esm.d.ts | Points to ./dist/src/index | ⚠️ BLOCKER |

**Finding:** All packages using rollup/vite emit `index.d.ts` with `export * from "./src/index"`, which resolves correctly **within the dist folder** but creates confusing module resolution. Type files ARE present in dist but indirectly referenced.

### 1.2 Packaging Issues (Detailed)

| Package              | Problem                                                                      | Type  | Severity | Fix Required                                |
| -------------------- | ---------------------------------------------------------------------------- | ----- | -------- | ------------------------------------------- |
| @dashforge/theme-mui | Types point to `./dist/src/index` via re-export                              | types | BLOCKER  | Fix type bundling or emit proper index.d.ts |
| @dashforge/forms     | Types point to `./dist/src/index` via re-export                              | types | BLOCKER  | Fix type bundling or emit proper index.d.ts |
| @dashforge/ui-core   | Types point to `./dist/src/index` via re-export                              | types | BLOCKER  | Fix type bundling or emit proper index.d.ts |
| @dashforge/ui        | Types point to `./dist/src/index` via re-export                              | types | BLOCKER  | Fix type bundling or emit proper index.d.ts |
| @dashforge/rbac      | Types point to `./dist/src/index` via re-export                              | types | BLOCKER  | Fix type bundling or emit proper index.d.ts |
| @dashforge/ui        | Missing `@dashforge/forms` in peerDependencies                               | peer  | WARNING  | Add `@dashforge/forms` as peerDependency    |
| @dashforge/ui        | Imports from `@dashforge/forms` (Select, Autocomplete use `useFieldRuntime`) | peer  | WARNING  | Declare dependency explicitly               |

**Root Cause:**

The bundler configuration (rollup/vite) is emitting:

```typescript
// dist/index.d.ts
export * from './src/index';
```

This works **if** the dist folder contains a `/src/` subdirectory with type definitions, which it does. However:

1. **Confusing module resolution:** Types aren't at the declared path (`./dist/index.d.ts` content)
2. **Fragile:** Requires dist structure to match src structure exactly
3. **Workaround-prone:** Users may need symlinks or path mapping

**Fix Strategy:**

Option A: Use `rollup-plugin-dts` to bundle types into single file  
Option B: Configure TypeScript to emit flat structure in dist  
Option C: Use API Extractor to create proper index.d.ts

**Recommendation:** Option A (rollup-plugin-dts) - most reliable for monorepo publishing.

---

## 2. PeerDependencies Audit

### 2.1 Missing Dependencies

**@dashforge/ui package.json:**

```json
{
  "peerDependencies": {
    "@dashforge/rbac": "^0.1.0-alpha",
    "@dashforge/ui-core": "^0.1.0-alpha",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "@mui/material": "^7.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

**Missing:** `@dashforge/forms` (used by Select and Autocomplete via `useFieldRuntime`)

### 2.2 Import Analysis

Components importing from `@dashforge/forms`:

- `libs/dashforge/ui/src/components/Select/Select.tsx` → `useFieldRuntime`
- `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx` → `useFieldRuntime`

**Impact:** Installing `@dashforge/ui` alone will cause runtime errors when using Select/Autocomplete in form-connected mode.

**Fix:** Add `@dashforge/forms` to `@dashforge/ui` peerDependencies.

---

## 3. Input Component Architecture Audit

### 3.1 Component Inventory

| Component      | Requires `name`? | Standalone? | Depends on @dashforge/forms? | Behavior Without Form Context |
| -------------- | ---------------- | ----------- | ---------------------------- | ----------------------------- |
| TextField      | ✅ Yes           | ❌ No       | ❌ No (uses bridge only)     | Throws/errors without context |
| Textarea       | ✅ Yes           | ❌ No       | ❌ No (uses bridge only)     | Throws/errors without context |
| NumberField    | ✅ Yes           | ❌ No       | ❌ No (uses bridge only)     | Throws/errors without context |
| Select         | ✅ Yes           | ❌ No       | ⚠️ Yes (`useFieldRuntime`)   | Throws/errors without context |
| Checkbox       | ✅ Yes           | ❌ No       | ❌ No (uses bridge only)     | Throws/errors without context |
| RadioGroup     | ✅ Yes           | ❌ No       | ❌ No (uses bridge only)     | Throws/errors without context |
| Switch         | ✅ Yes           | ❌ No       | ❌ No (uses bridge only)     | Throws/errors without context |
| DateTimePicker | ✅ Yes           | ❌ No       | ❌ No (uses bridge only)     | Throws/errors without context |
| Autocomplete   | ✅ Yes           | ❌ No       | ⚠️ Yes (`useFieldRuntime`)   | Throws/errors without context |

**Primitive (separate):**
| Component | Requires `name`? | Standalone? | Form-Aware? |
|-----------|------------------|-------------|-------------|
| TextField (primitive) | ❌ No | ✅ Yes | ❌ No |

**Key Findings:**

1. **All components require `name` prop** (typed as `Omit<MuiProps, 'name'> & { name: string }`)
2. **None support standalone usage** (all access `DashFormContext` unconditionally)
3. **Form integration works via bridge pattern** (@dashforge/ui-core), not react-hook-form directly
4. **2 components import from @dashforge/forms:** Select, Autocomplete (for runtime loading)

### 3.2 Current Component Contract

**Example: Checkbox.tsx**

```typescript
export interface CheckboxProps extends Omit<MuiCheckboxProps, 'name'> {
  name: string; // ❌ Always required
  label?: React.ReactNode;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  helperText?: string;
  error?: boolean;
  access?: AccessRequirement;
}
```

**Behavior:**

- `name` is mandatory
- Component calls `bridge.register(name, rules)` unconditionally
- If no `DashFormContext` exists → `bridge` is `null` → component fails

**Standalone Example (current - FAILS):**

```tsx
<Checkbox label="Accept terms" />  // ❌ Type error: missing `name`
<Checkbox name="terms" label="Accept terms" />  // ❌ Runtime error: no DashFormContext
```

---

## 4. Dual-Mode API Strategy

### 4.1 Objective

Support **two usage modes** for all input components:

1. **Standalone mode:** Component works outside DashForm, no `name` required
2. **Form-connected mode:** Component integrates with DashForm via bridge

### 4.2 API Contract Specification

#### 4.2.1 When `name` is Required

| Mode           | `name` Required? | Behavior                                            |
| -------------- | ---------------- | --------------------------------------------------- |
| Standalone     | ❌ No            | Component behaves as pure MUI wrapper               |
| Form-connected | ✅ Yes           | Component registers with bridge, binds value/errors |

#### 4.2.2 Standalone Props (Minimal)

Components in standalone mode should accept:

```typescript
// Standalone contract (no name, no form integration)
interface CheckboxStandaloneProps {
  label?: React.ReactNode;
  value?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  // ... all other MUI props
}
```

**No form-specific props allowed in standalone mode:**

- ❌ `rules`
- ❌ `visibleWhen`
- ❌ `access` (RBAC only in form context)

#### 4.2.3 Form-Connected Props

Components in form-connected mode require:

```typescript
// Form-connected contract (name required)
interface CheckboxFormProps {
  name: string; // ✅ Required
  label?: React.ReactNode;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  error?: boolean; // Explicit override
  helperText?: string; // Explicit override
  disabled?: boolean;
  access?: AccessRequirement;
  // ... all other MUI props
}
```

**Form-specific props active:**

- ✅ `rules` → passed to `bridge.register()`
- ✅ `visibleWhen` → reactive visibility via engine
- ✅ `access` → RBAC integration

#### 4.2.4 Behavior Without Form Provider

**Current:** Component fails (bridge is null)  
**Target:** Component renders in standalone mode

```typescript
// Without DashForm
<Checkbox label="Accept terms" onChange={...} />  // ✅ Works

// With DashForm
<DashForm ...>
  <Checkbox name="terms" label="Accept terms" />  // ✅ Works
</DashForm>
```

### 4.3 Type-Safe Implementation Pattern

**Proposed TypeScript signature:**

```typescript
// Discriminated union based on name prop
export type CheckboxProps =
  | CheckboxStandaloneProps // name is optional/absent
  | CheckboxFormProps; // name is required

// Runtime behavior
function Checkbox(props: CheckboxProps) {
  const bridge = useContext(DashFormContext);

  if ('name' in props && props.name) {
    // Form-connected mode
    return renderFormMode(props, bridge);
  } else {
    // Standalone mode
    return renderStandaloneMode(props);
  }
}
```

**Key Requirements:**

1. `name` prop presence determines mode (discriminated union)
2. TypeScript enforces mode-specific props at compile time
3. Runtime checks which mode is active
4. No breaking changes to existing form-connected usage

### 4.4 Migration Strategy

**Phase 1 (0.1.1-alpha):**

- ❌ NO component refactor
- ✅ Fix packaging only
- ✅ Document current limitations

**Phase 2 (0.2.0-alpha):**

- ✅ Refactor 3 pilot components (TextField, Select, Checkbox)
- ✅ Validate dual-mode pattern
- ✅ Update tests

**Phase 3 (0.3.0-alpha):**

- ✅ Refactor remaining components
- ✅ Comprehensive dual-mode testing
- ✅ Update documentation

---

## 5. Pilot Components

### 5.1 Selection Criteria

**Chosen Components:**

1. **TextField** - Most commonly used, simple value contract
2. **Checkbox** - Boolean value, minimal complexity
3. **Select** - Medium complexity, runtime integration (⚠️ depends on @dashforge/forms)

**Why These Three:**

| Component | Reason                                                                             | Complexity | Risk   |
| --------- | ---------------------------------------------------------------------------------- | ---------- | ------ |
| TextField | Most used, simple string value, no runtime deps                                    | Low        | Low    |
| Checkbox  | Simple boolean, minimal props, good test case                                      | Low        | Low    |
| Select    | Runtime loading, dependencies on @dashforge/forms, representative of complex cases | Medium     | Medium |

**Not Chosen (Defer to Phase 3):**

- Autocomplete (high complexity, freeSolo mode, runtime loading)
- DateTimePicker (value transformation logic)
- RadioGroup (multiple options, complex structure)
- NumberField (value parsing/formatting)
- Textarea (similar to TextField, deferred for coverage)
- Switch (similar to Checkbox, deferred for coverage)

### 5.2 Pilot Success Criteria

Each pilot component must:

1. ✅ Support standalone mode (no `name` required)
2. ✅ Support form-connected mode (`name` required)
3. ✅ Pass all existing unit tests
4. ✅ Pass new dual-mode tests
5. ✅ Zero TypeScript errors
6. ✅ No breaking changes to form-connected API

---

## 6. Release 0.1.1-alpha Scope

### 6.1 What's Included

**Packaging Fixes (BLOCKER):**

1. ✅ Fix type definitions for all packages (rollup-plugin-dts)
2. ✅ Add `@dashforge/forms` to `@dashforge/ui` peerDependencies
3. ✅ Verify all package.json exports match actual dist structure
4. ✅ Run full build + pack validation

**Documentation:**

5. ✅ Update README with known limitations (name always required)
6. ✅ Add migration guide placeholder for 0.2.0-alpha

**Testing:**

7. ✅ Verify local pack + install in external app
8. ✅ Validate typecheck passes in consumer app

### 6.2 What's NOT Included

**Deferred to 0.2.0-alpha:**

- ❌ Input component dual-mode refactor
- ❌ Standalone mode support
- ❌ Optional `name` prop
- ❌ Discriminated union types

**Reasoning:**

- Packaging is a blocker for adoption
- Dual-mode is an enhancement, not a blocker
- Safer to release incrementally
- Allows for community feedback on packaging before API changes

### 6.3 Version Bump Justification

**0.1.0-alpha → 0.1.1-alpha:**

- Patch-level increment (third digit)
- Fixes packaging bugs
- No breaking changes
- No new features
- Aligns with semantic versioning (alpha allows flexibility)

---

## 7. Validation Plan

### 7.1 Pre-Release Checklist

**Monorepo Level:**

- [ ] `npx nx run-many -t build` → All packages build successfully
- [ ] `npx nx run-many -t typecheck` → Zero TypeScript errors
- [ ] `npx nx run-many -t test` → All tests pass

**Package Level (for each package):**

- [ ] `npm pack` → Generates tarball
- [ ] Extract tarball, verify `dist/` contains proper type files
- [ ] Verify `package.json` main/module/types point to actual files

**External Validation:**

- [ ] Create clean external app (`npm create vite@latest`)
- [ ] Install from local pack: `npm install /path/to/dashforge-*.tgz`
- [ ] Import from each package
- [ ] Run `pnpm install` → No missing peer warnings
- [ ] Run `pnpm run dev` → App starts
- [ ] Run `pnpm run build` → Production build succeeds

**Component Testing (in external app):**

- [ ] TextField in DashForm → Works
- [ ] Checkbox in DashForm → Works
- [ ] Select with runtime loading → Works
- [ ] No workarounds required (symlinks, path mapping, etc.)

### 7.2 Validation Script

```bash
#!/bin/bash
# validate-release.sh

set -e

echo "=== Step 1: Monorepo Build ==="
npx nx run-many -t build

echo "=== Step 2: Monorepo Tests ==="
npx nx run-many -t test

echo "=== Step 3: Package Tarballs ==="
for pkg in tokens theme-core theme-mui forms ui-core ui rbac; do
  echo "Packing @dashforge/$pkg..."
  (cd libs/dashforge/$pkg && npm pack)
done

echo "=== Step 4: External App Test ==="
cd /tmp
npm create vite@latest dashforge-test -- --template react-ts
cd dashforge-test

# Install tarballs
for pkg in tokens theme-core theme-mui forms ui-core ui rbac; do
  npm install /path/to/dashforge/libs/dashforge/$pkg/*.tgz
done

# Install peer deps
npm install @mui/material@^7.0.0 @emotion/react@^11.0.0 @emotion/styled@^11.0.0 react-hook-form@^7.0.0

# Test imports
cat > src/test-imports.ts << 'EOF'
import '@dashforge/tokens';
import '@dashforge/theme-core';
import '@dashforge/theme-mui';
import '@dashforge/forms';
import '@dashforge/ui-core';
import '@dashforge/ui';
import '@dashforge/rbac';
EOF

npm run build

echo "=== Validation Complete ==="
```

### 7.3 Success Criteria

**All of the following must pass:**

1. ✅ Monorepo builds with zero errors
2. ✅ All tests pass
3. ✅ External app installs without peer warnings
4. ✅ External app imports all packages
5. ✅ External app dev mode starts
6. ✅ External app production build succeeds
7. ✅ No TypeScript errors in external app
8. ✅ No runtime errors when using form-connected components

---

## 8. Risk Assessment

### 8.1 High Risk

| Risk                                        | Impact  | Mitigation                                      |
| ------------------------------------------- | ------- | ----------------------------------------------- |
| Type bundling breaks existing imports       | BLOCKER | Test with local pack before publish             |
| Peer dependency change breaks consumer apps | HIGH    | Document in CHANGELOG, use peerDependenciesMeta |

### 8.2 Medium Risk

| Risk                              | Impact | Mitigation                         |
| --------------------------------- | ------ | ---------------------------------- |
| Rollup config changes break build | MEDIUM | Incremental testing, rollback plan |
| External validation fails         | MEDIUM | Fix before publish, iterate        |

### 8.3 Low Risk

| Risk                        | Impact | Mitigation              |
| --------------------------- | ------ | ----------------------- |
| Documentation gaps          | LOW    | Update after validation |
| Version numbering confusion | LOW    | Clear CHANGELOG entry   |

---

## 9. Post-Release (0.1.1-alpha)

### 9.1 Immediate Actions

1. ✅ Publish to npm
2. ✅ Tag git release: `v0.1.1-alpha`
3. ✅ Update CHANGELOG.md
4. ✅ Announce limitations (name always required)

### 9.2 Community Communication

**Message Template:**

> Dashforge 0.1.1-alpha is now available!
>
> **Fixed:**
>
> - Type definitions now resolve correctly in consuming apps
> - Added missing peerDependency on @dashforge/forms
>
> **Known Limitations:**
>
> - All input components require `name` prop (even outside DashForm)
> - Standalone mode coming in 0.2.0-alpha
>
> Install: `npm install @dashforge/ui@0.1.1-alpha`

### 9.3 Next Steps (0.2.0-alpha Planning)

**Priority:**

1. Implement dual-mode for pilot components (TextField, Checkbox, Select)
2. Write comprehensive dual-mode tests
3. Update Bridge Boundary Policy to support optional registration
4. Document dual-mode pattern for remaining components

**Timeline Estimate:**

- 0.1.1-alpha release: Week 1
- Pilot refactor: Week 2-3
- Testing + validation: Week 4
- 0.2.0-alpha release: Week 5

---

## 10. Decision Log

| Date       | Decision                                                | Rationale                                      |
| ---------- | ------------------------------------------------------- | ---------------------------------------------- |
| 2026-04-12 | Use rollup-plugin-dts for type bundling                 | Most reliable for flat type structure          |
| 2026-04-12 | Add @dashforge/forms to @dashforge/ui peers             | Select/Autocomplete depend on it               |
| 2026-04-12 | Defer dual-mode to 0.2.0-alpha                          | Packaging is blocker, dual-mode is enhancement |
| 2026-04-12 | Select 3 pilot components (TextField, Checkbox, Select) | Coverage of simple/medium complexity           |
| 2026-04-12 | Version 0.1.1-alpha (patch)                             | Packaging fix only, no features                |

---

## Appendix A: Build Configuration Changes Required

### A.1 Rollup Config (libs/dashforge/\*/vite.config.ts)

**Add rollup-plugin-dts:**

```typescript
import dts from 'rollup-plugin-dts';

export default defineConfig({
  plugins: [
    // ... existing plugins
  ],
  build: {
    rollupOptions: {
      plugins: [
        dts({
          insertTypesEntry: true, // Creates proper index.d.ts
        }),
      ],
    },
  },
});
```

**Verify output:**

```
dist/
  index.esm.js       ✅ Bundled JS
  index.esm.d.ts     ✅ Single bundled .d.ts (no ./src/ reference)
```

### A.2 Package.json Updates

**@dashforge/ui:**

```json
{
  "peerDependencies": {
    "@dashforge/forms": "^0.1.0-alpha", // ← ADD THIS
    "@dashforge/rbac": "^0.1.0-alpha",
    "@dashforge/ui-core": "^0.1.0-alpha",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "@mui/material": "^7.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

---

## Appendix B: Type Definition Example

**Current (BROKEN):**

```
dist/
  index.esm.d.ts     → export * from "./src/index";
  src/
    index.d.ts       → actual types
```

**Consumer sees:** `./dist/index.esm.d.ts` → references `./src/index` (confusing path resolution)

**Target (FIXED):**

```
dist/
  index.esm.d.ts     → Bundled complete type definitions (no re-export)
```

**Consumer sees:** `./dist/index.esm.d.ts` → all types inline, no path resolution needed

---

## Appendix C: Component Dependency Graph

```
@dashforge/ui
├── depends on @dashforge/ui-core (bridge contract)
├── depends on @dashforge/rbac (access control)
├── depends on @dashforge/forms (Select, Autocomplete only)
│   └── uses useFieldRuntime hook
└── depends on @mui/material (UI primitives)
```

**Key Insight:** `@dashforge/forms` is only needed for **runtime-loading components** (Select, Autocomplete). Other components use bridge contract from `@dashforge/ui-core` only.

**Future Optimization (0.3.0+):**

Consider splitting runtime-loading into separate package:

- `@dashforge/ui` → Core components (no forms dependency)
- `@dashforge/ui-runtime` → Runtime-loading components (Select, Autocomplete)

---

## Summary

**0.1.1-alpha Focus:** Fix packaging blockers.  
**0.2.0-alpha Focus:** Implement dual-mode for pilot components.  
**0.3.0-alpha Focus:** Complete dual-mode for all components.

**Critical Path:** Packaging → Pilot → Complete

This plan balances urgency (packaging fixes) with quality (incremental dual-mode rollout).
