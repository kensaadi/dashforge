import type { StarterKit } from '../src/pages/StarterKits/data/starterKits';
import type {
  DocsSidebarGroup,
  DocsSidebarItem,
} from '../src/pages/Docs/components/DocsSidebar.model';

/**
 * Generates complete list of routes for pre-rendering
 * Dynamically imports route data to ensure accuracy
 */
export async function generateRoutes(): Promise<string[]> {
  const routes: string[] = [
    // Main pages
    '/',
    '/components',
    '/pricing',
    '/starter-kits',
  ];

  // Dynamically import starter kits data
  const { starterKits } = (await import(
    '../src/pages/StarterKits/data/starterKits.js'
  )) as { starterKits: StarterKit[] };

  // Add starter kit detail pages
  starterKits.forEach((kit) => {
    routes.push(`/starter-kits/${kit.id}`);
  });

  // Dynamically import docs sidebar tree
  const { docsSidebarTree } = (await import(
    '../src/pages/Docs/components/DocsSidebar.model.js'
  )) as { docsSidebarTree: DocsSidebarGroup[] };

  // Extract all documentation routes
  docsSidebarTree.forEach((group) => {
    group.items.forEach((item: DocsSidebarItem) => {
      if (item.type === 'link') {
        routes.push(item.path);
      } else if (item.type === 'subgroup') {
        item.children.forEach((child) => {
          routes.push(child.path);
        });
      }
    });
  });

  return routes;
}

// For direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRoutes().then((routes) => {
    console.log('Generated routes:');
    routes.forEach((route) => console.log(`  - ${route}`));
    console.log(`\nTotal: ${routes.length} routes`);
  });
}
