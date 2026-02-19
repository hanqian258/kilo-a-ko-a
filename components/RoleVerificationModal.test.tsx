import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoleVerificationModal } from './RoleVerificationModal';
import { UserRole } from '../types';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('RoleVerificationModal Security', () => {
  const mockOnClose = vi.fn();
  const mockOnVerify = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('securely denies access when VITE_ADMIN_CODE is missing (no hardcoded fallback)', async () => {
    // Simulate missing env var
    vi.stubEnv('VITE_ADMIN_CODE', undefined);

    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: 'CORAL2026' } });

    const verifyButton = screen.getByText('Verify Access');
    fireEvent.click(verifyButton);

    // Should show error message
    expect(screen.getByText('Invalid Access Code')).toBeInTheDocument();
    // Should NOT show success state
    expect(screen.queryByText('Identity Verified')).not.toBeInTheDocument();
  });

  it('grants access with correct VITE_ADMIN_CODE', async () => {
    vi.stubEnv('VITE_ADMIN_CODE', 'SECRET123');

    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: 'SECRET123' } });

    const verifyButton = screen.getByText('Verify Access');
    fireEvent.click(verifyButton);

    expect(screen.getByText('Identity Verified')).toBeInTheDocument();
  });

  it('denies access with incorrect code', async () => {
    vi.stubEnv('VITE_ADMIN_CODE', 'SECRET123');

    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: 'WRONG' } });

    const verifyButton = screen.getByText('Verify Access');
    fireEvent.click(verifyButton);

    expect(screen.getByText('Invalid Access Code')).toBeInTheDocument();
    expect(screen.queryByText('Identity Verified')).not.toBeInTheDocument();
  });

  it('denies access with old hardcoded "CORAL2026" if VITE_ADMIN_CODE is set differently', async () => {
    vi.stubEnv('VITE_ADMIN_CODE', 'SECRET123');

    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: 'CORAL2026' } });

    const verifyButton = screen.getByText('Verify Access');
    fireEvent.click(verifyButton);

    expect(screen.getByText('Invalid Access Code')).toBeInTheDocument();
    expect(screen.queryByText('Identity Verified')).not.toBeInTheDocument();
  });
});
