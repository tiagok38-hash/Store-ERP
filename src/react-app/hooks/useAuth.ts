import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/react-app/components/SessionContextProvider';
import type { LoginRequest, LoginResponse, Permission } from '@/shared/auth-types';
import { UserPermissions } from '@/shared/auth-types';

interface UserProfile {
  id: string; // Supabase user ID
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  permissions: Permission[];
}

interface AuthContextType {
  user: UserProfile | null;
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
  const { session, user: supabaseUser, isLoading: isSessionLoading } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (supabaseUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role, permissions')
          .eq('id', supabaseUser.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } else if (data) {
          setUserProfile({
            id: data.id,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: supabaseUser.email || '', // Use email from auth.users
            role: data.role,
            permissions: data.permissions as Permission[],
          });
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    };

    if (!isSessionLoading) {
      fetchUserProfile();
    }
  }, [supabaseUser, isSessionLoading]);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      setIsLoading(false);
      return { success: false, message: error.message };
    }

    // Fetch profile after successful login
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, permissions')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile after login:', profileError);
        setIsLoading(false);
        return { success: false, message: 'Erro ao carregar perfil do usuário.' };
      }

      if (profileData) {
        setUserProfile({
          id: profileData.id,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: data.user.email || '',
          role: profileData.role,
          permissions: profileData.permissions as Permission[],
        });
      }
    }
    setIsLoading(false);
    return { success: true, user: userProfile, token: data.session?.access_token };
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
    }
    setUserProfile(null);
    setIsLoading(false);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!userProfile) return false;
    if (userProfile.role === 'admin') return true; // Admin has all permissions
    return userProfile.permissions.includes(permission);
  };

  return {
    user: userProfile,
    login,
    logout,
    hasPermission,
    isLoading: isLoading || isSessionLoading,
  };
};

export { AuthContext };
export type { UserProfile as User, AuthContextType };