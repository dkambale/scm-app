import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Permission } from '../types';
import api, { endpoints } from '../api';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userName: string, password: string, accountId: string, type: 'ADMIN' | 'TEACHER' | 'STUDENT') => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const raw = await storage.getItem('SCM-AUTH');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const data = parsed?.data;
          if (data) {
            const mappedUser: User = {
              id: data.id,
              email: data.email || data.userName || '',
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              role: (data.type?.toLowerCase?.() || 'student') as any,
              permissions: data?.role?.permissions || [],
              profilePic: data.profilePic,
            };
            setUser(mappedUser);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userName: string, password: string, accountId: string, type: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    try {
      const response = await api.post(endpoints.auth.login, { userName, password, accountId, type });
      if (response?.data?.accessToken) {
        await storage.setItem('SCM-AUTH', JSON.stringify(response.data));
        const data = response.data?.data || {};
        const mappedUser: User = {
          id: data.id,
          email: data.email || userName,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          role: (data.type?.toLowerCase?.() || 'student') as any,
          permissions: data?.role?.permissions || [],
          profilePic: data.profilePic,
        };
        setUser(mappedUser);
      } else {
        throw new Error(response?.data?.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem('SCM-AUTH');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
