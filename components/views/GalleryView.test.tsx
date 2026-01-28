import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GalleryView } from './GalleryView';
import { CoralImage } from '../../types';

// Mock AutoSizer to provide fixed dimensions in JSDOM
vi.mock('react-virtualized-auto-sizer', () => ({
  AutoSizer: ({ children }: any) => children({ width: 1000, height: 800 }),
  // Handle both named and default exports just in case
  default: ({ children }: any) => children({ width: 1000, height: 800 }),
}));

describe('GalleryView Performance', () => {
  it('renders a large number of items in the DOM (baseline)', () => {
    // Generate 1000 mock images
    const mockImages: CoralImage[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `img-${i}`,
      url: `https://example.com/img-${i}.jpg`,
      uploaderName: 'Tester',
      date: '2023-01-01',
      location: 'Test Location',
      description: 'Test Description',
      scientificName: 'Test Coral',
    }));

    const setImages = vi.fn();

    const { container } = render(
      <GalleryView
        user={null}
        images={mockImages}
        setImages={setImages}
        theme="light"
      />
    );

    // Count the number of rendered cards.
    // Each card has an image with the scientific name as alt text.
    // Or we can query by a specific class or element structure.
    // The images have alt text: img.scientificName || "Coral"

    // We can also count specific divs.
    // The grid items have a specific structure.
    // Let's count the `img` tags that are part of the gallery grid.
    // Note: The modal is not open, so only grid images should be there.
    // But there might be other images (like in the upload preview if set, but it's null).

    const renderedImages = screen.getAllByRole('img');

    // There might be some static images/icons?
    // Let's print the length to be sure.

    // We expect roughly 1000 images (one per card).
    // Plus maybe a few icons if they are rendered as imgs?
    // Lucide icons are SVGs, so they won't show up as 'img' role usually unless they have role="img".
    // The code uses lucide-react which renders SVGs.

    // Expectation for OPTIMIZED: Much less than 1000
    // With virtualization, only visible items + overscan are rendered.
    // JSDOM might have a small viewport, leading to very few items.
    expect(renderedImages.length).toBeLessThan(100);
  });
});
