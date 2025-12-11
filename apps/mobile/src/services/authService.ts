import { supabase } from './supabaseClient';
import { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  async signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // Create user profile in public.users table
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name: name || email.split('@')[0],
      });

      if (profileError) {
        console.warn('Failed to create user profile:', profileError);
      }
    }

    return { user: data.user, session: data.session, error: null };
  },

  async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  async getSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  async refreshSession(): Promise<AuthResponse> {
    const {
      data: { session, user },
      error,
    } = await supabase.auth.refreshSession();

    if (error) {
      return { user: null, session: null, error };
    }

    return { user, session, error: null };
  },

  async resetPasswordForEmail(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'myapp://reset-password',
    });
    return { error };
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};
