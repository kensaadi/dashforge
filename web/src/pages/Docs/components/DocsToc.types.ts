/**
 * Item in the table of contents
 */
export interface DocsTocItem {
  /**
   * Unique identifier matching the DOM element ID
   */
  id: string;

  /**
   * Display label for the TOC item
   */
  label: string;

  /**
   * Optional nested sub-sections
   */
  children?: DocsTocItem[];
}

/**
 * Props for DocsToc component
 */
export interface DocsTocProps {
  /**
   * Array of TOC items to display
   */
  items: DocsTocItem[];

  /**
   * Optional title for the TOC panel
   * @default "On This Page"
   */
  title?: string;
}
