# NPM Final Pre-Publish Audit

**Date:** 2026-04-12  
**Task:** Final comprehensive audit of Dashforge v0.1.0-alpha before npm publish  
**Repository:** https://github.com/kensaadi/dashforge

---

## Executive Summary

**VERDICT: ⚠️ NOT READY**

The audit identified **2 CRITICAL BLOCKERS** and **2 IMPORTANT ISSUES** that must be resolved before publishing to npm:

### Critical Blockers (Must Fix)

1. **ESM Import Failures** - @dashforge/tokens and @dashforge/theme-core cannot be imported in ESM environments
2. **Missing License Field** - All 7 packages missing required `license` field in package.json

### Important Issues (Recommended Fix)

3. **Build Info Files** - TypeScript .tsbuildinfo files unnecessarily included in published packages
4. **Dependency Classification** - @dashforge/theme-mui has peer dependencies listed as regular dependencies

---

## Packages Audited

All 7 Dashforge publishable packages:

1. ✅ @dashforge/tokens (v0.1.0-alpha) - **BLOCKED by ESM imports + license**
2. ✅ @dashforge/theme-core (v0.1.0-alpha) - **BLOCKED by ESM imports + license**
3. ✅ @dashforge/theme-mui (v0.1.0-alpha) - **BLOCKED by license, dependency issue**
4. ✅ @dashforge/forms (v0.1.0-alpha) - **BLOCKED by license**
5. ✅ @dashforge/ui-core (v0.1.0-alpha) - **BLOCKED by license**
6. ✅ @dashforge/ui (v0.1.0-alpha) - **BLOCKED by license**
7. ✅ @dashforge/rbac (v0.1.0-alpha) - **BLOCKED by license**

---

## 1. Build & Typecheck Results

### Build Status

**Command:** `npx nx run-many --target=build --projects=@dashforge/*`

**Result:** ✅ **ALL BUILDS SUCCESSFUL**

```
✅ @dashforge/tokens (tsc) - No errors
✅ @dashforge/theme-core (tsc) - No errors
✅ @dashforge/theme-mui (rollup) - No errors
✅ @dashforge/forms (rollup) - No errors
✅ @dashforge/ui-core (rollup) - No errors
✅ @dashforge/ui (rollup) - 1 expected warning (unresolved peer deps)
✅ @dashforge/rbac (rollup) - No errors
```

**Build Times:**

- tokens: ~500ms (tsc)
- theme-core: ~500ms (tsc)
- theme-mui: 1.3s (rollup)
- forms: 1.2s (rollup)
- ui-core: 924ms (rollup)
- ui: 3.3s (rollup)
- rbac: 688ms (rollup)

**Build Outputs:**

- All packages generated correct dist/ directories
- Declaration files (.d.ts) present for all packages
- Declaration maps (.d.ts.map) generated where expected
- No sourcemap warnings (fixed in previous task)

**Note on @dashforge/ui warning:**

```
(!) Unresolved dependencies
@dashforge/forms (imported by "src/components/Select/Select.tsx" and "src/components/Autocomplete/Autocomplete.tsx")
@dashforge/theme-core (imported by "src/components/TextField/TextField.tsx")
```

This is **EXPECTED** - these are peerDependencies and should remain external.

### Typecheck Status

**Command:** `npx nx run-many --target=typecheck --projects=@dashforge/*`

**Result:** ✅ **ALL TYPECHECKS PASSED**

```
✅ @dashforge/tokens - 0 errors
✅ @dashforge/theme-core - 0 errors
✅ @dashforge/theme-mui - 0 errors
✅ @dashforge/forms - 0 errors
✅ @dashforge/ui-core - 0 errors
✅ @dashforge/ui - 0 errors
✅ @dashforge/rbac - 0 errors
```

**Conclusion:** All packages build and typecheck cleanly with no errors.

---

## 2. Tarball Sanity Check

### Package Sizes

