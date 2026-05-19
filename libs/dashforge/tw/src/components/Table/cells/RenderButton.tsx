import type { MouseEvent, ReactNode } from 'react';
import { Button } from '../../Button/Button.js';
import type { ButtonProps } from '../../Button/button.types.js';

export interface RenderButtonProps
  extends Pick<ButtonProps, 'variant' | 'color' | 'size' | 'disabled' | 'access'> {
  label: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Inline button cell renderer. Thin wrapper over `<Button>` with
 * the size narrowed to `sm` by default (table density expects compact
 * controls).
 */
export function RenderButton(props: RenderButtonProps) {
  const { label, onClick, variant = 'ghost', size = 'sm', ...rest } = props;
  return (
    <Button variant={variant} size={size} onClick={onClick} {...rest}>
      {label}
    </Button>
  );
}
