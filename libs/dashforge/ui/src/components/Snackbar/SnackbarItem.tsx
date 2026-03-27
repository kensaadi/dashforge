import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import type { SnackbarQueueItem } from './types';

interface SnackbarItemProps {
  item: SnackbarQueueItem;
  onClose: () => void;
  onExited: () => void;
}

/**
 * SnackbarItem renders a single snackbar with transitions
 * Internal component - NOT exported
 */
export function SnackbarItem({ item, onClose, onExited }: SnackbarItemProps) {
  const isOpen = item.status === 'visible';
  const isDefault = item.variant === 'default';

  return (
    <Snackbar
      open={isOpen}
      TransitionComponent={Slide}
      slotProps={{
        transition: {
          direction: 'left',
          onExited,
        },
      }}
      sx={{ position: 'static', pointerEvents: 'auto' }}
    >
      {isDefault ? (
        <SnackbarContent
          message={item.message}
          action={
            <>
              {item.options.action}
              {!item.options.preventDismiss && (
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={onClose}
                  sx={{ ml: 1 }}
                >
                  ×
                </IconButton>
              )}
            </>
          }
        />
      ) : (
        <Alert
          severity={item.variant as 'success' | 'error' | 'warning' | 'info'}
          onClose={item.options.preventDismiss ? undefined : onClose}
          action={item.options.action}
          variant="filled"
        >
          {item.message}
        </Alert>
      )}
    </Snackbar>
  );
}
