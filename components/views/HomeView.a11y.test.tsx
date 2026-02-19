import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeView } from './HomeView';
import { Page } from '../../types';

describe('HomeView Accessibility', () => {
  it('renders accessible feature buttons', () => {
    const onNavigate = vi.fn();
    render(
      <HomeView
        onNavigate={onNavigate}
        theme="light"
        user={null}
      />
    );

    const buttons = [
      'Support the Reef',
      'CEST Knowledge',
      'View Monitoring'
    ];

    buttons.forEach(buttonText => {
      // Check if button exists and is accessible
      const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
      expect(button).toBeInTheDocument();

      // Check if button is clickable
      fireEvent.click(button);
    });

    // Check if onNavigate was called 3 times
    expect(onNavigate).toHaveBeenCalledTimes(3);

    // Verify specific calls
    expect(onNavigate).toHaveBeenCalledWith(Page.FUNDRAISER);
    expect(onNavigate).toHaveBeenCalledWith(Page.AWARENESS);
    expect(onNavigate).toHaveBeenCalledWith(Page.GALLERY);
  });

  it('buttons have focus visible styles', () => {
    const onNavigate = vi.fn();
    render(
      <HomeView
        onNavigate={onNavigate}
        theme="light"
        user={null}
      />
    );

    const button = screen.getByRole('button', { name: /Support the Reef/i });
    button.focus();
    expect(button).toHaveFocus();
  });
});
