import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeView } from './HomeView';
import { Page } from '../../types';

describe('HomeView', () => {
  it('renders feature cards', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" />);

    expect(screen.getByText(/Mitigate Stressors/i)).toBeInTheDocument();
    expect(screen.getByText(/CEST Framework/i)).toBeInTheDocument();
    expect(screen.getByText(/Kilo a Ko'a/i)).toBeInTheDocument();
  });

  it('navigates when feature cards are clicked', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" />);

    // Clicking "Support the Reef" text should trigger navigation
    const supportLink = screen.getByText(/Support the Reef/i);
    fireEvent.click(supportLink);
    expect(onNavigate).toHaveBeenCalledWith(Page.FUNDRAISER);
  });

  it('feature cards should be accessible buttons', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" />);

    // Verify that the "Support the Reef" action is a button
    // This should initially fail because it is currently a div or just text inside a div
    expect(screen.getByRole('button', { name: /Support the Reef/i })).toBeInTheDocument();
  });
});
