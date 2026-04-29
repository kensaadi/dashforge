import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes/routes';

export const createRoot = ViteReactSSG(
  { routes },
  () => {
    // global setup hook (runs both client and SSG)
  },
  {
    getStyleCollector: async () => {
      const { default: createCache } = await import('@emotion/cache');
      const { default: createEmotionServer } = await import(
        '@emotion/server/create-instance'
      );
      const { CacheProvider } = await import('@emotion/react');
      const { createElement } = await import('react');

      const cache = createCache({ key: 'css' });
      const { extractCriticalToChunks, constructStyleTagsFromChunks } =
        createEmotionServer(cache);

      return {
        collect(app) {
          return createElement(CacheProvider, { value: cache }, app);
        },
        toString(html) {
          const chunks = extractCriticalToChunks(html);
          return constructStyleTagsFromChunks(chunks);
        },
      };
    },
  }
);
