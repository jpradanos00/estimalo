import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Session as SupabaseSession, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: SupabaseSession | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes('rate')) return { error: 'Demasiados intentos. Espera unos minutos.' };
      if (error.message.includes('already')) return { error: 'Este email ya está registrado.' };
      return { error: error.message };
    }
    if (data.user && data.session) {
      setUser(data.user);
      setSession(data.session);
    }
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid')) return { error: 'Email o contraseña incorrectos.' };
      if (error.message.includes('rate')) return { error: 'Demasiados intentos. Espera unos minutos.' };
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('current_session_code');
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(() => ({ user, session, loading, signUp, signIn, signInWithGoogle, signOut }), [
    user, session, loading, signUp, signIn, signInWithGoogle, signOut,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
