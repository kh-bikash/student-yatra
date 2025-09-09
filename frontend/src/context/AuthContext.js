import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens')
            ? JSON.parse(localStorage.getItem('authTokens'))
            : null
    );

    const [user, setUser] = useState(() =>
        localStorage.getItem('authTokens')
            ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access)
            : null
    );

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loginUser = async (username, password, tokenData = null) => {
        if (tokenData) {
            setAuthTokens(tokenData);
            setUser(jwtDecode(tokenData.access));
            localStorage.setItem('authTokens', JSON.stringify(tokenData));
            navigate('/dashboard');
            return;
        }

        try {
            const response = await fetch(`http://${window.location.hostname}:8000/api/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                alert(data.detail || 'Invalid credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Failed to connect to the server.');
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
    };

    useEffect(() => {
        if (loading) {
            setLoading(false);
        }
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};
