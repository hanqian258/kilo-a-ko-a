import { render, screen, fireEvent } from '@testing-library/react';
import { RoleVerificationModal } from './RoleVerificationModal';
import { UserRole } from '../types';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock the environment variable handling if needed, but vi.stubEnv is preferred
// Note: import.meta.env is read at runtime in the component

describe('RoleVerificationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnVerify = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock for env var to be empty to simulate production without config
    vi.stubEnv('VITE_ADMIN_CODE', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('verifies successfully with correct code from env', () => {
    vi.stubEnv('VITE_ADMIN_CODE', 'SECRET_CODE');
    render(<RoleVerificationModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />);

    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: 'SECRET_CODE' } });
    fireEvent.click(screen.getByText('Verify Access'));

    expect(screen.getByText('Identity Verified')).toBeInTheDocument();
  });

  it('fails with incorrect code', () => {
    vi.stubEnv('VITE_ADMIN_CODE', 'SECRET_CODE');
    render(<RoleVerificationModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />);

    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: 'WRONG_CODE' } });
    fireEvent.click(screen.getByText('Verify Access'));

    expect(screen.queryByText('Identity Verified')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid Access Code')).toBeInTheDocument();
  });

  it('does NOT use fallback if env var is missing (Security Fix)', () => {
    // Ensure env var is empty
    vi.stubEnv('VITE_ADMIN_CODE', '');

    render(<RoleVerificationModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />);

    const input = screen.getByPlaceholderText('Access Code');
    // Attempt to use the hardcoded fallback
    fireEvent.change(input, { target: { value: 'CORAL2026' } });
    fireEvent.click(screen.getByText('Verify Access'));

    // Should FAIL verification
    expect(screen.queryByText('Identity Verified')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid Access Code')).toBeInTheDocument();
  });
});
