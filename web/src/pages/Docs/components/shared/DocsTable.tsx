import { type ReactNode } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { type TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * DocsTable - Low-Level Visual Primitive for Documentation Tables
 *
 * ARCHITECTURE STATUS: VISUAL PRIMITIVE (v1.0)
 * This is a LOW-LEVEL visual shell component that standardizes table appearance only.
 *
 * ============================================================
 * PURPOSE:
 * ============================================================
 * Unify visual grammar across all docs tables while allowing structural variation.
 *
 * Schema may vary:
 * - Prop | Type | Default | Description (DocsApiTable)
 * - Prop | Type | Required | Description (AppShell)
 * - Method | Signature | Description (Snackbar)
 * - Prop | Type | Required | Default | Description (ConfirmDialog)
 *
 * Visual system must be unified:
 * - Container treatment
 * - Border rhythm
 * - Header styling
 * - Body cell treatment
 * - Typography feel
 * - Overall quality
 *
 * ============================================================
 * VISUAL STANDARD: TextField API Section
 * ============================================================
 * - Container: Paper with rgba(0,0,0,0.2) dark / rgba(255,255,255,0.8) light
 * - Border: 1px solid rgba(255,255,255,0.08) dark / rgba(15,23,42,0.08) light
 * - Header: fontWeight 700, no background, no uppercase
 * - Body borders: rgba(255,255,255,0.05) dark / rgba(15,23,42,0.05) light
 * - Monospace: prop names, types (technical content)
 * - Sans-serif: descriptions (readability)
 *
 * ============================================================
 * USAGE:
 * ============================================================
 * ```tsx
 * <DocsTable>
 *   <DocsTableHead>
 *     <TableRow>
 *       <DocsTableHeaderCell>Prop</DocsTableHeaderCell>
 *       <DocsTableHeaderCell>Type</DocsTableHeaderCell>
 *       <DocsTableHeaderCell>Description</DocsTableHeaderCell>
 *     </TableRow>
 *   </DocsTableHead>
 *   <DocsTableBody>
 *     <TableRow>
 *       <DocsTableCell mono>value</DocsTableCell>
 *       <DocsTableCell mono>string</DocsTableCell>
 *       <DocsTableCell>The controlled value</DocsTableCell>
 *     </TableRow>
 *   </DocsTableBody>
 * </DocsTable>
 * ```
 *
 * ============================================================
 * ARCHITECTURAL RULES:
 * ============================================================
 * ✅ DO:
 * - Use for all docs tables
 * - Preserve structural schema differences
 * - Keep content rendering logic local
 *
 * ❌ DO NOT:
 * - Add variant props
 * - Add column configuration
 * - Add render callbacks
 * - Add conditional styling logic
 * - Turn this into a data table framework
 *
 * ============================================================
 */

interface DocsTableProps {
  children: ReactNode;
}

/**
 * DocsTable - Visual container for documentation tables
 * Provides standardized Paper container with consistent borders and background
 */
export function DocsTable({ children }: DocsTableProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <TableContainer
      component={Box}
      sx={{
        bgcolor: isDark ? 'rgba(17,24,39,0.60)' : 'rgba(255,255,255,0.8)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Table>{children}</Table>
    </TableContainer>
  );
}

/**
 * DocsTableHead - Visual wrapper for table headers
 * Re-exports MUI TableHead with no additional styling
 */
export function DocsTableHead({ children }: { children: ReactNode }) {
  return <TableHead>{children}</TableHead>;
}

/**
 * DocsTableBody - Visual wrapper for table body
 * Re-exports MUI TableBody with no additional styling
 */
export function DocsTableBody({ children }: { children: ReactNode }) {
  return <TableBody>{children}</TableBody>;
}

interface DocsTableCellProps extends Omit<TableCellProps, 'sx'> {
  children: ReactNode;
  /**
   * Use monospace font for technical content (prop names, types)
   * Use sans-serif (default) for descriptions
   */
  mono?: boolean;
  /**
   * Font size override (use sparingly)
   * - 13: Default for prop names and descriptions
   * - 12: Default for types and technical details
   */
  fontSize?: 12 | 13;
  /**
   * Reduce opacity for de-emphasized content (e.g., default values)
   */
  deemphasize?: boolean;
}

/**
 * DocsTableCell - Visual wrapper for table body cells
 * Provides standardized typography and borders
 */
export function DocsTableCell({
  children,
  mono = false,
  fontSize = 13,
  deemphasize = false,
  ...props
}: DocsTableCellProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  // Calculate opacity based on mono and deemphasize
  const getOpacity = () => {
    if (deemphasize) return '0.65';
    if (mono) return '0.85';
    return '0.75';
  };

  return (
    <TableCell
      {...props}
      sx={{
        fontFamily: mono ? 'monospace' : undefined,
        fontSize,
        color: isDark
          ? `rgba(255,255,255,${getOpacity()})`
          : `rgba(15,23,42,${getOpacity()})`,
        bgcolor: 'transparent',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.05)'
          : '1px solid rgba(15,23,42,0.05)',
      }}
    >
      {children}
    </TableCell>
  );
}

interface DocsTableHeaderCellProps {
  children: ReactNode;
}

/**
 * DocsTableHeaderCell - Visual wrapper for table header cells
 * Provides standardized header typography and borders (TextField standard)
 */
export function DocsTableHeaderCell({ children }: DocsTableHeaderCellProps) {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <TableCell
      sx={{
        fontWeight: 700,
        color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
        bgcolor: 'transparent',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      {children}
    </TableCell>
  );
}
