import seedrandom from "seedrandom";

interface Question {
    numberA: number;
    numberB: number;
    operation: string;
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
    sessionId: string,
    questionCount: number,
    range: number,
    operation: string,
): Question[] => {
    const rng = seedrandom(sessionId);
    const questions: Question[] = [];
    const generatedQuestions = new Set<string>();
    let attempts = 0;
    const maxAttempts = questionCount * 10; // Arbitrary limit to prevent infinite loops

    while (questions.length < questionCount && attempts < maxAttempts) {
        let numA: number, numB: number, correctAnswer: number;

        switch (operation) {
            case "addition":
                numA = Math.floor(rng() * (range - 1)) + 1;
                numB = Math.floor(rng() * (range - numA)) + 1;
                correctAnswer = numA + numB;
                break;
            case "subtraction":
                numA = Math.floor(rng() * range) + 1;
                numB = Math.floor(rng() * numA) + 1;
                correctAnswer = numA - numB;
                break;
            case "multiplication":
                numA = Math.floor(rng() * Math.sqrt(range)) + 1;
                numB = Math.floor(rng() * (range / numA)) + 1;
                correctAnswer = numA * numB;
                break;
            case "division":
                numB = Math.floor(rng() * (Math.sqrt(range) - 1)) + 2;
                correctAnswer = Math.floor(rng() * (range / numB)) + 1;
                numA = correctAnswer * numB;
                break;
            default:
                throw new Error("Invalid operation");
        }

        if (numA <= range && numB <= range && correctAnswer <= range) {
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

    // If we couldn't generate enough unique questions, fill the rest with duplicates
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
