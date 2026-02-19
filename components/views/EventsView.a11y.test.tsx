import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventsView } from './EventsView';
import { UserRole } from '../../types';

// Mock dependencies
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: (query: any, callback: any) => {
    callback({
      docs: [
        {
          id: 'event-1',
          data: () => ({
            title: 'Test Event 1',
            date: '2023-12-25',
            time: '10:00',
            location: 'Test Location',
            description: 'Test Description',
            attendees: [],
            status: 'upcoming'
          })
        }
      ]
    });
    return () => {};
  },
  doc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
      forEach: vi.fn()
  })),
}));

vi.mock('../../utils/firebase', () => ({
  db: {}
}));

vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(),
  subscribeToEvents: vi.fn((callback) => {
    callback([
      {
        id: 'event-1',
        title: 'Test Event 1',
        date: '2023-12-25',
        time: '10:00',
        location: 'Test Location',
        description: 'Test Description',
        attendees: [],
        status: 'upcoming'
      }
    ]);
    return () => {};
  })
}));

vi.mock('react-simple-wysiwyg', () => ({
  default: ({ value, onChange }: any) => (
    <textarea data-testid="editor" value={value} onChange={onChange} />
  )
}));

vi.mock('dompurify', () => ({
  default: {
    sanitize: (content: string) => content
  }
}));

describe('EventsView Accessibility', () => {
  const mockAdminUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    readArticles: [],
    attendedEvents: []
  };

  it('renders event cards with correct accessibility attributes for admin', async () => {
    await act(async () => {
      render(
        <EventsView
          user={mockAdminUser}
          onNavigateLogin={() => {}}
          theme="light"
        />
      );
    });

    // Check for Edit button
    const editButton = screen.getByRole('button', { name: /Edit event/i });
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveAttribute('title', 'Edit event');

    // Check for Delete button
    const deleteButton = screen.getByRole('button', { name: /Delete event/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('title', 'Delete event');
  });
});
