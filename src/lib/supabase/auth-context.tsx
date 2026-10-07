'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from './client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email?: string;
  name?: string;
}

interface SupabaseAuthContextType {
  user: AppUser | null;
  isUserLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      // In local/demo exploration mode, provide a friendly default user
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('budgetwise_demo_user') : null;
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const demoUser: AppUser = {
          id: 'demo-user',
          email: 'demo@budgetwise.local',
          name: 'Demo Explorer',
        };
        setUser(demoUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('budgetwise_demo_user', JSON.stringify(demoUser));
        }
      }
      setIsUserLoading(false);
      return;
    }

    // When configured with real Supabase credentials:
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        });
      } else {
        setUser(null);
      }
      setIsUserLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        });
      } else {
        setUser(null);
      }
      setIsUserLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      const demoUser: AppUser = {
        id: 'demo-user',
        email,
        name: email.split('@')[0],
      };
      setUser(demoUser);
      localStorage.setItem('budgetwise_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!configured) {
      const demoUser: AppUser = {
        id: 'demo-user',
        email,
        name: name || email.split('@')[0],
      };
      setUser(demoUser);
      localStorage.setItem('budgetwise_demo_user', JSON.stringify(demoUser));
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (!configured) {
      localStorage.removeItem('budgetwise_demo_user');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        isUserLoading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
