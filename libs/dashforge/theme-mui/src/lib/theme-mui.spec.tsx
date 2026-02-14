import { render } from '@testing-library/react';

import DashforgeThemeMui from './theme-mui';

describe('DashforgeThemeMui', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DashforgeThemeMui />);
    expect(baseElement).toBeTruthy();
  });
});
