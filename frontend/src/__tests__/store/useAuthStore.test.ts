import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { act } from '@testing-library/react';
import { useAuthStore } from '@/store/useAuthStore';

// Jest uyumluluğu için global fetch ve document cookie mock
const originalFetch = global.fetch;
const originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');

describe('useAuthStore', () => {
  beforeEach(() => {
    // store reset
    const { getState, setState } = { getState: useAuthStore.getState, setState: useAuthStore.setState } as any;
    act(() => {
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        lastActivity: null,
      });
    });

    // fetch mock
    // @ts-expect-error jest mock
    global.fetch = jest.fn();

    // cookie mock
    let cookieStore = '';
    Object.defineProperty(document, 'cookie', {
      get() {
        return cookieStore;
      },
      set(val: string) {
        cookieStore = cookieStore ? `${cookieStore}; ${val}` : val;
      },
      configurable: true,
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalCookie) Object.defineProperty(document, 'cookie', originalCookie);
  });

  it('login state ve cookie ayarlar', async () => {
    const user = { id: 'u1', email: 'a@b.com', role: 'super_admin' } as any;
    await act(async () => {
      await useAuthStore.getState().login(user, 'at', 'rt');
    });
    const state = useAuthStore.getState();
    expect(state.user?.id).toBe('u1');
    expect(state.isAuthenticated).toBe(true);
    expect(document.cookie.includes('accessToken=at')).toBe(true);
    expect(document.cookie.includes('refreshToken=rt')).toBe(true);
  });

  it('logout state sıfırlar ve cookie temizler', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    await act(async () => {
      await useAuthStore.getState().login({ id: 'u1', email: 'a', role: 'super_admin' } as any, 'at', 'rt');
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(document.cookie.includes('accessToken=')).toBe(true);
  });

  it('refreshTokens başarılı olduğunda accessToken ve user günceller', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'new', user: { id: 'u1', role: 'super_admin' } }),
    });

    const ok = await useAuthStore.getState().refreshTokens();
    const state = useAuthStore.getState();
    expect(ok).toBe(true);
    expect(state.accessToken).toBe('new');
    expect(state.user?.id).toBe('u1');
  });

  it('role helpers doğru çalışır', async () => {
    await act(async () => {
      await useAuthStore.getState().login({ id: 'u1', email: 'a', role: 'restaurant_admin' } as any, 'at', 'rt');
    });
    const s = useAuthStore.getState();
    expect(s.isAdmin()).toBe(false);
    expect(s.isRestaurantUser()).toBe(true);
    expect(s.hasAnyRole(['restaurant_owner', 'restaurant_admin'] as any)).toBe(true);
  });
});