| Package               | Unpacked Size | Packed Size | File Count |
| --------------------- | ------------- | ----------- | ---------- |
| @dashforge/tokens     | 46.7 kB       | 12.5 kB     | 18         |
| @dashforge/theme-core | 48.1 kB       | 13.2 kB     | 21         |
| @dashforge/theme-mui  | 1.3 MB        | 208.9 kB    | 267        |
| @dashforge/forms      | 415.4 kB      | 86.7 kB     | 86         |
| @dashforge/ui-core    | 176.8 kB      | 37.3 kB     | 82         |
| @dashforge/ui         | 906.3 kB      | 185.3 kB    | 174        |
| @dashforge/rbac       | 89.3 kB       | 20.5 kB     | 55         |

### Files Included

**All packages correctly include:**

- ✅ dist/ directory with built artifacts
- ✅ README.md
- ✅ package.json
- ✅ .d.ts type definitions
- ✅ .d.ts.map declaration maps (where applicable)
- ✅ .js/.esm.js JavaScript bundles

**Packages correctly exclude:**

- ✅ No .env files
- ✅ No credential files
- ✅ No .git directory
- ✅ No node_modules
- ✅ No .spec._ or .test._ test files (mostly)

### ⚠️ Issue Found: Build Info Files

**Severity:** IMPORTANT (not blocking, but recommended fix)

Several packages include TypeScript build info files that shouldn't be published:

| Package    | File                          | Size     |
| ---------- | ----------------------------- | -------- |
| tokens     | dist/tsconfig.lib.tsbuildinfo | 36.7 kB  |
| theme-core | dist/tsconfig.lib.tsbuildinfo | 38.2 kB  |
| theme-mui  | dist/tsconfig.lib.tsbuildinfo | 273.1 kB |
| forms      | dist/tsconfig.lib.tsbuildinfo | 54.2 kB  |
| ui         | dist/tsconfig.lib.tsbuildinfo | 320.9 kB |

**Impact:**

