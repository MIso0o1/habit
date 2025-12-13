// server/index.ts
import express from "express";
import { createServer } from "http";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/db.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DB_PATH = path.join(__dirname, "habit_tracker.sqlite");
async function initializeDatabase() {
  const db2 = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  await db2.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            tree_health INTEGER DEFAULT 100,
            last_check_date TEXT DEFAULT (date('now'))
        );

        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(user_id, name),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL, -- YYYY-MM-DD format
            UNIQUE(habit_id, date),
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        );
    `);
  console.log("Database initialized and tables created.");
  return db2;
}

// server/index.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";
var COOKIE_NAME = "auth_token";
var db;
var authMiddleware = (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (ex) {
    res.clearCookie(COOKIE_NAME);
    res.status(400).json({ message: "Invalid token." });
  }
};
var getTodayDate = () => {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
};
async function startServer() {
  const app = express();
  const server = createServer(app);
  db = await initializeDatabase();
  app.use(express.json());
  app.use(cookieParser());
  app.post("/api/register", async (req, res) => {
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
      res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1e3, sameSite: "strict" });
      res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ message: "Username already exists." });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  app.post("/api/login", async (req, res) => {
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
      res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1e3, sameSite: "strict" });
      res.json({ message: "Login successful." });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  app.post("/api/logout", (_req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: "Logout successful." });
  });
  app.get("/api/check-auth", authMiddleware, (req, res) => {
    res.json({ isAuthenticated: true, userId: req.userId });
  });
  app.get("/api/tree-health", authMiddleware, async (req, res) => {
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
  const updateTreeHealth = async (userId, change) => {
    const user = await db.get("SELECT tree_health FROM users WHERE id = ?", [userId]);
    if (!user) return;
    let newHealth = user.tree_health + change;
    newHealth = Math.max(0, Math.min(100, newHealth));
    await db.run("UPDATE users SET tree_health = ? WHERE id = ?", [newHealth, userId]);
    return newHealth;
  };
  const checkHabitsAndUpdateTree = async (userId) => {
    const habits = await db.all("SELECT id FROM habits WHERE user_id = ?", [userId]);
    if (habits.length === 0) return;
    const today = getTodayDate();
    const user = await db.get("SELECT tree_health, last_check_date FROM users WHERE id = ?", [userId]);
    if (!user) return;
    if (user.last_check_date === today) {
      return;
    }
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
    if (missedHabits.length > 0) {
      await updateTreeHealth(userId, -25);
      console.log(`User ${userId}: Missed ${missedHabits.length} habits. Decayed tree health.`);
    } else if (completedHabits.length > 0) {
      await updateTreeHealth(userId, 25);
      console.log(`User ${userId}: Completed all habits. Grew tree health.`);
    }
    await db.run("UPDATE users SET last_check_date = ? WHERE id = ?", [today, userId]);
  };
  const scheduleDailyCheck = () => {
    const scheduleNextCheck = () => {
      const now = /* @__PURE__ */ new Date();
      const next = /* @__PURE__ */ new Date();
      next.setHours(23, 59, 0, 0);
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
        scheduleNextCheck();
      }, timeUntilCheck);
    };
    scheduleNextCheck();
  };
  scheduleDailyCheck();
  app.get("/api/habits", authMiddleware, async (req, res) => {
    try {
      const habits = await db.all("SELECT id, name, created_at FROM habits WHERE user_id = ?", [req.userId]);
      const logs = await db.all(`
                SELECT habit_id, date 
                FROM habit_logs 
                WHERE habit_id IN (${habits.map((h) => h.id).join(",") || "NULL"})
            `);
      const habitsWithLogs = habits.map((habit) => ({
        ...habit,
        logs: logs.filter((log) => log.habit_id === habit.id).map((log) => log.date)
      }));
      res.json(habitsWithLogs);
    } catch (error) {
      console.error("Get habits error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  app.post("/api/habits", authMiddleware, async (req, res) => {
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
    } catch (error) {
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ message: "You already have a habit with this name." });
      }
      console.error("Add habit error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  app.post("/api/habits/:habitId/log", authMiddleware, async (req, res) => {
    const habitId = parseInt(req.params.habitId);
    const date = getTodayDate();
    try {
      const habit = await db.get("SELECT user_id FROM habits WHERE id = ?", [habitId]);
      if (!habit || habit.user_id !== req.userId) {
        return res.status(404).json({ message: "Habit not found or does not belong to user." });
      }
      await db.run(
        "INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)",
        [habitId, date]
      );
      res.json({ message: "Habit logged successfully." });
    } catch (error) {
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ message: "Habit already logged for today." });
      }
      console.error("Log habit error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  app.delete("/api/habits/:habitId", authMiddleware, async (req, res) => {
    const habitId = parseInt(req.params.habitId);
    try {
      const habit = await db.get("SELECT user_id FROM habits WHERE id = ?", [habitId]);
      if (!habit || habit.user_id !== req.userId) {
        return res.status(404).json({ message: "Habit not found or does not belong to user." });
      }
      await db.run("DELETE FROM habits WHERE id = ?", [habitId]);
      res.json({ message: "Habit deleted successfully." });
    } catch (error) {
      console.error("Delete habit error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
  app.delete("/api/habits/:habitId/log", authMiddleware, async (req, res) => {
    const habitId = parseInt(req.params.habitId);
    const date = getTodayDate();
    try {
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
  const staticPath = process.env.NODE_ENV === "production" ? path2.resolve(__dirname2, "public") : path2.resolve(__dirname2, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path2.join(staticPath, "index.html"));
  });
  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
