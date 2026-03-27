import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * API Reference section for Snackbar
 * Documents Provider, Hook, Options, and API methods
 */
export function SnackbarApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4}>
      {/* SnackbarProvider */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            mb: 2,
          }}
        >
          SnackbarProvider
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            mb: 2,
          }}
        >
          Enables useSnackbar() hook. Wrap your app root or subtree.
        </Typography>
        <TableContainer
          sx={{
            borderRadius: 1.5,
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Prop
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  children
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  ReactNode
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  App content to wrap
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* useSnackbar Hook */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            mb: 2,
          }}
        >
          useSnackbar()
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: 1.6,
            color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            mb: 2,
          }}
        >
          Returns the snackbar API. Must be called inside SnackbarProvider.
        </Typography>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                  mb: 0.5,
                }}
              >
                Returns
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontFamily: 'monospace',
                  color: isDark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(15,23,42,0.85)',
                }}
              >
                SnackbarAPI
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: 13,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
              }}
            >
              Methods to enqueue, close, and manage notifications.
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* SnackbarAPI */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            mb: 2,
          }}
        >
          SnackbarAPI
        </Typography>
        <TableContainer
          sx={{
            borderRadius: 1.5,
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Method
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Signature
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  enqueue
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  (message, options?) {'=>'} string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Add notification to queue, returns unique ID
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  success
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  (message, options?) {'=>'} string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Enqueue success variant notification
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  error
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  (message, options?) {'=>'} string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Enqueue error variant notification
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  warning
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  (message, options?) {'=>'} string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Enqueue warning variant notification
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  info
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  (message, options?) {'=>'} string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Enqueue info variant notification
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  close
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  (id: string) {'=>'} void
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Close specific notification by ID
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  closeAll
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  () {'=>'} void
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Close all visible notifications
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* SnackbarOptions */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            mb: 2,
          }}
        >
          SnackbarOptions
        </Typography>
        <TableContainer
          sx={{
            borderRadius: 1.5,
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Option
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Default
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  variant
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  'success' | 'error' | 'warning' | 'info' | 'default'
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  'default'
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Visual variant for the notification
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  autoHideDuration
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  number | null
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  5000
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Auto-hide duration in ms. Set to null for persistent
                  notification
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  action
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  ReactNode
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.50)',
                  }}
                >
                  -
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Optional action element (e.g., undo button)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(15,23,42,0.85)',
                  }}
                >
                  preventDismiss
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  boolean
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  false
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Prevent dismissal by clicking close button
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}
