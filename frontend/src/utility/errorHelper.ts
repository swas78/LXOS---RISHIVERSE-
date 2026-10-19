export function extractApiErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === "object" && err !== null) {
        const maybe = err as {
            response?: { data?: { message?: string } };
            message?: string;
        };
        return maybe.response?.data?.message || maybe.message || fallback;
    }
    return fallback;
}
