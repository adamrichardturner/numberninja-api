export interface ModeItem {
    id: string;
    mode_name: string;
}

export interface OperationItem {
    id: string;
    operation_name: string;
}

export interface RangeItem {
    id: string;
    range_name: string;
}

export interface DifficultyItem {
    id: string;
    level_name: string;
}

export interface Question {
    numberA: number;
    numberB: number;
    operation: string;
    correctAnswer: number;
}

export interface Session {
    userId: string;
    modeId: string;
    operationId: string;
    rangeId: string;
    difficultyId: string;
    questionCount: number;
    overallTimeLimit: number;
    sessionId: string;
}
