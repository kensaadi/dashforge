import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { DocsPage } from '../pages/DocsPage';
import { ComponentsPage } from '../pages/ComponentsPage';
import { PricingPage } from '../pages/PricingPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/docs',
    element: <DocsPage />,
  },
  {
    path: '/components',
    element: <ComponentsPage />,
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
