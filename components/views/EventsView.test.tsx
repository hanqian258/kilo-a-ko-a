import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventsView } from './EventsView';
import { UserRole } from '../../types';
import * as firestore from 'firebase/firestore';

// Mocks
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock('../../utils/firebase', () => ({
  db: {},
}));

vi.mock('../../utils/eventService', () => ({
  saveEvent: vi.fn(),
}));

// Mock react-simple-wysiwyg
vi.mock('react-simple-wysiwyg', () => {
  return {
    default: ({ value, onChange }: { value: string, onChange: (e: any) => void }) => (
      <div data-testid="editor">
        <textarea
          value={value}
          onChange={onChange}
          aria-label="Description"
        />
      </div>
    ),
  };
});

// Mock imageProcessor
vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

describe('EventsView Accessibility', () => {
  const mockUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    readArticles: []
  };

  const mockNavigateLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock onSnapshot to return empty list initially
    (firestore.onSnapshot as any).mockImplementation((q: any, cb: any) => {
        cb({ docs: [] });
        return () => {};
    });
    // Mock getDocs for users
    (firestore.getDocs as any).mockResolvedValue({
        forEach: vi.fn(),
    });
  });

  it('renders form inputs with associated labels', async () => {
    render(<EventsView user={mockUser} onNavigateLogin={mockNavigateLogin} theme="light" />);

    // Open editor
    const createButton = screen.getByText('Create Event');
    fireEvent.click(createButton);

    // Check title input
    const titleLabel = screen.getByText('Event Title');
    const titleInput = screen.getByLabelText('Event Title');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('id', 'event-title');
    expect(titleLabel).toHaveAttribute('for', 'event-title');

    // Check location input
    const locationInput = screen.getByLabelText('Location');
    expect(locationInput).toBeInTheDocument();
    expect(locationInput).toHaveAttribute('id', 'event-location');

    // Check date input
    const dateInput = screen.getByLabelText('Date');
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute('id', 'event-date');
  });

  it('renders "Mark as Canceled" as a switch button', async () => {
    render(<EventsView user={mockUser} onNavigateLogin={mockNavigateLogin} theme="light" />);

    // Open editor
    fireEvent.click(screen.getByText('Create Event'));

    // Check toggle
    const toggle = screen.getByRole('switch', { name: /Mark as Canceled/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Toggle it
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders icon buttons with aria-labels', async () => {
    render(<EventsView user={mockUser} onNavigateLogin={mockNavigateLogin} theme="light" />);

    // Open editor
    fireEvent.click(screen.getByText('Create Event'));

    // Check close button
    const closeButton = screen.getByLabelText('Close editor');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('title', 'Close');
  });
});
