import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Permission } from '../types';
import api, { endpoints } from '../api';
import { storage } from '../utils/storage';

// --- STORAGE KEYS ---
const API_KEY_STORAGE = '@authToken';
const USER_STORAGE = '@currentUser';

// --- INTERFACE DEFINITIONS (Updated to match API response and usage) ---

// Define the shape of the actions property within a permission
export interface ActionPermissions {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

// Define the shape of a single permission object
export interface Permission {
  entityName: string; // e.g., 'TEACHER', 'EXAM'
  name: string;
  id: number;
  actions: ActionPermissions;
}

// Define the final User object stored in state/AsyncStorage
export interface User {
  // Authentication/Session Data
  accessToken: string;
  // User Profile Data (from response.data)
  userId: number; // mapped from data.id
  userName: string;
  type: 'STUDENT' | 'ADMIN' | 'TEACHER';
  firstName: string;
  lastName: string;
  accountId: number;
  // Authorization Data (from response.role)
  roleName: string; // mapped from role.name
  permissions: Permission[]; // mapped from role.permissions
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userName: string, password: string, accountId: string, type: 'ADMIN' | 'TEACHER' | 'STUDENT') => Promise<void>;
  logout: () => Promise<void>;
  // CORRECTED: Permission check now takes entity name and action type
  hasPermission: (entityName: string, action: keyof ActionPermissions) => boolean;
  // Removed setUser from context exposure (state should be managed internally via login/logout)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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
      console.error('Error during AuthContext login processing:', error);
      throw error; // Re-throw so LoginScreen can catch and show Snackbar
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

  /**
   * Checks if the current user has a specific permission action for an entity.
   * @param entityName The name of the entity (e.g., 'TEACHER', 'EXAM').
   * @param action The action type (e.g., 'view', 'edit', 'add', 'delete').
   */
  // CORRECTED: Implementation based on the nested permission structure
  const hasPermission = (entityName: string, action: keyof ActionPermissions): boolean => {
    if (!user) return false;
    
    // Find the specific permission object by its entityName (case insensitive check)
    const permission = user.permissions.find(
      (p) => p.entityName.toUpperCase() === entityName.toUpperCase()
    );
    
    // Check if the permission exists and if the specific action is true
    return permission ? permission.actions[action] === true : false;
  };

  return (
    <AuthContext.Provider
      // CORRECTED: Removed setUser from the value object
      value={{ user, loading, login, logout, hasPermission }}
    >
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
