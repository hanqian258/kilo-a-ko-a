import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  onSnapshot: vi.fn((q, callback) => {
    // Simulate initial data load
    callback({
      docs: [
        {
          id: 'event-1',
          data: () => ({
            title: 'Test Event 1',
            date: '2023-12-25',
            time: '10:00',
            location: 'Test Location 1',
            description: 'Test Description 1',
            attendees: [],
            status: 'upcoming',
            imageUrl: '',
          }),
        },
      ],
    });
    return () => {};
  }),
  getDocs: vi.fn(() => Promise.resolve({ forEach: vi.fn() })),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
}));

vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(),
}));

vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

vi.mock('react-simple-wysiwyg', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="mock-editor"
      value={value}
      onChange={onChange}
    />
  ),
}));

vi.mock('dompurify', () => ({
  default: {
    sanitize: (content: string) => content,
  },
}));

describe('EventsView Accessibility', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    photoURL: '',
  };

  const mockNavigateLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create event button for admin', async () => {
    await act(async () => {
      render(
        <EventsView
          user={mockUser}
          onNavigateLogin={mockNavigateLogin}
          theme="light"
        />
      );
    });

    const createButton = screen.getByRole('button', { name: /create event/i });
    expect(createButton).toBeInTheDocument();
  });

  it('opens editor and has accessible form fields', async () => {
    await act(async () => {
      render(
        <EventsView
          user={mockUser}
          onNavigateLogin={mockNavigateLogin}
          theme="light"
        />
      );
    });

    const createButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(createButton);

    // Verify form fields have labels
    // These might fail initially if labels are not properly associated
    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();

    // Check for close button accessibility
    const closeButton = screen.getByRole('button', { name: /close/i }); // Will likely fail if aria-label missing
    expect(closeButton).toBeInTheDocument();
  });

  it('renders event actions with accessible names', async () => {
    await act(async () => {
      render(
        <EventsView
          user={mockUser}
          onNavigateLogin={mockNavigateLogin}
          theme="light"
        />
      );
    });

    // Wait for events to load (handled by mocked onSnapshot)
    const editButton = screen.queryByLabelText(/edit test event 1/i);
    const deleteButton = screen.queryByLabelText(/delete test event 1/i);

    // If these are missing aria-labels, queryByLabelText will fail to find them
    // Use getAllByRole('button') and check manually if needed, but we want to assert accessibility
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });
});
