import { useState, useEffect, createContext, useContext } from 'react';
import type { LoginRequest, LoginResponse, Permission } from '@/shared/auth-types';
import { UserPermissions } from '@/shared/auth-types';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock user for bypassing authentication
    const mockUser: User = {
      id: 1,
      name: 'Usuário Admin',
      email: 'admin@storeflow.com',
      role: 'admin',
      permissions: Object.values(UserPermissions) as Permission[]
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user as User);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has all permissions
    return user.permissions.includes(permission);
  };

  return {
    user,
    login,
    logout,
    hasPermission,
    isLoading,
  };
};

export { AuthContext };
export type { User, AuthContextType };
