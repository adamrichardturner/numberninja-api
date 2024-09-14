import { Operation } from "../types/session";
import seedrandom from "seedrandom";

interface Question {
    numberA: number;
    numberB: number;
    operation: Operation;
    correctAnswer: number;
}

interface Term {
    min: number;
    max: number;
    multiple: number;
}

const TIMEOUT = 15000; // 15 seconds timeout

export const generateQuestions = (
    questionCount: number,
    termA: Term,
    termB: Term,
    operations: Operation[],
): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
        const questions: Question[] = [];
        const usedQuestions = new Set<string>();
        const rng = seedrandom(Date.now().toString());

        const generateRandomInteger = (term: Term): number => {
            const newMin = Math.floor(term.min / term.multiple) + 1;
            const newMax = Math.floor(term.max / term.multiple);
            return (
                Math.floor(rng() * (newMax - newMin + 1) + newMin) *
                term.multiple
            );
        };

        const attemptGeneration = () => {
            while (questions.length < questionCount) {
                const numA = generateRandomInteger(termA);
                const numB = generateRandomInteger(termB);
                const operation =
                    operations[Math.floor(rng() * operations.length)];

                const question = createValidQuestion(numA, numB, operation);

                if (question) {
                    const questionKey = `${question.numberA}-${question.numberB}-${question.operation}`;
                    if (!usedQuestions.has(questionKey)) {
                        usedQuestions.add(questionKey);
                        questions.push(question);
                    }
                }
            }

            resolve(questions);
        };

        const timeoutId = setTimeout(() => {
            reject(new Error("Question generation timed out"));
        }, TIMEOUT);

        attemptGeneration();

        clearTimeout(timeoutId);
    });
};

const createValidQuestion = (
    numA: number,
    numB: number,
    operation: Operation,
): Question | null => {
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
            if (numB === 0) return null;
            if (numA % numB !== 0) return null;
            correctAnswer = numA / numB;
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }

    if (!Number.isInteger(correctAnswer)) return null;

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
            correctAnswer = numberA / numberB;
            break;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }

    return parseInt(selectedAnswer, 10) === correctAnswer;
};
