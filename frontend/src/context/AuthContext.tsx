import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, SchoolSetting } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  schoolSettings: SchoolSetting | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: Role) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('school_cms_token'));
  const [role, setRole] = useState<Role | null>((localStorage.getItem('school_cms_role') as Role) || null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSetting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const settings = await api.getSettings();
      setSchoolSettings(settings);
    } catch (e) {
      console.error('Failed to load school settings', e);
    }
  };

  const loadProfile = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await api.getProfile();
      setUser(res.user);
      setRole(res.user.role);
      if (res.settings) setSchoolSettings(res.settings);
    } catch (error) {
      console.error('Session expired or invalid', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
    loadProfile();
  }, [token]);

  const login = async (identifier: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const res = await api.login({ identifier, password });
      localStorage.setItem('school_cms_token', res.token);
      localStorage.setItem('school_cms_role', res.user.role);
      setToken(res.token);
      setUser(res.user);
      setRole(res.user.role);
      await refreshSettings();
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const switchRole = async (newRole: Role) => {
    // Map role to standard demo username
    const roleUsernameMap: Record<Role, string> = {
      SUPER_ADMIN: 'superadmin',
      SCHOOL_ADMIN: 'admin',
      PRINCIPAL: 'principal',
      TEACHER: 'teacher',
      ACCOUNTANT: 'accountant',
      RECEPTIONIST: 'receptionist',
      PARENT: 'parent',
      STUDENT: 'student',
    };
    const username = roleUsernameMap[newRole] || 'admin';
    await login(username, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('school_cms_token');
    localStorage.removeItem('school_cms_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        schoolSettings,
        isLoading,
        login,
        logout,
        switchRole,
        refreshSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
