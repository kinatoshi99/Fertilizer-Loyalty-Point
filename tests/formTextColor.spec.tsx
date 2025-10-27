import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

describe('Form Text Color', () => {
  it('should render input with black text', () => {
    render(<input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    expect(window.getComputedStyle(input).color).toBe('rgb(0, 0, 0)');
  });

  it('should render textarea with black text', () => {
    render(<textarea placeholder="Type here" />);
    const textarea = screen.getByPlaceholderText('Type here');
    expect(window.getComputedStyle(textarea).color).toBe('rgb(0, 0, 0)');
  });

  it('should maintain black text on focus', async () => {
    render(<input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    await userEvent.click(input);
    expect(window.getComputedStyle(input).color).toBe('rgb(0, 0, 0)');
  });
});