- Increases package size unnecessarily
- No security risk (doesn't expose secrets)
- TypeScript incremental compilation metadata (not needed by consumers)

**Recommendation:**
Add `.tsbuildinfo` to `.npmignore` or exclude from dist/ in build process.

### No Sensitive Files Found

✅ No sensitive files detected in any package tarball

---

## 3. Dependency & Peer Dependency Validation

### @dashforge/tokens

**Dependencies:**

- ✅ `tslib: ^2.3.0` - Appropriate helper library

**Analysis:** ✅ Clean, minimal dependencies

---

### @dashforge/theme-core

**Dependencies:**

- ✅ `@dashforge/tokens: ^0.1.0-alpha` - Correct version
- ✅ `tslib: ^2.3.0` - TypeScript helpers
- ✅ `valtio: ^2.3.0` - State management

**Analysis:** ✅ All dependencies appropriate and correctly versioned

---

### @dashforge/theme-mui

**Dependencies:**

- ✅ `@dashforge/tokens: ^0.1.0-alpha` - Correct
- ✅ `@dashforge/theme-core: ^0.1.0-alpha` - Correct
- ⚠️ `@emotion/react: ^11.14.0` - **SHOULD BE PEER**
- ⚠️ `@emotion/styled: ^11.14.1` - **SHOULD BE PEER**
- ⚠️ `@mui/material: ^7.3.8` - **SHOULD BE PEER**

**Issue:** Emotion and MUI packages should be peerDependencies, not regular dependencies.

**Impact:**

- Forces specific versions on consumers
- Can cause duplicate package installations
- Conflicts with consumer's MUI/Emotion versions

**Severity:** IMPORTANT - Not blocking but strongly recommended to fix

**Recommendation:**

```json
{
  "peerDependencies": {
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "@mui/material": "^7.0.0"
  }
}
```

---

### @dashforge/forms

**Dependencies:**

- ✅ `react-hook-form: ^7.71.1` - Core dependency (correct)

**Peer Dependencies:**

- ✅ `react: ^18.0.0 || ^19.0.0` - Correct
- ✅ `@dashforge/ui-core: ^0.1.0-alpha` - Correct version

**Analysis:** ✅ Properly structured dependencies

---

### @dashforge/ui-core

**Dependencies:**

- ✅ `valtio: 2.3.0` - State management (note: exact version, not ^)
- ✅ `tslib: ^2.0.0` - TypeScript helpers

**Peer Dependencies:**

- ✅ `react: ^18.0.0 || ^19.0.0` - Correct

**Analysis:** ✅ Clean structure. Note: valtio uses exact version (intentional?)

---

### @dashforge/ui

**Dependencies:**

- ✅ `motion: ^12.34.3` - Animation library

**Peer Dependencies:**

- ✅ `@dashforge/rbac: ^0.1.0-alpha` - Correct
- ✅ `@dashforge/ui-core: ^0.1.0-alpha` - Correct
- ✅ `@emotion/react: ^11.0.0` - Correct
- ✅ `@emotion/styled: ^11.0.0` - Correct
- ✅ `@mui/material: ^7.0.0` - Correct
- ✅ `react: ^18.0.0 || ^19.0.0` - Correct (supports both 18 and 19)
- ✅ `react-dom: ^18.0.0 || ^19.0.0` - Correct

**Analysis:** ✅ Excellent peer dependency structure. All framework dependencies properly declared as peers.

---

### @dashforge/rbac

**Dependencies:** _(none)_

**Peer Dependencies:**

- ✅ `react: ^18.0.0 || ^19.0.0` - Correct

**Analysis:** ✅ Perfect - minimal, clean dependencies

---

### Dependency Summary

| Package    | Regular Deps | Peer Deps | Internal Deps         | Status      |
| ---------- | ------------ | --------- | --------------------- | ----------- |
| tokens     | 1 (tslib)    | 0         | 0                     | ✅ OK       |
| theme-core | 3            | 0         | 1 (@dashforge/tokens) | ✅ OK       |
| theme-mui  | 5            | 0         | 2                     | ⚠️ Fix deps |
| forms      | 1            | 2         | 1 (peer)              | ✅ OK       |
| ui-core    | 2            | 1         | 0                     | ✅ OK       |
| ui         | 1            | 7         | 2 (peer)              | ✅ OK       |
| rbac       | 0            | 1         | 0                     | ✅ OK       |

---

## 4. Import Test Results (Consumer Simulation)

### Test Environment

- **Node.js:** v22.18.0
- **Package Manager:** npm
- **Module System:** ESM (type: "module")
- **Installation Method:** Local tarball install

### Test Results

#### ✅ @dashforge/rbac

**Status:** ✅ **SUCCESS**

```javascript
import * as rbac from '@dashforge/rbac';
// ✓ Imported successfully
```

**Exports Verified:**

```
Can, CircularRoleError, ConditionEvaluationError, InvalidPermissionError,
RbacEngine, RbacError, RbacProvider, createAccessGuard, createRbacEngine,
filterActions, filterNavigationItems, resolveAccessState, useCan, useRbac
```

**Conclusion:** Package imports correctly. All exports accessible.

---

#### ✅ @dashforge/ui-core

**Status:** ✅ **SUCCESS**

```javascript
import * as uiCore from '@dashforge/ui-core';
// ✓ Imported successfully
```

**Exports Verified:**

```
AnimatedNode, DashFormContext, DependencyTracker, EngineProvider,
FEATURES, PACKAGE_INFO, RuleEvaluator, VERSION, createAnimatedNode,
createEngine, createMockRHFResult, createRHFFieldConfig, ...
```

**Conclusion:** Package imports correctly. Rollup bundle works perfectly.

---

#### ❌ @dashforge/tokens

**Status:** 🚨 **CRITICAL FAILURE**

**Error:**

```
Directory import '/node_modules/@dashforge/tokens/dist/theme' is not supported
resolving ES modules imported from
/node_modules/@dashforge/tokens/dist/index.js
```

**Root Cause:**

In `dist/index.js`:

```javascript
export * from './theme'; // ❌ Fails in ESM
```

Should be:

```javascript
export * from './theme/index.js'; // ✅ Correct ESM syntax
```

**Why This Happens:**

- TypeScript compiler outputs `export * from './theme'` (without file extension)
- This works in CommonJS (directory imports are supported)
- This **FAILS** in ESM (requires explicit file paths with extensions)
- Node.js ESM loader cannot resolve directory imports

**Impact:** 🚨 **CRITICAL BLOCKER**

- Package **cannot be imported** in ESM projects
- Package **cannot be used** with modern bundlers (Vite, etc.)
- Package **cannot be used** in Node.js ESM mode
- Essentially **unusable** in production

**Affected Files:**

```
dist/index.js           → imports './theme' (fails)
dist/theme/index.js     → target file exists but can't be resolved
```

**TypeScript Config Issue:**

The problem is in `tsconfig.lib.json`:

- Missing `"moduleResolution": "bundler"` or `"node16"`
- TypeScript not emitting proper ESM imports with `.js` extensions

**Required Fix:**

Option 1 - Update tsconfig.lib.json:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false
  }
}
```

Option 2 - Switch to Rollup bundler (like other packages):

- Bundle into single file
- Avoids directory imports entirely

---

#### ❌ @dashforge/theme-core

**Status:** 🚨 **CRITICAL FAILURE**

**Error:**

```
Cannot find module '/node_modules/@dashforge/theme-core/dist/hooks/useDashTheme'
imported from /node_modules/@dashforge/theme-core/dist/index.js
```

**Root Cause:**

Same issue as @dashforge/tokens. In `dist/index.js`:

```javascript
export * from './hooks/useDashTheme'; // ❌ Missing .js extension
export * from './store'; // ❌ Missing .js extension
```

Should be:

```javascript
export * from './hooks/useDashTheme.js'; // ✅
export * from './store/index.js'; // ✅
```

**Impact:** 🚨 **CRITICAL BLOCKER**

- Package **cannot be imported** in ESM environments
- Breaks any downstream package (@dashforge/theme-mui depends on this)
- Must be fixed before publish

**Required Fix:** Same as @dashforge/tokens above.

---

### Import Test Summary

| Package    | Import Status                              | Severity | Blocker? |
| ---------- | ------------------------------------------ | -------- | -------- |
| tokens     | ❌ ESM failure                             | CRITICAL | 🚨 YES   |
| theme-core | ❌ ESM failure                             | CRITICAL | 🚨 YES   |
| theme-mui  | ⚠️ Not tested (depends on broken packages) | N/A      | N/A      |
| forms      | ⚠️ Not tested                              | N/A      | N/A      |
| ui-core    | ✅ Success                                 | -        | NO       |
| ui         | ⚠️ Not tested                              | N/A      | N/A      |
| rbac       | ✅ Success                                 | -        | NO       |

**Conclusion:** 2 packages have CRITICAL import failures that block publish.

---

## 5. Metadata Validation

### Required Fields Check

All packages validated against npm requirements:

| Field         | tokens | theme-core | theme-mui | forms | ui-core | ui  | rbac |
| ------------- | ------ | ---------- | --------- | ----- | ------- | --- | ---- |
| name          | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| version       | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| description   | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| **license**   | ❌     | ❌         | ❌        | ❌    | ❌      | ❌  | ❌   |
| repository    | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| homepage      | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| bugs          | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| keywords      | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| type          | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| exports       | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |
| publishConfig | ✅     | ✅         | ✅        | ✅    | ✅      | ✅  | ✅   |

### 🚨 Critical Issue: Missing License Field

**Status:** 🚨 **CRITICAL BLOCKER**

**Problem:**

- ALL 7 packages missing `"license"` field in package.json
- Root repository has LICENSE file (MIT), but not referenced in packages
- npm strongly recommends license field
- Many organizations require license information before using packages

**Current State:**

```json
{
  "name": "@dashforge/tokens",
  "version": "0.1.0-alpha"
  // ... other fields ...
  // ❌ NO LICENSE FIELD
}
```

**Required Fix:**
Add to all package.json files:

```json
{
  "license": "MIT"
}
```

**Recommendation:**
Also copy LICENSE file to each package directory for clarity:

```
libs/dashforge/tokens/LICENSE
libs/dashforge/theme-core/LICENSE
...etc
```

**Impact:**

- npm will show "No license" warning
- Reduces trust and adoption
- Legal ambiguity for commercial users
- Blocks enterprise adoption

**Severity:** CRITICAL - Must fix before publish

---

### Repository Metadata

All packages have correct GitHub repository metadata (fixed in previous task):

**Repository URL:** ✅ `git+https://github.com/kensaadi/dashforge.git`

