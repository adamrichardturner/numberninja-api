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
): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Question generation timed out after 10 seconds"));
        }, 10000);

        try {
            const questions: Question[] = [];
            const usedQuestions = new Set<string>();
            const operationCounts: Record<Operation, number> =
                operations.reduce(
                    (acc, op) => ({ ...acc, [op]: 0 }),
                    {} as Record<Operation, number>,
                );

            while (questions.length < questionCount) {
                const availableOperations = operations.filter(
                    op =>
                        operationCounts[op] ===
                        Math.min(...Object.values(operationCounts)),
                );
                const operation =
                    availableOperations[
                        Math.floor(Math.random() * availableOperations.length)
                    ];

                let numA: number, numB: number, correctAnswer: number;
                let isValid = false;

                while (!isValid) {
                    numA = generateMultiple(range.min, range.max, terms.termA);
                    numB = generateMultiple(range.min, range.max, terms.termB);

                    switch (operation) {
                        case "addition":
                            correctAnswer = numA + numB;
                            isValid = correctAnswer <= range.max;
                            break;
                        case "subtraction":
                            if (numA < numB) [numA, numB] = [numB, numA];
                            correctAnswer = numA - numB;
                            isValid = correctAnswer >= range.min;
                            break;
                        case "multiplication":
                            correctAnswer = numA * numB;
                            isValid = correctAnswer <= range.max;
                            break;
                        case "division":
                            correctAnswer = numA;
                            numA = numA * numB;
                            isValid = numA <= range.max;
                            break;
                    }

                    const questionKey = `${numA}${operation}${numB}`;
                    if (usedQuestions.has(questionKey)) {
                        isValid = false;
                    }

                    if (isValid) {
                        questions.push({
                            numberA: numA,
                            numberB: numB,
                            operation,
                            correctAnswer,
                        });
                        usedQuestions.add(questionKey);
                        operationCounts[operation]++;
                    }
                }
            }

            console.log("Questions generated: ", questions);
            clearTimeout(timeoutId);
            resolve(questions);
        } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
        }
    });
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
