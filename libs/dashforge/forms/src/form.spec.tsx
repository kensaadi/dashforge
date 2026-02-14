import { render } from '@testing-library/react';

import DashforgeForms from './forms';

describe('DashforgeForms', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DashforgeForms />);
    expect(baseElement).toBeTruthy();
  });
});