**Package-specific URLs:**

| Package    | Directory                 | Homepage                                | Status |
| ---------- | ------------------------- | --------------------------------------- | ------ |
| tokens     | libs/dashforge/tokens     | .../tree/main/libs/dashforge/tokens     | ✅     |
| theme-core | libs/dashforge/theme-core | .../tree/main/libs/dashforge/theme-core | ✅     |
| theme-mui  | libs/dashforge/theme-mui  | .../tree/main/libs/dashforge/theme-mui  | ✅     |
| forms      | libs/dashforge/forms      | .../tree/main/libs/dashforge/forms      | ✅     |
| ui-core    | libs/dashforge/ui-core    | .../tree/main/libs/dashforge/ui-core    | ✅     |
| ui         | libs/dashforge/ui         | .../tree/main/libs/dashforge/ui         | ✅     |
| rbac       | libs/dashforge/rbac       | .../tree/main/libs/dashforge/rbac       | ✅     |

**Bugs URL:** ✅ `https://github.com/kensaadi/dashforge/issues` (all packages)

---

### Exports Configuration

All packages have proper `exports` field for ESM:

**Example (tokens):**

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

**Special Export (@dashforge/ui-core):**

```json
{
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.esm.d.ts",
      "import": "./dist/index.esm.js",
      "default": "./dist/index.esm.js"
    },
    "./animations.css": "./dist/animations/animations.css" // ✅ CSS export
  }
}
```

