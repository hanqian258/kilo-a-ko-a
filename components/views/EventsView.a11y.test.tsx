import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
  onSnapshot: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
}));

vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(),
}));

vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

// Mock Editor since it might cause issues in JSDOM
vi.mock('react-simple-wysiwyg', () => ({
  default: ({ value, onChange }: any) => (
    <textarea data-testid="editor" value={value} onChange={onChange} />
  ),
}));

import { onSnapshot, getDocs } from 'firebase/firestore';

describe('EventsView Accessibility', () => {
  const mockUser = {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockEvents = [
    {
      id: '1',
      title: 'Coral Restoration',
      date: '2023-12-01',
      time: '10:00',
      endTime: '12:00',
      location: 'Kahaluu',
      description: 'Restoration event',
      attendees: [],
      status: 'upcoming',
      imageUrl: 'test.jpg'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (onSnapshot as any).mockImplementation((query: any, callback: any) => {
      callback({
        docs: mockEvents.map(e => ({
          id: e.id,
          data: () => e
        }))
      });
      return () => {};
    });

    (getDocs as any).mockResolvedValue({
        forEach: vi.fn()
    });
  });

  it('renders admin action buttons with accessible labels', async () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    await waitFor(() => {
      expect(screen.getByText('Coral Restoration')).toBeInTheDocument();
    });

    // Check Edit button
    const editBtn = screen.getByRole('button', { name: 'Edit Coral Restoration' });
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).toHaveAttribute('title', 'Edit Coral Restoration');

    // Check Delete button
    const deleteBtn = screen.getByRole('button', { name: 'Delete Coral Restoration' });
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).toHaveAttribute('title', 'Delete Coral Restoration');
  });

  it('renders close button with accessible label in editor modal', async () => {
    render(<EventsView user={mockUser} onNavigateLogin={vi.fn()} theme="light" />);

    // Open Editor
    const createBtn = screen.getByRole('button', { name: /Create Event/i });
    fireEvent.click(createBtn);

    // Check Close button
    const closeBtn = screen.getByRole('button', { name: 'Close editor' });
    expect(closeBtn).toBeInTheDocument();
  });
});
