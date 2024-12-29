import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '@/services/api';

export const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [isValidating, setIsValidating] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const validateSession = async () => {
            try {
                // Make a lightweight request to verify the session
                await axios.get('/user/validate-session');
                setIsAuthenticated(true);
            } catch (error) {
                // If the request fails, the session is invalid
                localStorage.removeItem('profile');
                setIsAuthenticated(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateSession();
    }, []);

    // Show nothing while checking authentication
    if (isValidating) {
        return null; // or a loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;