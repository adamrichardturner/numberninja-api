export type Operation = "+" | "-" | "*" | "/";

export interface Range {
    min: number;
    max: number;
}

export interface Question {
    numberA: number;
    numberB: number;
    operation: Operation;
    answer: number;
}
