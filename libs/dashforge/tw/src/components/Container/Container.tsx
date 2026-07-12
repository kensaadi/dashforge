import { forwardRef, type ElementType, type ReactElement } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { containerVariants } from './container.variants.js';
import type { ContainerProps } from './container.types.js';

/**
 * `<Container>` — centered max-width wrapper for page-level layouts.
 *
 * The pattern is universal: every page-root `<div>` in a non-trivial
 * web app boils down to "mx-auto + max-w-X + responsive horizontal
 * padding". Container collapses that into a typed prop set so the
 * decision lives in ONE place per app section (the Container size),
 * not scattered as utility chains across every page file.
 *
 * Default size is `'xl'` (1280px) — comfortable for full app shells
 * with a left nav + main + optional right rail. Drop to `'lg'` (1024px)
 * for content-heavy docs/marketing, jump to `'2xl'` (1536px) for wide
 * dashboards.
 *
 * Composition pattern — Container at the page root, Stack/Grid inside:
 *
 *   <Container size="lg" as="main">
 *     <Stack gap={8}>
 *       <Typography variant="h1">Page title</Typography>
 *       <Grid container spacing={6}>
 *         <Grid xs={12} md={6}>...</Grid>
 *       </Grid>
 *     </Stack>
 *   </Container>
 *
 * Container handles the page chrome (centered, padded, capped width);
 * Stack/Grid handle the actual layout of children. Two concerns, two
 * primitives.
 *
 * Polymorphism rule (same as Typography/Box/Stack/Grid): when both
 * `as` and `asChild` are passed, `asChild` wins.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(
  function Container(props, ref) {
    const themeDefaults = useComponentDefaults('Container');
    const merged: ContainerProps = { ...themeDefaults?.defaults, ...props };
    const {
      size,
      px,
      centerContent,
      as,
      asChild = false,
      sx,
      children,
      ...rest
    } = merged;

    const classes = cn(
      containerVariants({ size, px, centerContent }),
      sx,
    );

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...rest}>
          {children as ReactElement}
        </Slot>
      );
    }

    const Tag = (as ?? 'div') as ElementType;
    return (
      <Tag ref={ref as never} className={classes} {...rest}>
        {children}
      </Tag>
    );
  },
);

Container.displayName = 'Container';
