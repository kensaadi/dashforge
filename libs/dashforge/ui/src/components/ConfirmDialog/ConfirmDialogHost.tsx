import MuiDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import type { ConfirmOptions, ConfirmResult } from './types';

/**
 * Internal host component for rendering the confirmation dialog.
 * NOT exported - implementation detail of ConfirmDialogProvider.
 *
 * Responsibilities:
 * - Renders MUI Dialog based on options
 * - Handles description rendering (string vs ReactNode)
 * - Forwards button props and dialog props
 * - Calls onClose with semantic ConfirmResult
 */
interface ConfirmDialogHostProps {
  options: ConfirmOptions | null;
  onClose: (result: ConfirmResult) => void;
}

export function ConfirmDialogHost({
  options,
  onClose,
}: ConfirmDialogHostProps) {
  const open = options !== null;

  if (!options) {
    return null;
  }

  const handleBackdropClick = () => {
    onClose({ status: 'cancelled', reason: 'backdrop' });
  };

  const handleEscapeKeyDown = () => {
    onClose({ status: 'cancelled', reason: 'escape-key' });
  };

  const handleConfirm = () => {
    onClose({ status: 'confirmed' });
  };

  const handleCancel = () => {
    onClose({ status: 'cancelled', reason: 'cancel-button' });
  };

  return (
    <MuiDialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') {
          handleBackdropClick();
        } else if (reason === 'escapeKeyDown') {
          handleEscapeKeyDown();
        }
      }}
      maxWidth={options.dialogProps?.maxWidth ?? 'sm'}
      fullWidth={options.dialogProps?.fullWidth ?? true}
      fullScreen={options.dialogProps?.fullScreen}
    >
      <DialogTitle>{options.title}</DialogTitle>

      {options.description && (
        <DialogContent>
          {typeof options.description === 'string' ? (
            <DialogContentText>{options.description}</DialogContentText>
          ) : (
            options.description
          )}
        </DialogContent>
      )}

      <DialogActions>
        <Button
          onClick={handleCancel}
          color={options.cancelButtonProps?.color}
          variant={options.cancelButtonProps?.variant}
          startIcon={options.cancelButtonProps?.startIcon}
        >
          {options.cancelText ?? 'Cancel'}
        </Button>
        <Button
          onClick={handleConfirm}
          color={options.confirmButtonProps?.color ?? 'primary'}
          variant={options.confirmButtonProps?.variant ?? 'contained'}
          startIcon={options.confirmButtonProps?.startIcon}
        >
          {options.confirmText ?? 'Confirm'}
        </Button>
      </DialogActions>
    </MuiDialog>
  );
}
