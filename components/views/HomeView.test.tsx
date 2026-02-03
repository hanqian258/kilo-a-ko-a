import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeView } from './HomeView';
import { Page } from '../../types';

describe('HomeView Accessibility', () => {
  it('renders feature cards as accessible buttons', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" user={null} />);

    // Check for the "Mitigate Stressors" card
    const mitigateButton = screen.getByRole('button', { name: /Mitigate Stressors/i });
    expect(mitigateButton).toBeInTheDocument();

    // Check for the "CEST Framework" card
    const cestButton = screen.getByRole('button', { name: /CEST Framework/i });
    expect(cestButton).toBeInTheDocument();

    // Check for the "Kilo a Ko'a" card
    const kiloButton = screen.getByRole('button', { name: /Kilo a Ko'a/i });
    expect(kiloButton).toBeInTheDocument();
  });

  it('navigates when feature button is clicked', () => {
    const onNavigate = vi.fn();
    render(<HomeView onNavigate={onNavigate} theme="light" user={null} />);

    // We use getAllByText because initially it might not be a button,
    // but for this test to pass *after* refactor, we want to target the click action.
    // However, since we are strictly testing that it IS a button in the first test,
    // let's try to grab it by text first if we expect this to work before refactor?
    // No, the plan says "This test is expected to fail initially".
    // So writing it as `getByRole` is correct.

    const mitigateButton = screen.getByRole('button', { name: /Mitigate Stressors/i });
    fireEvent.click(mitigateButton);

    expect(onNavigate).toHaveBeenCalledWith(Page.FUNDRAISER);
  });
});
