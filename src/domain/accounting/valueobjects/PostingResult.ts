export class PostingResult {
    public readonly isSuccess: boolean;
    public readonly errorDetails: string | null;
    constructor(isSuccess: boolean, errorDetails?: string | null) {
        this.isSuccess = isSuccess;
        this.errorDetails = errorDetails || null;
        Object.freeze(this);
    }
}
