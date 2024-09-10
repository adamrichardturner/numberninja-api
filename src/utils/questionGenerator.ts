import seedrandom from "seedrandom";
import { Operation } from "../types/session";

interface Question {
    numberA: number;
    numberB: number;
    operation: Operation;
    correctAnswer: number;
}

type NumberPattern =
    | "evens"
    | "odds"
    | "fives"
    | "tens"
    | "squares"
    | "cubes"
    | "primes"
    | "any";

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
    numberPatterns: NumberPattern[],
): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Question generation timed out after 10 seconds"));
        }, 10000);

        try {
            const rng = seedrandom();
            const questions: Question[] = [];
            const usedQuestions = new Set<string>();

            for (let i = 0; i < questionCount; i++) {
                const operation =
                    operations[Math.floor(rng() * operations.length)];
                let numA = range.min,
                    numB = range.min,
                    correctAnswer = 0;
                let isValid = false;

                while (!isValid) {
                    const patternA =
                        numberPatterns[
                            Math.floor(rng() * numberPatterns.length)
                        ];
                    const patternB =
                        numberPatterns[
                            Math.floor(rng() * numberPatterns.length)
                        ];

                    numA = generateNumberByPattern(
                        range.min,
                        range.max,
                        patternA,
                    );
                    numB = generateNumberByPattern(
                        range.min,
                        range.max,
                        patternB,
                    );

                    [numA, numB, correctAnswer, isValid] =
                        validateAndAdjustNumbers(numA, numB, operation, range);

                    const questionKey = `${numA}${operation}${numB}`;
                    if (usedQuestions.has(questionKey)) {
                        isValid = false;
                    }
                }

                questions.push({
                    numberA: numA,
                    numberB: numB,
                    operation,
                    correctAnswer,
                });
                usedQuestions.add(`${numA}${operation}${numB}`);
            }

            clearTimeout(timeoutId);
            resolve(questions);
        } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
        }
    });
};

// Add this helper function
function validateAndAdjustNumbers(
    numA: number,
    numB: number,
    operation: Operation,
    range: { min: number; max: number },
): [number, number, number, boolean] {
    let correctAnswer: number;
    let isValid = false;

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
            if (numB === 0) return [numA, 1, numA, true]; // Avoid division by zero
            correctAnswer = Math.floor(numA / numB);
            numA = correctAnswer * numB; // Ensure clean division
            isValid =
                numA <= range.max && numA >= range.min && numB >= range.min;
            break;
    }

    return [numA, numB, correctAnswer, isValid];
}

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

function isPrime(num: number): boolean {
    for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++)
        if (num % i === 0) return false;
    return num > 1;
}

function generateNumberByPattern(
    min: number,
    max: number,
    pattern: NumberPattern,
): number {
    const rng = seedrandom();
    let num: number;
    do {
        num = Math.floor(rng() * (max - min + 1)) + min;
        switch (pattern) {
            case "evens":
                num = num % 2 === 0 ? num : num + 1;
                break;
            case "odds":
                num = num % 2 === 0 ? num + 1 : num;
                break;
            case "fives":
                num = Math.round(num / 5) * 5;
                break;
            case "tens":
                num = Math.round(num / 10) * 10;
                break;
            case "squares":
                num = Math.pow(Math.round(Math.sqrt(num)), 2);
                break;
            case "cubes":
                num = Math.pow(Math.round(Math.cbrt(num)), 3);
                break;
            case "primes":
                while (!isPrime(num) && num <= max) num++;
                if (num > max) num = 2; // Fallback to smallest prime if no prime in range
                break;
            case "any":
                // No adjustment needed
                break;
        }
    } while (num < min || num > max);
    return num;
}
