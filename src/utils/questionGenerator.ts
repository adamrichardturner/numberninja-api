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
    const rng = seedrandom(Date.now().toString());
    const questions: Question[] = [];
    const generatedQuestions = new Set<string>();
    let attempts = 0;
    const maxAttempts = questionCount * 10;

    while (questions.length < questionCount && attempts < maxAttempts) {
        const operation = operations[Math.floor(rng() * operations.length)];
        let numA: number, numB: number, correctAnswer: number;

        switch (operation) {
            case "addition":
                numA =
                    Math.floor(rng() * (range.max - range.min + 1)) + range.min;
                numB = Math.floor(rng() * (range.max - numA + 1)) + range.min;
                correctAnswer = numA + numB;
                break;
            case "subtraction":
                numA =
                    Math.floor(rng() * (range.max - range.min + 1)) + range.min;
                numB = Math.floor(rng() * (numA - range.min + 1)) + range.min;
                correctAnswer = numA - numB;
                break;
            case "multiplication":
                numA =
                    Math.floor(
                        rng() *
                            (Math.sqrt(range.max) - Math.sqrt(range.min) + 1),
                    ) + Math.sqrt(range.min);
                numB =
                    Math.floor(
                        rng() * (range.max / numA - range.min / numA + 1),
                    ) +
                    range.min / numA;
                correctAnswer = numA * numB;
                break;
            case "division":
                numB =
                    Math.floor(
                        rng() *
                            (Math.sqrt(range.max) - Math.sqrt(range.min) + 1),
                    ) + Math.sqrt(range.min);
                correctAnswer =
                    Math.floor(
                        rng() * (range.max / numB - range.min / numB + 1),
                    ) +
                    range.min / numB;
                numA = correctAnswer * numB;
                break;
            default:
                throw new Error("Invalid operation");
        }

        if (
            numA >= range.min &&
            numA <= range.max &&
            numB >= range.min &&
            numB <= range.max &&
            correctAnswer >= range.min &&
            correctAnswer <= range.max &&
            numA % terms.termA === 0 &&
            numB % terms.termB === 0
        ) {
            const questionKey = `${numA}${operation}${numB}`;
            if (!generatedQuestions.has(questionKey)) {
                generatedQuestions.add(questionKey);
                questions.push({
                    numberA: numA,
                    numberB: numB,
                    operation,
                    correctAnswer,
                });
            }
        }

        attempts++;
    }

    while (questions.length < questionCount) {
        const index = Math.floor(rng() * questions.length);
        questions.push({ ...questions[index] });
    }

    return questions;
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
