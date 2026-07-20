import type { ReactNode } from 'react';

export interface AccordionSlotProps {
  root?: { className?: string };
  item?: { className?: string };
  header?: { className?: string };
  trigger?: { className?: string };
  content?: { className?: string };
  chevron?: { className?: string };
}

/**
 * Single accordion section — paired `{ value, header, content }`.
 * The `value` is the canonical id (used in `value` / `defaultValue`
 * to control which sections are expanded).
 */
export interface AccordionItem {
  value: string;
  /** Trigger label (clickable to expand / collapse). */
  header: ReactNode;
  /** Section body, revealed when this item is expanded. */
  content: ReactNode;
  /** Per-item disabled flag. */
  disabled?: boolean;
}

interface AccordionBaseProps {
  items: AccordionItem[];
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot overrides. */
  slotProps?: AccordionSlotProps;
}

/**
 * Single-mode props — at most one section open at a time.
 * `collapsible: true` (default) lets the user close the open
 * section by clicking it again.
 */
export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** @default true */
  collapsible?: boolean;
}

/**
 * Multiple-mode props — any number of sections open simultaneously.
 */
export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

/**
 * Props for `<Accordion>`.
 *
 * Built on `@radix-ui/react-accordion`. Discriminated by `type`:
 *  - `type="single"` (default) — `value` is `string`.
 *  - `type="multiple"` — `value` is `string[]`.
 */
export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Accordion?: {
      slotProps?: AccordionSlotProps;
    };
  }
}
