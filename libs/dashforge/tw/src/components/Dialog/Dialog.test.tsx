// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Dialog } from './Dialog.js';

void React;
afterEach(() => cleanup());

describe('Dialog — rendering', () => {
  it('renders nothing when open=false', () => {
    render(
      <Dialog open={false} onOpenChange={() => {}}>
        <p>body</p>
      </Dialog>
    );
    expect(screen.queryByText('body')).toBeNull();
  });

  it('renders title + body + close button when open', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Confirm action">
        <p>body content</p>
      </Dialog>
    );
    expect(screen.queryByText('Confirm action')).not.toBeNull();
    expect(screen.queryByText('body content')).not.toBeNull();
    expect(screen.queryByLabelText('Close')).not.toBeNull();
  });

  it('honors showCloseButton={false}', () => {
    render(
      <Dialog open onOpenChange={() => {}} showCloseButton={false}>
        <p>body</p>
      </Dialog>
    );
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('emits onOpenChange(false) when close button is clicked', () => {
    let lastOpen: boolean | null = null;
    render(
      <Dialog open onOpenChange={(o) => (lastOpen = o)}>
        <p>body</p>
      </Dialog>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(lastOpen).toBe(false);
  });

  it('renders description when provided', () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Title" description="Hint text">
        <p>body</p>
      </Dialog>
    );
    expect(screen.queryByText('Hint text')).not.toBeNull();
  });
});

describe('Dialog — size variants', () => {
  it.each(['sm', 'md', 'lg'] as const)('renders size=%s without crashing', (size) => {
    render(
      <Dialog open onOpenChange={() => {}} size={size}>
        <p>body</p>
      </Dialog>
    );
    expect(screen.queryByText('body')).not.toBeNull();
  });
});

describe('Dialog — sx + slotProps', () => {
  it('appends sx to the content element', () => {
    render(
      <Dialog open onOpenChange={() => {}} sx="custom-sx-class">
        <p>body</p>
      </Dialog>
    );
    const content = screen.getByText('body').closest('[role="dialog"]');
    expect(content?.className).toContain('custom-sx-class');
  });

  it('applies slotProps.title.className', () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
        title="T"
        slotProps={{ title: { className: 'tw-title-override' } }}
      >
        <p>body</p>
      </Dialog>
    );
    expect(screen.getByText('T').className).toContain('tw-title-override');
  });
});
