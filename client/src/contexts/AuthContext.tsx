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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
            subscription.unsubscribe();
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
            // --- RESILIENT UPDATE LOGIC START ---
            
            const payload = { 
                timezone: userTimezone,
                last_check_date: '1970-01-01' 
            };

            const attemptUpdate = async () => {
                return supabase
                    .from('user_profiles')
                    .update(payload)
                    .eq('id', data.user.id)
                    .select();
            };

            // 1. Try the update immediately
            let { error: profileError, data: updateData } = await attemptUpdate();

            // 2. If the update failed (likely because the row wasn't created yet), wait and try again
            if (profileError || !updateData || updateData.length === 0) {
                console.warn('Initial profile update failed. Waiting 1 second for database trigger to create row...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Try the update again
                ({ error: profileError, data: updateData } = await attemptUpdate());
                
                // --- NEW DEBUGGING LOGIC ---
                if (profileError) {
                    console.error('Second update attempt FAILED:', profileError);
                } else if (updateData && updateData.length > 0) {
                    console.log('Second update attempt SUCCEEDED. Rows updated:', updateData.length);
                } else {
                    console.error('Second update attempt FAILED: No error object, but no rows updated.');
                }
                // --- END NEW DEBUGGING LOGIC ---
            }

            // --- RESILIENT UPDATE LOGIC END ---

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
