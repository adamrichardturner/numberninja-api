import pool from "../config/database";

export const performanceService = {
    getSessionData: async (userId: string) => {
        const query = `
            SELECT 
                s.id,
                m.mode_name as mode,
                d.level_name as difficulty,
                o.operation_name as operation,
                nr.range_name as range,
                s.question_count as total_questions,
                COUNT(CASE WHEN ua.is_correct THEN 1 END) as correct_answers,
                COUNT(CASE WHEN NOT ua.is_correct THEN 1 END) as wrong_answers,
                AVG(ua.time_taken) as average_time,
                SUM(ua.time_taken) as total_time,
                s.ended_at as answered_at
            FROM 
                sessions s
            LEFT JOIN modes m ON s.mode_id = m.id
            LEFT JOIN difficulty_levels d ON s.difficulty_id = d.id
            LEFT JOIN operations o ON s.operation_id = o.id
            LEFT JOIN number_ranges nr ON s.range_id = nr.id
            LEFT JOIN user_answers ua ON s.id = ua.session_id
            WHERE 
                s.user_id = $1 AND s.is_completed = true
            GROUP BY
                s.id, m.mode_name, d.level_name, o.operation_name, nr.range_name, s.question_count, s.ended_at
            ORDER BY 
                s.ended_at DESC
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getOperationPerformance: async (userId: string) => {
        const query = `
            SELECT 
                operation,
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as wrong_answers,
                AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as percentage
            FROM user_answers
            WHERE user_id = $1
            GROUP BY operation
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getStrugglingQuestions: async (userId: string, operation: string) => {
        const query = `
            SELECT 
                CONCAT(number_a, ' ', 
                    CASE 
                        WHEN operation = 'addition' THEN '+'
                        WHEN operation = 'subtraction' THEN '-'
                        WHEN operation = 'multiplication' THEN '×'
                        WHEN operation = 'division' THEN '÷'
                        ELSE operation
                    END,
                ' ', number_b) as question,
                operation,
                AVG(time_taken) as avg_time,
                COUNT(*) as attempts,
                SUM(CASE WHEN is_correct THEN 0 ELSE 1 END) as wrong_answers
            FROM user_answers
            WHERE user_id = $1 AND operation = $2
            GROUP BY number_a, operation, number_b
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
            FROM user_answers
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
                FROM user_answers
                WHERE user_id = $1 AND answered_at >= NOW() - $2::INTERVAL
            `;
                const result = await pool.query(query, [userId, period]);
                return { period, percentage: result.rows[0].percentage };
            }),
        );
        return results;
    },

    getCommonWrongAnswers: async (userId: string, limit: number = 10) => {
        const query = `
        SELECT 
            CONCAT(number_a, ' ', 
                CASE 
                    WHEN operation = 'addition' THEN '+'
                    WHEN operation = 'subtraction' THEN '-'
                    WHEN operation = 'multiplication' THEN '×'
                    WHEN operation = 'division' THEN '÷'
                    ELSE operation
                END,
            ' ', number_b) as question,
            operation,
            COUNT(*) as wrong_attempts
        FROM user_answers
        WHERE user_id = $1 AND NOT is_correct
        GROUP BY number_a, operation, number_b
        ORDER BY wrong_attempts DESC
        LIMIT $2
        `;

        const values = [userId, limit];

        const result = await pool.query(query, values);
        return result.rows;
    },
};
