# @dashforge/ui-core

Production-grade predictive reactive engine for dynamic form systems.

## Overview

`@dashforge/ui-core` is a TypeScript-first reactive state management engine designed for complex, dynamic form systems with rule-based logic. It provides a declarative way to define relationships between form fields, automatic dependency tracking, and seamless React integration.

### Key Features

- **🎯 Predictive Reactivity**: Rules automatically evaluate when dependencies change
- **📊 Explicit Dependencies**: No magic - dependencies must be declared explicitly
- **⚡ Incremental Evaluation**: O(k) updates for changed nodes, not O(n) full re-evaluation
- **🔒 Type Safety**: Zero `any` types in public API, all generics default to `unknown`
- **⚛️ React Integration**: Optimized hooks with node-level subscriptions
- **🎨 CSS Animations**: Pure CSS transitions with max-height strategy
- **📝 Form Integration**: React Hook Form support out of the box
- **🧪 Strict Mode**: TypeScript strict mode with `exactOptionalPropertyTypes: true`

### Architecture Highlights

Three mandatory patches applied for optimal performance and type safety:

- ✅ **PATCH A**: `registerNode()` is O(1) - does NOT trigger evaluation
- ✅ **PATCH B**: All generics default to `unknown` (NOT `any`)
- ✅ **PATCH C**: `getState()` returns Valtio proxy (not snapshot)

## Installation

```bash
npm install @dashforge/ui-core valtio
```

**Peer Dependencies**:

- `valtio@^2.0.0` - Required
- `react@^18.0.0` - Required for React hooks
- `react-hook-form@^7.0.0` - Optional, for RHF integration

## Quick Start

### 1. Create an Engine

```typescript
import { createEngine } from '@dashforge/ui-core';

const engine = createEngine({
  debug: true, // Optional: Enable debug logging
});
```

### 2. Register Nodes

Nodes represent individual pieces of state (e.g., form fields).

```typescript
// Register a simple node
engine.registerNode({
  id: 'email',
  value: '',
  label: 'Email Address',
  visible: true,
  disabled: false,
});

// Register nodes with initial state
engine.registerNode({
  id: 'password',
  value: '',
  label: 'Password',
  visible: false, // Initially hidden
});

engine.registerNode({
  id: 'confirmPassword',
  value: '',
  label: 'Confirm Password',
  visible: false,
});
```

### 3. Add Rules

Rules define reactive relationships between nodes.

```typescript
// Show password field when email is valid
engine.addRule({
  id: 'show-password-when-email-valid',
  dependencies: ['email'], // Explicit dependencies
  effect: (nodes) => {
    const email = nodes.email?.value as string;
    const isValidEmail = email?.includes('@');

    return {
      password: {
        visible: isValidEmail,
      },
    };
  },
});

// Show confirm password when password is entered
engine.addRule({
  id: 'show-confirm-when-password-entered',
  dependencies: ['password'],
  effect: (nodes) => {
    const password = nodes.password?.value as string;
    const hasPassword = password?.length > 0;

    return {
      confirmPassword: {
        visible: hasPassword,
      },
    };
  },
});

// Validate password match
engine.addRule({
  id: 'validate-password-match',
  dependencies: ['password', 'confirmPassword'],
  effect: (nodes) => {
    const password = nodes.password?.value as string;
    const confirm = nodes.confirmPassword?.value as string;

    if (confirm && password !== confirm) {
      return {
        confirmPassword: {
          error: 'Passwords do not match',
        },
      };
    }

    return {
      confirmPassword: {
        error: undefined,
      },
    };
  },
});
```

### 4. Update Nodes

Update node values to trigger reactive evaluations.

```typescript
// Update triggers incremental evaluation (O(k), not O(n))
engine.updateNode('email', { value: 'user@example.com' });
// → 'password' becomes visible automatically

engine.updateNode('password', { value: 'secret123' });
// → 'confirmPassword' becomes visible automatically

engine.updateNode('confirmPassword', { value: 'secret456' });
// → 'confirmPassword' gets error: "Passwords do not match"
```

