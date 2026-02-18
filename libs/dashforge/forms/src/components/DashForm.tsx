import type { FieldValues } from 'react-hook-form';
import type { DashFormProps } from '../core/form.types';
import { DashFormProvider } from '../core/DashFormProvider';
import { useDashFormContext } from '../core/useDashFormContext';

/**
 * Internal component that renders the actual HTML form element.
 * This must be separate from DashForm to access the context.
 */
function DashFormInner<TFieldValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  ...formProps
}: Omit<
  DashFormProps<TFieldValues>,
  'engine' | 'defaultValues' | 'debug' | 'mode'
>) {
  const { rhf } = useDashFormContext<TFieldValues>();

  // Wrap onSubmit with RHF's handleSubmit for validation
  // If no onSubmit provided, use noop function
  const handleSubmit = rhf.handleSubmit(onSubmit || (() => {}));

  return (
    <form {...formProps} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

/**
 * Complete form component that combines DashFormProvider with HTML form element.
 *
 * This is the recommended way to use DashForms - it provides both the context
 * and the form element in one component.
 *
 * **Phase 0 Implementation:**
 * - Sets up DashFormProvider with Engine and RHF
 * - Renders HTML form with proper submit handling
 * - onSubmit is wired with rhf.handleSubmit (NOT a stub - works like normal RHF)
 * - No value synchronization yet (Phase 1+)
 *
 * **Key Features:**
 * - Auto-creates Engine if not provided
 * - Handles form validation via RHF
 * - Proper TypeScript generics for type-safe forms
 * - Supports all standard HTML form attributes
 *
 * @template TFieldValues - Form field values type
 *
 * @example
 * ```tsx
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 *
 * function LoginPage() {
 *   const handleSubmit = (data: LoginForm) => {
 *     console.log('Form submitted:', data);
 *     // API call here
 *   };
 *
 *   return (
 *     <DashForm<LoginForm>
 *       defaultValues={{ email: '', password: '' }}
 *       onSubmit={handleSubmit}
 *       debug={true}
 *     >
 *       <EmailField />
 *       <PasswordField />
 *       <button type="submit">Login</button>
 *     </DashForm>
 *   );
 * }
 *
 * function EmailField() {
 *   const { register } = useDashRegister('email', {
 *     required: 'Email is required',
 *   });
 *   return <input type="email" {...register} />;
 * }
 *
 * function PasswordField() {
 *   const { register } = useDashRegister('password', {
 *     required: 'Password is required',
 *     minLength: { value: 8, message: 'Min 8 characters' },
 *   });
 *   return <input type="password" {...register} />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With external Engine instance
 * const engine = createEngine();
 *
 * function MyForm() {
 *   return (
 *     <DashForm
 *       engine={engine}
 *       defaultValues={{ name: '' }}
 *       mode="onBlur"
 *     >
 *       <input {...useDashRegister('name').register} />
 *     </DashForm>
 *   );
 * }
 * ```
 */
export function DashForm<TFieldValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  engine,
  defaultValues,
  debug,
  mode,
  ...formProps
}: DashFormProps<TFieldValues>) {
  return (
    <DashFormProvider<TFieldValues>
      engine={engine}
      defaultValues={defaultValues}
      debug={debug}
      mode={mode}
    >
      <DashFormInner<TFieldValues> onSubmit={onSubmit} {...formProps}>
        {children}
      </DashFormInner>
    </DashFormProvider>
  );
}
