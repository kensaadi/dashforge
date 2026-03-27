import Box from '@mui/material/Box';
import type { SnackbarQueueItem } from './types';
import { SnackbarItem } from './SnackbarItem';

interface SnackbarHostProps {
  queue: SnackbarQueueItem[];
  onExited: (id: string) => void;
  onClose: (id: string) => void;
}

/**
 * SnackbarHost renders the stack of visible and exiting snackbars
 * Internal component - NOT exported
 */
export function SnackbarHost({ queue, onExited, onClose }: SnackbarHostProps) {
  // Render only visible and exiting items
  const renderingItems = queue.filter(
    (item) => item.status === 'visible' || item.status === 'exiting'
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pointerEvents: 'none',
      }}
    >
      {renderingItems.map((item) => (
        <SnackbarItem
          key={item.id}
          item={item}
          onClose={() => onClose(item.id)}
          onExited={() => onExited(item.id)}
        />
      ))}
    </Box>
  );
}
