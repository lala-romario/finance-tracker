import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

function ProtectedRoute() {

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {

        const checkAuthentication = async () => {

            const token = localStorage.getItem('token');

            if (!token) {
                setAuthenticated(false);
                setLoading(false);
                return;
            }

            try {

                await api.get('/me');

                setAuthenticated(true);

            } catch (error) {

                console.error('Authentication failed:', error);

                localStorage.removeItem('token');

                setAuthenticated(false);

            } finally {

                setLoading(false);

            }
        };

        checkAuthentication();

    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;