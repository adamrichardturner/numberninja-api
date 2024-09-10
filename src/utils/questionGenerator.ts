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

export const generateQuestions = (
    questionCount: number,
    range: Range,
    operations: Operation[],
): Question[] => {
    const seed = Date.now().toString();
    const rng = seedrandom(seed);
    const questions: Question[] = [];
    const usedQuestions = new Set<string>();
    const operationCounts: Record<Operation, number> = operations.reduce(
        (acc, op) => ({ ...acc, [op]: 0 }),
        {} as Record<Operation, number>,
    );

    while (questions.length < questionCount) {
        const operation = getNextOperation(operations, operationCounts, rng);
        let question: Question | null = null;

        while (!question) {
            const numA = getRandomNumber(range.min, range.max, rng);
            const numB = getRandomNumber(range.min, range.max, rng);
            question = createValidQuestion(numA, numB, operation, range);

            if (question) {
                const questionKey = `${question.numberA}${operation}${question.numberB}`;
                if (usedQuestions.has(questionKey)) {
                    question = null;
                } else {
                    usedQuestions.add(questionKey);
                    operationCounts[operation]++;
                }
            }
        }

        questions.push(question);
    }

    return questions;
};

const getNextOperation = (
    operations: Operation[],
    operationCounts: Record<Operation, number>,
    rng: seedrandom.PRNG,
): Operation => {
    const minCount = Math.min(...Object.values(operationCounts));
    const availableOperations = operations.filter(
        op => operationCounts[op] === minCount,
    );
    return availableOperations[Math.floor(rng() * availableOperations.length)];
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

    switch (operation) {
        case "addition":
            correctAnswer = numA + numB;
            return correctAnswer <= range.max
                ? { numberA: numA, numberB: numB, operation, correctAnswer }
                : null;
        case "subtraction":
            if (numA < numB) [numA, numB] = [numB, numA];
            correctAnswer = numA - numB;
            return correctAnswer >= range.min
                ? { numberA: numA, numberB: numB, operation, correctAnswer }
                : null;
        case "multiplication":
            correctAnswer = numA * numB;
            return correctAnswer <= range.max
                ? { numberA: numA, numberB: numB, operation, correctAnswer }
                : null;
        case "division":
            if (numB === 0) return null;
            correctAnswer = Math.floor(numA / numB);
            numA = correctAnswer * numB; // Ensure clean division
            return numA <= range.max &&
                numA >= range.min &&
                numB <= range.max &&
                numB >= range.min &&
                correctAnswer >= range.min
                ? { numberA: numA, numberB: numB, operation, correctAnswer }
                : null;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }
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
