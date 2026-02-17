/**
 * Store factory using Valtio for reactive state management.
 *
 * This module creates and manages the Valtio proxy that holds the engine state.
 * The proxy enables automatic reactivity in React components via useSnapshot.
 */

import { proxy, subscribe } from 'valtio';
import type { EngineState } from '../types/engine.types';
import type { StoreConfig, StoreMetadata } from './storeTypes';

// Re-export types for external use
export type { StoreConfig, StoreMetadata } from './storeTypes';

/**
 * Store wrapper that combines the Valtio proxy with metadata.
 */
export interface Store {
  /**
   * The Valtio proxy containing the reactive engine state.
   */
  state: EngineState;

  /**
   * Internal metadata (not reactive, not part of the proxy).
   */
  metadata: StoreMetadata;

  /**
   * Subscribe to changes in the store.
   *
   * @param callback - Function to call when state changes
   * @returns Unsubscribe function
   */
  subscribe: (callback: () => void) => () => void;
}

/**
 * Creates a new Valtio-based store for the engine.
 *
 * The store uses Valtio's proxy system to enable fine-grained reactivity.
 * Components can subscribe to specific parts of the state using useSnapshot.
 *
 * @param config - Configuration options for the store
 * @returns Store instance with Valtio proxy and metadata
 */
export function createStore(config: StoreConfig = {}): Store {
  const { initialState = {}, debug = false } = config;

  // Create the Valtio proxy with initial state
  const state = proxy<EngineState>({
    nodes: initialState.nodes || {},
    rules: initialState.rules || {},
  });

  // Create non-reactive metadata
  const metadata: StoreMetadata = {
    createdAt: Date.now(),
    evaluationDepth: 0,
    debug,
  };

  // Log store creation in debug mode
  if (debug) {
    console.log(
      '[Store] Created at',
      new Date(metadata.createdAt).toISOString()
    );
  }

  // Create subscribe function that wraps Valtio's subscribe
  const subscribeToStore = (callback: () => void): (() => void) => {
    if (debug) {
      console.log('[Store] New subscription registered');
    }
    return subscribe(state, callback);
  };

  return {
    state,
    metadata,
    subscribe: subscribeToStore,
  };
}

/**
 * Helper function to reset a store to its initial state.
 *
 * @param store - The store to reset
 */
export function resetStore(store: Store): void {
  if (store.metadata.debug) {
    console.log('[Store] Resetting store');
  }

  // Clear nodes and rules
  store.state.nodes = {};
  store.state.rules = {};

  // Reset evaluation depth
  store.metadata.evaluationDepth = 0;
}

/**
 * Helper function to get the current evaluation depth.
 *
 * @param store - The store to query
 * @returns Current evaluation depth
 */
export function getEvaluationDepth(store: Store): number {
  return store.metadata.evaluationDepth;
}

/**
 * Helper function to increment the evaluation depth.
 * Used for loop protection during rule evaluation.
 *
 * @param store - The store to modify
 * @returns New evaluation depth
 */
export function incrementEvaluationDepth(store: Store): number {
  store.metadata.evaluationDepth += 1;
  if (store.metadata.debug) {
    console.log(
      '[Store] Evaluation depth increased to',
      store.metadata.evaluationDepth
    );
  }
  return store.metadata.evaluationDepth;
}

/**
 * Helper function to decrement the evaluation depth.
 * Used for loop protection during rule evaluation.
 *
 * @param store - The store to modify
 * @returns New evaluation depth
 */
export function decrementEvaluationDepth(store: Store): number {
  store.metadata.evaluationDepth = Math.max(
    0,
    store.metadata.evaluationDepth - 1
  );
  if (store.metadata.debug) {
    console.log(
      '[Store] Evaluation depth decreased to',
      store.metadata.evaluationDepth
    );
  }
  return store.metadata.evaluationDepth;
}

/**
 * Helper function to reset the evaluation depth to zero.
 * Should be called after each top-level evaluation completes.
 *
 * @param store - The store to modify
 */
export function resetEvaluationDepth(store: Store): void {
  if (store.metadata.debug && store.metadata.evaluationDepth > 0) {
    console.log(
      '[Store] Resetting evaluation depth from',
      store.metadata.evaluationDepth
    );
  }
  store.metadata.evaluationDepth = 0;
}
