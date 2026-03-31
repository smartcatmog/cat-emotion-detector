import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser } from '../lib/supabase';

interface AuthState {
  user: User | null;
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
    // Check for existing session
    getCurrentUser().then(user => {
      if (user) {
        setAuthState({ user, isAnonymous: false, isLoading: false });
      } else {
        // Check for anonymous mode
        const anonId = localStorage.getItem('anon_user_id');
        setAuthState({
          user: null,
          isAnonymous: !!anonId,
          isLoading: false,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user || null,
        isAnonymous: false,
        isLoading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const setAnonymousMode = () => {
    const anonId = localStorage.getItem('anon_user_id') || `anon_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('anon_user_id', anonId);
    setAuthState({ user: null, isAnonymous: true, isLoading: false });
  };

  return {
    user: authState.user,
    isAnonymous: authState.isAnonymous,
    isAuthenticated: !!authState.user,
    isLoading: authState.isLoading,
    setAnonymousMode,
  };
}
