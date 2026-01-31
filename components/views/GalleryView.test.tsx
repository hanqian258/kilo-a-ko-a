import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GalleryView } from './GalleryView';
import { CoralImage } from '../../types';

// Mock AutoSizer to provide fixed dimensions in JSDOM
vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ children }: any) => children({ width: 1000, height: 800 }),
  // Handle both named and default exports just in case
  default: ({ children }: any) => children({ width: 1000, height: 800 }),
}));

// Mock galleryService
vi.mock('../../utils/galleryService', () => {
  return {
    subscribeToGallery: (callback: (data: any[]) => void) => {
      // Generate 1000 mock images
      const mockImages: any[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `img-${i}`,
        url: `https://example.com/img-${i}.jpg`,
        uploaderName: 'Tester',
        date: '2023-01-01',
        location: 'Test Location',
        description: 'Test Description',
        scientificName: 'Test Coral',
      }));
      callback(mockImages);
      return () => {};
    },
    saveGalleryImage: vi.fn(),
    deleteGalleryImage: vi.fn(),
  };
});

describe('GalleryView Performance', () => {
  it('renders a large number of items in the DOM (baseline)', async () => {
    await act(async () => {
      render(
        <GalleryView
          user={null}
          theme="light"
        />
      );
    });

    // Count the number of rendered cards (images).
    // With virtualization, only a subset should be rendered.
    const renderedImages = screen.getAllByRole('img');
    expect(renderedImages.length).toBeLessThan(100);
  });
});
