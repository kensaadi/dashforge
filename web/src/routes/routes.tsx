import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { HomePage } from '../pages/Home/HomePage';
import { DocsPage } from '../pages/Docs/DocsPage';
import { ComponentsPage } from '../pages/ComponentsPage';
import { PricingPage } from '../pages/PricingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { StarterKitsPage } from '../pages/StarterKits/StarterKitsPage';
import { StarterKitDetailPage } from '../pages/StarterKits/StarterKitDetailPage';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/docs/*',
    element: <DocsPage />,
  },
  {
    path: '/components',
    element: <ComponentsPage />,
  },
  {
    path: '/starter-kits',
    element: <StarterKitsPage />,
  },
  {
    path: '/starter-kits/:kitId',
    element: <StarterKitDetailPage />,
  },
  {
    path: '/pricing',
    element: <PricingPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter(routes);

export default router;
