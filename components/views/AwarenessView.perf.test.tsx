import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRole } from '../../types';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
}));

// Mock utils/firebase
vi.mock('../../utils/firebase', () => ({
  db: {},
}));

// Mock the articleService
vi.mock('../../utils/articleService', () => ({
  subscribeToArticles: vi.fn(),
  saveArticle: vi.fn(),
  deleteArticle: vi.fn(),
}));

// Import component AFTER mocks
import { AwarenessView } from './AwarenessView';
import { subscribeToArticles } from '../../utils/articleService';

describe('AwarenessView Performance', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.DONOR,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies hybrid lazy loading strategy to article images', async () => {
    // Create 5 mock articles
    const mockArticles = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      title: `Article ${i}`,
      content: 'Content',
      excerpt: 'Excerpt',
      author: 'Author',
      date: '2023-01-01',
      imageUrl: `http://example.com/image-${i}.jpg`,
      tags: ['Tag'],
    }));

    // Mock implementation to return articles immediately
    (subscribeToArticles as any).mockImplementation((callback: any) => {
      callback(mockArticles);
      return () => {};
    });

    const setArticles = vi.fn();
    render(<AwarenessView user={mockUser} theme="light" articles={mockArticles} setArticles={setArticles} />);

    // Wait for articles to be rendered
    await waitFor(() => {
        expect(screen.getByText('Article 0')).toBeInTheDocument();
    });

    // Get all article images
    // Note: There might be other images (like icons inside buttons?), so we filter by alt text or src pattern if needed.
    // The component renders an image for each article with alt={article.title}.
    const images = screen.getAllByRole('img');

    // Filter images that are article covers
    const articleImages = images.filter(img => img.getAttribute('src')?.includes('http://example.com/image-'));

    expect(articleImages).toHaveLength(5);

    // First 2 should be eager (or at least NOT lazy)
    // Note: 'loading' attribute might be missing if default (eager), so we check it's not 'lazy'.
    expect(articleImages[0].getAttribute('loading')).not.toBe('lazy');
    expect(articleImages[1].getAttribute('loading')).not.toBe('lazy');

    // Subsequent images should be lazy
    expect(articleImages[2].getAttribute('loading')).toBe('lazy');
    expect(articleImages[3].getAttribute('loading')).toBe('lazy');
    expect(articleImages[4].getAttribute('loading')).toBe('lazy');
  });
});