### 5. React Integration

```typescript
import {
  EngineProvider,
  useEngineValue,
  useEngineField,
} from '@dashforge/ui-core';

function App() {
  return (
    <EngineProvider engine={engine}>
      <SignupForm />
    </EngineProvider>
  );
}

function SignupForm() {
  const emailField = useEngineField('email');
  const passwordField = useEngineField('password');
  const confirmField = useEngineField('confirmPassword');

  return (
    <form>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={emailField.value || ''}
          onChange={(e) => emailField.onChange(e.target.value)}
          disabled={emailField.disabled}
        />
      </div>

      {passwordField.visible && (
        <div>
          <label>Password</label>
          <input
            type="password"
            value={passwordField.value || ''}
            onChange={(e) => passwordField.onChange(e.target.value)}
            disabled={passwordField.disabled}
          />
        </div>
      )}

      {confirmField.visible && (
        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmField.value || ''}
            onChange={(e) => confirmField.onChange(e.target.value)}
            disabled={confirmField.disabled}
          />
          {confirmField.error && (
            <span className="error">{confirmField.error}</span>
          )}
        </div>
      )}
    </form>
  );
}
```

## Core Concepts

### Nodes

Nodes are the fundamental units of state in the engine. Each node represents a single piece of data (typically a form field).

```typescript
interface Node<TValue = unknown> {
  id: string; // Unique identifier
  value: TValue; // The node's value
  label?: string; // Human-readable label
  description?: string; // Additional description
  visible?: boolean; // UI visibility (default: true)
  disabled?: boolean; // Read-only state (default: false)
  error?: string; // Error message
  tags?: string[]; // Categorization tags
  metadata?: Record<string, unknown>; // Custom data
}
```

### Rules

Rules define reactive relationships between nodes. When dependencies change, rules automatically re-evaluate.

```typescript
interface Rule<TValue = unknown> {
  id: string; // Unique identifier
  dependencies: string[]; // Node IDs this rule depends on
  effect: RuleEffect<TValue>; // Function that returns updates
  priority?: number; // Execution order (default: 0)
  description?: string; // Human-readable description
}

type RuleEffect<TValue = unknown> = (
  nodes: Record<string, Node | undefined>
) => Record<string, Partial<Node<TValue>>>;
```

**Key Points**:

- Dependencies are **explicit** - must be declared upfront
- Effect functions are **pure** - no side effects
- Rules execute in **priority order** (higher = earlier)
- Returns **partial updates** for affected nodes

### Engine

The engine manages nodes, rules, and reactive evaluation.

```typescript
const engine = createEngine({
  debug?: boolean;              // Enable debug logging
  maxEvaluationDepth?: number;  // Loop protection (default: 10)
});
```

**Core Methods**:

```typescript
// Node management
engine.registerNode(node: Node): void
engine.unregisterNode(nodeId: string): void
engine.updateNode(nodeId: string, updates: Partial<Node>): void
engine.getNode(nodeId: string): Node | undefined
engine.getAllNodes(): Node[]

// Rule management
engine.addRule(rule: Rule): void
engine.removeRule(ruleId: string): void
engine.getRule(ruleId: string): Rule | undefined
engine.getAllRules(): Rule[]

// State access
engine.getState(): Store  // Returns Valtio proxy
```

## React Integration

### Provider Setup

Wrap your app with `EngineProvider`:

```typescript
import { EngineProvider } from '@dashforge/ui-core';

<EngineProvider engine={engine}>
  <App />
</EngineProvider>;
```

### Hook: `useEngineNode()`

Subscribe to a specific node's state.

```typescript
import { useEngineNode } from '@dashforge/ui-core';

function MyComponent() {
  const node = useEngineNode('email');

  if (!node) return null;

  return <div>{node.value}</div>;
}
```

**Performance**: Uses node-level subscription - only re-renders when this specific node changes.

### Hook: `useEngineValue()`

