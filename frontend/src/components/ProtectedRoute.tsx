import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
