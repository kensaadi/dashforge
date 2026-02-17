/**
 * @dashforge/ui-core
 * Production-grade predictive reactive engine for dynamic form systems
 *
 * @module @dashforge/ui-core
 * @author Dashforge Team
 * @license MIT
 *
 * Architecture:
 * - Type System: Strict TypeScript with zero `any` types
 * - Store Layer: Valtio-powered reactive state
 * - Core Layer: DependencyTracker + RuleEvaluator
 * - Engine Layer: Complete reactive engine API
 * - React Layer: Hooks for component integration
 * - Animations: CSS-only transitions
 * - Integrations: React Hook Form support
 *
 * Three Mandatory Patches Applied:
 * ✅ PATCH A: registerNode() does NOT call evaluate() (O(1) registration)
 * ✅ PATCH B: All generics default to `unknown` (NOT `any`)
 * ✅ PATCH C: getState() JSDoc correctly states "returns proxy"
 */

// ============================================================================
// IMPORTS (for function implementations)
// ============================================================================

import { useEngineNode } from './react';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Node types
  NodeMetadata,
  Node,
  NodeUpdate,

  // Rule types
  Rule,
  RuleEffect,
  UpdateFunction,

  // Engine types
  Engine,
  EngineConfig,
  EngineState,
} from './types';

export { isNode, isRule } from './types';

// ============================================================================
// STORE
// ============================================================================

export type { Store, StoreConfig, StoreMetadata } from './store';

export {
  createStore,
  resetStore,
  getEvaluationDepth,
  incrementEvaluationDepth,
  decrementEvaluationDepth,
  resetEvaluationDepth,
} from './store';

// ============================================================================
// CORE
// ============================================================================

export type {
  DependencyGraph,
  DependencyTrackerConfig,
  RuleEvaluatorConfig,
  EvaluationStats,
} from './core';

export { DependencyTracker, RuleEvaluator } from './core';

// ============================================================================
// ENGINE
// ============================================================================

export { createEngine } from './engine';

// ============================================================================
// REACT
// ============================================================================

export {
  // Provider
  EngineProvider,
  useEngineContext,

  // Node hooks
  useEngineNode,
  useRequiredEngineNode,

  // Value hooks
  useEngineValue,
  useEngineValueWithDefault,
  useEngineValues,

  // Form field hooks
  useEngineField,
  useEngineCheckbox,
  useEngineSelect,
} from './react';

export type { EngineProviderProps, EngineFieldResult } from './react';

// ============================================================================
// REACT HOOKS - PUBLIC API ALIASES
// ============================================================================
// NOTE: These aliases provide simplified names for external consumers
// Internal implementation uses useEngine* prefix for clarity

/**
 * Subscribe to a node's complete state
 * Alias for useEngineNode
 *
 * @param nodeId - The ID of the node to subscribe to
 * @returns The node snapshot (immutable) or undefined if not found
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const node = useNode('field1');
 *   if (!node) return null;
 *   return <div>{node.value}</div>;
 * }
 * ```
 */
export { useEngineNode as useNode } from './react';

/**
 * Extract just the value from a node
 * Alias for useEngineValue
 *
 * @param nodeId - The ID of the node to get the value from
 * @returns The node's value or undefined if node not found
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const value = useNodeValue('field1');
 *   return <div>{value}</div>;
 * }
 * ```
 */
export { useEngineValue as useNodeValue } from './react';

/**
 * Get node's enabled state (inverse of disabled)
 * Derived from useEngineNode
 *
 * @param nodeId - The ID of the node to check
 * @returns True if the node is enabled (not disabled), false otherwise
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const enabled = useNodeEnabled('field1');
 *   return <button disabled={!enabled}>Submit</button>;
 * }
 * ```
 */
export function useNodeEnabled(nodeId: string): boolean {
  const node = useEngineNode(nodeId);
  return !(node?.disabled ?? false);
}

/**
 * Get node's visibility state
 * Derived from useEngineNode
 *
 * @param nodeId - The ID of the node to check
 * @returns True if the node is visible, false otherwise (defaults to true if node not found)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const visible = useNodeVisibility('field1');
 *   if (!visible) return null;
 *   return <div>Field is visible</div>;
 * }
 * ```
 */
export function useNodeVisibility(nodeId: string): boolean {
  const node = useEngineNode(nodeId);
  return node?.visible ?? true;
}

// ============================================================================
// ANIMATIONS
// ============================================================================

export { AnimatedNode, createAnimatedNode } from './animations';

export type { AnimatedNodeProps, AnimationSpeed } from './animations';

// ============================================================================
// INTEGRATIONS
// ============================================================================

export {
  // RHF utilities
  createRHFFieldConfig,
  createRHFFieldConfigs,
  createRHFSyncOptions,
  shouldSyncValue,
  shouldSyncError,
  shouldSyncDisabled,
  createMockRHFResult,
  defaultRHFErrorMapper,
} from './integrations';

export type {
  // RHF types
  RHFFieldConfig,
  RHFSyncOptions,
  UseEngineRHFResult,
  RHFMappedNode,
  FieldValues,
  Path,
  PathValue,
  FieldError,
} from './integrations';

// ============================================================================
// VERSION & METADATA
// ============================================================================

/**
 * Package version
 * Updated automatically during build
 */
export const VERSION = '0.1.0';

/**
 * Package metadata
 */
export const PACKAGE_INFO = {
  name: '@dashforge/ui-core',
  version: VERSION,
  description:
    'Production-grade predictive reactive engine for dynamic form systems',
  repository: 'https://github.com/dashforge/dashforge',
  license: 'MIT',
} as const;

/**
 * Feature flags for runtime capabilities
 */
export const FEATURES = {
  strictTypes: true,
  explicitDependencies: true,
  nodeSubscriptions: true,
  cssAnimations: true,
  rhfIntegration: true,
} as const;
