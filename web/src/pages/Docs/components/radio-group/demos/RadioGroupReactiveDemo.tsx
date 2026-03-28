import Stack from '@mui/material/Stack';
import { DashForm } from '@dashforge/forms';
import { RadioGroup, Select } from '@dashforge/ui';

/**
 * RadioGroupReactiveDemo shows RadioGroup with conditional visibility
 * Demonstrates visibleWhen predicate and reactive behavior
 */
export function RadioGroupReactiveDemo() {
  const accountTypeOptions = [
    { value: '', label: 'Select account type...' },
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
  ];

  const businessTypeOptions = [
    { value: 'sole-proprietor', label: 'Sole Proprietor' },
    { value: 'llc', label: 'LLC' },
    { value: 'corporation', label: 'Corporation' },
  ];

  const contactOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'mail', label: 'Mail' },
  ];

  return (
    <DashForm
      defaultValues={{
        accountType: '',
        businessType: '',
        contactMethod: '',
      }}
    >
      <Stack spacing={3}>
        <Select
          name="accountType"
          label="Account Type"
          options={accountTypeOptions}
        />

        <RadioGroup
          name="contactMethod"
          label="Preferred Contact Method"
          options={contactOptions}
        />

        {/* Conditional RadioGroup: only visible for business accounts */}
        <RadioGroup
          name="businessType"
          label="Business Type"
          options={businessTypeOptions}
          visibleWhen={(engine) => {
            const accountType = engine.getNode('accountType')?.value;
            return accountType === 'business';
          }}
          rules={{
            required: 'Please select a business type',
          }}
        />
      </Stack>
    </DashForm>
  );
}
