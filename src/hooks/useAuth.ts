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
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.user || null;
  } catch {
    return null;
  }
}

export function saveSession(user: MoodCatUser, accessToken: string, expiresAt: number) {
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

  useEffect(() => {
    const user = getStoredSession();
    if (user) {
      setAuthState({ user, isAnonymous: false, isLoading: false });
    } else {
      const anonId = localStorage.getItem('anon_user_id');
      setAuthState({ user: null, isAnonymous: !!anonId, isLoading: false });
    }
  }, []);

  const setAnonymousMode = () => {
    const anonId = localStorage.getItem('anon_user_id') || `anon_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('anon_user_id', anonId);
    setAuthState({ user: null, isAnonymous: true, isLoading: false });
  };

  const login = (user: MoodCatUser) => {
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
