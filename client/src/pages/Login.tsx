import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';

export default function Login() {
    useSEO('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [, setLocation] = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Login successful!');
            setLocation('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your credentials to access your habit tracker</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                               value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <div className="mt-4 space-y-3">
                        <div className="text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <button
                                onClick={() => setLocation('/register')}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Register here
                            </button>
                        </div>
                        <div className="text-center text-sm">
                            <button
                                onClick={() => setLocation('/forgot-password')}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
