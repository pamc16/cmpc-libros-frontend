// src/api/axios.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./axios', async () => {
  const original = await vi.importActual('./axios');
  // Avoid spreading a callable axios instance; cast to any and use Object.assign
  const modifiedDefault = Object.assign((original.default as any), {
    defaults: {
      ...((original.default as any).defaults || {}),
      baseURL: 'http://test-base-url.com',
    },
  });
  return {
    __esModule: true,
    ...original,
    default: modifiedDefault,
  };
});

import api from './axios';

describe('axios instance', () => {
  beforeEach(() => localStorage.clear());

  it('should have mocked baseURL', () => {
    expect(api.defaults.baseURL).toBe('http://test-base-url.com');
  });

  it('should set headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    expect(api.defaults.withCredentials).toBe(false);
  });

  it('should add Authorization header if token exists', () => {
    localStorage.setItem('token', '12345');
    const config = { headers: {} as any };
    // @ts-ignore
    const modified = api.interceptors.request.handlers[0].fulfilled(config);
    expect(modified.headers.Authorization).toBe('Bearer 12345');
  });

  it('should not add Authorization header if no token', () => {
    const config = { headers: {} as any };
    // @ts-ignore
    const modified = api.interceptors.request.handlers[0].fulfilled(config);
    expect(modified.headers.Authorization).toBeUndefined();
  });
});
