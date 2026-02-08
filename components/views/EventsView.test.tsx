import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventsView } from './EventsView';
import { UserRole } from '../../types';

// Mock dependencies
vi.mock('../../utils/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    // Simulate initial snapshot with no events
    callback({ docs: [] });
    return () => {};
  }),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ forEach: vi.fn() })),
}));

vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(() => new Promise(resolve => setTimeout(resolve, 100))), // Add delay to test loading state
}));

vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

describe('EventsView', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test Admin',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    readArticles: [],
  };

  it('renders "Create Event" button for admin', () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('opens editor when "Create Event" is clicked', () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);
    fireEvent.click(screen.getByText('Create Event'));
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('shows loading state when saving an event', async () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    // Open editor
    fireEvent.click(screen.getByText('Create Event'));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Event Title/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2023-12-25' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '10:00' } });

    // Submit
    const submitButton = screen.getByText('Publish Event');
    fireEvent.click(submitButton);

    // Check for loading state (this will fail until implemented)
    // The button text changes to "Processing..." inside Button component when isLoading is true
    // Or we can check if it's disabled
    await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('has accessible labels for icon-only buttons', () => {
    // We need to render with some events to test edit/delete buttons
    // But mocking onSnapshot to return data is tricky here without extensive setup.
    // Let's just test the "Close" button in the editor first.

    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);
    fireEvent.click(screen.getByText('Create Event'));

    const closeButton = screen.getByLabelText('Close editor'); // This will fail until aria-label is added
    expect(closeButton).toBeInTheDocument();
  });
});
