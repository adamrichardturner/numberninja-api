import { Pool } from "pg";
import dotenv from "dotenv";

const envFile =
    process.env.NODE_ENV === "production"
        ? ".env.production.local"
        : ".env.development.local";
dotenv.config({ path: envFile });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default pool;
