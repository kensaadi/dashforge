/**
 * Docs sidebar navigation tree structure
 */

export interface DocsSidebarItem {
  /**
   * Display label for the navigation item
   */
  label: string;
  /**
   * Route path (when implemented)
   */
  path?: string;
  /**
   * Nested children items
   */
  children?: DocsSidebarItem[];
}

export interface DocsSidebarGroup {
  /**
   * Group title
   */
  title: string;
  /**
   * Navigation items in this group
   */
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
        label: 'Overview',
        path: '/docs/getting-started/overview',
      },
      {
        label: 'Installation',
        path: '/docs/getting-started/installation',
      },
      {
        label: 'Usage',
        path: '/docs/getting-started/usage',
      },
      {
        label: 'Project Structure',
        path: '/docs/getting-started/project-structure',
      },
      {
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
        label: 'Input',
        children: [
          {
            label: 'TextField',
            path: '/docs/components/text-field',
          },
          {
            label: 'NumberField',
            path: '/docs/components/number-field',
          },
          {
            label: 'Select',
            path: '/docs/components/select',
          },
          {
            label: 'Autocomplete',
            path: '/docs/components/autocomplete',
          },
        ],
      },
      {
        label: 'Layout',
        children: [],
      },
    ],
  },
  {
    title: 'Form System',
    items: [],
  },
  {
    title: 'Theme System',
    items: [],
  },
  {
    title: 'Architecture',
    items: [],
  },
];
