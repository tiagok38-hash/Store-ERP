import { ReactNode } from 'react';
import type { Permission } from '@/shared/auth-types';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: Permission;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Temporariamente bypass authentication - allow access to all routes
  // Para reativar a proteção de rota, remova esta linha e descomente a lógica de autenticação real.
  return <>{children}</>;
}