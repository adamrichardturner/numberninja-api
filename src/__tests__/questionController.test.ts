import request from "supertest";
import { app, server } from "../app";
import pool from "../config/database";
import { faker } from "@faker-js/faker";
import { ModeItem, OperationItem, RangeItem, DifficultyItem } from "../types";

describe("Question API Endpoints", () => {
    let testEmail: string;
    let testPassword: string;
    let authToken: string;
    let sessionId: string;
    let modeId: string;
    let operationId: string;
    let rangeId: string;
    let difficultyId: string;

    beforeAll(async () => {
        testEmail = faker.internet.email();
        testPassword = faker.internet.password();

        await request(app).post("/api/auth/register").send({
            email: testEmail,
            password: testPassword,
        });

        const loginRes = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: testPassword,
        });

        authToken = loginRes.body.token;

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

        const sessionRes = await request(app)
            .post("/api/sessions/create")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                userId: loginRes.body.user.id,
                modeId,
                operationId,
                rangeId,
                difficultyId,
                questionCount: 5,
                overallTimeLimit: 300,
            });

        sessionId = sessionRes.body.sessionId;
    });

    afterAll(async () => {
        // First, delete any answers related to the session
        await pool.query("DELETE FROM user_answers WHERE session_id = $1", [
            sessionId,
        ]);

        // Then, delete the session itself
        await pool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);

        // Finally, delete the user
        await pool.query("DELETE FROM users WHERE email = $1", [testEmail]);

        await pool.end();
        if (server) {
            server.close();
        }
    });

    it("should fetch questions for a valid session", async () => {
        const res = await request(app)
            .get(`/api/questions/${sessionId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("questions");
        expect(res.body.questions.length).toBeGreaterThan(0);
    });

    it("should return 404 if session is not found when fetching questions", async () => {
        const res = await request(app)
            .get(`/api/questions/${faker.string.uuid()}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty("error", "Session not found");
    });

    it("should submit an answer and return correctness", async () => {
        const res = await request(app)
            .post("/api/questions/submit")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                sessionId,
                questionIndex: 0,
                selectedAnswer: 5,
                timeTaken: 10,
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("isCorrect");
        expect(res.body).toHaveProperty("correctAnswer");
    });

    it("should return 404 if session is not found when submitting an answer", async () => {
        const res = await request(app)
            .post("/api/questions/submit")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                sessionId: faker.string.uuid(),
                questionIndex: 0,
                selectedAnswer: 5,
                timeTaken: 10,
            });

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty("error", "Session not found");
    });
});
