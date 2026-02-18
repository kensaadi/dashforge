/**
 * @module react
 * React integration hooks and components for @dashforge/ui-core
 */

// Provider and context
export { EngineProvider, useEngineContext } from './EngineProvider';
export type { EngineProviderProps } from './EngineProvider';

// Node subscription hooks
export { useEngineNode, useRequiredEngineNode } from './useEngineNode';

// Value extraction hooks
export {
  useEngineValue,
  useEngineValueWithDefault,
  useEngineValues,
} from './useEngineValue';

// Form field integration hooks
export {
  useEngineField,
  useEngineCheckbox,
  useEngineSelect,
} from './useEngineField';
export type { EngineFieldResult } from './useEngineField';

// Visibility hooks
export { useEngineVisibility } from './useEngineVisibility';
