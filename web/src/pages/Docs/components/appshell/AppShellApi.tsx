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
 * API Reference section for AppShell
 * Documents AppShell component props
 *
 * ============================================================
 * LOCAL EXCEPTION: DO NOT MIGRATE TO DocsApiTable
 * ============================================================
 *
 * This component uses a STRUCTURALLY DIFFERENT table schema:
 * - Columns: Prop | Type | **Required** | Description
 * - Standard DocsApiTable uses: Prop | Type | **Default** | Description
 *
 * Justification for keeping local:
 * 1. Column schema difference: "Required" (Yes/No) vs "Default" (value)
 * 2. Data structure mismatch: requires `required: boolean` field
 * 3. Extraction criteria failure: zero variability requirement fails
 * 4. Creating DocsApiTableRequired violates anti-variant policy
 *
 * DECISION: Permanent local exception (hardened 2026-03-28)
 *
 * See: .opencode/policies/docs-architecture.policies.md
 * See: .opencode/reports/docs-api-table-hardening-report.md
 * ============================================================
 */
export function AppShellApi() {
  const props = [
    {
      name: 'items',
      type: 'LeftNavItem[]',
      required: true,
      description: 'Navigation items for LeftNav',
    },
    {
      name: 'renderLink',
      type: 'RenderLinkFn',
      required: false,
      description: 'Router-agnostic link renderer',
    },
    {
      name: 'isActive',
      type: 'IsActiveFn',
      required: false,
      description: 'Callback to determine if item is active',
    },
    {
      name: 'navOpen',
      type: 'boolean',
      required: false,
      description: 'Controlled drawer open state',
    },
    {
      name: 'defaultNavOpen',
      type: 'boolean',
      required: false,
      description: 'Default drawer open state (default: true)',
    },
    {
      name: 'onNavOpenChange',
      type: '(open: boolean) => void',
      required: false,
      description: 'Callback when drawer state changes',
    },
    {
      name: 'navWidthExpanded',
      type: 'number',
      required: false,
      description: 'Width when expanded (default: 280)',
    },
    {
      name: 'navWidthCollapsed',
      type: 'number',
      required: false,
      description: 'Width when collapsed (default: 64)',
    },
    {
      name: 'breakpoint',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      required: false,
      description: 'Mobile breakpoint (default: lg)',
    },
    {
      name: 'topBarLeft',
      type: 'ReactNode',
      required: false,
      description: 'Left content slot for TopBar',
    },
    {
      name: 'topBarCenter',
      type: 'ReactNode',
      required: false,
      description: 'Center content slot for TopBar',
    },
    {
      name: 'topBarRight',
      type: 'ReactNode',
      required: false,
      description: 'Right content slot for TopBar',
    },
    {
      name: 'topBarPosition',
      type: "AppBarProps['position']",
      required: false,
      description: "TopBar position (default: 'fixed')",
    },
    {
      name: 'leftNavHeader',
      type: 'ReactNode',
      required: false,
      description: 'Header slot for LeftNav',
    },
    {
      name: 'leftNavFooter',
      type: 'ReactNode',
      required: false,
      description: 'Footer slot for LeftNav',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Main content to render',
    },
    {
      name: 'mainSx',
      type: 'SxProps<Theme>',
      required: false,
      description: 'Optional sx props for main container',
    },
  ];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mb: 2,
          }}
        >
          AppShell Props
        </Typography>
        <DocsTable>
          <DocsTableHead>
            <TableRow>
              <DocsTableHeaderCell>Prop</DocsTableHeaderCell>
              <DocsTableHeaderCell>Type</DocsTableHeaderCell>
              <DocsTableHeaderCell>Required</DocsTableHeaderCell>
              <DocsTableHeaderCell>Description</DocsTableHeaderCell>
            </TableRow>
          </DocsTableHead>
          <DocsTableBody>
            {props.map((prop) => (
              <TableRow key={prop.name}>
                <DocsTableCell mono fontSize={13}>
                  {prop.name}
                </DocsTableCell>
                <DocsTableCell mono fontSize={12}>
                  {prop.type}
                </DocsTableCell>
                <DocsTableCell fontSize={13}>
                  {prop.required ? 'Yes' : 'No'}
                </DocsTableCell>
                <DocsTableCell fontSize={13}>{prop.description}</DocsTableCell>
              </TableRow>
            ))}
          </DocsTableBody>
        </DocsTable>
      </Box>
    </Stack>
  );
}
