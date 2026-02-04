import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText('Welcome to Verse')).toBeInTheDocument();
  });

  it('shows phase 0 completion message', () => {
    render(<App />);
    expect(screen.getByText(/Phase 0 foundation is complete/i)).toBeInTheDocument();
  });
});
