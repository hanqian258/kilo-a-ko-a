import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AwarenessView } from './AwarenessView';
import { UserRole } from '../../types';

// Mock dependencies
vi.mock('../../utils/articleService', () => ({
  subscribeToArticles: vi.fn((callback) => {
    callback([
      {
        id: '1',
        title: 'Test Article',
        content: 'Test Content',
        excerpt: 'Test Excerpt',
        author: 'Test Author',
        date: '2023-01-01',
        imageUrl: 'http://example.com/image.jpg',
        tags: ['Test'],
      },
    ]);
    return () => {};
  }),
  saveArticle: vi.fn(),
  deleteArticle: vi.fn(),
}));

vi.mock('../../utils/imageProcessor', () => ({
  compressImage: vi.fn(),
}));

vi.mock('../../utils/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
}));

describe('AwarenessView Accessibility', () => {
  const mockUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockArticles = [
    {
      id: '1',
      title: 'Test Article',
      content: 'Test Content',
      excerpt: 'Test Excerpt',
      author: 'Test Author',
      date: '2023-01-01',
      imageUrl: 'http://example.com/image.jpg',
      tags: ['Test'],
    },
  ];

  it('renders accessible buttons for admin actions', () => {
    render(<AwarenessView user={mockUser} theme="light" articles={mockArticles} setArticles={vi.fn()} />);

    // Check for Edit Article button
    const editButton = screen.getByLabelText('Edit article');
    expect(editButton).toBeInTheDocument();

    // Check for Delete Article button
    const deleteButton = screen.getByLabelText('Delete article');
    expect(deleteButton).toBeInTheDocument();
  });

  it('renders accessible close button in expanded view', () => {
    render(<AwarenessView user={mockUser} theme="light" articles={mockArticles} setArticles={vi.fn()} />);

    // Open article
    const expandButton = screen.getByText('Explore Lesson');
    fireEvent.click(expandButton);

    // Check for Close Expanded View button
    const closeButton = screen.getByLabelText('Close expanded view');
    expect(closeButton).toBeInTheDocument();
  });

  it('renders accessible close button in editor', () => {
    render(<AwarenessView user={mockUser} theme="light" articles={mockArticles} setArticles={vi.fn()} />);

    // Open editor
    const publishButton = screen.getByText('Publish Knowledge');
    fireEvent.click(publishButton);

    // Check for Close Editor button
    const closeButton = screen.getByLabelText('Close editor');
    expect(closeButton).toBeInTheDocument();
  });
});
