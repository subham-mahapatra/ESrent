'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { frontendServices } from '@/lib/services/frontendServices';

interface AuthContextType {
  token: string | null;
  user: Record<string, unknown> | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: { email: string; password: string; name: string; role: string }) => Promise<{ success: boolean; user?: Record<string, unknown>; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      frontendServices.verifyToken(storedToken)
        .then(({ valid, user }) => {
          if (valid && user) {
            setUser(user);
          } else {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token: authToken, user: userData } = await frontendServices.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', authToken);
      }
      setToken(authToken);
      setUser(userData);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const register = async (userData: { email: string; password: string; name: string; role: string }) => {
    try {
      const { user: newUser } = await frontendServices.register(userData);
      return { success: true, user: newUser };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isInitialized, isAuthenticated: !!token && !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 