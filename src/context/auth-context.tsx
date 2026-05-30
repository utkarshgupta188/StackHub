'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, name: string) => Promise<boolean>;
  signUp: (email: string, name: string) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (name: string, role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted user session
    const stored = localStorage.getItem('stackhub_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse persisted session', e);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, name: string): Promise<boolean> => {
    // Simulated validation and signin
    const mockUser: User = {
      email,
      name: name || email.split('@')[0],
      role: 'Full Stack Engineer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    };
    setUser(mockUser);
    localStorage.setItem('stackhub_user', JSON.stringify(mockUser));
    return true;
  };

  const signUp = async (email: string, name: string): Promise<boolean> => {
    return signIn(email, name);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('stackhub_user');
  };

  const updateProfile = (name: string, role: string) => {
    if (!user) return;
    const updated = { ...user, name, role };
    setUser(updated);
    localStorage.setItem('stackhub_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
