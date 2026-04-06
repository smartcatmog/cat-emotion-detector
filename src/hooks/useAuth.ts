import { useState, useEffect } from 'react';

// 完全不依赖 Supabase SDK，用自己的 session 管理
const SESSION_KEY = 'moodcat_session';

export interface MoodCatUser {
  id: string;
  email: string;
  username?: string;
}

function getStoredSession(): MoodCatUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // 检查是否过期
    if (session.expires_at) {
      const expiresAtSeconds = typeof session.expires_at === 'number' && session.expires_at > 10000000000 
        ? session.expires_at / 1000 
        : session.expires_at;
      if (Date.now() / 1000 > expiresAtSeconds) {
        console.log('[getStoredSession] Session expired');
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
    }
    return session.user || null;
  } catch (e) {
    console.error('[getStoredSession] Error:', e);
    return null;
  }
}

export function saveSession(user: MoodCatUser, accessToken: string, expiresAt: number) {
  console.log('[saveSession] Saving session for user:', user.id, 'expiresAt:', expiresAt);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, access_token: accessToken, expires_at: expiresAt }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw).access_token || null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: MoodCatUser | null;
  isAnonymous: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAnonymous: false,
    isLoading: true,
  });

  // Helper function to update auth state
  const updateAuthState = () => {
    const user = getStoredSession();
    console.log('[useAuth] updateAuthState - user from localStorage:', user);
    if (user) {
      setAuthState({ user, isAnonymous: false, isLoading: false });
    } else {
      const anonId = localStorage.getItem('anon_user_id');
      setAuthState({ user: null, isAnonymous: !!anonId, isLoading: false });
    }
  };

  // Initial load from localStorage
  useEffect(() => {
    console.log('[useAuth] Initial load');
    updateAuthState();
  }, []);

  // Listen for storage changes (e.g., from other tabs or programmatic updates)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('[useAuth] Storage change detected');
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setAnonymousMode = () => {
    const anonId = localStorage.getItem('anon_user_id') || `anon_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('anon_user_id', anonId);
    setAuthState({ user: null, isAnonymous: true, isLoading: false });
  };

  const login = (user: MoodCatUser) => {
    console.log('[useAuth] login called with user:', user);
    // 确保 session 已保存到 localStorage（由 LoginModal 调用 saveSession）
    // 然后更新状态
    setAuthState({ user, isAnonymous: false, isLoading: false });
  };

  const logout = () => {
    clearSession();
    setAuthState({ user: null, isAnonymous: false, isLoading: false });
  };

  return {
    user: authState.user,
    username: authState.user?.username || null,
    isAnonymous: authState.isAnonymous,
    isAuthenticated: !!authState.user,
    isLoading: authState.isLoading,
    setAnonymousMode,
    login,
    logout,
  };
}