Extract just the value from a node.

```typescript
import { useEngineValue } from '@dashforge/ui-core';

function EmailDisplay() {
  const email = useEngineValue<string>('email');
  return <div>{email}</div>;
}
```

**Variants**:

- `useEngineValueWithDefault(nodeId, defaultValue)` - With fallback
- `useEngineValues(['id1', 'id2', ...])` - Multiple values at once

### Hook: `useEngineField()`

Get complete field state for forms.

```typescript
import { useEngineField } from '@dashforge/ui-core';

function EmailInput() {
  const field = useEngineField<string>('email');

  return (
    <div>
      <input
        type="email"
        value={field.value || ''}
        onChange={(e) => field.onChange(e.target.value)}
        disabled={field.disabled}
      />
      {field.error && <span>{field.error}</span>}
    </div>
  );
}
```

**Returns**:

```typescript
interface EngineFieldResult<TValue> {
  value: TValue | undefined;
  onChange: (value: TValue) => void;
  disabled: boolean;
  visible: boolean;
  error?: string; // Only present if defined
}
```

**Variants**:

- `useEngineCheckbox(nodeId)` - For boolean checkboxes
- `useEngineSelect(nodeId, options)` - For select dropdowns

### Hook: `useEngineContext()`

Access the engine instance directly.

```typescript
import { useEngineContext } from '@dashforge/ui-core';

function DebugPanel() {
  const engine = useEngineContext();
  const nodes = engine.getAllNodes();

  return <pre>{JSON.stringify(nodes, null, 2)}</pre>;
}
```

## Animations

Pure CSS animations for `node.visible` property.

### Setup

Import the CSS file:

```typescript
import '@dashforge/ui-core/animations/animations.css';
```

### Usage

```typescript
import { AnimatedNode } from '@dashforge/ui-core';

<AnimatedNode nodeId="section-1" speed="fast" maxHeight={500}>
  <div>Content that animates based on node.visible</div>
</AnimatedNode>;
```

**Props**:

- `nodeId: string` - Node to watch for visibility
- `speed?: 'instant' | 'fast' | 'normal' | 'slow'` - Animation speed (default: 'normal')
- `maxHeight?: number` - Max height in pixels (default: 1000)
- `unmountWhenHidden?: boolean` - Remove from DOM when hidden (default: false)

**Speed Presets**:

- `instant` - No transition
- `fast` - 200ms
- `normal` - 300ms (default)
- `slow` - 500ms

**Accessibility**: Automatically respects `prefers-reduced-motion`.

### Factory Pattern

Create pre-configured animated components:

```typescript
import { createAnimatedNode } from '@dashforge/ui-core';

const AnimatedSection = createAnimatedNode('section-1', {
  speed: 'fast',
  maxHeight: 800,
});

<AnimatedSection>
  <div>Content</div>
</AnimatedSection>;
```

## React Hook Form Integration

Utilities for syncing engine state with React Hook Form.

### Field Configuration

```typescript
import { createRHFFieldConfig, createRHFSyncOptions } from '@dashforge/ui-core';

const fieldConfig = createRHFFieldConfig({
  name: 'email', // RHF field name
  nodeId: 'user-email', // Engine node ID
  syncValue: true, // Sync value (default: true)
  syncError: true, // Sync error (default: true)
  syncDisabled: true, // Sync disabled state (default: true)
});

const syncOptions = createRHFSyncOptions({
  fields: [fieldConfig],
  direction: 'bidirectional', // 'rhf-to-engine' | 'engine-to-rhf' | 'bidirectional'
  debounceMs: 100, // Debounce engine → RHF sync
});
```

### Batch Configuration

```typescript
import { createRHFFieldConfigs } from '@dashforge/ui-core';

const configs = createRHFFieldConfigs([
  { name: 'email', nodeId: 'user-email' },
  { name: 'password', nodeId: 'user-password' },
  { name: 'confirmPassword', nodeId: 'user-confirm' },
]);
```

### Type Guards

