import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsTable,
  DocsTableHead,
  DocsTableBody,
  DocsTableCell,
  DocsTableHeaderCell,
} from '../shared';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * API Reference section for ConfirmDialog
 * Documents Provider, Hook, Options, and Result types
 *
 * ============================================================
 * LOCAL EXCEPTION: DO NOT MIGRATE TO DocsApiTable
 * ============================================================
 *
 * This component uses a COMPLEX HYBRID API documentation pattern:
 * - Multiple tables: Provider props, Hook API, Options, Result types
 * - 5-column schema: Prop | Type | Required | Default | Description
 * - Color-coded required fields with custom rendering
 * - Mixed imperative and declarative API documentation
 *
 * Justification for keeping local:
 * 1. Multi-table structure: 4 separate API tables
 * 2. Extended schema: 5 columns vs standard 4 columns
 * 3. Custom rendering: Color-coded required fields
 * 4. Extraction criteria failure: structurally incompatible with standard
 * 5. Creating DocsApiTable5Column would violate anti-variant policy
 *
 * DECISION: Permanent local exception (hardened 2026-03-28)
 *
 * See: .opencode/policies/docs-architecture.policies.md
 * See: .opencode/reports/docs-api-table-hardening-report.md
 * ============================================================
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
            mb: 2,
          }}
        >
          Context provider that enables useConfirm() hook. Wrap your app root or
          a subtree where you need confirmation dialogs.
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

      {/* useConfirm Hook */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
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
                {'(options: ConfirmOptions) => Promise<ConfirmResult>'}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: 13,
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
            mb: 2,
          }}
        >
          ConfirmOptions
        </Typography>
        <DocsTable>
          <DocsTableHead>
            <TableRow>
              <DocsTableHeaderCell>Prop</DocsTableHeaderCell>
              <DocsTableHeaderCell>Type</DocsTableHeaderCell>
              <DocsTableHeaderCell>Required</DocsTableHeaderCell>
              <DocsTableHeaderCell>Default</DocsTableHeaderCell>
              <DocsTableHeaderCell>Description</DocsTableHeaderCell>
            </TableRow>
          </DocsTableHead>
          <DocsTableBody>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                title
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                string
              </DocsTableCell>
              <TableCell
                sx={{
                  fontSize: 13,
                  color: isDark ? '#86efac' : '#16a34a',
                  fontWeight: 600,
                  borderBottom: isDark
                    ? '1px solid rgba(255,255,255,0.05)'
                    : '1px solid rgba(15,23,42,0.05)',
                }}
              >
                Yes
              </TableCell>
              <DocsTableCell mono fontSize={13} deemphasize>
                -
              </DocsTableCell>
              <DocsTableCell fontSize={13}>Dialog title</DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                description
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                string | ReactNode
              </DocsTableCell>
              <DocsTableCell fontSize={13} deemphasize>
                No
              </DocsTableCell>
              <DocsTableCell mono fontSize={13} deemphasize>
                -
              </DocsTableCell>
              <DocsTableCell fontSize={13}>Dialog body content</DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                confirmText
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                string
              </DocsTableCell>
              <DocsTableCell fontSize={13} deemphasize>
                No
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                'Confirm'
              </DocsTableCell>
              <DocsTableCell fontSize={13}>Confirm button label</DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                cancelText
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                string
              </DocsTableCell>
              <DocsTableCell fontSize={13} deemphasize>
                No
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                'Cancel'
              </DocsTableCell>
              <DocsTableCell fontSize={13}>Cancel button label</DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                confirmButtonProps
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                ButtonProps
              </DocsTableCell>
              <DocsTableCell fontSize={13} deemphasize>
                No
              </DocsTableCell>
              <DocsTableCell mono fontSize={13} deemphasize>
                -
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Confirm button customization (color, variant, icon)
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                cancelButtonProps
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                ButtonProps
              </DocsTableCell>
              <DocsTableCell fontSize={13} deemphasize>
                No
              </DocsTableCell>
              <DocsTableCell mono fontSize={13} deemphasize>
                -
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                Cancel button customization
              </DocsTableCell>
            </TableRow>
            <TableRow>
              <DocsTableCell mono fontSize={13}>
                dialogProps
              </DocsTableCell>
              <DocsTableCell mono fontSize={13}>
                DialogProps
              </DocsTableCell>
              <DocsTableCell fontSize={13} deemphasize>
                No
              </DocsTableCell>
              <DocsTableCell mono fontSize={13} deemphasize>
                -
              </DocsTableCell>
              <DocsTableCell fontSize={13}>
                MUI Dialog props (limited subset: maxWidth, fullWidth,
                fullScreen)
              </DocsTableCell>
            </TableRow>
          </DocsTableBody>
        </DocsTable>
      </Box>

      {/* ConfirmResult */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
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
            mb: 2,
          }}
        >
          Discriminated union that distinguishes between user actions and system
          behavior.
        </Typography>
        <DocsCodeBlock
          code={`type ConfirmResult =
  | { status: 'confirmed' }
  | {
      status: 'cancelled';
      reason: 'cancel-button' | 'backdrop' | 'escape-key' | 'provider-unmount';
    }
  | {
      status: 'blocked';
      reason: 'reentrant-call';
    };`}
          language="typescript"
        />
      </Box>
    </Stack>
  );
}
