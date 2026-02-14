import { render } from '@testing-library/react';

import DashforgeUi from './ui';

describe('DashforgeUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DashforgeUi />);
    expect(baseElement).toBeTruthy();
  });
});