```typescript
import {
  shouldSyncValue,
  shouldSyncError,
  shouldSyncDisabled,
} from '@dashforge/ui-core';

if (shouldSyncValue(fieldConfig)) {
  // Sync the value
}
```

## TypeScript Usage

### Generic Type Parameters

All generics default to `unknown` for type safety:

```typescript
// Node with specific value type
const node: Node<string> = {
  id: 'email',
  value: 'user@example.com',
};

// Rule with typed effect
const rule: Rule<string> = {
  id: 'email-rule',
  dependencies: ['email'],
  effect: (nodes) => {
    const email = nodes.email?.value as string;
    return {};
  },
};

// Typed hooks
const email = useEngineValue<string>('email');
const field = useEngineField<number>('age');
```

### Type Guards

```typescript
import { isNode, isRule } from '@dashforge/ui-core';

if (isNode(value)) {
  // TypeScript knows value is Node
  console.log(value.id);
}

if (isRule(value)) {
  // TypeScript knows value is Rule
  console.log(value.dependencies);
}
```

### Strict Mode Compatibility

Works with all TypeScript strict flags:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

## Architecture

### Dependency Tracking

**Mandatory Component**: DependencyTracker is not optional.

- **O(1) lookups**: Uses `Map<string, Set<string>>` for instant dependent rule queries
- **Explicit dependencies**: Auto-detection throws an error - dependencies must be declared
- **Cycle detection**: Validates dependency graph structure

```typescript
import { DependencyTracker } from '@dashforge/ui-core';

const tracker = new DependencyTracker();
tracker.registerRule('rule-1', ['node-a', 'node-b']);

const dependents = tracker.getDependentRules('node-a');
// → ['rule-1']
```

### Rule Evaluation

Two evaluation modes:

1. **Full Evaluation** - O(n)

   - Evaluates all rules in priority order
   - Used when: adding rules, manual trigger

2. **Incremental Evaluation** - O(k)
   - Only evaluates rules that depend on changed nodes
   - Used when: updating nodes, unregistering nodes

**Loop Protection**: Max evaluation depth (default: 10) prevents infinite loops.

```typescript
import { RuleEvaluator } from '@dashforge/ui-core';

const evaluator = new RuleEvaluator({
  maxDepth: 10,
  debug: false,
});
```

### State Management

Powered by Valtio for reactive state:

- **Proxy-based**: Direct mutations with automatic tracking
- **Snapshot isolation**: React hooks use snapshots for stability
- **Node-level subscriptions**: Components only re-render when specific nodes change

```typescript
const store = engine.getState(); // Returns Valtio proxy
store.nodes['email'].value = 'new@example.com'; // Direct mutation
```

### Performance Characteristics

| Operation             | Complexity | Notes                   |
| --------------------- | ---------- | ----------------------- |
| `registerNode()`      | O(1)       | No evaluation (PATCH A) |
| `unregisterNode()`    | O(k)       | Incremental evaluation  |
| `updateNode()`        | O(k)       | Incremental evaluation  |
| `addRule()`           | O(n)       | Full evaluation         |
| `removeRule()`        | O(1)       | No evaluation           |
| `getDependentRules()` | O(1)       | Map lookup              |

Where:

- `n` = total number of rules
- `k` = number of rules affected by change

## API Reference

### Types

```typescript
// Node types
export type { Node, NodeMetadata, NodeUpdate };
export { isNode };

// Rule types
export type { Rule, RuleEffect, UpdateFunction };
export { isRule };

// Engine types
export type { Engine, EngineConfig, EngineState };
```

### Store

```typescript
export type { Store, StoreConfig, StoreMetadata };
export { createStore, resetStore };
export {
  getEvaluationDepth,
  incrementEvaluationDepth,
  decrementEvaluationDepth,
  resetEvaluationDepth,
};
```

### Core

```typescript
export { DependencyTracker, RuleEvaluator };
export type {
  DependencyGraph,
  DependencyTrackerConfig,
  RuleEvaluatorConfig,
  EvaluationStats,
};
```

