import { DocsApiTable } from '../shared/DocsApiTable';

/**
 * TopBarApi displays the complete API reference for TopBar component
 * Documents all props with types and descriptions
 */
export function TopBarApi() {
  const props = [
    {
      name: 'navOpen',
      type: 'boolean',
      required: true,
      description:
        'Whether the LeftNav is open/expanded. Required for layout coordination.',
    },
    {
      name: 'navWidthExpanded',
      type: 'number',
      required: true,
      description:
        'Width in pixels of LeftNav when expanded. Used to compute desktop margin/width.',
    },
    {
      name: 'navWidthCollapsed',
      type: 'number',
      required: true,
      description:
        'Width in pixels of LeftNav when collapsed. Used to compute desktop margin/width.',
    },
    {
      name: 'breakpoint',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      required: false,
      default: "'lg'",
      description:
        'Breakpoint below which mobile behavior is triggered. On mobile, TopBar ignores nav state and spans full width.',
    },
    {
      name: 'position',
      type: "'fixed' | 'absolute' | 'relative' | 'static' | 'sticky'",
      required: false,
      default: "'fixed'",
      description:
        'AppBar positioning strategy (same as MUI AppBar position prop)',
    },
    {
      name: 'left',
      type: 'React.ReactNode',
      required: false,
      description:
        'Optional left-aligned content slot (e.g., logo, menu toggle, title)',
    },
    {
      name: 'center',
      type: 'React.ReactNode',
      required: false,
      description:
        'Optional center-aligned content slot (e.g., search bar, navigation tabs)',
    },
    {
      name: 'right',
      type: 'React.ReactNode',
      required: false,
      description:
        'Optional right-aligned content slot (e.g., user menu, notifications, actions)',
    },
    {
      name: 'toolbarMinHeight',
      type: '{ xs: number; md: number }',
      required: false,
      default: '{ xs: 68, md: 76 }',
      description:
        'Toolbar minimum height (responsive). Controls the vertical height of the TopBar.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      required: false,
      description: 'MUI system style overrides for the root AppBar',
    },
    {
      name: 'className',
      type: 'string',
      required: false,
      description: 'CSS class name for custom styling',
    },
    {
      name: '...appBarProps',
      type: 'AppBarProps',
      required: false,
      description:
        'All other MUI AppBar props are forwarded to the underlying AppBar component',
    },
  ];

  const types = [
    {
      name: 'TopBarProps',
      definition: `interface TopBarProps extends Omit<AppBarProps, 'position'> {
  navOpen: boolean;
  navWidthExpanded: number;
  navWidthCollapsed: number;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  position?: AppBarProps['position'];
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  toolbarMinHeight?: { xs: number; md: number };
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
