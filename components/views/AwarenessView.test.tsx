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

describe('AwarenessView Security', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.DONOR,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sanitizes HTML content to prevent XSS', async () => {
    const maliciousContent = '<img src=x onerror=alert("XSS")>Safe Content';
    const mockArticles = [
      {
        id: '1',
        title: 'Malicious Article',
        content: maliciousContent,
        excerpt: 'Excerpt',
        author: 'Hacker',
        date: '2023-01-01',
        imageUrl: 'http://example.com/image.jpg',
        tags: ['Security'],
      },
    ];

    // Mock implementation to return malicious articles immediately
    (subscribeToArticles as any).mockImplementation((callback: any) => {
      callback(mockArticles);
      return () => {};
    });

    const setArticles = vi.fn();
    render(<AwarenessView user={mockUser} theme="light" articles={mockArticles} setArticles={setArticles} />);

    // Open the article to trigger dangerouslySetInnerHTML
    const button = await screen.findByText('Explore Lesson');
    button.click();

    // Wait for the modal content
    await waitFor(() => {
        expect(screen.getByText('Malicious Article')).toBeInTheDocument();
    });

    // Check if the onerror attribute is removed (sanitized)
    // We check if "Safe Content" is present.
    expect(screen.getByText(/Safe Content/)).toBeInTheDocument();

    // Inspect the HTML to ensure onerror is gone.
    const container = screen.getByText(/Safe Content/).closest('div');
    expect(container).not.toBeNull();
    if (container) {
        expect(container.innerHTML).not.toContain('onerror=');
        expect(container.innerHTML).not.toContain('alert("XSS")');
    }
  });

  it('opens the editor without crashing when clicking Add Knowledge', async () => {
    const adminUser = {
      ...mockUser,
      role: UserRole.ADMIN,
    };

    render(<AwarenessView user={adminUser} theme="light" articles={[]} setArticles={vi.fn()} />);

    const addButton = screen.getByText('Publish Knowledge');
    expect(addButton).toBeInTheDocument();

    await waitFor(() => {
        addButton.click();
    });

    // Check if editor is visible.
    // We look for text inside the editor modal, e.g. "Illuminate a Topic"
    expect(await screen.findByText('Illuminate a Topic')).toBeInTheDocument();

    // Also check inputs are present
    expect(screen.getByText('Topic Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
