import { supabase, Database } from './supabase';

type HabitRow = Database['public']['Tables']['habits']['Row'];
type HabitLogRow = Database['public']['Tables']['habit_logs']['Row'];

export interface Habit {
    id: number;
    name: string;
    created_at: string;
    logs: string[];
}

const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

export const HabitService = {
    /**
     * Fetches all habits for the current user along with their logs.
     */
    async fetchHabits(): Promise<Habit[]> {
        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
            .from('habits')
            .select('id, name, created_at')
            .order('created_at', { ascending: true });

        if (habitsError) {
            throw new Error(habitsError.message);
        }

        const habitIds = habitsData.map(h => h.id);

        // Fetch logs for those habits
        const { data: logsData, error: logsError } = await supabase
            .from('habit_logs')
            .select('habit_id, date')
            .in('habit_id', habitIds);

        if (logsError) {
            throw new Error(logsError.message);
        }

        // Combine habits and logs
        const habitsWithLogs: Habit[] = habitsData.map(habit => ({
            ...habit,
            logs: logsData
                .filter(log => log.habit_id === habit.id)
                .map(log => log.date),
        }));

        return habitsWithLogs;
    },

    /**
     * Adds a new habit for the current user.
     */
    async addHabit(name: string): Promise<void> {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { error } = await supabase
            .from('habits')
            .insert({
                user_id: user.id,
                name: name.trim(),
            });

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('You already have a habit with this name.');
            }
            throw new Error(error.message);
        }
    },

    /**
     * Logs a habit completion for today.
     */
    async logHabit(habitId: number): Promise<void> {
        const date = getTodayDate();
        
        const { error } = await supabase
            .from('habit_logs')
            .insert({
                habit_id: habitId,
                date: date,
            });

        if (error) {
            if (error.code === '23505') { // Unique constraint violation (already logged)
                // This is fine, just means it was already logged today
                return;
            }
            throw new Error(error.message);
        }
    },

    /**
     * Unlogs a habit completion for today.
     */
    async unlogHabit(habitId: number): Promise<void> {
        const date = getTodayDate();

        const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId)
            .eq('date', date);

        if (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Deletes a habit.
     */
    async deleteHabit(habitId: number): Promise<void> {
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', habitId);

        if (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Fetches the user's tree health.
     */
    async fetchTreeHealth(): Promise<number> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('tree_health')
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data.tree_health;
    }
};
