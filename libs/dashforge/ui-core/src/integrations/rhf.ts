/**
 * @module integrations/rhf
 * React Hook Form integration utilities for @dashforge/ui-core
 *
 * Provides helpers to sync engine nodes with RHF form state
 *
 * ⚠️ PATCH B: All generics default to `unknown` (NOT `any`)
 */

import type {
  RHFFieldConfig,
  RHFSyncOptions,
  UseEngineRHFResult,
  FieldValues,
  Path,
} from './rhf.types';

/**
 * Creates a field configuration for RHF sync
 * Helper to reduce boilerplate
 *
 * ⚠️ PATCH B: TFieldValues defaults to unknown
 *
 * @example
 * ```ts
 * const config = createRHFFieldConfig({
 *   name: 'email',
 *   nodeId: 'user-email',
 * });
 * ```
 */
export function createRHFFieldConfig<
  TFieldValues extends FieldValues = Record<string, unknown>,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>(
  config: RHFFieldConfig<TFieldValues, TName>
): RHFFieldConfig<TFieldValues, TName> {
  return {
    syncValue: true,
    syncError: true,
    syncDisabled: true,
    ...config,
  };
}

/**
 * Creates multiple field configurations at once
 * Convenience helper for batch configuration
 *
 * ⚠️ PATCH B: TFieldValues defaults to unknown
 *
 * @example
 * ```ts
 * const configs = createRHFFieldConfigs([
 *   { name: 'email', nodeId: 'user-email' },
 *   { name: 'password', nodeId: 'user-password' },
 * ]);
 * ```
 */
export function createRHFFieldConfigs<
  TFieldValues extends FieldValues = Record<string, unknown>
>(
  configs: Array<{
    name: Path<TFieldValues>;
    nodeId: string;
    syncValue?: boolean;
    syncError?: boolean;
    syncDisabled?: boolean;
  }>
): Array<RHFFieldConfig<TFieldValues>> {
  return configs.map((config) => createRHFFieldConfig(config));
}

/**
 * Creates RHF sync options with defaults
 * Helper to reduce boilerplate
 *
 * ⚠️ PATCH B: TFieldValues defaults to unknown
 *
 * @example
 * ```ts
 * const options = createRHFSyncOptions({
 *   fields: [
 *     { name: 'email', nodeId: 'user-email' },
 *   ],
 *   direction: 'bidirectional',
 * });
 * ```
 */
export function createRHFSyncOptions<
  TFieldValues extends FieldValues = Record<string, unknown>
>(
  options: Omit<RHFSyncOptions<TFieldValues>, 'direction' | 'debounceMs'> & {
    direction?: RHFSyncOptions<TFieldValues>['direction'];
    debounceMs?: number;
  }
): RHFSyncOptions<TFieldValues> {
  const result: RHFSyncOptions<TFieldValues> = {
    fields: options.fields,
  };

  // Conditionally add optional properties to satisfy exactOptionalPropertyTypes
  if (options.direction !== undefined) {
    result.direction = options.direction;
  }

  if (options.debounceMs !== undefined) {
    result.debounceMs = options.debounceMs;
  }

  return result;
}

/**
 * Type guard to check if a field config should sync values
 */
export function shouldSyncValue<
  TFieldValues extends FieldValues = Record<string, unknown>
>(config: RHFFieldConfig<TFieldValues>): boolean {
  return config.syncValue !== false;
}

/**
 * Type guard to check if a field config should sync errors
 */
export function shouldSyncError<
  TFieldValues extends FieldValues = Record<string, unknown>
>(config: RHFFieldConfig<TFieldValues>): boolean {
  return config.syncError !== false;
}

/**
 * Type guard to check if a field config should sync disabled state
 */
export function shouldSyncDisabled<
  TFieldValues extends FieldValues = Record<string, unknown>
>(config: RHFFieldConfig<TFieldValues>): boolean {
  return config.syncDisabled !== false;
}

/**
 * Hook result factory for testing
 * Creates a mock UseEngineRHFResult for unit tests
 *
 * ⚠️ PATCH B: TFieldValues defaults to unknown
 */
export function createMockRHFResult<
  TFieldValues extends FieldValues = Record<string, unknown>
>(): UseEngineRHFResult<TFieldValues> {
  return {
    isSyncing: false,
    startSync: () => undefined,
    stopSync: () => undefined,
    triggerSync: () => undefined,
    getNodeValue: () => undefined,
    setNodeValue: () => undefined,
  };
}

/**
 * Re-export types for convenience
 */
export type {
  RHFFieldConfig,
  RHFSyncOptions,
  UseEngineRHFResult,
  RHFMappedNode,
  FieldValues,
  Path,
  PathValue,
  FieldError,
} from './rhf.types';

export { defaultRHFErrorMapper } from './rhf.types';
