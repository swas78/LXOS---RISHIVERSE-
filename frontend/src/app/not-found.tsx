import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-subtle">
                <FileQuestion className="h-8 w-8 text-text-secondary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-primary-text">Page Not Found</h2>
            <p className="mb-8 max-w-md text-text-secondary">
                We couldn&apos;t find the page you were looking for. It might have been moved or
                doesn&apos;t exist.
            </p>
            <Button asChild className="gap-2">
                <Link href="/">
                    <Home className="h-4 w-4" /> Return Home
                </Link>
            </Button>
        </div>
    );
}