### Engine

```typescript
export { createEngine };
```

### React

```typescript
// Provider
export { EngineProvider, useEngineContext };
export type { EngineProviderProps };

// Hooks
export { useEngineNode, useRequiredEngineNode };
export { useEngineValue, useEngineValueWithDefault, useEngineValues };
export { useEngineField, useEngineCheckbox, useEngineSelect };
export type { EngineFieldResult };
```

### Animations

```typescript
export { AnimatedNode, createAnimatedNode };
export type { AnimatedNodeProps, AnimationSpeed };
```

### Integrations

```typescript
export { createRHFFieldConfig, createRHFFieldConfigs, createRHFSyncOptions };
export { shouldSyncValue, shouldSyncError, shouldSyncDisabled };
export { createMockRHFResult, defaultRHFErrorMapper };
export type {
  RHFFieldConfig,
  RHFSyncOptions,
  UseEngineRHFResult,
  RHFMappedNode,
};
export type { FieldValues, Path, PathValue, FieldError };
```

### Metadata

```typescript
export const VERSION: string;
export const PACKAGE_INFO: { name; version; description; repository; license };
export const FEATURES: {
  strictTypes;
  explicitDependencies;
  nodeSubscriptions;
  cssAnimations;
  rhfIntegration;
};
```

## Best Practices

### 1. Keep Rules Pure

Rules should be pure functions with no side effects:

```typescript
// ✅ Good
effect: (nodes) => {
  const email = nodes.email?.value;
  return {
    field: { visible: !!email },
  };
};

// ❌ Bad
effect: (nodes) => {
  console.log('Evaluating rule'); // Side effect
  fetch('/api/validate'); // Side effect
  return { field: { visible: true } };
};
```

### 2. Declare All Dependencies

Be explicit about what each rule depends on:

```typescript
// ✅ Good
{
  id: 'rule-1',
  dependencies: ['email', 'password'],  // Explicit
  effect: (nodes) => {
    const email = nodes.email?.value;
    const password = nodes.password?.value;
    // ...
  },
}

// ❌ Bad - dependencies array missing or incomplete
{
  id: 'rule-1',
  dependencies: [],  // Empty - will throw error
  effect: (nodes) => { /* ... */ },
}
```

### 3. Use Priority for Rule Ordering

Control execution order with priority:

```typescript
// Higher priority = executes first
engine.addRule({
  id: 'validation-rule',
  priority: 10, // Runs first
  dependencies: ['email'],
  effect: (nodes) => {
    /* ... */
  },
});

engine.addRule({
  id: 'visibility-rule',
  priority: 5, // Runs second
  dependencies: ['email'],
  effect: (nodes) => {
    /* ... */
  },
});
```

### 4. Optimize React Subscriptions

Use the most specific hook for your needs:

```typescript
// ✅ Good - only subscribes to specific node
const email = useEngineValue('email');

// ❌ Bad - subscribes to entire engine state
const engine = useEngineContext();
const email = engine.getNode('email')?.value;
```

### 5. Type Your Node Values

Use TypeScript generics for type safety:

```typescript
// ✅ Good
engine.registerNode<string>({
  id: 'email',
  value: 'user@example.com',
});

const email = useEngineValue<string>('email');
// TypeScript knows email is string | undefined

// ✅ Also good - complex types
interface Address {
  street: string;
  city: string;
}

engine.registerNode<Address>({
  id: 'address',
  value: { street: '123 Main St', city: 'NYC' },
});
```

## Contributing

This package is part of the Dashforge monorepo. See the main repository for contribution guidelines.

## License

MIT License - see LICENSE file for details

---

**Built with**:

- TypeScript (strict mode)
- Valtio (reactive state)
- React (UI integration)
- CSS (animations)

**Mandatory Patches Applied**:

- ✅ PATCH A: O(1) node registration
- ✅ PATCH B: Zero `any` types
- ✅ PATCH C: Correct proxy documentation
