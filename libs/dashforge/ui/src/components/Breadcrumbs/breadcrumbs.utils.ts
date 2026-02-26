// libs/dashforge/ui/src/components/Breadcrumbs/breadcrumbs.utils.ts

import type { BreadcrumbNode, BreadcrumbMatch } from './types';

function stripQueryAndHash(path: string): string {
  // "/a/b?x=1#y" -> "/a/b"
  const q = path.indexOf('?');
  const h = path.indexOf('#');
  const cut = Math.min(q === -1 ? path.length : q, h === -1 ? path.length : h);
  return path.slice(0, cut);
}

export function normalizePathname(pathname: string): string {
  const base = stripQueryAndHash(pathname || '').trim();

  if (!base) return '/';

  // Ensure leading slash.
  const withLeading = base.startsWith('/') ? base : `/${base}`;

  // Remove trailing slash (except root).
  if (withLeading.length > 1 && withLeading.endsWith('/')) {
    return withLeading.slice(0, -1);
  }

  return withLeading;
}

function toSegments(path: string): string[] {
  const n = normalizePathname(path);
  if (n === '/') return [];
  // "/a/b" -> ["a","b"]
  return n.slice(1).split('/').filter(Boolean);
}

function isPrefixSegments(target: string, href: string): boolean {
  const t = toSegments(target);
  const h = toSegments(href);

  if (h.length === 0) return t.length === 0; // href "/" matches only root in prefix mode
  if (h.length > t.length) return false;

  for (let i = 0; i < h.length; i += 1) {
    if (t[i] !== h[i]) return false;
  }
  return true;
}

function isExactSegments(target: string, href: string): boolean {
  return normalizePathname(target) === normalizePathname(href);
}

export function matchesPathname(
  pathname: string,
  href: string,
  match: BreadcrumbMatch = 'prefix'
): boolean {
  if (!href) return false;
  return match === 'exact'
    ? isExactSegments(pathname, href)
    : isPrefixSegments(pathname, href);
}

/**
 * Returns the first matching chain (parents included) found via DFS.
 * - A node may be part of the chain even if it has no href (container).
 * - Matching is performed on nodes with href.
 */
export function resolveBreadcrumbChain(
  tree: BreadcrumbNode[],
  pathname: string
): BreadcrumbNode[] {
  const target = normalizePathname(pathname);

  function dfs(
    nodes: BreadcrumbNode[],
    parents: BreadcrumbNode[]
  ): BreadcrumbNode[] | null {
    for (const node of nodes) {
      const nextParents = [...parents, node];

      if (
        node.href &&
        matchesPathname(target, node.href, node.match ?? 'prefix')
      ) {
        // Note: we return immediately on first match, consistent with typical nav trees
        return nextParents;
      }

      if (node.children && node.children.length > 0) {
        const found = dfs(node.children, nextParents);
        if (found) return found;
      }
    }
    return null;
  }

  return dfs(tree, []) ?? [];
}

/**
 * Prepends home if needed.
 * - If includeHome is false: returns chain unchanged.
 * - If chain empty: returns [] (let component decide what to do).
 * - If active href equals home href: do not prepend.
 * - If active href missing (container active): still prepend home if chain has at least 1 item.
 */
export function prependHomeIfNeeded(
  chain: BreadcrumbNode[],
  home: BreadcrumbNode,
  includeHome: boolean
): BreadcrumbNode[] {
  if (!includeHome) return chain;
  if (chain.length === 0) return chain;

  const active = chain.at(-1);
  const homeHref = home.href ? normalizePathname(home.href) : undefined;

  if (homeHref && active?.href && normalizePathname(active.href) === homeHref) {
    return chain;
  }

  // Avoid double-home if user included it in the tree/chain already
  if (homeHref) {
    const first = chain[0];
    if (first?.href && normalizePathname(first.href) === homeHref) return chain;
  }

  return [home, ...chain];
}
