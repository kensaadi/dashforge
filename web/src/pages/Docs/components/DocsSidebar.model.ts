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
    items: [],
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
