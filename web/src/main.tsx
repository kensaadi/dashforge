import { createElement } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './routes/routes';

export const createRoot = ViteReactSSG(
  { routes },
  () => {},
  {
    getStyleCollector: async () => {
      const cache = createCache({ key: 'css', speedy: false });

      // Intercept insert to capture all styles as strings
      const insertedStyles: Record<string, string> = {};
      const originalInsert = cache.insert.bind(cache);
      cache.insert = (selector, serialized, sheet, shouldCache) => {
        if (!insertedStyles[serialized.name]) {
          insertedStyles[serialized.name] = serialized.styles;
        }
        return originalInsert(selector, serialized, sheet, shouldCache);
      };

      return {
        collect(app) {
          return createElement(CacheProvider, { value: cache }, app);
        },
        toString(_html) {
          const ids = Object.keys(insertedStyles);
          const css = Object.values(insertedStyles).join('');
          if (!css) return '';
          return `<style data-emotion="${cache.key} ${ids.join(' ')}">${css}</style>`;
        },
      };
    },
  }
);
