export interface Answer {
    questionId: string;
    userAnswer: string | number; // Changed from selectedAnswer to userAnswer
    isCorrect: boolean;
    timeTaken: number;
}
