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
 * Phase 0: Methods are stubs.
 */
export { FormEngineAdapter } from './core/FormEngineAdapter';

/**
 * Type definitions for DashForm infrastructure.
 */
export type {
  DashFormContextValue,
  DashFormConfig,
  DashFormProps,
  DashFormProviderProps,
  IFormEngineAdapter,
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
export const VERSION = '0.0.1';
