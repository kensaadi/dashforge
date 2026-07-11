import type { Engine } from '@dashforge/ui-core';
import type { FieldValues, UseFormReturn, FieldPath, Resolver } from 'react-hook-form';
import type { ReactionDefinition } from '../reactions/reaction.types';

/**
 * Interface for the adapter that bridges React Hook Form with the Dashforge Engine.
 *
 * This adapter is responsible for:
 * - Tracking registered fields
 * - Synchronizing values between RHF and Engine (Phase 1+)
 * - Managing field lifecycle (register/unregister)
 *
 * @template TFieldValues - Form field values type
 */
export interface IFormEngineAdapter<
  TFieldValues extends FieldValues = FieldValues
> {
  /**
   * Registers a field with the adapter.
   * Phase 0: Just tracks the field name internally.
   * Phase 1+: Will set up bidirectional sync with Engine.
   *
   * @param name - Field name to register
   */
  registerField(name: FieldPath<TFieldValues>): void;

  /**
   * Unregisters a field from the adapter.
   * Phase 0: Just removes from internal tracking.
   * Phase 1+: Will cleanup Engine connections.
   *
   * @param name - Field name to unregister
   */
  unregisterField(name: FieldPath<TFieldValues>): void;

  /**
   * Synchronizes a value from RHF to the Engine.
   * Phase 0: STUB - logs only if debug enabled.
   * Phase 1+: Will update corresponding Engine node.
   *
   * @param name - Field name
   * @param value - Value to sync to engine
   */
  syncValueToEngine(name: FieldPath<TFieldValues>, value: unknown): void;

  /**
   * Synchronizes a value from Engine to RHF.
   * Phase 0: STUB - logs only if debug enabled.
   * Phase 1+: Will update RHF form state.
   *
   * @param name - Field name
   * @param value - Value to sync to RHF
   */
  syncValueToRHF(name: FieldPath<TFieldValues>, value: unknown): void;

  /**
   * Returns all currently registered field names.
   *
   * @returns Array of registered field names
   */
  getRegisteredFields(): string[];
}

/**
 * Context value provided by DashFormProvider.
 * Contains all necessary references for form management.
 *
 * @template TFieldValues - Form field values type
 */
export interface DashFormContextValue<
  TFieldValues extends FieldValues = FieldValues
> {
  /**
   * The Dashforge Engine instance managing reactive state.
   * Either provided externally or auto-created.
   *
   * Typed against the form's `TFieldValues` so `engine.getNode(...)` /
   * `updateNode(...)` calls made on this instance from within a form
   * component get compile-time path checking and value-type narrowing.
   */
  engine: Engine<TFieldValues>;

  /**
   * React Hook Form methods and state.
   * Contains register, handleSubmit, formState, etc.
   */
  rhf: UseFormReturn<TFieldValues>;

  /**
   * Adapter bridging RHF and Engine.
   * Phase 0: Methods are stubs.
   * Phase 1+: Handles bidirectional sync.
   */
  adapter: IFormEngineAdapter<TFieldValues>;

  /**
   * Debug mode flag.
   * When true, adapter logs sync operations to console.
   */
  debug: boolean;
}

/**
 * Configuration options for DashFormProvider.
 *
 * @template TFieldValues - Form field values type
 */
export interface DashFormConfig<
  TFieldValues extends FieldValues = FieldValues
> {
  /**
   * Optional Engine instance to use.
   * If not provided, a new Engine will be created automatically.
   *
   * When you pass one in, type it as `Engine<TFieldValues>` (e.g. via
   * `createEngine<MySchema>()`) so path constraints propagate through
   * the whole provider tree.
   */
  engine?: Engine<TFieldValues>;

  /**
   * Default values for form fields.
   * Passed directly to React Hook Form's useForm.
   */
  defaultValues?: Partial<TFieldValues>;

  /**
   * Enable debug logging.
   * When true, adapter operations are logged to console.
   *
   * @default false
   */
  debug?: boolean;

  /**
   * React Hook Form validation mode.
   * Controls when validation runs (onChange, onBlur, onSubmit, etc.).
   *
   * @default 'onChange'
   */
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';

  /**
   * Reaction definitions for declarative side effects.
   * Reactions execute when watched fields change.
   *
   * @default undefined
   */
  reactions?: ReactionDefinition<TFieldValues>[];

  /**
   * Optional React Hook Form resolver (pass-through).
   *
   * **IMPORTANT: Dashforge does NOT bundle any validation library.**
   * **It only exposes React Hook Form capabilities via pass-through.**
   *
   * When a resolver is provided, it becomes the primary validation source.
   * Field-level rules may still be defined, but their behavior depends on
   * React Hook Form's validation flow.
   *
   * When NOT provided:
   * - Field-level rules work as before (backward compatible)
   *
   * Compatible resolvers (user must install separately):
   * - @hookform/resolvers/yup (requires yup)
   * - @hookform/resolvers/zod (requires zod)
   * - @hookform/resolvers/joi (requires joi)
   * - Custom resolvers (implement Resolver<TFieldValues> interface)
   *
   * @see https://react-hook-form.com/docs/useform#resolver
   * @example
   * ```tsx
   * // User must install: npm install yup @hookform/resolvers
   * import { yupResolver } from '@hookform/resolvers/yup';
   * import * as yup from 'yup';
   *
   * const schema = yup.object({
   *   email: yup.string().email().required(),
   * });
   *
   * <DashFormProvider
   *   resolver={yupResolver(schema)}
   *   defaultValues={{ email: '' }}
   * >
   *   <TextField name="email" label="Email" />
   * </DashFormProvider>
   * ```
   */
  resolver?: Resolver<TFieldValues>;
}

/**
 * Props for DashFormProvider component.
 * Extends DashFormConfig with children.
 *
 * @template TFieldValues - Form field values type
 */
export interface DashFormProviderProps<
  TFieldValues extends FieldValues = FieldValues
> extends DashFormConfig<TFieldValues> {
  /**
   * Child components to render within the form context.
   */
  children: React.ReactNode;
}

/**
 * Props for DashForm component.
 * Combines DashFormConfig with HTML form attributes and onSubmit handler.
 *
 * @template TFieldValues - Form field values type
 */
export interface DashFormProps<TFieldValues extends FieldValues = FieldValues>
  extends DashFormConfig<TFieldValues>,
    Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /**
   * Form submission handler.
   * Receives validated form data when form is submitted.
   * Wrapped with RHF's handleSubmit for validation.
   */
  onSubmit?: (data: TFieldValues) => void | Promise<void>;

  /**
   * Child components to render within the form.
   */
  children: React.ReactNode;
}

/**
 * Options for FormEngineAdapter constructor.
 */
export interface FormEngineAdapterOptions {
  /**
   * Enable debug logging.
   *
   * @default false
   */
  debug?: boolean;
}
