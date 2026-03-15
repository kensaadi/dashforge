import Box from '@mui/material/Box';

import { DocsSidebar } from './DocsSidebar';
import { DocsContent } from './DocsContent';

interface DocsLayoutProps {
  /**
   * Content to render in the main docs area
   */
  children?: React.ReactNode;
}

/**
 * DocsLayout composes the sidebar and main content area
 * Creates a two-column responsive layout for documentation pages
 */
export function DocsLayout({ children }: DocsLayoutProps) {
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
    </Box>
  );
}
