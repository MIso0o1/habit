import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Database } from "sqlite";

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";
const COOKIE_NAME = "auth_token";

let db: Database;

// --- Middleware ---

interface AuthRequest extends Request {
    userId?: number;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (ex) {
        res.clearCookie(COOKIE_NAME);
        res.status(400).json({ message: "Invalid token." });
    }
};

// --- Utility Functions ---

const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

// --- Server Start ---

async function startServer() {
    const app = express();
    const server = createServer(app);

    // Initialize DB
    db = await initializeDatabase();

    // Middleware
    app.use(express.json());
    app.use(cookieParser());

    // --- API Routes ---

    // 1. Authentication
    app.post("/api/register", async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        try {
            const password_hash = await bcrypt.hash(password, 10);
            const result = await db.run(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                [username, password_hash]
            );
            
            const userId = result.lastID;
            const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

            res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'strict' });
            res.status(201).json({ message: "User registered successfully." });

        } catch (error: any) {
            if (error.message && error.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ message: "Username already exists." });
            }
            console.error("Registration error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    app.post("/api/login", async (req: Request, res: Response) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        try {
            const user = await db.get("SELECT id, password_hash FROM users WHERE username = ?", [username]);
            if (!user) {
                return res.status(401).json({ message: "Invalid username or password." });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid username or password." });
            }

            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

            res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'strict' });
            res.json({ message: "Login successful." });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    app.post("/api/logout", (_req: Request, res: Response) => {
        res.clearCookie(COOKIE_NAME);
        res.json({ message: "Logout successful." });
    });

    app.get("/api/check-auth", authMiddleware, (req: AuthRequest, res: Response) => {
        res.json({ isAuthenticated: true, userId: req.userId });
    });

    app.get("/api/tree-health", authMiddleware, async (req: AuthRequest, res: Response) => {
        try {
            const user = await db.get("SELECT tree_health FROM users WHERE id = ?", [req.userId]);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            res.json({ treeHealth: user.tree_health });
        } catch (error) {
            console.error("Get tree health error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    // 2. Habit Tracker

    // --- Tree Health Logic ---

    // Helper function to update tree health
    const updateTreeHealth = async (userId: number, change: number) => {
        const user = await db.get("SELECT tree_health FROM users WHERE id = ?", [userId]);
        if (!user) return;

        let newHealth = user.tree_health + change;
        newHealth = Math.max(0, Math.min(100, newHealth)); // Clamp between 0 and 100

        await db.run("UPDATE users SET tree_health = ? WHERE id = ?", [newHealth, userId]);
        return newHealth;
    };

    // Function to check habits and update tree health
    const checkHabitsAndUpdateTree = async (userId: number) => {
        const habits = await db.all("SELECT id FROM habits WHERE user_id = ?", [userId]);
        if (habits.length === 0) return; // No habits, no check needed

        const today = getTodayDate();
        const user = await db.get("SELECT tree_health, last_check_date FROM users WHERE id = ?", [userId]);
        if (!user) return;

        // Check if we already processed today
        if (user.last_check_date === today) {
            return; // Already checked today
        }

        // Check logs for today
        const missedHabits = [];
        const completedHabits = [];

        for (const habit of habits) {
            const log = await db.get("SELECT 1 FROM habit_logs WHERE habit_id = ? AND date = ?", [habit.id, today]);
            if (!log) {
                missedHabits.push(habit.id);
            } else {
                completedHabits.push(habit.id);
            }
        }

        // Update tree health based on habit completion
        if (missedHabits.length > 0) {
            // Decay: Missed at least one habit
            await updateTreeHealth(userId, -25); // Decay one stage (e.g., 25 points)
            console.log(`User ${userId}: Missed ${missedHabits.length} habits. Decayed tree health.`);
        } else if (completedHabits.length > 0) {
            // Growth: All habits completed
            await updateTreeHealth(userId, 25); // Grow one stage (e.g., 25 points)
            console.log(`User ${userId}: Completed all habits. Grew tree health.`);
        }

        // Update last check date
        await db.run("UPDATE users SET last_check_date = ? WHERE id = ?", [today, userId]);
    };

    // Scheduled check function (runs daily at 23:59)
    const scheduleDailyCheck = () => {
        const scheduleNextCheck = () => {
            const now = new Date();
            const next = new Date();
            
            // Set to 23:59:00 today
            next.setHours(23, 59, 0, 0);
            
            // If it's already past 23:59 today, schedule for tomorrow
            if (now >= next) {
                next.setDate(next.getDate() + 1);
            }
            
            const timeUntilCheck = next.getTime() - now.getTime();
            
            console.log(`Next habit check scheduled for: ${next.toLocaleString()}`);
            
            setTimeout(async () => {
                console.log("Running daily habit check at 23:59...");
                const users = await db.all("SELECT id FROM users");
                for (const user of users) {
                    await checkHabitsAndUpdateTree(user.id);
                }
                console.log("Daily habit check complete.");
                
                // Schedule the next check for tomorrow
                scheduleNextCheck();
            }, timeUntilCheck);
        };
        
        scheduleNextCheck();
    };

    // Start the scheduler
    scheduleDailyCheck();

    // 2. Habit Tracker

    // GET /api/habits - Get all habits and their logs for the last 30 days
    app.get("/api/habits", authMiddleware, async (req: AuthRequest, res: Response) => {
        try {
            const habits = await db.all("SELECT id, name, created_at FROM habits WHERE user_id = ?", [req.userId]);
            
            const logs = await db.all(`
                SELECT habit_id, date 
                FROM habit_logs 
                WHERE habit_id IN (${habits.map(h => h.id).join(',') || 'NULL'})
            `);

            const habitsWithLogs = habits.map(habit => ({
                ...habit,
                logs: logs.filter(log => log.habit_id === habit.id).map(log => log.date)
            }));

            res.json(habitsWithLogs);
        } catch (error) {
            console.error("Get habits error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    // POST /api/habits - Add a new habit
    app.post("/api/habits", authMiddleware, async (req: AuthRequest, res: Response) => {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Habit name is required." });
        }

        try {
            const created_at = getTodayDate();
            await db.run(
                "INSERT INTO habits (user_id, name, created_at) VALUES (?, ?, ?)",
                [req.userId, name, created_at]
            );
            res.status(201).json({ message: "Habit added successfully." });
        } catch (error: any) {
            if (error.message && error.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ message: "You already have a habit with this name." });
            }
            console.error("Add habit error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    // POST /api/habits/:habitId/log - Log a habit completion
    app.post("/api/habits/:habitId/log", authMiddleware, async (req: AuthRequest, res: Response) => {
        const habitId = parseInt(req.params.habitId);
        const date = getTodayDate();

        try {
            // Check if habit belongs to user
            const habit = await db.get("SELECT user_id FROM habits WHERE id = ?", [habitId]);
            if (!habit || habit.user_id !== req.userId) {
                return res.status(404).json({ message: "Habit not found or does not belong to user." });
            }

            await db.run(
                "INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)",
                [habitId, date]
            );
            res.json({ message: "Habit logged successfully." });
        } catch (error: any) {
            if (error.message && error.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ message: "Habit already logged for today." });
            }
            console.error("Log habit error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    // DELETE /api/habits/:habitId - Delete a habit
    app.delete("/api/habits/:habitId", authMiddleware, async (req: AuthRequest, res: Response) => {
        const habitId = parseInt(req.params.habitId);

        try {
            // Check if habit belongs to user
            const habit = await db.get("SELECT user_id FROM habits WHERE id = ?", [habitId]);
            if (!habit || habit.user_id !== req.userId) {
                return res.status(404).json({ message: "Habit not found or does not belong to user." });
            }

            // Delete the habit (CASCADE will delete related logs)
            await db.run("DELETE FROM habits WHERE id = ?", [habitId]);

            res.json({ message: "Habit deleted successfully." });
        } catch (error) {
            console.error("Delete habit error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    // DELETE /api/habits/:habitId/log - Unlog a habit completion
    app.delete("/api/habits/:habitId/log", authMiddleware, async (req: AuthRequest, res: Response) => {
        const habitId = parseInt(req.params.habitId);
        const date = getTodayDate();

        try {
            // Check if habit belongs to user (optional, but good practice)
            const habit = await db.get("SELECT user_id FROM habits WHERE id = ?", [habitId]);
            if (!habit || habit.user_id !== req.userId) {
                return res.status(404).json({ message: "Habit not found or does not belong to user." });
            }

            const result = await db.run(
                "DELETE FROM habit_logs WHERE habit_id = ? AND date = ?",
                [habitId, date]
            );

            if (result.changes === 0) {
                return res.status(404).json({ message: "Log entry not found for today." });
            }

            res.json({ message: "Habit unlogged successfully." });
        } catch (error) {
            console.error("Unlog habit error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });

    // --- Static File Serving and Client-Side Routing ---

    // Serve static files from dist/public in production
    const staticPath =
        process.env.NODE_ENV === "production"
            ? path.resolve(__dirname, "public")
            : path.resolve(__dirname, "..", "dist", "public");

    app.use(express.static(staticPath));

    // Handle client-side routing - serve index.html for all routes
    app.get("*", (_req, res) => {
        res.sendFile(path.join(staticPath, "index.html"));
    });

    const port = process.env.PORT || 3001;

    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}/`);
    });
}

startServer().catch(console.error);
