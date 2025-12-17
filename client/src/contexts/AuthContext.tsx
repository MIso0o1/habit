import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Supabase Auth Listener
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user);
                setIsAuthenticated(true);
            }
            setLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const register = async (email: string, password: string) => {
        // Detect the user's current IANA timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('Detected timezone:', userTimezone);
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }
        
        if (data.user) {
            // --- FINAL SOLUTION: Call Edge Function to bypass RLS/Triggers ---
            const payload = { 
                user_id: data.user.id,
                timezone: userTimezone
            };

            // NOTE: The URL is relative to your Supabase project's base URL
            try {
                const response = await fetch('https://mbrqjbkxorxwyrhzfimv.supabase.co/functions/v1/update-profile-timezone', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Pass the user's access token for context, though the function uses the Service Role Key
                        'Authorization': `Bearer ${data.user.access_token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error('Edge Function call failed:', response.status, response.statusText);
                } else {
                    console.log('Profile update successfully delegated to Edge Function.');
                }
            } catch (error) {
                console.error('Error calling Edge Function:', error);
            }
            // --- END EDGE FUNCTION CALL LOGIC ---

            setUser(data.user);
            setIsAuthenticated(true);
        }
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        if (data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        setIsAuthenticated(false);
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            throw new Error(error.message);
        }
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            throw new Error(error.message);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, resetPassword, updatePassword }}>
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
