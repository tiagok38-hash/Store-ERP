import { ReactNode } from 'react';
import type { Permission } from '@/shared/auth-types';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: Permission;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Temporarily bypass authentication - allow access to all routes
  return <>{children}</>;
}
