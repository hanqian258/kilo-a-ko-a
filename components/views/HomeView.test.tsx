import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeView } from './HomeView';
import { Page } from '../../types';

describe('HomeView', () => {
  it('renders feature cards as accessible buttons', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" user={null} />);

    // We expect buttons for: Edit Hero (if admin - wait, admin only), Support Resilience, Explore Monitoring, and the 3 feature cards.
    // Actually, Feature Cards have titles: "Mitigate Stressors", "CEST Framework", "Kilo a Ko'a".
    const stressorsButton = screen.getByRole('button', { name: /Mitigate Stressors/i });
    expect(stressorsButton).toBeInTheDocument();

    const cestButton = screen.getByRole('button', { name: /CEST Framework/i });
    expect(cestButton).toBeInTheDocument();

    const galleryButton = screen.getByRole('button', { name: /Kilo a Ko'a/i });
    expect(galleryButton).toBeInTheDocument();
  });
});
