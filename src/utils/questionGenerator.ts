import seedrandom from "seedrandom";
import { Operation } from "../types/session";

interface Question {
    numberA: number;
    numberB: number;
    operation: Operation;
    correctAnswer: number;
}

/**
 * Generates a list of questions based on session parameters.
 * @param sessionId The session ID used as the seed for deterministic generation.
 * @param questionCount The number of questions to generate.
 * @param range The range of numbers (e.g., 1-10, 1-20).
 * @param operation The operation (e.g., "addition", "subtraction", "multiplication", "division").
 * @returns An array of generated questions.
 */
export const generateQuestions = (
    questionCount: number,
    range: { min: number; max: number },
    operations: Operation[],
    terms: { termA: number; termB: number },
): Question[] => {
    const questions: Question[] = [];
    const operationCounts: Record<Operation, number> = operations.reduce(
        (acc, op) => ({ ...acc, [op]: 0 }),
        {} as Record<Operation, number>,
    );
    const targetOperationCount = Math.ceil(questionCount / operations.length);

    while (questions.length < questionCount) {
        const availableOperations = operations.filter(
            op => operationCounts[op] < targetOperationCount,
        );
        const operation =
            availableOperations[
                Math.floor(Math.random() * availableOperations.length)
            ];
        operationCounts[operation]++;

        let numA: number, numB: number, correctAnswer: number;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            attempts++;
            switch (operation) {
                case "addition":
                    numA = generateMultiple(range.min, range.max, terms.termA);
                    numB = generateMultiple(
                        range.min,
                        range.max - numA,
                        terms.termB,
                    );
                    correctAnswer = numA + numB;
                    break;
                case "subtraction":
                    numA = generateMultiple(range.min, range.max, terms.termA);
                    numB = generateMultiple(range.min, numA, terms.termB);
                    correctAnswer = numA - numB;
                    break;
                case "multiplication":
                    numA = generateMultiple(
                        range.min,
                        Math.floor(Math.sqrt(range.max)),
                        terms.termA,
                    );
                    numB = generateMultiple(
                        range.min,
                        Math.floor(range.max / numA),
                        terms.termB,
                    );
                    correctAnswer = numA * numB;
                    break;
                case "division":
                    numB = generateMultiple(
                        range.min,
                        Math.floor(Math.sqrt(range.max)),
                        terms.termB,
                    );
                    correctAnswer = generateMultiple(
                        range.min,
                        Math.floor(range.max / numB),
                        1,
                    );
                    numA = correctAnswer * numB;
                    // Ensure numA is also a multiple of termA
                    numA = Math.floor(numA / terms.termA) * terms.termA;
                    correctAnswer = numA / numB;
                    break;
                default:
                    throw new Error(`Invalid operation: ${operation}`);
            }
        } while (
            (correctAnswer < range.min ||
                correctAnswer > range.max ||
                numA > range.max ||
                numB > range.max) &&
            attempts < maxAttempts
        );

        if (attempts < maxAttempts) {
            questions.push({
                numberA: numA,
                numberB: numB,
                operation,
                correctAnswer,
            });
        }
    }

    console.log("questions", questions);

    return questions;
};

const generateMultiple = (min: number, max: number, factor: number): number => {
    const lowerBound = Math.ceil(min / factor) * factor;
    const upperBound = Math.floor(max / factor) * factor;
    const range = (upperBound - lowerBound) / factor + 1;
    return lowerBound + Math.floor(Math.random() * range) * factor;
};

/**
 * Checks if the provided answer is correct based on the session parameters and generated question.
 * @param sessionId The session ID used as the seed for deterministic generation.
 * @param questionIndex The index of the question in the list.
 * @param selectedAnswer The answer provided by the user.
 * @param range The range of numbers (e.g., 1-10, 1-20).
 * @param operation The operation (e.g., "addition", "subtraction", "multiplication", "division").
 * @returns An object containing whether the answer is correct and what the correct answer is.
 */
export const checkAnswer = (
    numberA: number,
    numberB: number,
    operation: string,
    selectedAnswer: string,
): boolean => {
    let correctAnswer: number;
    switch (operation) {
        case "addition":
            correctAnswer = numberA + numberB;
            break;
        case "subtraction":
            correctAnswer = numberA - numberB;
            break;
        case "multiplication":
            correctAnswer = numberA * numberB;
            break;
        case "division":
            correctAnswer = numberA / numberB;
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }
    return correctAnswer.toString() === selectedAnswer;
};
