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

const TIMEOUT = 15000; // 15 seconds timeout

export const generateQuestions = (
    questionCount: number,
    range: Range,
    operations: Operation[],
): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
        const questions: Question[] = [];
        const usedQuestions = new Set<string>();

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
                let question: Question | null = null;
                let attempts = 0;

                while (!question && attempts < 100) {
                    const numA = getRandomNumber(
                        Math.max(1, range.min),
                        range.max,
                        rng,
                    );
                    const numB = getRandomNumber(
                        Math.max(1, range.min),
                        range.max,
                        rng,
                    );
                    question = createValidQuestion(
                        numA,
                        numB,
                        operation,
                        range,
                    );

                    if (question) {
                        const questionKey = `${question.numberA}-${question.numberB}-${question.operation}`;
                        if (usedQuestions.has(questionKey)) {
                            question = null;
                        } else {
                            usedQuestions.add(questionKey);
                        }
                    }

                    attempts++;
                }

                if (!question) {
                    question = createSimpleQuestion(range, operation, rng);
                    const questionKey = `${question.numberA}-${question.numberB}-${question.operation}`;
                    usedQuestions.add(questionKey);
                }

                questions.push(question);
                operationCounts[operation]++;
            }

            resolve(questions);
        };

        const timeoutId = setTimeout(() => {
            reject(new Error("Question generation timed out"));
        }, TIMEOUT);

        attemptGeneration();

        // Clear the timeout if questions are generated successfully
        clearTimeout(timeoutId);
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
    let [a, b] = [numA, numB]; // New line

    switch (operation) {
        case "addition":
            correctAnswer = a + b;
            break;
        case "subtraction":
            if (a < b) [a, b] = [b, a];
            correctAnswer = a - b;
            break;
        case "multiplication":
            correctAnswer = a * b;
            break;
        case "division":
            if (b === 0) return null;
            correctAnswer = Math.floor(a / b);
            a = correctAnswer * b; // Ensure clean division
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }

    return correctAnswer <= range.max && correctAnswer >= range.min
        ? { numberA: a, numberB: b, operation, correctAnswer }
        : null;
};

const createSimpleQuestion = (
    range: Range,
    operation: Operation,
    rng: seedrandom.PRNG,
): Question => {
    let numA = getRandomNumber(Math.max(1, range.min), range.max, rng);
    let numB = getRandomNumber(Math.max(1, range.min), range.max, rng);
    let correctAnswer: number;

    switch (operation) {
        case "addition":
            correctAnswer = numA + numB;
            break;
        case "subtraction":
            if (numA < numB) [numA, numB] = [numB, numA];
            correctAnswer = numA - numB;
            break;
        case "multiplication":
            correctAnswer = numA * numB;
            break;
        case "division":
            correctAnswer = numA;
            numB = getRandomNumber(1, Math.min(numA, range.max), rng);
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
