import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import getWasm from 'shiki/wasm';

let highlighterInstance: HighlighterCore | null = null;
const highlightCache = new Map<string, string>();

/**
 * Supported languages for docs code highlighting
 */
export type SupportedLanguage = 'tsx' | 'typescript' | 'jsx' | 'javascript';

/**
 * Initialize Shiki highlighter (lazy, singleton)
 */
async function getHighlighter(): Promise<HighlighterCore> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  highlighterInstance = await createHighlighterCore({
    themes: [
      import('shiki/themes/github-dark.mjs'),
      import('shiki/themes/github-light.mjs'),
    ],
    langs: [
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/jsx.mjs'),
      import('shiki/langs/javascript.mjs'),
    ],
    loadWasm: getWasm,
  });

  return highlighterInstance;
}

/**
 * Generate cache key for highlighted code
 */
function getCacheKey(code: string, lang: string, theme: string): string {
  return `${theme}:${lang}:${code}`;
}

/**
 * Highlight code with Shiki (memoized)
 */
export async function highlightCode(
  code: string,
  lang: SupportedLanguage = 'tsx',
  isDark = true
): Promise<string> {
  const theme = isDark ? 'github-dark' : 'github-light';
  const cacheKey = getCacheKey(code, lang, theme);

  if (highlightCache.has(cacheKey)) {
    return highlightCache.get(cacheKey)!;
  }

  try {
    const highlighter = await getHighlighter();
    const html = highlighter.codeToHtml(code, {
      lang,
      theme,
    });

    highlightCache.set(cacheKey, html);
    return html;
  } catch (error) {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

/**
 * Escape HTML for fallback rendering
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Clear highlight cache (useful for hot reload)
 */
export function clearHighlightCache(): void {
  highlightCache.clear();
}
