import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventsView } from './EventsView';
import { UserRole } from '../../types';
import * as firestore from 'firebase/firestore';
import * as eventService from '../../utils/eventService';

// Mock dependencies
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    arrayUnion: vi.fn(),
    arrayRemove: vi.fn(),
    deleteDoc: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({ docs: [], forEach: vi.fn() })),
  };
});

vi.mock('../../utils/firebase', () => ({
  db: {},
}));

vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(),
  subscribeToEvents: vi.fn(),
}));

// Mock react-simple-wysiwyg
vi.mock('react-simple-wysiwyg', () => ({
  default: ({ value, onChange }: any) => (
    <textarea data-testid="editor" value={value} onChange={onChange} />
  ),
}));

describe('EventsView UX', () => {
  const futureYear = new Date().getFullYear() + 1;
  const mockUser = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    readArticles: [],
  };

  const mockAdmin = {
    ...mockUser,
    role: UserRole.ADMIN,
  };

  const mockEvent = {
    id: 'event1',
    title: 'Test Event',
    date: `${futureYear}-12-25`,
    time: '10:00',
    location: 'Test Location',
    description: 'Test Description',
    status: 'upcoming',
    attendees: [],
    imageUrl: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state on RSVP button during action', async () => {
    // Mock subscribeToEvents
    (eventService.subscribeToEvents as any).mockImplementation((callback: any) => {
      callback([mockEvent]);
      return vi.fn();
    });

    // Mock onSnapshot to return our event
    (firestore.onSnapshot as any).mockImplementation((query: any, callback: any) => {
      callback({
        docs: [
          {
            id: mockEvent.id,
            data: () => mockEvent,
          },
        ],
      });
      return vi.fn(); // unsubscribe
    });

    // Mock updateDoc to simulate delay
    (firestore.updateDoc as any).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    // Find RSVP button
    const rsvpButton = screen.getByRole('button', { name: /I'm Going/i });
    expect(rsvpButton).toBeInTheDocument();

    // Click it
    fireEvent.click(rsvpButton);

    // Check for loading state immediately after click (Button should be disabled)
    expect(rsvpButton).toBeDisabled();

    // Wait for the async action to finish
    await waitFor(() => {
      expect(firestore.updateDoc).toHaveBeenCalled();
    });

    // Should be enabled again
    await waitFor(() => {
      expect(rsvpButton).not.toBeDisabled();
    });
  });

  it('renders accessible admin buttons', async () => {
    // Mock subscribeToEvents
    (eventService.subscribeToEvents as any).mockImplementation((callback: any) => {
      callback([mockEvent]);
      return vi.fn();
    });

    // Mock onSnapshot
    (firestore.onSnapshot as any).mockImplementation((query: any, callback: any) => {
      callback({
        docs: [
          {
            id: mockEvent.id,
            data: () => mockEvent,
          },
        ],
      });
      return vi.fn();
    });

    render(<EventsView user={mockAdmin} onNavigateLogin={vi.fn()} theme="light" />);

    // Check for Edit button
    const editButton = await screen.findByLabelText('Edit event');
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveAttribute('title', 'Edit event');

    // Check for Delete button
    const deleteButton = await screen.findByLabelText('Delete event');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('title', 'Delete event');
  });

  it('renders past events for normal users', async () => {
    const pastEvent = {
      ...mockEvent,
      id: 'past-event',
      title: 'Past Event',
      date: '2020-01-01',
    };

    (eventService.subscribeToEvents as any).mockImplementation((callback: any) => {
      callback([pastEvent]);
      return vi.fn();
    });

    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    expect(screen.getByText('Past Event')).toBeInTheDocument();
  });

  it('renders all events for logged-out users', async () => {
    (eventService.subscribeToEvents as any).mockImplementation((callback: any) => {
      callback([mockEvent]);
      return vi.fn();
    });

    render(<EventsView user={null} onNavigateLogin={vi.fn()} theme="light" />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});
