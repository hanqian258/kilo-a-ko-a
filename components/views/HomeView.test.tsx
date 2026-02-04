import { render, screen } from '@testing-library/react';
import { HomeView } from './HomeView';
import { describe, it, expect, vi } from 'vitest';

describe('HomeView', () => {
  it('renders feature cards as accessible buttons', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" />);

    // Check for the "Mitigate Stressors" card
    const stressorCard = screen.getByRole('button', { name: /mitigate stressors/i });
    expect(stressorCard).toBeInTheDocument();

    // Check for "CEST Framework" card
    const cestCard = screen.getByRole('button', { name: /cest framework/i });
    expect(cestCard).toBeInTheDocument();

    // Check for "Kilo a Ko'a" card
    const kiloCard = screen.getByRole('button', { name: /kilo a ko'a/i });
    expect(kiloCard).toBeInTheDocument();
  });
});
