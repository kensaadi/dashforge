import type React from 'react';
import { useMemo } from 'react';

// @mui
import { useTheme } from '@mui/material/styles';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

// @project
import type { BreadcrumbNode } from './types';
import {
  normalizePathname,
  prependHomeIfNeeded,
  resolveBreadcrumbChain,
} from './breadcrumbs.utils';

type DefaultLinkComponent = 'a';

type LinkPropsOf<C extends React.ElementType> =
  React.ComponentPropsWithoutRef<C>;

export interface BreadcrumbsProps<
  C extends React.ElementType = DefaultLinkComponent
> {
  /** Current pathname (router-agnostic). */
  pathname: string;

  /** Controlled mode: render exactly these items (active item is last). */
  items?: BreadcrumbNode[];

  /** Uncontrolled mode: resolve items from a tree + pathname. */
  tree?: BreadcrumbNode[];

  /** Optional home crumb (prepended when includeHome=true and active isn't home). */
  home?: BreadcrumbNode;

  /** Defaults to true */
  includeHome?: boolean;

  /** Router integration (React Router / Next Link / etc). If omitted, uses <a>. */
  LinkComponent?: C;

  getLinkProps?: (node: BreadcrumbNode) => LinkPropsOf<C>;

  /** Label resolver (i18n hook). */
  getLabel?: (node: BreadcrumbNode) => React.ReactNode;

  /** Breadcrumb separator. */
  separator?: React.ReactNode;

  /** Max items (MUI feature). */
  maxItems?: number;

  /** System style overrides for the root Breadcrumbs. */
  sx?: SxProps<Theme>;

  /** Slot props for fine-grained styling overrides. */
  slotProps?: {
    link?: {
      sx?: SxProps<Theme>;
    };
    active?: {
      sx?: SxProps<Theme>;
    };
  };
}

const DEFAULT_HOME: BreadcrumbNode = {
  id: 'home',
  label: 'Home',
  href: '/',
};

function focusRingSx(theme: Theme) {
  // Keep it generic (no app utils). Uses theme primary.
  return {
    outline: 'none',
    borderRadius: 0.5,
    boxShadow: `0 0 0 3px ${
      theme.vars?.palette?.primary?.main ?? theme.palette.primary.main
    }33`,
  };
}

export function Breadcrumbs<C extends React.ElementType = DefaultLinkComponent>(
  props: BreadcrumbsProps<C>
) {
  const theme = useTheme();

  const {
    pathname,
    items,
    tree,
    home = DEFAULT_HOME,
    includeHome = true,
    LinkComponent,
    getLabel,
    separator,
    maxItems,
    sx,
    slotProps,
    getLinkProps,
  } = props;

  const resolvedChain = useMemo(() => {
    if (items && items.length > 0) return items;

    if (!tree || tree.length === 0) return [];

    const chain = resolveBreadcrumbChain(tree, normalizePathname(pathname));
    return prependHomeIfNeeded(chain, home, includeHome);
  }, [items, tree, pathname, home, includeHome]);

  const activeItem = resolvedChain.at(-1);
  const linkItems = resolvedChain.length > 1 ? resolvedChain.slice(0, -1) : [];

  const renderLabel = (node: BreadcrumbNode) => {
    if (getLabel) return getLabel(node);
    return node.label;
  };

  const Sep = separator ?? '/';

  return (
    <MuiBreadcrumbs
      aria-label="breadcrumb"
      separator={Sep}
      maxItems={maxItems}
      sx={sx}
    >
      {linkItems.map((node) => {
        const isClickable = Boolean(node.href) && !node.disabled;

        // For router components: we pass `href` for 'a' and many link-like components.
        // Apps can wrap/adapt if they need `to`.
        const linkProps: LinkPropsOf<C> | undefined = isClickable
          ? getLinkProps
            ? getLinkProps(node)
            : ({ href: node.href } as unknown as LinkPropsOf<C>)
          : undefined;

        return (
          <Typography
            key={node.id}
            component={isClickable ? LinkComponent ?? 'a' : 'span'}
            variant="body2"
            {...(linkProps ?? ({} as LinkPropsOf<C>))}
            sx={{
              p: 0.5,
              color: 'text.secondary',
              textDecoration: 'none',
              ...(isClickable && {
                cursor: 'pointer',
                ':hover': { color: 'primary.main' },
              }),
              ':focus-visible': focusRingSx(theme),
              ...(slotProps?.link?.sx ?? {}),
            }}
          >
            {renderLabel(node)}
          </Typography>
        );
      })}

      {activeItem ? (
        <Typography
          variant="body2"
          sx={{
            p: 0.5,
            color: 'text.primary',
            ...(slotProps?.active?.sx ?? {}),
          }}
          aria-current="page"
        >
          {renderLabel(activeItem)}
        </Typography>
      ) : null}
    </MuiBreadcrumbs>
  );
}
