/**
 * @dashforge/forms
 * Form library bridging React Hook Form with Dashforge Engine
 *
 * @module @dashforge/forms
 * @author Dashforge Team
 * @license MIT
 *
 * Phase 0: Structural Foundation
 * - Infrastructure skeleton with stub methods
 * - No business logic or synchronization yet
 * - Ready for Phase 1 implementation
 */

// ============================================================================
// CORE
// ============================================================================

/**
 * Context provider for DashForms.
 * Sets up Engine, RHF, and adapter infrastructure.
 */
export { DashFormProvider } from './core/DashFormProvider';

/**
 * Form bridge context (defined in @dashforge/ui-core).
 * Re-exported for convenience and backward compatibility.
 */
export { DashFormContext } from '@dashforge/ui-core';
export type { DashFormBridge } from '@dashforge/ui-core';

/**
 * Hook to access DashForm context.
 * Provides engine, rhf, adapter, and debug flag.
 */
export { useDashFormContext } from './core/useDashFormContext';

/**
 * Adapter bridging React Hook Form with Dashforge Engine.
 *
 * @internal
 * Implementation detail used by `DashFormProvider`. Exported for advanced
 * use-cases (custom providers, testing harnesses) but **not part of the
 * stable public surface** — it can change shape between minor releases.
 * Most consumers should never reach for this; use `useDashFormContext` or
 * the field hooks instead.
 */
export { FormEngineAdapter } from './core/FormEngineAdapter';

/**
 * Type definitions for DashForm infrastructure.
 *
 * The `DashFormProviderProps`, `DashFormProps`, `DashFormConfig`,
 * `DashFormContextValue` types are **public**.
 *
 * The `IFormEngineAdapter` and `FormEngineAdapterOptions` types describe
 * the internal adapter contract — they are exported for consumers that
 * build a custom provider, but flagged `@internal` for the same reason
 * `FormEngineAdapter` itself is.
 */
export type {
  DashFormContextValue,
  DashFormConfig,
  DashFormProps,
  DashFormProviderProps,
  /** @internal */
  IFormEngineAdapter,
  /** @internal */
  FormEngineAdapterOptions,
} from './core/form.types';

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to access an Engine node within a DashForm.
 * Wraps useEngineNode from @dashforge/ui-core with debug logging.
 */
export { useDashFieldNode } from './hooks/useDashFieldNode';

/**
 * Hook to register a field with both RHF and the adapter.
 * Phase 0: No value sync, just lifecycle tracking.
 */
export { useDashRegister } from './hooks/useDashRegister';

/**
 * Result type from useDashRegister.
 */
export type { UseDashRegisterResult } from './hooks/useDashRegister';

/**
 * Hook to subscribe to runtime state for a field (Reactive V2).
 * Provides read-only access to loading status, errors, and fetched data.
 */
export { useFieldRuntime } from './hooks/useFieldRuntime';

/**
 * Hook for granular per-field state subscription.
 * Replaces the legacy `void bridge?.errorVersion` global subscribe pattern
 * with a subscription scoped to a single field name. The consumer
 * re-renders ONLY when its own field's value/error/touched/dirty changes.
 */
export { useDashFieldMeta } from './hooks/useDashFieldMeta';
export type { DashFieldMeta } from './hooks/useDashFieldMeta';

/**
 * Hook to manage dynamic field arrays.
 * V1: Thin adapter over RHF useFieldArray with Dashforge API.
 * Provides pre-computed field names and stable IDs.
 */
export { useDashFieldArray } from './hooks/useDashFieldArray';

/**
 * Type definitions for field array hook.
 */
export type {
  DashFieldArrayItem,
  UseDashFieldArrayReturn,
} from './hooks/useDashFieldArray';

// ============================================================================
// RUNTIME (Reactive V2)
// ============================================================================

/**
 * Runtime store types and utilities.
 */
export type {
  FieldFetchStatus,
  FieldRuntimeState,
  SelectFieldRuntimeData,
  RuntimeStoreConfig,
  RuntimeStoreState,
} from './runtime/runtime.types';

/**
 * Low-level runtime store factory.
 *
 * @internal
 * `DashFormProvider` creates and owns its own `RuntimeStore` instance.
 * UI consumers interact with runtime state exclusively via `useFieldRuntime`
 * (read) and bridge-mediated writes from reactions. The factory is exported
 * here for testing and advanced custom-provider scenarios only — not part
 * of the stable public surface.
 */
export type { RuntimeStore } from './runtime/createRuntimeStore';
/** @internal */
export { createRuntimeStore, DEFAULT_FIELD_RUNTIME } from './runtime/createRuntimeStore';

// ============================================================================
// REACTIONS (Reactive V2)
// ============================================================================

/**
 * Reaction system types and utilities.
 * Defines declarative side effects that execute when watched fields change.
 */
export type {
  ReactionDefinition,
  ReactionWhenContext,
  ReactionRunContext,
  ReactionRegistryConfig,
} from './reactions/reaction.types';

/**
 * Reaction registry.
 *
 * @internal
 * Internal orchestration primitive. `DashFormProvider` creates a registry
 * from the `reactions` prop and drives evaluation. Typical consumers only
 * need the `ReactionDefinition` type to author reactions; they do NOT need
 * to touch the registry directly. Exported for testing / custom-provider
 * authoring only — not part of the stable public surface.
 */
export type { ReactionRegistry } from './reactions/createReactionRegistry';
/** @internal */
export { createReactionRegistry } from './reactions/createReactionRegistry';

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Complete form component combining DashFormProvider + HTML form.
 * Recommended way to use DashForms.
 */
export { DashForm } from './components/DashForm';

// ============================================================================
// VERSION
// ============================================================================

/**
 * Package version.
 */
export const VERSION = '0.2.3-beta';
