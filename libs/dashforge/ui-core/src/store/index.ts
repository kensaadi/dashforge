/**
 * Store exports for @dashforge/ui-core
 *
 * This module exports the store factory and related utilities.
 */

export type { Store, StoreConfig, StoreMetadata } from './createStore';
export {
  createStore,
  resetStore,
  getEvaluationDepth,
  incrementEvaluationDepth,
  decrementEvaluationDepth,
  resetEvaluationDepth,
} from './createStore';
