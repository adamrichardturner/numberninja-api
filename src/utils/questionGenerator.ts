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
    console.log("Session ID:", sessionId);
    console.log("Question Count:", questionCount);
    console.log("Range:", range);
    console.log("Operation:", operation);

    const rng = seedrandom(sessionId); // Use session ID as the seed
    const questions: Question[] = [];

    for (let i = 0; i < questionCount; i++) {
        let numA = Math.floor(rng() * range) + 1;
        let numB = Math.floor(rng() * range) + 1;

        // Ensure numB is not zero when performing division
        if (operation === "division" && numB === 0) {
            numB = 1;
        }

        // Handle division to ensure integer results only
        if (operation === "division") {
            // Adjust numA to make sure the division results in a whole number
            numA = numA * numB;
        }

        let correctAnswer: number;
        switch (operation) {
            case "addition":
                correctAnswer = numA + numB;
                break;
            case "subtraction":
                correctAnswer = numA - numB;
                break;
            case "multiplication":
                correctAnswer = numA * numB;
                break;
            case "division":
                correctAnswer = numA / numB;
                break;
            default:
                throw new Error("Invalid operation");
        }

        questions.push({
            numberA: numA,
            numberB: numB,
            operation,
            correctAnswer,
        });
    }

    console.log("QUESTIONS: ", questions);

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
    sessionId: string,
    questionIndex: number,
    selectedAnswer: number,
    range: number,
    operation: string,
): { isCorrect: boolean; correctAnswer: number } => {
    // Generate questions up to the desired index (only generate the needed questions)
    const questions = generateQuestions(
        sessionId,
        questionIndex + 1,
        range,
        operation,
    );
    const question = questions[questionIndex];

    return {
        isCorrect: selectedAnswer === question.correctAnswer,
        correctAnswer: question.correctAnswer,
    };
};
