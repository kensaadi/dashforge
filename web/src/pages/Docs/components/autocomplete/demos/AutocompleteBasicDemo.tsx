import { useState } from 'react';
import { Autocomplete } from '@dashforge/ui';

const countries = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Australia',
];

/**
 * Basic Autocomplete demo with static string options
 */
export function AutocompleteBasicDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Autocomplete
      name="country"
      label="Country"
      options={countries}
      value={value}
      onChange={setValue}
    />
  );
}
