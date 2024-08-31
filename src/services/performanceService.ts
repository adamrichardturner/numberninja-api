import pool from "../config/database";

export const performanceService = {
    getSessionData: async (userId: string, period: string) => {
        const query = `
            SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as wrong_answers,
                AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as percentage
            FROM answers
            WHERE user_id = $1 AND created_at >= NOW() - $2::INTERVAL
        `;
        const result = await pool.query(query, [userId, period]);
        return result.rows[0];
    },

    getOperationPerformance: async (userId: string) => {
        const query = `
            SELECT 
                operation,
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as wrong_answers,
                AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as percentage
            FROM answers
            WHERE user_id = $1
            GROUP BY operation
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getStrugglingQuestions: async (userId: string, operation: string) => {
        const query = `
            SELECT 
                question,
                operation,
                AVG(time_taken) as avg_time,
                COUNT(*) as attempts,
                SUM(CASE WHEN is_correct THEN 0 ELSE 1 END) as wrong_answers
            FROM answers
            WHERE user_id = $1 AND operation = $2
            GROUP BY question, operation
            ORDER BY (AVG(time_taken) * SUM(CASE WHEN is_correct THEN 0 ELSE 1 END)) DESC
            LIMIT 20
        `;
        const result = await pool.query(query, [userId, operation]);
        return result.rows;
    },

    getTotalStats: async (userId: string) => {
        const query = `
            SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as wrong_answers
            FROM answers
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    },

    getPerformanceOverTime: async (userId: string) => {
        const periods = [
            "6 months",
            "3 months",
            "1 month",
            "2 weeks",
            "1 week",
        ];
        const results = await Promise.all(
            periods.map(async period => {
                const query = `
                SELECT 
                    AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as percentage
                FROM answers
                WHERE user_id = $1 AND created_at >= NOW() - $2::INTERVAL
            `;
                const result = await pool.query(query, [userId, period]);
                return { period, percentage: result.rows[0].percentage };
            }),
        );
        return results;
    },
};
