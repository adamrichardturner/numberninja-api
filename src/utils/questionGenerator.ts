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
    let difficulty: number = 0;

    if (
        numA === numB &&
        (operation === "multiplication" ||
            operation === "division" ||
            operation === "subtraction")
    )
        return null; // Avoid identical numbers for multiplication, division, and subtraction

    switch (operation) {
        case "addition":
            if (numA === 0 || numB === 0 || numA + numB === numA * 2)
                return null;
            correctAnswer = numA + numB;
            difficulty = Math.min(numA, numB) / range.max;
            break;
        case "subtraction":
            if (numA < numB) [numA, numB] = [numB, numA];
            if (numB === 0 || numA === numB) return null;
            correctAnswer = numA - numB;
            difficulty = numB / range.max;
            break;
        case "multiplication":
            if (numA === 1 || numB === 1 || numA === numB) return null; // Ensure numbers are not identical
            correctAnswer = numA * numB;
            difficulty = (numA * numB) / (range.max * range.max);
            break;
        case "division":
            if (numA === numB || numB === 1) return null; // Ensure numbers are not identical
            correctAnswer = Math.floor(numA / numB);
            numA = correctAnswer * numB; // Ensure clean division
            difficulty = numB / range.max;
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }

    if (difficulty < 0.4) return null;

    return correctAnswer <= range.max && correctAnswer >= range.min
        ? { numberA: numA, numberB: numB, operation, correctAnswer }
        : null;
};

const createSimpleQuestion = (
    range: Range,
    operation: Operation,
    rng: seedrandom.PRNG,
): Question => {
    let numA = getRandomNumber(Math.max(2, range.min), range.max, rng);
    let numB = getRandomNumber(Math.max(2, range.min), range.max, rng);
    let correctAnswer: number;

    const createNewQuestion = () => createSimpleQuestion(range, operation, rng);

    if (
        numA === numB &&
        (operation === "multiplication" ||
            operation === "division" ||
            operation === "subtraction")
    )
        return createNewQuestion(); // Prevent same-number multiplication, division, or subtraction

    switch (operation) {
        case "addition":
            if (numA === 0 || numB === 0 || numA + numB === numA * 2)
                return createNewQuestion();
            correctAnswer = numA + numB;
            break;
        case "subtraction":
            if (numA < numB) [numA, numB] = [numB, numA];
            if (numB === 0 || numA === numB) return createNewQuestion();
            correctAnswer = numA - numB;
            break;
        case "multiplication":
            if (numA === 1 || numB === 1 || numA === numB)
                return createNewQuestion(); // Ensure numbers are not identical
            correctAnswer = numA * numB;
            break;
        case "division":
            if (numA === numB || numB === 1) return createNewQuestion(); // Ensure numbers are not identical
            correctAnswer = Math.floor(numA / numB);
            if (correctAnswer === 1) return createNewQuestion();
            numA = correctAnswer * numB; // Ensure clean division
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }

    if (correctAnswer > range.max) return createNewQuestion();

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
