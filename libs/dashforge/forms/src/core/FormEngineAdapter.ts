import type { Engine } from '@dashforge/ui-core';
import type { FieldValues, UseFormReturn, FieldPath } from 'react-hook-form';
import type {
  IFormEngineAdapter,
  FormEngineAdapterOptions,
} from './form.types';

/**
 * Adapter bridging React Hook Form with the Dashforge Engine.
 *
 * **Phase 0 Implementation:**
 * - Tracks registered fields in a Set
 * - All sync methods are stubs (log only if debug enabled)
 * - No actual bidirectional synchronization
 *
 * **Future Phases:**
 * - Phase 1: Implement bidirectional sync between RHF and Engine
 * - Phase 2: Add reaction system integration
 * - Phase 3: Add async validation support
 *
 * @template TFieldValues - Form field values type
 */
export class FormEngineAdapter<TFieldValues extends FieldValues = FieldValues>
  implements IFormEngineAdapter<TFieldValues>
{
  private engine: Engine;
  private rhfMethods: UseFormReturn<TFieldValues>;
  private debug: boolean;
  private registeredFields: Set<string>;

  /**
   * Creates a new FormEngineAdapter instance.
   *
   * @param engine - Dashforge Engine instance
   * @param rhfMethods - React Hook Form methods and state
   * @param options - Optional configuration
   */
  constructor(
    engine: Engine,
    rhfMethods: UseFormReturn<TFieldValues>,
    options?: FormEngineAdapterOptions
  ) {
    this.engine = engine;
    this.rhfMethods = rhfMethods;
    this.debug = options?.debug ?? false;
    this.registeredFields = new Set<string>();

    if (this.debug) {
      console.log('[FormEngineAdapter] Initialized', {
        engine,
        rhfMethods,
        options,
      });
    }
  }

  /**
   * Registers a field with the adapter.
   *
   * Creates an Engine node for the field if it doesn't exist and initializes
   * it with the current value from RHF.
   *
   * @param name - Field name to register
   */
  registerField(name: FieldPath<TFieldValues>): void {
    const fieldName = String(name);
    this.registeredFields.add(fieldName);

    // Get initial value from RHF
    const initialValue = this.rhfMethods.getValues(name);

    // Create Engine node if it doesn't exist
    const existingNode = this.engine.getNode(fieldName);
    if (!existingNode) {
      this.engine.registerNode({
        id: fieldName,
        value: initialValue ?? '',
        visible: true,
        disabled: false,
      });
    }

    if (this.debug) {
      console.log('[FormEngineAdapter] registerField', {
        name: fieldName,
        initialValue,
        nodeCreated: !existingNode,
        totalRegistered: this.registeredFields.size,
      });
    }
  }

  /**
   * Unregisters a field from the adapter.
   *
   * Removes the Engine node for the field if it was registered.
   *
   * @param name - Field name to unregister
   */
  unregisterField(name: FieldPath<TFieldValues>): void {
    const fieldName = String(name);
    const wasRegistered = this.registeredFields.delete(fieldName);

    // Remove Engine node if field was registered
    if (wasRegistered) {
      this.engine.unregisterNode(fieldName);
    }

    if (this.debug) {
      console.log('[FormEngineAdapter] unregisterField', {
        name: fieldName,
        wasRegistered,
        totalRegistered: this.registeredFields.size,
      });
    }
  }

  /**
   * Synchronizes a value from RHF to the Engine.
   *
   * **Phase 1 Implementation:**
   * - Checks if field is registered
   * - Updates Engine node with new value
   * - Unidirectional: RHF → Engine only
   *
   * @param name - Field name
   * @param value - Value to sync to engine
   */
  syncValueToEngine(name: FieldPath<TFieldValues>, value: unknown): void {
    const fieldName = String(name);

    if (!this.registeredFields.has(fieldName)) {
      if (this.debug) {
        console.warn(
          `[FormEngineAdapter] Attempted to sync unregistered field: ${fieldName}`
        );
      }
      return;
    }

    if (this.debug) {
      console.log(
        `[FormEngineAdapter] Syncing value to engine: ${fieldName}`,
        value
      );
    }

    this.engine.updateNode(fieldName, { value });
  }

  /**
   * Synchronizes a value from Engine to RHF.
   *
   * **Phase 0:** STUB - Only logs if debug enabled.
   *
   * **Future:** Will update RHF form state.
   *
   * @param name - Field name
   * @param value - Value to sync to RHF
   */
  syncValueToRHF(name: FieldPath<TFieldValues>, value: unknown): void {
    if (this.debug) {
      console.log('[FormEngineAdapter] syncValueToRHF (STUB)', {
        name: String(name),
        value,
      });
    }

    // TODO: Phase 1 - Call rhfMethods.setValue(name, value)
    // TODO: Phase 1 - Prevent circular updates
    // TODO: Phase 1 - Handle nested field paths
  }

  /**
   * Returns all currently registered field names.
   *
   * @returns Array of registered field names
   */
  getRegisteredFields(): string[] {
    return Array.from(this.registeredFields);
  }
}
