import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventsView } from './EventsView';
import { UserRole } from '../../types';
import DOMPurify from 'dompurify';
import { onSnapshot } from 'firebase/firestore';
import * as eventService from '../../utils/eventService';

// Mock dependencies
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ forEach: vi.fn() })),
}));

vi.mock('../../utils/firebase', () => ({
  db: {},
}));

vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(),
  subscribeToEvents: vi.fn(),
}));

// Mock react-simple-wysiwyg
vi.mock('react-simple-wysiwyg', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="editor"
      value={value}
      onChange={onChange}
    />
  ),
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((str) => str),
  },
}));

describe('EventsView Performance', () => {
  const mockUser = {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    readArticles: [],
  };

  const mockEvents = Array.from({ length: 20 }, (_, i) => ({
    id: `event-${i}`,
    title: `Event ${i}`,
    date: '2023-12-25',
    time: '10:00',
    location: 'Test Location',
    description: `<p>Description for event ${i}</p>`,
    attendees: [],
    status: 'upcoming' as const,
    imageUrl: '',
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup subscribeToEvents to return mock events immediately
    (eventService.subscribeToEvents as any).mockImplementation((callback: any) => {
      callback(mockEvents);
      return () => {};
    });

    // Setup onSnapshot to return mock events immediately
    (onSnapshot as any).mockImplementation((query: any, callback: any) => {
      callback({
        docs: mockEvents.map(event => ({
          id: event.id,
          data: () => event,
        })),
      });
      return () => {};
    });
  });

  it('minimizes DOMPurify.sanitize calls when typing in the form', async () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText('Event 0')).toBeInTheDocument();
    });

    // Check initial sanitize calls
    // Should be called for each event (20 events)
    const initialCallCount = (DOMPurify.sanitize as any).mock.calls.length;
    expect(initialCallCount).toBeGreaterThanOrEqual(20);

    // Open the editor
    const createButton = screen.getByText('Create Event');
    fireEvent.click(createButton);

    // Type in the title field
    // Note: The label is not currently associated with the input, so we grab by role or index.
    // There are multiple inputs. Title is likely the first one.
    const inputs = screen.getAllByRole('textbox');
    const titleInput = inputs[0]; // Assumption based on render order

    // Reset mock calls before typing test to be precise
    (DOMPurify.sanitize as any).mockClear();

    // Type "Test" - 4 characters
    fireEvent.change(titleInput, { target: { value: 'T' } });
    fireEvent.change(titleInput, { target: { value: 'Te' } });
    fireEvent.change(titleInput, { target: { value: 'Tes' } });
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    // With optimization (React.memo), typing should NOT re-render the list items.
    // So calls should be 0 (or very low if something else triggers a re-render).
    const typingCallCount = (DOMPurify.sanitize as any).mock.calls.length;

    console.log(`DOMPurify calls during typing: ${typingCallCount}`);

    // Expect significantly reduced calls (ideally 0)
    expect(typingCallCount).toBeLessThan(5);
  });
});