**Validation:** ✅ All exports configurations are correct and follow ESM best practices.

---

### PublishConfig

All packages have correct publishConfig:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

✅ Required for scoped packages (@dashforge/\*) to be public on npm.

---

## 6. Version Alignment & Publish Order

### Version Consistency

**All packages:** `0.1.0-alpha` ✅

```
@dashforge/tokens:      0.1.0-alpha ✅
@dashforge/theme-core:  0.1.0-alpha ✅
@dashforge/theme-mui:   0.1.0-alpha ✅
@dashforge/forms:       0.1.0-alpha ✅
@dashforge/ui-core:     0.1.0-alpha ✅
@dashforge/ui:          0.1.0-alpha ✅
@dashforge/rbac:        0.1.0-alpha ✅
```

**Internal Dependency Versions:**

All internal dependencies correctly reference `^0.1.0-alpha`:

- theme-core → tokens: `^0.1.0-alpha` ✅
- theme-mui → tokens: `^0.1.0-alpha` ✅
- theme-mui → theme-core: `^0.1.0-alpha` ✅
- forms → ui-core (peer): `^0.1.0-alpha` ✅
- ui → ui-core (peer): `^0.1.0-alpha` ✅
- ui → rbac (peer): `^0.1.0-alpha` ✅

**Conclusion:** ✅ All versions properly aligned

---

### Recommended Publish Order

Based on dependency graph analysis:

#### Level 1: Foundation (No Internal Dependencies)

**Publish First:**

1. ✅ `@dashforge/tokens` - No dependencies
2. ✅ `@dashforge/rbac` - No internal dependencies (peer: react only)

**Wait for:** npm registry propagation (~5 minutes)

---

#### Level 2: Core Packages

**Publish Second:** 3. ✅ `@dashforge/theme-core` - Depends on: tokens (Level 1) 4. ✅ `@dashforge/ui-core` - No internal dependencies (peer: react only)

**Wait for:** npm registry propagation (~5 minutes)

---

#### Level 3: Integration Packages

