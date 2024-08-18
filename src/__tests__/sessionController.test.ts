import request from "supertest";
import { app, server } from "../app";
import pool from "../config/database";
import { faker } from "@faker-js/faker";
import { ModeItem, OperationItem, RangeItem, DifficultyItem } from "../types";

describe("Session API Endpoints", () => {
    let testEmail: string;
    let testPassword: string;
    let authToken: string;
    let userId: string;
    let modeId: string;
    let operationId: string;
    let rangeId: string;
    let difficultyId: string;
    let sessionId: string;

    beforeAll(async () => {
        testEmail = faker.internet.email();
        testPassword = faker.internet.password();

        // Register a new user
        await request(app).post("/api/auth/register").send({
            email: testEmail,
            password: testPassword,
        });

        // Log in to get the JWT token and user ID
        const loginRes = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: testPassword,
        });

        authToken = loginRes.body.token;
        userId = loginRes.body.user.id;

        // Fetch the mode, operation, range, and difficulty IDs
        const modesRes = await request(app)
            .get("/api/sessions/modes")
            .set("Authorization", `Bearer ${authToken}`);
        modeId = (modesRes.body as ModeItem[])[0].id;

        const operationsRes = await request(app)
            .get("/api/sessions/operations")
            .set("Authorization", `Bearer ${authToken}`);
        operationId = (operationsRes.body as OperationItem[]).find(
            op => op.operation_name === "addition",
        )?.id as string;

        const rangesRes = await request(app)
            .get("/api/sessions/ranges")
            .set("Authorization", `Bearer ${authToken}`);
        rangeId = (rangesRes.body as RangeItem[]).find(
            range => range.range_name === "1-10",
        )?.id as string;

        const difficultiesRes = await request(app)
            .get("/api/sessions/difficulties")
            .set("Authorization", `Bearer ${authToken}`);
        difficultyId = (difficultiesRes.body as DifficultyItem[])[0].id;
    });

    afterAll(async () => {
        // Clean up related data first
        if (sessionId) {
            await pool.query("DELETE FROM user_answers WHERE session_id = $1", [
                sessionId,
            ]);
            await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
        }
        await pool.query("DELETE FROM users WHERE email = $1", [testEmail]);
        await pool.end();
        if (server) {
            server.close();
        }
    });

    it("should create a session", async () => {
        const res = await request(app)
            .post("/api/sessions/create")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                userId,
                modeId,
                operationId,
                rangeId,
                difficultyId,
                questionCount: 5,
                overallTimeLimit: 300,
            });

        sessionId = res.body.sessionId;

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("sessionId");
    });

    it("should fetch available modes", async () => {
        const res = await request(app)
            .get("/api/sessions/modes")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should fetch available operations", async () => {
        const res = await request(app)
            .get("/api/sessions/operations")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should fetch available number ranges", async () => {
        const res = await request(app)
            .get("/api/sessions/ranges")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should fetch available difficulty levels", async () => {
        const res = await request(app)
            .get("/api/sessions/difficulties")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });
});
