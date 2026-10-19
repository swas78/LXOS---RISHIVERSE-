"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-subtle">
                        <AlertCircle className="h-8 w-8 text-error-subtle-foreground" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-primary-text">Critical Error</h2>
                    <p className="mb-8 max-w-md text-text-secondary">
                        A critical error occurred. Please try reloading the application.
                    </p>
                    <Button onClick={() => reset()} className="gap-2">
                        <RotateCcw className="h-4 w-4" /> Reload
                    </Button>
                </div>
            </body>
        </html>
    );
}
