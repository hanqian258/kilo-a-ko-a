import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventsView } from './EventsView';
import { UserRole } from '../../types';

// Mock dependencies
vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(),
}));

vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

vi.mock('../../utils/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn((q, callback) => {
    // Simulate event snapshot
    callback({
      docs: [
        {
          id: '1',
          data: () => ({
            id: '1',
            title: 'Test Event',
            date: '2023-01-01',
            time: '12:00',
            location: 'Test Location',
            description: 'Test Description',
            attendees: [],
            status: 'upcoming',
            imageUrl: 'http://example.com/image.jpg',
          }),
        },
      ],
    });
    return () => {};
  }),
}));

describe('EventsView Accessibility', () => {
  const mockUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  it('renders accessible buttons for admin actions', () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    // Check for Edit Event button
    const editButton = screen.getByLabelText('Edit event');
    expect(editButton).toBeInTheDocument();

    // Check for Delete Event button
    const deleteButton = screen.getByLabelText('Delete event');
    expect(deleteButton).toBeInTheDocument();
  });

  it('renders accessible close button in editor', () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    // Open editor
    const createButton = screen.getByText('Create Event');
    fireEvent.click(createButton);

    // Check for Close Editor button
    const closeButton = screen.getByLabelText('Close editor');
    expect(closeButton).toBeInTheDocument();
  });
});
