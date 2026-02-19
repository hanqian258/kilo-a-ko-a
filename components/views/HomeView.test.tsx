import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeView } from './HomeView';
import { Page } from '../../types';

describe('HomeView', () => {
  it('renders feature cards as accessible buttons', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" user={null} />);

    // We expect buttons for: Edit Hero (if admin - wait, admin only), Support Resilience, Explore Monitoring, and the 3 feature cards.
    // Feature Cards have buttons with specific link text.
    const stressorsButton = screen.getByRole('button', { name: /Support the Reef/i });
    expect(stressorsButton).toBeInTheDocument();

    const cestButton = screen.getByRole('button', { name: /CEST Knowledge/i });
    expect(cestButton).toBeInTheDocument();

    const galleryButton = screen.getByRole('button', { name: /View Monitoring/i });
    expect(galleryButton).toBeInTheDocument();
  });
});
