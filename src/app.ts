import express from "express";
import dotenv from "dotenv";
import sessionRoutes from "./routes/sessionRoutes";
import questionRoutes from "./routes/questionRoutes";
import performanceRoutes from "./routes/performanceRoutes";
import pool from "./config/database";
import http from "http";
import { firebaseAuth } from "./middleware/firebaseAuth";
import userRoutes from "./routes/userRoutes";

const envFile =
    process.env.NODE_ENV === "production"
        ? ".env.production.local"
        : ".env.development.local";

dotenv.config({ path: envFile });

export const app = express();

app.use(express.json());

// Apply Firebase authentication middleware to all routes except /api/auth
app.use(/^(?!\/api\/auth).*$/, firebaseAuth);

// Use routes
app.use("/api", questionRoutes);
app.use("/api", sessionRoutes);
app.use("/api", performanceRoutes);
app.use("/api", userRoutes);

// Database connection test
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Database connected:", res.rows[0]);
    }
});

let server: http.Server;

if (process.env.NODE_ENV === "production") {
    const port = process.env.PORT || 8080;
    server = app.listen(port, () => {
        console.log(
            `Server running at http://localhost:${port}/ in production mode`,
        );
    });
} else if (process.env.NODE_ENV === "development") {
    if (require.main === module) {
        const port = process.env.PORT || 3000;
        server = app.listen(port, () => {
            console.log(
                `Server running at http://localhost:${port}/ in development mode`,
            );
        });
    }
}

export { server };
