import { DocsApiTable } from '../shared/DocsApiTable';

/**
 * BreadcrumbsApi displays the complete API reference for Breadcrumbs component
 * Documents all props with types and descriptions
 */
export function BreadcrumbsApi() {
  const props = [
    {
      name: 'pathname',
      type: 'string',
      required: true,
      description:
        'Current pathname used to determine the active breadcrumb item (router-agnostic)',
    },
    {
      name: 'items',
      type: 'BreadcrumbNode[]',
      required: false,
      description:
        'Controlled mode: explicitly provide breadcrumb items. Last item is treated as active.',
    },
    {
      name: 'tree',
      type: 'BreadcrumbNode[]',
      required: false,
      description:
        'Uncontrolled mode: provide navigation tree structure. Component automatically resolves breadcrumb chain from pathname.',
    },
    {
      name: 'home',
      type: 'BreadcrumbNode',
      required: false,
      default: '{ id: "home", label: "Home", href: "/" }',
      description:
        'Home breadcrumb node prepended when includeHome is true and active item is not home',
    },
    {
      name: 'includeHome',
      type: 'boolean',
      required: false,
      default: 'true',
      description:
        'Whether to automatically prepend home breadcrumb when not at root',
    },
    {
      name: 'LinkComponent',
      type: 'React.ElementType',
      required: false,
      default: '"a"',
      description:
        'Custom link component for router integration (e.g., React Router Link, Next.js Link)',
    },
    {
      name: 'getLinkProps',
      type: '(node: BreadcrumbNode) => LinkProps',
      required: false,
      description:
        'Function to customize props passed to LinkComponent (e.g., convert href to "to" for React Router)',
    },
    {
      name: 'getLabel',
      type: '(node: BreadcrumbNode) => React.ReactNode',
      required: false,
      description:
        'Label resolver function for i18n or custom rendering. If omitted, uses node.label directly.',
    },
    {
      name: 'separator',
      type: 'React.ReactNode',
      required: false,
      default: '"/"',
      description:
        'Separator displayed between breadcrumb items (can be text, icon, or any React node)',
    },
    {
      name: 'maxItems',
      type: 'number',
      required: false,
      description:
        'Maximum number of breadcrumbs to display. Middle items are collapsed with ellipsis.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      required: false,
      description: 'MUI system style overrides for the root Breadcrumbs',
    },
    {
      name: 'slotProps',
      type: 'object',
      required: false,
      description:
        'Fine-grained styling overrides: { link?: { sx }, active?: { sx } }',
    },
  ];

  const types = [
    {
      name: 'BreadcrumbNode',
      definition: `{
  id: string;
  label: string | React.ReactNode;
  href?: string;
  match?: 'exact' | 'prefix';
  disabled?: boolean;
  children?: BreadcrumbNode[];
  meta?: unknown;
}`,
    },
  ];

  return (
    <>
      <DocsApiTable props={props} />

      {/* Type Definitions */}
      <div
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 8,
          background: 'rgba(59,130,246,0.05)',
          border: '1px solid rgba(59,130,246,0.12)',
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#2563eb',
            marginBottom: 12,
          }}
        >
          Type Definitions
        </div>
        {types.map((type) => (
          <div key={type.name} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'monospace',
                marginBottom: 8,
              }}
            >
              {type.name}
            </div>
            <pre
              style={{
                margin: 0,
                padding: 12,
                borderRadius: 6,
                background: 'rgba(0,0,0,0.03)',
                fontSize: 12,
                fontFamily: 'monospace',
                lineHeight: 1.6,
                overflow: 'auto',
              }}
            >
              {type.definition}
            </pre>
          </div>
        ))}
      </div>
    </>
  );
}
