/**
 * @module integrations
 * Third-party integrations for @dashforge/ui-core
 *
 * Currently supports:
 * - React Hook Form (RHF) - Form state management integration
 *
 * ⚠️ PATCH B: All generics default to `unknown` (NOT `any`)
 */

// React Hook Form integration
export {
  createRHFFieldConfig,
  createRHFFieldConfigs,
  createRHFSyncOptions,
  shouldSyncValue,
  shouldSyncError,
  shouldSyncDisabled,
  createMockRHFResult,
  defaultRHFErrorMapper,
} from './rhf';

export type {
  RHFFieldConfig,
  RHFSyncOptions,
  UseEngineRHFResult,
  RHFMappedNode,
  FieldValues,
  Path,
  PathValue,
  FieldError,
} from './rhf';
