import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventCard } from './EventCard';
import { User, Event, UserRole } from '../../types';
import React from 'react';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: (content: string) => content,
  },
}));

describe('EventCard', () => {
  const mockUser: User = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.DONOR,
  };

  const mockEvent: Event = {
    id: 'event1',
    title: 'Test Event',
    date: '2023-12-25',
    time: '10:00',
    location: 'Test Location',
    description: '<p>Test Description</p>',
    attendees: [],
    status: 'upcoming',
  };

  const defaultProps = {
    event: mockEvent,
    user: mockUser,
    isAdmin: false,
    isDark: false,
    allUsers: {},
    onRSVP: vi.fn(),
    onCheckIn: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders event details', () => {
    render(<EventCard {...defaultProps} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('calls onRSVP when RSVP button is clicked', () => {
    render(<EventCard {...defaultProps} />);
    const rsvpButton = screen.getByText("I'm Going");
    fireEvent.click(rsvpButton);
    expect(defaultProps.onRSVP).toHaveBeenCalledWith(mockEvent);
  });

  it('shows edit/delete buttons for admin', () => {
    render(<EventCard {...defaultProps} isAdmin={true} />);
    const editButton = screen.getByLabelText(`Edit ${mockEvent.title}`);
    const deleteButton = screen.getByLabelText(`Delete ${mockEvent.title}`);
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockEvent);

    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockEvent.id);
  });

  it('does not show edit/delete buttons for non-admin', () => {
    render(<EventCard {...defaultProps} isAdmin={false} />);
    const editButton = screen.queryByLabelText(`Edit ${mockEvent.title}`);
    const deleteButton = screen.queryByLabelText(`Delete ${mockEvent.title}`);
    expect(editButton).not.toBeInTheDocument();
    expect(deleteButton).not.toBeInTheDocument();
  });
});
