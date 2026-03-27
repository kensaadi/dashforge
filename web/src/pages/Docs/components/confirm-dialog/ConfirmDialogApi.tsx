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
 * API Reference section for ConfirmDialog
 * Documents Provider, Hook, Options, and Result types
 */
export function ConfirmDialogApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={4}>
      {/* ConfirmDialogProvider */}
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
          ConfirmDialogProvider
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
          Context provider that enables useConfirm() hook. Wrap your app root or
          a subtree where you need confirmation dialogs.
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

      {/* useConfirm Hook */}
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
          useConfirm()
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
          Hook that returns the confirm function. Throws error if called outside
          ConfirmDialogProvider.
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
                {'(options: ConfirmOptions) => Promise<ConfirmResult>'}
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
              Imperative function that opens a confirmation dialog and returns a
              promise that resolves with the result.
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* ConfirmOptions */}
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
          ConfirmOptions
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
                  Required
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
                  title
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
                  string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark ? '#86efac' : '#16a34a',
                    fontWeight: 600,
                  }}
                >
                  Yes
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
                  Dialog title
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
                  description
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
                  string | ReactNode
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.50)',
                  }}
                >
                  No
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
                  Dialog body content
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
                  confirmText
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
                  string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.50)',
                  }}
                >
                  No
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
                  'Confirm'
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Confirm button label
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
                  cancelText
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
                  string
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.50)',
                  }}
                >
                  No
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
                  'Cancel'
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  Cancel button label
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
                  confirmButtonProps
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
                  ButtonProps
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.50)',
                  }}
                >
                  No
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
                  Confirm button customization (color, variant, icon)
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
                  cancelButtonProps
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
                  ButtonProps
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.50)',
                  }}
                >
                  No
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
                  Cancel button customization
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
                  dialogProps
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
                  DialogProps
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: 13,
                    color: isDark
                      ? 'rgba(255,255,255,0.50)'
                      : 'rgba(15,23,42,0.50)',
                  }}
                >
                  No
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
                  MUI Dialog props (limited subset: maxWidth, fullWidth,
                  fullScreen)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ConfirmResult */}
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
          ConfirmResult
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
          Discriminated union that distinguishes between user actions and system
          behavior.
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2.5,
            borderRadius: 1.5,
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: '"Fira Code", "SF Mono", Menlo, monospace',
            color: isDark ? '#e5e7eb' : '#1f2937',
            bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            overflowX: 'auto',
          }}
        >
          {`type ConfirmResult =
  | { status: 'confirmed' }
  | {
      status: 'cancelled';
      reason: 'cancel-button' | 'backdrop' | 'escape-key' | 'provider-unmount';
    }
  | {
      status: 'blocked';
      reason: 'reentrant-call';
    };`}
        </Box>
      </Box>
    </Stack>
  );
}
