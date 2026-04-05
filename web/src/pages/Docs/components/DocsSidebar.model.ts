/**
 * Docs sidebar navigation tree structure with explicit three-level hierarchy:
 * 1. Group - static heading (not collapsible)
 * 2. SubGroup - collapsible section with child links
 * 3. LinkItem - leaf navigation item
 */

/**
 * Leaf navigation item (level 3)
 */
export interface DocsSidebarLinkItem {
  type: 'link';
  label: string;
  path: string;
}

/**
 * Collapsible sub-group (level 2)
 */
export interface DocsSidebarSubGroup {
  type: 'subgroup';
  label: string;
  children: DocsSidebarLinkItem[];
}

/**
 * Navigation item - either a direct link or a sub-group
 */
export type DocsSidebarItem = DocsSidebarLinkItem | DocsSidebarSubGroup;

/**
 * Top-level group (level 1) - static heading
 */
export interface DocsSidebarGroup {
  title: string;
  items: DocsSidebarItem[];
}

/**
 * Complete sidebar navigation structure
 */
export const docsSidebarTree: DocsSidebarGroup[] = [
  {
    title: 'Getting Started',
    items: [
      {
        type: 'link',
        label: 'Overview',
        path: '/docs/getting-started/overview',
      },
      {
        type: 'link',
        label: 'Installation',
        path: '/docs/getting-started/installation',
      },
      {
        type: 'link',
        label: 'Usage',
        path: '/docs/getting-started/usage',
      },
      {
        type: 'link',
        label: 'Project Structure',
        path: '/docs/getting-started/project-structure',
      },
      {
        type: 'link',
        label: 'Why Dashforge',
        path: '/docs/getting-started/why-dashforge',
      },
    ],
  },
  {
    title: 'Core Concepts',
    items: [],
  },
  {
    title: 'UI Components',
    items: [
      {
        type: 'subgroup',
        label: 'Input',
        children: [
          {
            type: 'link',
            label: 'TextField',
            path: '/docs/components/text-field',
          },
          {
            type: 'link',
            label: 'Textarea',
            path: '/docs/components/textarea',
          },
          {
            type: 'link',
            label: 'NumberField',
            path: '/docs/components/number-field',
          },
          {
            type: 'link',
            label: 'Select',
            path: '/docs/components/select',
          },
          {
            type: 'link',
            label: 'Autocomplete',
            path: '/docs/components/autocomplete',
          },
          {
            type: 'link',
            label: 'Checkbox',
            path: '/docs/components/checkbox',
          },
          {
            type: 'link',
            label: 'RadioGroup',
            path: '/docs/components/radio-group',
          },
          {
            type: 'link',
            label: 'Switch',
            path: '/docs/components/switch',
          },
          {
            type: 'link',
            label: 'DateTimePicker',
            path: '/docs/components/date-time-picker',
          },
        ],
      },
      {
        type: 'subgroup',
        label: 'Layout',
        children: [
          {
            type: 'link',
            label: 'AppShell',
            path: '/docs/components/appshell',
          },
        ],
      },
      {
        type: 'subgroup',
        label: 'Navigation',
        children: [
          {
            type: 'link',
            label: 'Breadcrumbs',
            path: '/docs/components/breadcrumbs',
          },
          {
            type: 'link',
            label: 'TopBar',
            path: '/docs/components/top-bar',
          },
        ],
      },
      {
        type: 'subgroup',
        label: 'Utilities',
        children: [
          {
            type: 'link',
            label: 'ConfirmDialog',
            path: '/docs/components/confirm-dialog',
          },
          {
            type: 'link',
            label: 'Snackbar',
            path: '/docs/components/snackbar',
          },
        ],
      },
    ],
  },
  {
    title: 'Form System',
    items: [
      {
        type: 'link',
        label: 'Overview',
        path: '/docs/form-system/overview',
      },
      {
        type: 'link',
        label: 'Quick Start',
        path: '/docs/form-system/quick-start',
      },
      {
        type: 'link',
        label: 'Reactions',
        path: '/docs/form-system/reactions',
      },
      {
        type: 'link',
        label: 'Dynamic Forms',
        path: '/docs/form-system/dynamic-forms',
      },
      {
        type: 'link',
        label: 'Patterns',
        path: '/docs/form-system/patterns',
      },
      {
        type: 'link',
        label: 'API Reference',
        path: '/docs/form-system/api',
      },
    ],
  },
  {
    title: 'Access Control',
    items: [
      {
        type: 'link',
        label: 'Overview',
        path: '/docs/access-control/overview',
      },
      {
        type: 'link',
        label: 'Quick Start',
        path: '/docs/access-control/quick-start',
      },
      {
        type: 'link',
        label: 'Core Concepts',
        path: '/docs/access-control/core-concepts',
      },
      {
        type: 'link',
        label: 'Dashforge Integration',
        path: '/docs/access-control/dashforge',
      },
      {
        type: 'link',
        label: 'Playground',
        path: '/docs/access-control/playground',
      },
    ],
  },
  {
    title: 'Theme System',
    items: [
      {
        type: 'link',
        label: 'Design Tokens',
        path: '/docs/theme-system/design-tokens',
      },
    ],
  },
  {
    title: 'Architecture',
    items: [],
  },
];
