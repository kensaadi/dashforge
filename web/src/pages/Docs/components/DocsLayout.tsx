import Box from '@mui/material/Box';

import { DocsSidebar } from './DocsSidebar';
import { DocsContent } from './DocsContent';
import { DocsToc } from './DocsToc';
import type { DocsTocItem } from './DocsToc.types';

interface DocsLayoutProps {
  /**
   * Content to render in the main docs area
   */
  children?: React.ReactNode;

  /**
   * Optional table of contents items for right-side panel
   */
  tocItems?: DocsTocItem[];
}

/**
 * DocsLayout composes the sidebar, main content area, and optional TOC
 * Creates a responsive layout for documentation pages
 */
export function DocsLayout({ children, tocItems }: DocsLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        minHeight: '100vh',
      }}
    >
      <DocsSidebar />
      <DocsContent>{children}</DocsContent>
      {tocItems && tocItems.length > 0 && <DocsToc items={tocItems} />}
    </Box>
  );
}
