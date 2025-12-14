import React from 'react';
import { render, screen } from '@testing-library/react';
import UltraAiTodo from '../components/UltraAiTodo';

test('renders UltraAiTodo component', () => {
  render(<UltraAiTodo />);
  const linkElement = screen.getByText(/Ultra AI Todo/i);
  expect(linkElement).toBeInTheDocument();
});
