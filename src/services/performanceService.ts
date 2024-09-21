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
                ROUND(AVG(CASE WHEN ua.is_correct THEN 100 ELSE 0 END), 2) as percentage,
                s.ended_at as date
            FROM user_answers ua
            JOIN sessions s ON ua.session_id = s.id
            WHERE s.user_id = $1
            GROUP BY ua.operation, s.ended_at
            ORDER BY s.ended_at DESC
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getTotalStats: async (userId: string) => {
        const query = `
            SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_answers,
                SUM(CASE WHEN NOT ua.is_correct THEN 1 ELSE 0 END) as wrong_answers,
                s.ended_at as date
            FROM user_answers ua
            JOIN sessions s ON ua.session_id = s.id
            WHERE s.user_id = $1
            GROUP BY s.ended_at
            ORDER BY s.ended_at DESC
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getCommonWrongAnswers: async (userId: string) => {
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
                COUNT(*) as wrong_attempts,
                s.ended_at as date
            FROM user_answers ua
            JOIN sessions s ON ua.session_id = s.id
            WHERE s.user_id = $1 AND NOT ua.is_correct
            GROUP BY ua.number_a, ua.operation, ua.number_b, s.ended_at
            ORDER BY s.ended_at DESC, wrong_attempts DESC
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    },
};
