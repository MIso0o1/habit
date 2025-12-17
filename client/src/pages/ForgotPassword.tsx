import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';

export default function ForgotPassword() {
    useSEO('forgotPassword');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { resetPassword } = useAuth();
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await resetPassword(email);
            setSubmitted(true);
            toast.success('Password reset email sent! Check your inbox.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl">Check Your Email</CardTitle>
                        <CardDescription>Password reset instructions have been sent</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                            We've sent a password reset link to <strong>{email}</strong>. Please check your email and follow the instructions to reset your password.
                        </p>
                        <p className="text-xs text-gray-500">
                            The link will expire in 24 hours for security reasons.
                        </p>
                        <Button 
                            onClick={() => setLocation('/login')} 
                            className="w-full"
                        >
                            Back to Login
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
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>Enter your email to receive a password reset link</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <button
                            onClick={() => setLocation('/login')}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Back to Login
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
