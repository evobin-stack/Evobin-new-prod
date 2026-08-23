import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authApi, userApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  language?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token) {
          // Attempt fetching live profile from backend
          const profileRes = await userApi.getProfile();
          if (profileRes.success && profileRes.data) {
            const fetchedUser = profileRes.data;
            setUser(fetchedUser);
            localStorage.setItem('userData', JSON.stringify(fetchedUser));
          } else if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res: any = await authApi.login({ email, password });

      if (res.success && res.data) {
        const payload: any = res.data;
        const token = payload.token || (payload.data && payload.data.token);
        const userObj = payload.user || (payload.data && payload.data.user);

        if (token && userObj) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(userObj));
          setUser(userObj as User);
          return { success: true };
        }
      }
      return { success: false, error: res.error || 'Invalid credentials' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed. Please check backend connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res: any = await authApi.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'user',
        phone: userData.phone || '',
        language: (userData.language as any) || 'en',
      });

      if (res.success && res.data) {
        const payload: any = res.data;
        const token = payload.token || (payload.data && payload.data.token);
        const userObj = payload.user || (payload.data && payload.data.user);

        if (token && userObj) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(userObj));
          setUser(userObj as User);
          return { success: true };
        }
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    authApi.logout().catch(() => {});
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      userApi.updateProfile(userData).catch(() => {});
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
