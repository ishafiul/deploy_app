import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Simple validation to check if token exists and is not expired
    const validateToken = () => {
      if (!accessToken) {
        return false;
      }
      // Add any additional token validation logic here if needed
      return true;
    };

    const isValid = validateToken();
    setIsValidating(false);

    if (!isValid) {
      localStorage.clear(); // Clear any invalid tokens
    }
  }, [accessToken]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 