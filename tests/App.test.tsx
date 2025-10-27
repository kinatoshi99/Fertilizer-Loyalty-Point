import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByText(/Fertilizer Loyalty Points System/i);
    expect(heading).toBeInTheDocument();
  });
});
