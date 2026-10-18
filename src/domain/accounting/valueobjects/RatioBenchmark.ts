export class RatioBenchmark {
    constructor(public readonly value: number | null) {
        Object.freeze(this);
    }
}
