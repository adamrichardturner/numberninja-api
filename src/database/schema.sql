-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table compatible with Passport.js for email and social logins (Google, Apple)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255),
    apple_id VARCHAR(255),
    password_hash VARCHAR(255), -- For local email-based login if needed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Modes table storing the different modes (Test and Practice)
CREATE TABLE modes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mode_name VARCHAR(50) UNIQUE NOT NULL -- 'Test' or 'Practice'
);

-- Operations table storing the different operations (Addition, Subtraction, etc.)
CREATE TABLE operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_name VARCHAR(50) UNIQUE NOT NULL -- 'Addition', 'Subtraction', etc.
);

-- Number Ranges table for the number ranges (1-10, 1-20, 1-100)
CREATE TABLE number_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    range_name VARCHAR(50) UNIQUE NOT NULL -- '1-10', '1-20', '1-100'
);

-- Difficulty Levels table storing different levels with corresponding time limits
CREATE TABLE difficulty_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_name VARCHAR(50) UNIQUE NOT NULL, -- 'Easy', 'Medium', 'Hard'
    time_limit INT NOT NULL -- Time limit in seconds (for overall quiz time or each question)
);

-- Sessions table to track user sessions, including quiz setup
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    mode_id UUID REFERENCES modes(id),
    operation_id UUID REFERENCES operations(id),
    range_id UUID REFERENCES number_ranges(id),
    difficulty_id UUID REFERENCES difficulty_levels(id),
    question_count INT NOT NULL,
    overall_time_limit INT NOT NULL, -- Total time allowed for the session in seconds
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Questions table storing questions in BSON format
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id),
    question_data JSONB NOT NULL, -- JSON structure with the question
    correct_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Answers table to store each answer given in Test Mode
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES sessions(id),
    question_id UUID REFERENCES questions(id),
    selected_answer VARCHAR(255),
    is_correct BOOLEAN NOT NULL,
    time_taken INT NOT NULL, -- Time taken to answer the question in seconds
    answered_at TIMESTAMP DEFAULT NOW()
);

-- Indexing for efficient querying
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_session_id ON user_answers(session_id);
CREATE INDEX idx_user_answers_correctness ON user_answers(is_correct);
