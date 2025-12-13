import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userId: number | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/check-auth', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserId(data.userId);
                } else {
                    setIsAuthenticated(false);
                    setUserId(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                setUserId(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (username: string, password: string) => {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        setIsAuthenticated(true);
        // Get the user ID from the response or check auth
        const checkResponse = await fetch('/api/check-auth', {
            method: 'GET',
            credentials: 'include',
        });
        if (checkResponse.ok) {
            const data = await checkResponse.json();
            setUserId(data.userId);
        }
    };

    const login = async (username: string, password: string) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        setIsAuthenticated(true);
        const checkResponse = await fetch('/api/check-auth', {
            method: 'GET',
            credentials: 'include',
        });
        if (checkResponse.ok) {
            const data = await checkResponse.json();
            setUserId(data.userId);
        }
    };

    const logout = async () => {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setIsAuthenticated(false);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
