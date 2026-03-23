// Mock async data sources for Reactive V2 demo
// Simulates API calls with deterministic data

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Province data by country
export async function fetchProvinces(
  country: string
): Promise<Array<{ value: string; label: string }>> {
  await delay(300); // Simulate network delay

  const data: Record<string, Array<{ value: string; label: string }>> = {
    usa: [
      { value: 'ca', label: 'California' },
      { value: 'ny', label: 'New York' },
      { value: 'tx', label: 'Texas' },
    ],
    canada: [
      { value: 'on', label: 'Ontario' },
      { value: 'qc', label: 'Quebec' },
      { value: 'bc', label: 'British Columbia' },
    ],
    mexico: [
      { value: 'mx-df', label: 'Mexico City' },
      { value: 'mx-jal', label: 'Jalisco' },
      { value: 'mx-nl', label: 'Nuevo León' },
    ],
  };

  return data[country] || [];
}

// City data by province
export async function fetchCities(
  province: string
): Promise<Array<{ value: string; label: string }>> {
  await delay(300);

  const data: Record<string, Array<{ value: string; label: string }>> = {
    ca: [
      { value: 'la', label: 'Los Angeles' },
      { value: 'sf', label: 'San Francisco' },
      { value: 'sd', label: 'San Diego' },
    ],
    ny: [
      { value: 'nyc', label: 'New York City' },
      { value: 'buffalo', label: 'Buffalo' },
      { value: 'rochester', label: 'Rochester' },
    ],
    tx: [
      { value: 'houston', label: 'Houston' },
      { value: 'dallas', label: 'Dallas' },
      { value: 'austin', label: 'Austin' },
    ],
    on: [
      { value: 'toronto', label: 'Toronto' },
      { value: 'ottawa', label: 'Ottawa' },
      { value: 'hamilton', label: 'Hamilton' },
    ],
    qc: [
      { value: 'montreal', label: 'Montreal' },
      { value: 'quebec-city', label: 'Quebec City' },
      { value: 'laval', label: 'Laval' },
    ],
    bc: [
      { value: 'vancouver', label: 'Vancouver' },
      { value: 'victoria', label: 'Victoria' },
      { value: 'kelowna', label: 'Kelowna' },
    ],
    'mx-df': [
      { value: 'cdmx-centro', label: 'Centro' },
      { value: 'cdmx-polanco', label: 'Polanco' },
      { value: 'cdmx-coyoacan', label: 'Coyoacán' },
    ],
    'mx-jal': [
      { value: 'gdl', label: 'Guadalajara' },
      { value: 'zapopan', label: 'Zapopan' },
      { value: 'tlaquepaque', label: 'Tlaquepaque' },
    ],
    'mx-nl': [
      { value: 'mty', label: 'Monterrey' },
      { value: 'san-pedro', label: 'San Pedro' },
      { value: 'santa-catarina', label: 'Santa Catarina' },
    ],
  };

  return data[province] || [];
}

// Generic option shapes for Example 4
export interface CustomOption {
  id: number;
  name: string;
  active: boolean;
}

export async function fetchCustomOptions(
  category: string
): Promise<CustomOption[]> {
  await delay(300);

  const data: Record<string, CustomOption[]> = {
    'category-a': [
      { id: 1, name: 'Option Alpha', active: true },
      { id: 2, name: 'Option Beta', active: true },
      { id: 3, name: 'Option Gamma', active: false },
    ],
    'category-b': [
      { id: 10, name: 'Option Delta', active: true },
      { id: 11, name: 'Option Epsilon', active: false },
      { id: 12, name: 'Option Zeta', active: true },
    ],
  };

  return data[category] || [];
}
