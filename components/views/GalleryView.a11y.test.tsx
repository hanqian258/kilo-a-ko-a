import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GalleryView } from './GalleryView';
import { CoralImage, UserRole, User } from '../../types';

// Mock AutoSizer to provide fixed dimensions
vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ children }: any) => children({ width: 1000, height: 800 }),
  default: ({ children }: any) => children({ width: 1000, height: 800 }),
}));

const mockImages: CoralImage[] = [
    {
      id: 'img-1',
      url: 'https://example.com/img-1.jpg',
      uploaderName: 'Tester',
      date: '2023-01-01',
      location: 'Test Location',
      description: 'Test Description',
      scientificName: 'Pocillopora meandrina',
    },
    {
        id: 'img-2',
        url: 'https://example.com/img-2.jpg',
        uploaderName: 'Tester 2',
        date: '2023-01-02',
        location: 'Test Location 2',
        description: 'Test Description 2',
        scientificName: 'Porites lobata',
      }
  ];

// Mock galleryService
vi.mock('../../utils/galleryService', () => {
  return {
    subscribeToGallery: (callback: (data: any[]) => void) => {
      callback(mockImages);
      return () => {};
    },
    saveGalleryImage: vi.fn(),
    deleteGalleryImage: vi.fn(),
  };
});

describe('GalleryView Accessibility', () => {
  it('renders gallery items with correct accessibility attributes', async () => {
    await act(async () => {
        render(
        <GalleryView
            user={null}
            theme="light"
        />
        );
    });

    // Get the first item by its expected aria-label
    const item = screen.getByLabelText('View details for Pocillopora meandrina');

    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('role', 'button');
    expect(item).toHaveAttribute('tabIndex', '0');
  });

  it('activates gallery item on Enter key press', async () => {
    await act(async () => {
        render(
        <GalleryView
            user={null}
            theme="light"
        />
        );
    });

    const item = screen.getByLabelText('View details for Pocillopora meandrina');

    // Simulate Enter key press
    fireEvent.keyDown(item, { key: 'Enter', code: 'Enter' });

    // Check if the modal opened by looking for the "Back to Gallery" button
    const backButton = screen.getByRole('button', { name: /back to gallery/i });
    expect(backButton).toBeInTheDocument();

    // Also verify the content matches the clicked item
    const headings = screen.getAllByRole('heading', { name: 'Pocillopora meandrina' });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('activates gallery item on Space key press', async () => {
    await act(async () => {
        render(
        <GalleryView
            user={null}
            theme="light"
        />
        );
    });

    const item = screen.getByLabelText('View details for Porites lobata');

    // Simulate Space key press
    fireEvent.keyDown(item, { key: ' ', code: 'Space' });

    // Check if the modal opened
    const backButton = screen.getByRole('button', { name: /back to gallery/i });
    expect(backButton).toBeInTheDocument();

    const headings = screen.getAllByRole('heading', { name: 'Porites lobata' });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders edit and delete buttons with aria-labels for admin users', async () => {
    const adminUser: User = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
    };

    await act(async () => {
        render(
        <GalleryView
            user={adminUser}
            theme="light"
        />
        );
    });

    const editButtons = screen.getAllByLabelText(/Edit Pocillopora meandrina/i);
    const deleteButtons = screen.getAllByLabelText(/Delete Pocillopora meandrina/i);

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('renders close button with aria-label in upload modal', async () => {
     const adminUser: User = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
    };

    await act(async () => {
        render(
        <GalleryView
            user={adminUser}
            theme="light"
        />
        );
    });

    // Open upload modal
    const uploadButton = screen.getByText(/New Observation/i);
    fireEvent.click(uploadButton);

    const closeButton = screen.getByLabelText(/Close upload modal/i);
    expect(closeButton).toBeInTheDocument();
  });
});
