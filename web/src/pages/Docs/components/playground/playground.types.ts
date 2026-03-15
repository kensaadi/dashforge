/**
 * Reusable type definitions for the Docs playground system
 */

/**
 * Props for the main DocsPlayground composition component
 */
export interface DocsPlaygroundProps {
  /**
   * Section title displayed at the top
   */
  title?: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Control panel content
   */
  controls: React.ReactNode;
  /**
   * Live component preview
   */
  preview: React.ReactNode;
  /**
   * Generated code snippet
   */
  code: string;
}

/**
 * Props for DocsPlaygroundControls wrapper
 */
export interface DocsPlaygroundControlsProps {
  /**
   * Controls to render inside the panel
   */
  children: React.ReactNode;
}

/**
 * Props for DocsPlaygroundPreview wrapper
 */
export interface DocsPlaygroundPreviewProps {
  /**
   * Component to preview
   */
  children: React.ReactNode;
}

/**
 * Props for DocsCodePreview component
 */
export interface DocsCodePreviewProps {
  /**
   * Code to display
   */
  code: string;
  /**
   * Programming language for syntax highlighting hint
   */
  language?: string;
}
