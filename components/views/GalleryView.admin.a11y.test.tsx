import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GalleryView } from './GalleryView';
import { UserRole } from '../../types';

// Mock AutoSizer to provide fixed dimensions
vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ children }: any) => children({ width: 1000, height: 800 }),
}));

// Mock galleryService
vi.mock('../../utils/galleryService', () => ({
  subscribeToGallery: (callback: (data: any[]) => void) => {
    callback([
      {
        id: '1',
        url: 'https://example.com/img-1.jpg',
        uploaderName: 'Tester',
        date: '2023-01-01',
        location: 'Test Location',
        description: 'Test Description',
        scientificName: 'Pocillopora meandrina',
      },
    ]);
    return () => {};
  },
  saveGalleryImage: vi.fn(),
  deleteGalleryImage: vi.fn(),
}));

vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

describe('GalleryView Admin Accessibility', () => {
  const mockUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  it('renders accessible buttons for admin actions', async () => {
    await act(async () => {
      render(<GalleryView user={mockUser} theme="light" />);
    });

    // Check for Edit Monitoring Record button
    const editButton = screen.getByLabelText('Edit monitoring record');
    expect(editButton).toBeInTheDocument();

    // Check for Delete Monitoring Record button
    const deleteButton = screen.getByLabelText('Delete monitoring record');
    expect(deleteButton).toBeInTheDocument();
  });
});
