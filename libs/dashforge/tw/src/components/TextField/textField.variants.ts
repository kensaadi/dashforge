import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<TextField>` with 7 slots.
 *
 * The MUI-side `TextField` supports three layout modes (floating /
 * stacked / inline) plus a Select-integration hook. The TW-side
 * port covers **stacked** + **inline** in F3 (label outside the
 * input wrapper) and ships a CSS-only floating label using
 * Tailwind's `peer` modifier.
 *
 * The Select integration (`__selectAvailableValues` etc.) is
 * deferred to F4 when the dedicated `<Select>` component arrives.
 */
export const textFieldVariants = tv({
  slots: {
    root: 'flex',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    inputWrapper: [
      'relative flex items-center',
      // bg-neutral-50 inverts via @dashforge/tw-tokens: #fafafa in light,
      // #0a0a0a in dark. Same class, dark-mode aware automatically.
      'rounded-md border bg-neutral-50',
      'border-neutral-300',
      'transition-colors',
      'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30',
    ],
    input: [
      'block w-full bg-transparent outline-none',
      'text-neutral-900 placeholder:text-neutral-400',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'read-only:cursor-default',
    ],
    helperText: 'mt-1 text-sm text-neutral-600',
    errorText: 'mt-1 text-sm text-danger-600',
  },
  variants: {
    size: {
      sm: {
        inputWrapper: 'h-8 px-2',
        input: 'text-sm',
      },
      md: {
        inputWrapper: 'h-10 px-3',
        input: 'text-base',
      },
      lg: {
        inputWrapper: 'h-12 px-4',
        input: 'text-lg',
      },
    },
    layout: {
      stacked: { root: 'flex-col' },
      inline: { root: 'flex-row items-start gap-3', label: 'mb-0 pt-2 whitespace-nowrap shrink-0' },
    },
    error: {
      true: {
        inputWrapper:
          'border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500/30',
      },
    },
    fullWidth: {
      true: {
        root: 'w-full',
        inputWrapper: 'w-full',
      },
    },
    disabled: {
      true: {
        // neutral-200 is a darker shade of the default neutral-50 surface
        // — visually distinguishes the disabled input from the active one
        // in both light and dark modes.
        inputWrapper: 'opacity-60 cursor-not-allowed bg-neutral-200',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    layout: 'stacked',
    error: false,
    fullWidth: false,
    disabled: false,
  },
});

export type TextFieldVariants = VariantProps<typeof textFieldVariants>;
