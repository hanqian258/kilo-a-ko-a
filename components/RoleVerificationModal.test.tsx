import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoleVerificationModal } from './RoleVerificationModal';
import { UserRole } from '../types';

describe('RoleVerificationModal', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fails safely when env var is missing (FIXED)', async () => {
    // Ensure VITE_ADMIN_CODE is undefined
    vi.stubEnv('VITE_ADMIN_CODE', '');

    const onVerify = vi.fn();
    const onClose = vi.fn();

    // Mock console.error to avoid cluttering test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={onClose}
        onVerify={onVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    const button = screen.getByText('Verify Access');

    // Attempt with the old fallback code
    fireEvent.change(input, { target: { value: 'CORAL2026' } });
    fireEvent.click(button);

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/System configuration error/i)).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('VITE_ADMIN_CODE is missing'));
    consoleSpy.mockRestore();
  });

  it('allows access with correct code when env var is set', async () => {
    // Mock the env var
    vi.stubEnv('VITE_ADMIN_CODE', 'SECRET_CODE_123');

    const onVerify = vi.fn();
    const onClose = vi.fn();

    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={onClose}
        onVerify={onVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    const button = screen.getByText('Verify Access');

    // Enter correct code
    fireEvent.change(input, { target: { value: 'SECRET_CODE_123' } });
    fireEvent.click(button);

    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Identity Verified')).toBeInTheDocument();
    });

    // Select role
    fireEvent.click(screen.getByText('Admin'));
    fireEvent.click(screen.getByText('Update Role'));

    expect(onVerify).toHaveBeenCalledWith(UserRole.ADMIN);
  });

  it('denies access with incorrect code when env var is set', async () => {
    vi.stubEnv('VITE_ADMIN_CODE', 'SECRET_CODE_123');

    const onVerify = vi.fn();
    const onClose = vi.fn();

    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={onClose}
        onVerify={onVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    const button = screen.getByText('Verify Access');

    // Enter wrong code
    fireEvent.change(input, { target: { value: 'WRONG_CODE' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Invalid Access Code')).toBeInTheDocument();
    });
  });
});
