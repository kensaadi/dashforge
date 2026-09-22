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
  // If no onSubmit provided, use noop function (named so the lint rule
  // against empty arrows doesn't trip on the intentional no-op).
  const noopSubmit = () => undefined;
  const handleSubmit = rhf.handleSubmit(onSubmit || noopSubmit);

  return (
    <form {...formProps} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

/**
 * Complete form component that combines DashFormProvider with an HTML
 * `<form>` element.
 *
 * This is the recommended entry point on the web. It provides both the
 * context and the `<form>` element in one component.
 *
 * **DOM-only.** `<DashForm>` renders a `<form>` host element and is
 * unusable on non-DOM renderers (React Native, Ink, custom
 * reconcilers) — those throw at render time with
 * `View config getter callback for component 'form' must be a function`
 * or similar. Use {@link DashFormProvider} directly there and render
 * your own container; wire submit with
 * `useDashFormContext().rhf.handleSubmit(onSubmit)`. See BUG 10 in
 * `libs/dashforge/README-BUG.md`.
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
  reactions,
  resolver,
  shouldUnregister,
  ...formProps
}: DashFormProps<TFieldValues>) {
  return (
    <DashFormProvider<TFieldValues>
      engine={engine}
      defaultValues={defaultValues}
      debug={debug}
      mode={mode}
      reactions={reactions}
      resolver={resolver}
      shouldUnregister={shouldUnregister}
    >
      <DashFormInner<TFieldValues> onSubmit={onSubmit} {...formProps}>
        {children}
      </DashFormInner>
    </DashFormProvider>
  );
}
