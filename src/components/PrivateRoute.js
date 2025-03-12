import { useAuthenticationStatus } from '@nhost/react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace={true} />;
  }

  return children;
};

export default PrivateRoute;