**Publish Third:** 5. ✅ `@dashforge/theme-mui` - Depends on: tokens, theme-core (Levels 1-2) 6. ✅ `@dashforge/forms` - Peer depends on: ui-core (Level 2)

**Wait for:** npm registry propagation (~5 minutes)

---

#### Level 4: Top-Level Packages

**Publish Last:** 7. ✅ `@dashforge/ui` - Peer depends on: ui-core, rbac (Levels 1-2)

---

### Dependency Graph Visualization

```
Level 1:  [tokens] ────┐
                       ├──→ [theme-core] (Level 2)
                       └──→ [theme-mui] (Level 3)

Level 1:  [rbac] ──────────→ [ui] (Level 4) [peer]

Level 2:  [ui-core] ───┬──→ [forms] (Level 3) [peer]
                       └──→ [ui] (Level 4) [peer]
```

**Publish Sequence:**

```
1. tokens, rbac (parallel)
   ↓ wait ~5 min
2. theme-core, ui-core (parallel)
   ↓ wait ~5 min
3. theme-mui, forms (parallel)
   ↓ wait ~5 min
4. ui
```

**Total Estimated Time:** ~20-25 minutes (including registry propagation waits)

---

### Publish Commands

```bash
# Level 1
cd libs/dashforge/tokens && npm publish
cd libs/dashforge/rbac && npm publish

# Wait 5 minutes for npm registry propagation

# Level 2
cd libs/dashforge/theme-core && npm publish
cd libs/dashforge/ui-core && npm publish

# Wait 5 minutes

# Level 3
cd libs/dashforge/theme-mui && npm publish
cd libs/dashforge/forms && npm publish

# Wait 5 minutes

# Level 4
cd libs/dashforge/ui && npm publish
```

**Note:** Before executing, ALL BLOCKERS must be resolved.

---

## Critical Issues Summary

### 🚨 Blocker #1: ESM Import Failures

**Affected Packages:**

- @dashforge/tokens
- @dashforge/theme-core

**Problem:**
TypeScript compiler not emitting proper ESM imports with file extensions. Directory imports fail in Node.js ESM mode.

**Fix Required:**

**Option A - Fix TypeScript Config (Recommended):**

