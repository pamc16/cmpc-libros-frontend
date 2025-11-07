// src/contexts/auth.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api/axios';
import { AuthProvider, useAuth } from './AuthProvider';

// Mock del API
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Componente de prueba para acceder al hook
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="username">{user?.username || 'null'}</span>
      <button onClick={() => login('test', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes user from localStorage', () => {
    localStorage.setItem('token', '12345');
    localStorage.setItem('user', JSON.stringify({ id: 'test', username: 'test' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('username').textContent).toBe('test');
  });

  it('login stores token/user and updates state', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { access_token: 'abc123' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Login');
    loginBtn.click();

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('abc123');
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ username: 'test' }));
      expect(screen.getByTestId('username').textContent).toBe('test');
    });
  });

  it('logout clears token/user and updates state', async () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify({ username: 'test' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByText('Logout');
    logoutBtn.click();

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(screen.getByTestId('username').textContent).toBe('null');
    });
  });

  it('useAuth throws if used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // evita logs de error de react
    const TestOutside = () => {
      useAuth(); // debería lanzar
      return null;
    };

    expect(() => render(<TestOutside />)).toThrow('useAuth must be used inside AuthProvider');
    consoleSpy.mockRestore();
  });
});
