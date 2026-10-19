"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service like Sentry or Crashlytics
        console.error("Application error boundary caught:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-subtle">
                <AlertCircle className="h-8 w-8 text-error-subtle-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-primary-text">Something went wrong!</h2>
            <p className="mb-8 max-w-md text-text-secondary">
                An unexpected error occurred while rendering this page. We apologize for the
                inconvenience.
            </p>
            <div className="flex items-center gap-4">
                <Button onClick={() => reset()} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Try again
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                    Go Home
                </Button>
            </div>
        </div>
    );
}
