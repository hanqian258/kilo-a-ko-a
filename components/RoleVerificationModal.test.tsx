import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleVerificationModal } from './RoleVerificationModal';
import { UserRole } from '../types';

describe('RoleVerificationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnVerify = vi.fn();
  const TEST_CODE = 'TEST_SECRET_CODE';

  beforeEach(() => {
    // Mock the environment variable
    vi.stubEnv('VITE_ADMIN_CODE', TEST_CODE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should not render when isOpen is false', () => {
    render(
      <RoleVerificationModal
        isOpen={false}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );
    expect(screen.queryByText('Organization Access')).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );
    expect(screen.getByText('Organization Access')).toBeDefined();
    expect(screen.getByPlaceholderText('Access Code')).toBeDefined();
  });

  it('should show error for invalid code', () => {
    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );

    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: 'WRONG_CODE' } });

    const submitBtn = screen.getByText('Verify Access');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Invalid Access Code')).toBeDefined();
  });

  it('should verify with correct code and allow role selection', () => {
    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );

    // Enter correct code
    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: TEST_CODE } });

    const submitBtn = screen.getByText('Verify Access');
    fireEvent.click(submitBtn);

    // Should see success state
    expect(screen.getByText('Identity Verified')).toBeDefined();
    expect(screen.queryByText('Invalid Access Code')).toBeNull();

    // Select Admin role
    const adminBtn = screen.getByText('Admin');
    fireEvent.click(adminBtn);

    // Confirm
    const updateBtn = screen.getByText('Update Role');
    fireEvent.click(updateBtn);

    expect(mockOnVerify).toHaveBeenCalledWith(UserRole.ADMIN);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should be case-insensitive for code', () => {
    render(
      <RoleVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onVerify={mockOnVerify}
      />
    );

    // Enter correct code with mixed case
    const input = screen.getByPlaceholderText('Access Code');
    fireEvent.change(input, { target: { value: TEST_CODE.toLowerCase() } });

    const submitBtn = screen.getByText('Verify Access');
    fireEvent.click(submitBtn);

    // Should see success state
    expect(screen.getByText('Identity Verified')).toBeDefined();
  });
});
