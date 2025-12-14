import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HabitService, Habit } from '@/lib/HabitService';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Trash2, LogOut, Plus } from 'lucide-react';

// interface Habit is now imported from HabitService
    id: number;
    name: string;
    created_at: string;
    logs: string[];
}

export default function Dashboard() {
    const { isAuthenticated, logout, user } = useAuth();
    const [, setLocation] = useLocation();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabitName, setNewHabitName] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingHabit, setAddingHabit] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !loading) {
            setLocation('/login');
        }
    }, [isAuthenticated, loading, setLocation]);

    // Fetch habits on mount
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchHabits();
        }
    }, [isAuthenticated]);

    const fetchHabits = async () => {
        try {
            const data = await HabitService.fetchHabits();
            setHabits(data);
        } catch (error) {
            console.error('Fetch habits error:', error);
            toast.error('Failed to load habits');
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newHabitName.trim()) {
            toast.error('Habit name cannot be empty');
            return;
        }

        setAddingHabit(true);

        try {
            await HabitService.addHabit(newHabitName);

            toast.success('Habit added successfully!');
            setNewHabitName('');
            await fetchHabits();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add habit');
        } finally {
            setAddingHabit(false);
        }
    };

    const handleLogHabit = async (habitId: number, isLogged: boolean) => {
        try {
            if (isLogged) {
                await HabitService.unlogHabit(habitId);
            } else {
                await HabitService.logHabit(habitId);
            }

            toast.success(isLogged ? 'Habit unlogged' : 'Habit logged for today!');
            await fetchHabits();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update habit log');
        }
    };

    const handleDeleteHabit = async (habitId: number, habitName: string) => {
        if (!confirm(`Are you sure you want to delete "${habitName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await HabitService.deleteHabit(habitId);

            toast.success('Habit deleted successfully!');
            await fetchHabits();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete habit');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            setLocation('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const getTodayDate = (): string => {
        return new Date().toISOString().split('T')[0];
    };

    const isHabitLoggedToday = (habit: Habit): boolean => {
        return habit.logs.includes(getTodayDate());
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your habits...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Habit & Skill Tracker</h1>
                        <p className="text-gray-600 mt-1">Track your daily habits and skills to build consistency</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/">
                            <Button variant="outline" className="gap-2">
                                Home
                            </Button>
                        </Link>
                        <Button onClick={handleLogout} variant="outline" className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Add New Habit */}
                <Card className="mb-8 shadow-lg">
                    <CardHeader>
                        <CardTitle>Add a New Habit</CardTitle>
                        <CardDescription>Create a custom habit or skill to track</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddHabit} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="e.g., Morning Exercise, Read 30 minutes, Drink 8 glasses of water"
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                disabled={addingHabit}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={addingHabit} className="gap-2">
                                <Plus className="w-4 h-4" />
                                {addingHabit ? 'Adding...' : 'Add Habit'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Habits List */}
                <div className="space-y-4">
                    {habits.length === 0 ? (
                        <Card className="shadow-lg">
                            <CardContent className="pt-8">
                                <p className="text-center text-gray-500">No habits yet. Create one to get started!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        habits.map((habit) => {
                            const isLogged = isHabitLoggedToday(habit);
                            return (
                                <Card key={habit.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1">
                                                <Checkbox
                                                    checked={isLogged}
                                                    onCheckedChange={() => handleLogHabit(habit.id, isLogged)}
                                                    className="w-6 h-6"
                                                />
                                                <div className="flex-1">
                                                    <h3 className={`text-lg font-semibold ${isLogged ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                        {habit.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Created: {new Date(habit.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">{habit.logs.length}</p>
                                                    <p className="text-xs text-gray-500">days completed</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteHabit(habit.id, habit.name)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
