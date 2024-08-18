import request from "supertest";
import { app, server } from "../app";
import pool from "../config/database";
import { faker } from "@faker-js/faker";

describe("Auth API Endpoints", () => {
    afterAll(async () => {
        // Clean up dynamically created users
        await pool.query("DELETE FROM users WHERE email LIKE '%@example.com'");
        await pool.end();
        if (server) {
            server.close();
        }
    });

    it("should register a new user", async () => {
        const email = faker.internet.email();
        const password = faker.internet.password();

        const res = await request(app).post("/api/auth/register").send({
            email,
            password,
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty(
            "message",
            "User registered successfully",
        );
        expect(res.body.user).toHaveProperty("email", email);
    });

    it("should not register a user that already exists", async () => {
        const email = "testuser@example.com";
        const password = "password123";

        // Register the user first
        await request(app).post("/api/auth/register").send({
            email,
            password,
        });

        // Try registering again
        const res = await request(app).post("/api/auth/register").send({
            email,
            password,
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error", "User already exists");
    });

    it("should log in an existing user with valid credentials", async () => {
        const email = "testuser@example.com";
        const password = "password123";

        const res = await request(app).post("/api/auth/login").send({
            email,
            password,
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
