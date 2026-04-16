import type { SxProps, Theme } from '@mui/material';

/**
 * Get slot styling based on state
 */
export function getSlotStyles(
  isActive: boolean,
  hasError: boolean,
  isDisabled: boolean
): SxProps<Theme> {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '56px',
    fontSize: '1.5rem',
    fontWeight: 500,
    border: '2px solid',
    borderRadius: '8px',
    borderColor: hasError
      ? 'error.main'
      : isActive
      ? 'primary.main'
      : 'divider',
    backgroundColor: isDisabled
      ? 'action.disabledBackground'
      : 'background.paper',
    color: isDisabled ? 'text.disabled' : 'text.primary',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    '&:hover': isDisabled
      ? {}
      : {
          borderColor: hasError ? 'error.dark' : 'primary.main',
        },
  };
}

/**
 * Get container layout styles
 */
export function getContainerStyles(fullWidth?: boolean): SxProps<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    width: fullWidth ? '100%' : 'auto',
  };
}

/**
 * Get slots container styles
 */
export function getSlotsContainerStyles(): SxProps<Theme> {
  return {
    display: 'flex',
    gap: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  };
}
