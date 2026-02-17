/**
 * Internal store type definitions.
 * These types are used internally by the store layer and are not exported publicly.
 */

import type { EngineState } from '../types/engine.types';

/**
 * Configuration options for creating the store.
 */
export interface StoreConfig {
  /**
   * Initial state for the store.
   */
  initialState?: Partial<EngineState>;

  /**
   * Whether to enable debug logging.
   * @default false
   */
  debug?: boolean;
}

/**
 * Internal metadata tracked by the store (not part of the reactive state).
 */
export interface StoreMetadata {
  /**
   * Timestamp when the store was created.
   */
  createdAt: number;

  /**
   * Current evaluation depth (for loop protection).
   */
  evaluationDepth: number;

  /**
   * Whether debug mode is enabled.
   */
  debug: boolean;
}
