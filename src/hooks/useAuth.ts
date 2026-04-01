import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser } from '../lib/supabase';

interface AuthState {
  user: User | null;
  username: string | null;
  isAnonymous: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    username: null,
    isAnonymous: false,
    isLoading: true,
  });

  const fetchUsername = async (userId: string) => {
    const { data } = await supabase.from('users').select('username, display_name').eq('id', userId).single();
    return data?.display_name || data?.username || null;
  };

  useEffect(() => {
    getCurrentUser().then(async user => {
      if (user) {
        const username = await fetchUsername(user.id);
        setAuthState({ user, username, isAnonymous: false, isLoading: false });
      } else {
        const anonId = localStorage.getItem('anon_user_id');
        setAuthState({ user: null, username: null, isAnonymous: !!anonId, isLoading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 忽略 null session 事件，避免误清除登录状态
      if (event === 'SIGNED_OUT') {
        setAuthState({ user: null, username: null, isAnonymous: false, isLoading: false });
        return;
      }
      if (session?.user) {
        const username = await fetchUsername(session.user.id);
        setAuthState({ user: session.user, username, isAnonymous: false, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setAnonymousMode = () => {
    const anonId = localStorage.getItem('anon_user_id') || `anon_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('anon_user_id', anonId);
    setAuthState({ user: null, username: null, isAnonymous: true, isLoading: false });
  };

  return {
    user: authState.user,
    username: authState.username,
    isAnonymous: authState.isAnonymous,
    isAuthenticated: !!authState.user,
    isLoading: authState.isLoading,
    setAnonymousMode,
  };
}
