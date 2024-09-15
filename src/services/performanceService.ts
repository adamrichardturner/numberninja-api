import pool from "../config/database";

export const performanceService = {
    getSessionData: async (userId: string) => {
        const query = `
            SELECT 
                s.id,
                m.mode_name as mode,
                string_agg(o.operation_name, ', ' ORDER BY o.operation_name) as operations,
                sr.min_value || '-' || sr.max_value as range,
                s.question_count as total_questions,
                COUNT(CASE WHEN ua.is_correct THEN 1 END) as correct_answers,
                COUNT(CASE WHEN NOT ua.is_correct THEN 1 END) as wrong_answers,
                COALESCE(AVG(ua.time_taken), 0) as average_time,
                COALESCE(SUM(ua.time_taken), 0) as total_time,
                s.overall_time_limit as time_limit,
                s.ended_at as answered_at
            FROM 
                sessions s
            LEFT JOIN modes m ON s.mode_id = m.id
            LEFT JOIN session_operations so ON s.id = so.session_id
            LEFT JOIN operations o ON so.operation_id = o.id
            LEFT JOIN session_ranges sr ON s.id = sr.session_id
            LEFT JOIN user_answers ua ON s.id = ua.session_id
            WHERE 
                s.user_id = $1 AND s.is_completed = true
            GROUP BY
                s.id, m.mode_name, sr.min_value, sr.max_value, s.question_count, s.overall_time_limit, s.ended_at
            ORDER BY 
                s.ended_at DESC
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getOperationPerformance: async (userId: string) => {
        const query = `
            SELECT 
                ua.operation,
                COUNT(*) as total_questions,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN NOT ua.is_correct THEN 1 ELSE 0 END) as wrong_answers,
                AVG(CASE WHEN ua.is_correct THEN 100 ELSE 0 END) as percentage
            FROM user_answers ua
            JOIN sessions s ON ua.session_id = s.id
            WHERE s.user_id = $1
            GROUP BY ua.operation
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getStrugglingQuestions: async (userId: string, operation: string) => {
        const query = `
            SELECT 
                CONCAT(ua.number_a, ' ', 
                    CASE 
                        WHEN ua.operation = 'addition' THEN '+'
                        WHEN ua.operation = 'subtraction' THEN '-'
                        WHEN ua.operation = 'multiplication' THEN '×'
                        WHEN ua.operation = 'division' THEN '÷'
                        ELSE ua.operation
                    END,
                ' ', ua.number_b) as question,
                ua.operation,
                AVG(ua.time_taken) as avg_time,
                COUNT(*) as attempts,
                SUM(CASE WHEN NOT ua.is_correct THEN 1 ELSE 0 END) as wrong_answers
            FROM user_answers ua
            JOIN sessions s ON ua.session_id = s.id
            WHERE s.user_id = $1 AND ua.operation = $2
            GROUP BY ua.number_a, ua.operation, ua.number_b
            ORDER BY (AVG(ua.time_taken) * SUM(CASE WHEN NOT ua.is_correct THEN 1 ELSE 0 END)) DESC
            LIMIT 20
        `;
        const result = await pool.query(query, [userId, operation]);
        return result.rows;
    },

    getTotalStats: async (userId: string) => {
        const query = `
            SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN NOT ua.is_correct THEN 1 ELSE 0 END) as wrong_answers
            FROM user_answers ua
            JOIN sessions s ON ua.session_id = s.id
            WHERE s.user_id = $1
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
                    AVG(CASE WHEN ua.is_correct THEN 100 ELSE 0 END) as percentage
                FROM user_answers ua
                JOIN sessions s ON ua.session_id = s.id
                WHERE s.user_id = $1 AND ua.answered_at >= NOW() - $2::INTERVAL
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
            CONCAT(ua.number_a, ' ', 
                CASE 
                    WHEN ua.operation = 'addition' THEN '+'
                    WHEN ua.operation = 'subtraction' THEN '-'
                    WHEN ua.operation = 'multiplication' THEN '×'
                    WHEN ua.operation = 'division' THEN '÷'
                    ELSE ua.operation
                END,
            ' ', ua.number_b) as question,
            ua.operation,
            COUNT(*) as wrong_attempts
        FROM user_answers ua
        JOIN sessions s ON ua.session_id = s.id
        WHERE s.user_id = $1 AND NOT ua.is_correct
        GROUP BY ua.number_a, ua.operation, ua.number_b
        ORDER BY wrong_attempts DESC
        LIMIT $2
        `;

        const values = [userId, limit];

        const result = await pool.query(query, values);
        return result.rows;
    },
};
