import type { RouteRecord } from 'vite-react-ssg';
import { RootLayout } from '../app/RootLayout';
import { HomePage } from '../pages/Home/HomePage';
import { DocsPage } from '../pages/Docs/DocsPage';
import { ComponentsPage } from '../pages/ComponentsPage';
import { PricingPage } from '../pages/PricingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ThankYouPage } from '../pages/ThankYouPage';
import { StarterKitsPage } from '../pages/StarterKits/StarterKitsPage';
import { StarterKitDetailPage } from '../pages/StarterKits/StarterKitDetailPage';

async function getStarterKitPaths(): Promise<string[]> {
  const { starterKits } = await import('../pages/StarterKits/data/starterKits');
  return starterKits.map((kit) => `/starter-kits/${kit.id}`);
}

async function getDocsPaths(): Promise<string[]> {
  const { docsSidebarTree } = await import(
    '../pages/Docs/components/DocsSidebar.model'
  );
  const paths: string[] = [];
  for (const group of docsSidebarTree) {
    for (const item of group.items) {
      if (item.type === 'link') {
        paths.push(item.path);
      } else {
        for (const child of item.children) {
          paths.push(child.path);
        }
      }
    }
  }
  return paths;
}

export const routes: RouteRecord[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/docs/*',
        element: <DocsPage />,
        getStaticPaths: getDocsPaths,
      },
      { path: '/components', element: <ComponentsPage /> },
      { path: '/starter-kits', element: <StarterKitsPage /> },
      {
        path: '/starter-kits/:kitId',
        element: <StarterKitDetailPage />,
        getStaticPaths: getStarterKitPaths,
      },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/thank-you', element: <ThankYouPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
