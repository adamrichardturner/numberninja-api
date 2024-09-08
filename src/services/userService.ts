import pool from "../config/database";

export const userService = {
    async deleteUserData(userId: string): Promise<void> {
        try {
            await pool.query("BEGIN");

            // Delete user's answers
            await pool.query("DELETE FROM user_answers WHERE user_id = $1", [
                userId,
            ]);

            // Delete questions associated with user's sessions
            await pool.query(
                "DELETE FROM questions WHERE session_id IN (SELECT id FROM sessions WHERE user_id = $1)",
                [userId],
            );

            // Delete user's sessions
            await pool.query("DELETE FROM sessions WHERE user_id = $1", [
                userId,
            ]);

            // Delete user's account
            await pool.query("DELETE FROM users WHERE id = $1", [userId]);

            await pool.query("COMMIT");
        } catch (error) {
            await pool.query("ROLLBACK");
            console.error("Error deleting user data:", error);
            throw error;
        }
    },
};
