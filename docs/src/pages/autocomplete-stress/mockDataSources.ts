// Mock async data sources for Autocomplete stress testing
// Simulates API calls with deterministic data

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Countries (simple string array)
export const COUNTRIES = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Australia',
];

// Programming languages (for FreeSolo example)
export const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'Go',
  'Rust',
  'Ruby',
];

// Product interface for generic options example
export interface Product {
  id: number;
  name: string;
  disabled: boolean;
}

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop Pro', disabled: false },
  { id: 2, name: 'Wireless Mouse', disabled: false },
  { id: 3, name: 'Mechanical Keyboard', disabled: false },
  { id: 4, name: 'USB-C Hub', disabled: true }, // Out of stock
  { id: 5, name: '4K Monitor', disabled: false },
  { id: 6, name: 'Webcam HD', disabled: true }, // Discontinued
];

// Categories for runtime options example
export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
];

// Fetch subcategories based on category (runtime options)
export async function fetchSubcategories(category: string): Promise<string[]> {
  await delay(500); // Simulate network delay

  const data: Record<string, string[]> = {
    electronics: ['Laptops', 'Smartphones', 'Tablets', 'Accessories'],
    furniture: ['Chairs', 'Desks', 'Tables', 'Storage'],
    clothing: ['Shirts', 'Pants', 'Jackets', 'Shoes'],
  };

  return data[category] || [];
}

// Service tiers with disabled options
export interface ServiceTier {
  id: number;
  name: string;
  disabled: boolean;
  reason?: string;
}

export const SERVICE_TIERS: ServiceTier[] = [
  { id: 1, name: 'Free Tier', disabled: false },
  { id: 2, name: 'Basic Plan', disabled: false },
  { id: 3, name: 'Pro Plan', disabled: false },
  {
    id: 4,
    name: 'Enterprise (Contact Sales)',
    disabled: true,
    reason: 'Contact required',
  },
  { id: 5, name: 'Legacy Plan', disabled: true, reason: 'No longer available' },
];
