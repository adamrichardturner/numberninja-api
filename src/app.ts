import express from "express";
import dotenv from "dotenv";
import passport from "./middleware/passport";
import authRoutes from "./routes/authRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import questionRoutes from "./routes/questionRoutes";
import pool from "./config/database";

dotenv.config();

const app = express();

app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

// Database connection test
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Database connected:", res.rows[0]);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
