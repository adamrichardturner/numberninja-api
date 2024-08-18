import request from "supertest";
import app from "../app";
import pool from "../config/database";

describe("Auth API Endpoints", () => {
    // Run after all tests
    afterAll(async () => {
        // Clean up the database and close the connection
        await pool.query("DELETE FROM users WHERE email = $1", [
            "testuser@example.com",
        ]);
        await pool.end();
    });

    it("should register a new user", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "testuser@example.com",
            password: "password123",
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty(
            "message",
            "User registered successfully",
        );
        expect(res.body.user).toHaveProperty("email", "testuser@example.com");
    });

    it("should not register a user that already exists", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "testuser@example.com",
            password: "password123",
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error", "User already exists");
    });

    it("should log in an existing user with valid credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "testuser@example.com",
            password: "password123",
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
    });

    it("should not log in a user with invalid credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "testuser@example.com",
            password: "wrongpassword",
        });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty("error", "Invalid credentials");
    });
});
