import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<Stepper>` — declarative multi-step
 * navigation with per-step config carried by `<Step>` children.
 *
 * Slots:
 *   - `root`        — outer wrapper (strip + content + footer are direct children).
 *   - `strip`       — the indicator strip (a flex/grid row for horizontal, a column stack for vertical).
 *   - `step`        — each rendered step item (indicator + label group).
 *   - `indicator`   — the round dot that carries the step number, check, alert, or `icon`.
 *   - `labelGroup`  — vertical stack holding label + helper + optional caption.
 *   - `label`       — the step's short title.
 *   - `helperText`  — the secondary line below the label.
 *   - `optionalTag` — the italic "Optional" (or consumer-supplied node) tag below the label.
 *   - `connector`   — the line drawn between two adjacent indicators.
 *   - `content`     — the panel that renders the current step's children.
 *   - `footer`      — reserved slot for consumer-authored Back / Next controls.
 *
 * State axes (data-* attributes on the `step` slot):
 *   - `data-state="pending"|"current"|"completed"|"invalid"|"skipped"`.
 *   Consumers can theme with `[data-state='invalid']` selectors in `slotProps`.
 */
export const stepperVariants = tv({
  slots: {
    root: 'flex',
    strip: 'flex items-center',
    step: 'flex items-center gap-2 min-w-0',
    indicator: [
      'flex-shrink-0 flex items-center justify-center rounded-full',
      'font-medium select-none transition-colors',
      'data-[state=pending]:bg-transparent',
      'data-[state=pending]:text-neutral-500',
      'data-[state=pending]:border data-[state=pending]:border-neutral-300',
      'data-[state=completed]:text-neutral-50',
      'data-[state=current]:text-neutral-50',
      'data-[state=invalid]:bg-danger-500 data-[state=invalid]:text-neutral-50',
    ],
    labelGroup: 'flex flex-col min-w-0 gap-0.5',
    label: [
      'text-sm font-medium text-neutral-900 truncate',
      'group-data-[state=pending]/step:text-neutral-500 group-data-[state=pending]/step:font-normal',
      'group-data-[state=invalid]/step:text-danger-700',
    ],
    helperText: 'text-xs text-neutral-600 truncate',
    optionalTag: 'text-[10px] italic text-neutral-500',
    connector: 'bg-neutral-200',
    content: 'w-full',
    footer: 'flex items-center justify-between mt-4',
  },
  variants: {
    color: {
      primary: {
        indicator: [
          'data-[state=current]:bg-primary-600 data-[state=current]:ring-4 data-[state=current]:ring-primary-100',
          'data-[state=current]:dark:ring-primary-950',
          'data-[state=completed]:bg-primary-600',
        ],
        connector: 'data-[completed=true]:bg-primary-600',
      },
      secondary: {
        indicator: [
          'data-[state=current]:bg-secondary-600 data-[state=current]:ring-4 data-[state=current]:ring-secondary-100',
          'data-[state=current]:dark:ring-secondary-950',
          'data-[state=completed]:bg-secondary-600',
        ],
        connector: 'data-[completed=true]:bg-secondary-600',
      },
      success: {
        indicator: [
          'data-[state=current]:bg-success-600 data-[state=current]:ring-4 data-[state=current]:ring-success-100',
          'data-[state=current]:dark:ring-success-950',
          'data-[state=completed]:bg-success-600',
        ],
        connector: 'data-[completed=true]:bg-success-600',
      },
      warning: {
        indicator: [
          'data-[state=current]:bg-warning-600 data-[state=current]:ring-4 data-[state=current]:ring-warning-100',
          'data-[state=current]:dark:ring-warning-950',
          'data-[state=completed]:bg-warning-600',
        ],
        connector: 'data-[completed=true]:bg-warning-600',
      },
      danger: {
        indicator: [
          'data-[state=current]:bg-danger-600 data-[state=current]:ring-4 data-[state=current]:ring-danger-100',
          'data-[state=current]:dark:ring-danger-950',
          'data-[state=completed]:bg-danger-600',
        ],
        connector: 'data-[completed=true]:bg-danger-600',
      },
      neutral: {
        indicator: [
          'data-[state=current]:bg-neutral-800 data-[state=current]:ring-4 data-[state=current]:ring-neutral-200',
          'data-[state=completed]:bg-neutral-800',
        ],
        connector: 'data-[completed=true]:bg-neutral-800',
      },
    },
    size: {
      sm: {
        indicator: 'w-6 h-6 text-xs',
        label: 'text-xs',
        helperText: 'text-[10px]',
      },
      md: {
        indicator: 'w-7 h-7 text-sm',
        label: 'text-sm',
        helperText: 'text-xs',
      },
      lg: {
        indicator: 'w-9 h-9 text-base',
        label: 'text-base',
        helperText: 'text-sm',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-col gap-4',
        strip: 'flex-row w-full',
        connector: 'flex-1 h-px mx-3 min-w-4',
      },
      vertical: {
        root: 'flex-row gap-6',
        strip: 'flex-col items-start w-auto shrink-0',
        step: 'w-full',
        connector: 'w-px h-6 ml-3 my-1',
      },
    },
    labelPlacement: {
      end: {},
      below: {
        step: 'flex-col items-center gap-1.5 text-center',
        labelGroup: 'items-center text-center',
      },
    },
  },
  compoundVariants: [
    // In vertical orientation, `labelPlacement` is a no-op — labels
    // naturally sit next to indicators in a column layout.
    {
      orientation: 'vertical',
      labelPlacement: 'below',
      class: {
        step: 'flex-row items-start gap-2 text-left',
        labelGroup: 'items-start text-left',
      },
    },
  ],
  defaultVariants: {
    color: 'primary',
    size: 'md',
    orientation: 'horizontal',
    labelPlacement: 'end',
  },
});

export type StepperVariants = VariantProps<typeof stepperVariants>;
