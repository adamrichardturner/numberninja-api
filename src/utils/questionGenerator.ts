import { Operation } from "../types/session";
import seedrandom from "seedrandom";

interface Question {
    numberA: number;
    numberB: number;
    operation: Operation;
    correctAnswer: number;
}

interface Range {
    min: number;
    max: number;
}

const TIMEOUT = 30000; // 30 seconds timeout

export const generateQuestions = (
    questionCount: number,
    range: Range,
    operations: Operation[],
): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const questions: Question[] = [];

        const attemptGeneration = () => {
            const seed = Date.now().toString();
            const rng = seedrandom(seed);
            const operationCounts: Record<Operation, number> =
                operations.reduce(
                    (acc, op) => ({ ...acc, [op]: 0 }),
                    {} as Record<Operation, number>,
                );

            while (questions.length < questionCount) {
                const operation = getNextOperation(
                    operations,
                    operationCounts,
                    rng,
                );
                const numA = getRandomNumber(range.min, range.max, rng);
                const numB = getRandomNumber(range.min, range.max, rng);

                let question = createValidQuestion(
                    numA,
                    numB,
                    operation,
                    range,
                );

                if (!question) {
                    question = createSimpleQuestion(range, operation, rng);
                }

                questions.push(question);
                operationCounts[operation]++;

                if (Date.now() - startTime > TIMEOUT) {
                    reject(new Error("Question generation timed out"));
                    return;
                }
            }

            resolve(questions);
        };

        attemptGeneration();
    });
};

const getNextOperation = (
    operations: Operation[],
    operationCounts: Record<Operation, number>,
    rng: seedrandom.PRNG,
): Operation => {
    const minCount = Math.min(...Object.values(operationCounts));
    const candidateOperations = operations.filter(
        op => operationCounts[op] === minCount,
    );
    return candidateOperations[Math.floor(rng() * candidateOperations.length)];
};

const getRandomNumber = (
    min: number,
    max: number,
    rng: seedrandom.PRNG,
): number => {
    return Math.floor(rng() * (max - min + 1)) + min;
};

const createValidQuestion = (
    numA: number,
    numB: number,
    operation: Operation,
    range: Range,
): Question | null => {
    let correctAnswer: number;
    let difficulty: number = 0;

    switch (operation) {
        case "addition":
            if (numA === 0 || numB === 0) return null; // Avoid trivial additions
            correctAnswer = numA + numB;
            difficulty = Math.min(numA, numB) / range.max; // Higher difficulty for larger numbers
            break;
        case "subtraction":
            if (numA < numB) [numA, numB] = [numB, numA];
            if (numB === 0) return null; // Avoid trivial subtractions
            correctAnswer = numA - numB;
            difficulty = numB / range.max; // Higher difficulty for larger numbers being subtracted
            break;
        case "multiplication":
            if (numA === 1 || numB === 1) return null; // Avoid trivial multiplications
            correctAnswer = numA * numB;
            difficulty = (numA * numB) / (range.max * range.max); // Higher difficulty for larger products
            break;
        case "division":
            if (numB === 0 || numB === 1) return null; // Avoid division by 0 or 1
            correctAnswer = Math.floor(numA / numB);
            numA = correctAnswer * numB; // Ensure clean division
            difficulty = numB / range.max; // Higher difficulty for larger divisors
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }

    // Only accept questions with a minimum difficulty
    if (difficulty < 0.3) return null;

    return correctAnswer <= range.max && correctAnswer >= range.min
        ? { numberA: numA, numberB: numB, operation, correctAnswer }
        : null;
};

const createSimpleQuestion = (
    range: Range,
    operation: Operation,
    rng: seedrandom.PRNG,
): Question => {
    const numA = getRandomNumber(range.min, range.max, rng);
    const numB = getRandomNumber(range.min, range.max, rng);
    let correctAnswer: number;

    switch (operation) {
        case "addition":
            correctAnswer = numA + numB;
            break;
        case "subtraction":
            correctAnswer = Math.max(numA, numB) - Math.min(numA, numB);
            break;
        case "multiplication":
            correctAnswer = numA * numB;
            break;
        case "division":
            correctAnswer = numA;
            return {
                numberA: numA * numB,
                numberB: numB,
                operation,
                correctAnswer,
            };
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }

    return { numberA: numA, numberB: numB, operation, correctAnswer };
};

export const checkAnswer = (
    numberA: number,
    numberB: number,
    operation: Operation,
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
            correctAnswer = Math.floor(numberA / numberB);
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }
    return correctAnswer.toString() === selectedAnswer;
};
