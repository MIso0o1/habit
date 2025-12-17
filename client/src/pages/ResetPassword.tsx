import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSEO } from '@/hooks/useSEO';

export default function ResetPassword() {
    useSEO('resetPassword');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validSession, setValidSession] = useState(false);
    const { updatePassword } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        // Check if user has a valid session from the reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setValidSession(true);
            } else {
                setError('Invalid or expired reset link. Please request a new one.');
            }
        };

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            await updatePassword(password);
            toast.success('Password updated successfully!');
            setLocation('/dashboard');
        } catch (error: any) {
            setError(error.message || 'Failed to update password');
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (!validSession) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
                        <CardDescription>The reset link is invalid or has expired</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                            {error}
                        </p>
                        <Button 
                            onClick={() => setLocation('/forgot-password')} 
                            className="w-full"
                        >
                            Request New Reset Link
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl">Create New Password</CardTitle>
                    <CardDescription>Enter your new password below</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                New Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
