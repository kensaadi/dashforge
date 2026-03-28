import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import {
  DocsTable,
  DocsTableHead,
  DocsTableBody,
  DocsTableCell,
  DocsTableHeaderCell,
} from '../shared';

/**
 * API Reference section for Snackbar
 * Documents Provider, Hook, Options, and API methods
 *
 * ============================================================
 * LOCAL EXCEPTION: DO NOT MIGRATE TO DocsApiTable
 * ============================================================
 *
 * This component uses a STRUCTURALLY DIFFERENT API documentation pattern:
 * - Multiple tables: Provider props, Hook API, Method signatures, Options
 * - Different column schemas: Method | Signature vs Prop | Type | Default
 * - Imperative API documentation (show/hide/dismiss methods)
 *
 * Justification for keeping local:
 * 1. Multi-table structure: 4 separate API tables
 * 2. Mixed schemas: Methods vs Props require different columns
 * 3. Extraction criteria failure: structurally incompatible with standard
 * 4. Creating multiple variants would violate anti-variant policy
 *
 * DECISION: Permanent local exception (hardened 2026-03-28)
 *
 * See: .opencode/policies/docs-architecture.policies.md
 * See: .opencode/reports/docs-api-table-hardening-report.md
 * ============================================================
 */
export function SnackbarApi() {
  return (
    <Stack spacing={4}>
      {/* SnackbarProvider */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
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
            mb: 2,
          }}
        >
          Enables useSnackbar() hook. Wrap your app root or subtree.
        </Typography>
        <DocsTable>
          <DocsTableHead>
            <TableRow>
              <DocsTableHeaderCell>Prop</DocsTableHeaderCell>
              <DocsTableHeaderCell>Type</DocsTableHeaderCell>
              <DocsTableHeaderCell>Description</DocsTableHeaderCell>
            </TableRow>
          </DocsTableHead>
          <DocsTableBody>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                children
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                ReactNode
              </DocsTableCell>
              <DocsTableCell fontSize={13}>App content to wrap</DocsTableCell>
            </TableRow>
          </DocsTableBody>
        </DocsTable>
      </Box>

      {/* useSnackbar Hook */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
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
            mb: 2,
          }}
        >
          Returns the snackbar API. Must be called inside SnackbarProvider.
        </Typography>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 1.5,
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Returns
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                SnackbarAPI
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: 13,
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
            mb: 2,
          }}
        >
          SnackbarAPI
        </Typography>
        <DocsTable>
          <DocsTableHead>
            <TableRow>
              <DocsTableHeaderCell>Method</DocsTableHeaderCell>
              <DocsTableHeaderCell>Signature</DocsTableHeaderCell>
              <DocsTableHeaderCell>Description</DocsTableHeaderCell>
            </TableRow>
          </DocsTableHead>
          <DocsTableBody>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                enqueue
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                (message, options?) {'=>'} string
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Add notification to queue, returns unique ID
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                success
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                (message, options?) {'=>'} string
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Enqueue success variant notification
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                error
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                (message, options?) {'=>'} string
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Enqueue error variant notification
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                warning
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                (message, options?) {'=>'} string
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Enqueue warning variant notification
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                info
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                (message, options?) {'=>'} string
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Enqueue info variant notification
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                close
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                (id: string) {'=>'} void
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Close specific notification by ID
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                closeAll
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                () {'=>'} void
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Close all visible notifications
              </DocsTableCell>
            </TableRow>
          </DocsTableBody>
        </DocsTable>
      </Box>

      {/* SnackbarOptions */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mb: 2,
          }}
        >
          SnackbarOptions
        </Typography>
        <DocsTable>
          <DocsTableHead>
            <TableRow>
              <DocsTableHeaderCell>Option</DocsTableHeaderCell>
              <DocsTableHeaderCell>Type</DocsTableHeaderCell>
              <DocsTableHeaderCell>Default</DocsTableHeaderCell>
              <DocsTableHeaderCell>Description</DocsTableHeaderCell>
            </TableRow>
          </DocsTableHead>
          <DocsTableBody>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                variant
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                'success' | 'error' | 'warning' | 'info' | 'default'
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                'default'
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Visual variant for the notification
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                autoHideDuration
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                number | null
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                5000
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Auto-hide duration in ms. Set to null for persistent
                notification
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                action
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                ReactNode
              </DocsTableCell>
              <DocsTableCell mono fontSize={13} deemphasize>
                -
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Optional action element (e.g., undo button)
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                preventDismiss
              </DocsTableCell>
              <DocsTableCell mono fontSize={12}>
                boolean
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                false
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Prevent dismissal by clicking close button
              </DocsTableCell>
            </TableRow>
          </DocsTableBody>
        </DocsTable>
      </Box>
    </Stack>
  );
}
