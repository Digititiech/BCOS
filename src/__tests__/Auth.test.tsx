import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { expect, test } from 'vitest';

// Child component that reads auth context
function TestComponent() {
  const { profile } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{profile?.email}</span>
      <span data-testid="user-role">{profile?.role}</span>
    </div>
  );
}

test('AuthProvider serves sandbox user details in Sprint 0 preview mode', async () => {
  await act(async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });

  // Verify email and role matches default sandbox config
  expect(screen.getByTestId('user-email').textContent).toBe('admin@bcos.om');
  expect(screen.getByTestId('user-role').textContent).toBe('Admin');
});