Update `tsconfig.lib.json` for both packages:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  }
}
```

Then rebuild and verify:

```bash
npm pack --dry-run
# Extract and test: node -e "import('@dashforge/tokens')"
```

**Option B - Switch to Rollup (Like Other Packages):**

Migrate from `tsc` to Rollup bundler:

- Creates single-file bundle
- Avoids directory import issues
- Matches other packages (consistency)

**Estimated Fix Time:** 30-60 minutes per package

**Must Fix:** YES - Package unusable otherwise

---

### 🚨 Blocker #2: Missing License Field

**Affected Packages:** ALL (7 packages)

**Problem:**
No `"license"` field in package.json files.

**Fix Required:**

Add to each package.json:

```json
{
  "license": "MIT"
}
```

**Optional but Recommended:**
Copy LICENSE file to each package:

```bash
cp LICENSE libs/dashforge/tokens/
cp LICENSE libs/dashforge/theme-core/
# ... etc for all packages
```

**Estimated Fix Time:** 5-10 minutes

**Must Fix:** YES - Legal/trust issue

---

### ⚠️ Important Issue #1: Build Info Files

**Affected Packages:**

- tokens, theme-core, theme-mui, forms, ui

**Problem:**
`.tsbuildinfo` files included in npm packages (unnecessary bloat).

**Impact:**

- Adds 36-320 KB per package
- No functional impact
- Professional polish issue

**Fix Required:**

Add `.npmignore`:

```
*.tsbuildinfo
```

Or update `files` in package.json to explicitly exclude:

```json
{
  "files": [
    "dist/**/*.js",
    "dist/**/*.d.ts",
    "dist/**/*.d.ts.map",
    "dist/**/*.css",
    "!dist/**/*.tsbuildinfo",
    "README.md"
  ]
}
```

**Estimated Fix Time:** 5 minutes

**Must Fix:** Recommended but not blocking

---

### ⚠️ Important Issue #2: Dependency Classification

**Affected Package:** @dashforge/theme-mui

**Problem:**
@emotion and @mui packages are regular dependencies, should be peer dependencies.

**Current:**

```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/material": "^7.3.8"
  }
}
```

**Should Be:**

```json
{
  "peerDependencies": {
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "@mui/material": "^7.0.0"
  }
}
```

**Impact:**

- Forces specific versions
- Can cause duplicate installations
- Conflicts with consumer's MUI/Emotion

**Estimated Fix Time:** 5 minutes

**Must Fix:** Strongly recommended (not blocking, but important)

---

## Risk Assessment

### High Risk (Blocking)

1. ❌ **ESM Import Failures** - Users cannot use @dashforge/tokens or @dashforge/theme-core
2. ❌ **Missing License** - Legal ambiguity, enterprise adoption blocker

### Medium Risk (Important)

3. ⚠️ **Dependency Misclassification** - Can cause version conflicts for consumers
4. ⚠️ **Build Info Files** - Unprofessional package bloat

### Low Risk (Acceptable)

5. ℹ️ **Unresolved dependency warnings** - Expected behavior for peer dependencies

---

## Recommendations

### Before Publish (MUST FIX)

1. **Fix ESM imports in @dashforge/tokens and @dashforge/theme-core**

   - Update TypeScript config to emit proper ESM with extensions
   - OR migrate to Rollup bundler
   - Test with real imports in consumer project

2. **Add license field to all package.json files**
   - Use "MIT" (matches root LICENSE)
   - Optionally copy LICENSE to each package directory

### Before Publish (STRONGLY RECOMMENDED)

3. **Fix @dashforge/theme-mui dependency classification**

   - Move @emotion and @mui to peerDependencies
   - Test that package still works correctly

4. **Remove .tsbuildinfo files from packages**
   - Add .npmignore or update files field
   - Reduces package size by 36-320 KB per package

### After First Publish (Nice to Have)

5. **Add CHANGELOG.md** to each package
6. **Add package-specific documentation**
7. **Set up automated publish workflow**
8. **Add npm badges to README files**

---

## Checklist for First Publish

- [ ] Fix ESM imports (@dashforge/tokens)
- [ ] Fix ESM imports (@dashforge/theme-core)
- [ ] Add "license": "MIT" to all 7 package.json files
- [ ] (Recommended) Fix @dashforge/theme-mui peer dependencies
- [ ] (Recommended) Remove .tsbuildinfo files from packages
- [ ] Rebuild all packages with clean cache
- [ ] Run full test suite
- [ ] Test imports in temporary consumer project
- [ ] Verify npm pack output for all packages
- [ ] Double-check version alignment (0.1.0-alpha)
- [ ] Follow publish order (tokens → theme-core → theme-mui → etc.)
- [ ] Wait 5 minutes between dependency levels for npm propagation
- [ ] Verify packages on npmjs.com after publish
- [ ] Test installation from npm registry
- [ ] Update repository README with installation instructions

---

## Overall Verdict

### ⚠️ OVERALL: NOT READY

**Reason:** 2 CRITICAL BLOCKERS must be resolved before publishing

**Blockers:**

1. 🚨 ESM import failures in @dashforge/tokens and @dashforge/theme-core
2. 🚨 Missing license field in all 7 packages

**Estimated Time to Ready:** 1-2 hours

**Confidence Level:** HIGH - All issues have clear solutions

**Once Fixed:**

- All builds pass ✅
- All typechecks pass ✅
- All metadata present ✅
- Dependency graph correct ✅
- Publish order documented ✅

**Next Steps:**

1. Fix the 2 critical blockers
2. (Recommended) Fix the 2 important issues
3. Re-run this audit to verify fixes
4. Proceed with publish following documented order

---

**Audit Completed:** 2026-04-12  
**Auditor:** OpenCode AI Agent  
**Status:** COMPREHENSIVE REVIEW COMPLETE  
**Action Required:** Fix blockers before proceeding to publish
