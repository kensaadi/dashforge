import TableRow from '@mui/material/TableRow';
import {
  DocsTable,
  DocsTableHead,
  DocsTableBody,
  DocsTableCell,
  DocsTableHeaderCell,
} from './DocsTable';

/**
 * Data structure for component API documentation
 * Based on TextField reference implementation
 */
export interface ApiPropDefinition {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface DocsApiTableProps {
  /** Array of prop definitions to display in the table */
  props: ApiPropDefinition[];
}

/**
 * DocsApiTable - Fixed Primitive for Component API Tables
 *
 * ARCHITECTURE STATUS: HARDENED (v1.0)
 * This component is intentionally FIXED and NON-EXTENSIBLE.
 *
 * ============================================================
 * FORBIDDEN EXTENSIONS (DO NOT ADD):
 * ============================================================
 * ❌ NO variant props (variant, mode, theme, schema, etc.)
 * ❌ NO column customization (columns, showRequired, hideDefault, etc.)
 * ❌ NO rendering callbacks (renderCell, renderHeader, etc.)
 * ❌ NO conditional logic (showActions, dismissible, etc.)
 * ❌ NO size props (size, compact, dense, etc.)
 * ❌ NO color/theme props (color, themeColor, purple, etc.)
 *
 * If you need different table behavior, create a NEW component
 * or keep the table implementation LOCAL in your docs file.
 *
 * Do NOT create:
 * - DocsApiTableRequired
 * - DocsApiTablePurple
 * - DocsApiTableWithVariant
 * - DocsApiTable + any prop that changes structure/styling
 *
 * ============================================================
 * USAGE GUIDELINES:
 * ============================================================
 *
 * ✅ USE DocsApiTable when:
 * - Component has standard form-field-like API
 * - You need: Prop | Type | Default | Description columns
 * - Visual consistency with TextField/NumberField/Autocomplete is desired
 *
 * ❌ KEEP TABLE LOCAL when:
 * - Component needs "Required" column instead of "Default"
 * - Component needs custom theming (purple, blue, etc.)
 * - Component has multiple API tables (Provider/Hook/Methods/Options)
 * - Component has 5+ columns or non-standard schema
 * - Visual differentiation is architecturally important
 *
 * ============================================================
 * VISUAL STANDARD: TextField API Section
 * ============================================================
 * - 4-column layout: Prop | Type | Default | Description
 * - Monospace font for technical content (prop names, types)
 * - Sans-serif for descriptions (readability)
 * - Subtle borders and consistent spacing
 * - Theme-aware colors (dark/light mode)
 * - Clean, professional styling
 *
 * ============================================================
 * EDITORIAL STANDARDS:
 * ============================================================
 * - Use "-" (single hyphen) for missing defaultValue
 * - Do NOT use "—" (em dash) or empty string
 * - Keep descriptions concise and technical
 * - Prop names in monospace
 * - Type signatures in monospace
 *
 * ============================================================
 * EXAMPLES:
 * ============================================================
 *
 * @example Basic Usage
 * ```tsx
 * import { DocsApiTable, type ApiPropDefinition } from '../shared';
 *
 * const props: ApiPropDefinition[] = [
 *   {
 *     name: 'value',
 *     type: 'string',
 *     defaultValue: undefined, // Will display as "-"
 *     description: 'The controlled value of the input'
 *   },
 *   {
 *     name: 'disabled',
 *     type: 'boolean',
 *     defaultValue: 'false',
 *     description: 'If true, the input is disabled'
 *   }
 * ];
 *
 * export function MyComponentApi() {
 *   return <DocsApiTable props={props} />;
 * }
 * ```
 *
 * @example With Additional Context (TextField pattern)
 * ```tsx
 * export function MyComponentApi() {
 *   const dashTheme = useDashTheme();
 *   const isDark = dashTheme.meta.mode === 'dark';
 *
 *   return (
 *     <Stack spacing={2}>
 *       <Typography variant="body2" sx={{...}}>
 *         <strong>Context note:</strong> Additional context about props
 *       </Typography>
 *       <DocsApiTable props={props} />
 *     </Stack>
 *   );
 * }
 * ```
 *
 * ============================================================
 * POLICY COMPLIANCE:
 * ============================================================
 * This component complies with:
 * - .opencode/policies/docs-architecture.policies.md
 * - Extraction criteria: 3+ identical usages, zero variability
 * - Single responsibility: Render standard 4-column API table
 * - Stable contract: ApiPropDefinition interface is fixed
 * - No flags: Zero conditional rendering logic
 *
 * Reference implementations:
 * - web/src/pages/Docs/components/text-field/TextFieldApi.tsx
 * - web/src/pages/Docs/components/number-field/NumberFieldApi.tsx
 * - web/src/pages/Docs/components/autocomplete/AutocompleteApi.tsx
 *
 * Justified local exceptions (do NOT migrate):
 * - Select: Intentional purple theme differentiation
 * - AppShell: Required column instead of Default column
 * - Snackbar: Multi-table imperative API (4 separate tables)
 * - ConfirmDialog: Complex hybrid (4 tables, 5 columns)
 *
 * ============================================================
 */
export function DocsApiTable({ props }: DocsApiTableProps) {
  return (
    <DocsTable>
      <DocsTableHead>
        <TableRow>
          <DocsTableHeaderCell>Prop</DocsTableHeaderCell>
          <DocsTableHeaderCell>Type</DocsTableHeaderCell>
          <DocsTableHeaderCell>Default</DocsTableHeaderCell>
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
            <DocsTableCell mono fontSize={12} deemphasize>
              {prop.defaultValue || '-'}
            </DocsTableCell>
            <DocsTableCell fontSize={13}>{prop.description}</DocsTableCell>
          </TableRow>
        ))}
      </DocsTableBody>
    </DocsTable>
  );
}
