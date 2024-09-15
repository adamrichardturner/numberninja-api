export interface Answer {
    questionId: string;
    userAnswer: string | number;
    isCorrect: boolean;
    timeTaken: number;
}
