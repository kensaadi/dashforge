import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Textarea>` with 7 slots.
 *
 * Sibling of `<TextField>` but renders a multi-line `<textarea>` element
 * instead of a single-line `<input>`. Shares the same slot taxonomy +
 * variant axes so consumers can swap the two without rewriting overrides.
 */
export const textareaVariants = tv({
  slots: {
    root: 'flex',
    label: 'block text-sm font-medium text-neutral-900 mb-1',
    requiredMark: 'text-danger-500 ml-0.5',
    inputWrapper: [
      'relative flex',
      // bg-neutral-50 inverts via @dashforge/tw-tokens — dark-mode aware.
      'rounded-md border bg-neutral-50',
      'border-neutral-300',
      'transition-colors',
      'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30',
    ],
    input: [
      'block w-full bg-transparent outline-none resize-y',
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
        inputWrapper: 'px-2 py-1.5',
        input: 'text-sm',
      },
      md: {
        inputWrapper: 'px-3 py-2',
        input: 'text-base',
      },
      lg: {
        inputWrapper: 'px-4 py-3',
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
        inputWrapper: 'opacity-60 cursor-not-allowed bg-neutral-200',
      },
    },
    resize: {
      none: { input: 'resize-none' },
      vertical: { input: 'resize-y' },
      horizontal: { input: 'resize-x' },
      both: { input: 'resize' },
    },
  },
  defaultVariants: {
    size: 'md',
    layout: 'stacked',
    error: false,
    fullWidth: false,
    disabled: false,
    resize: 'vertical',
  },
});

export type TextareaVariants = VariantProps<typeof textareaVariants>;
