import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * The application shell, matching production RishiVerse.
 *
 * Production's header is a 78px transparent bar — no background fill, no
 * bottom rule — with the wide Rishihood logo on the left and the account
 * controls on the right. It does NOT carry a page title or a product name;
 * the title belongs to the page below it. The bar this replaces printed
 * "RISHIVERSE × LXOS / Learner Experience OS", which exists nowhere in the
 * real product.
 *
 * The content below sits directly under it with no card or panel wrapper,
 * which is how every production page is laid out: title, then content.
 */
export default function ErpLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-dvh bg-background">
            <header className="relative flex h-[78px] w-full items-center justify-between px-4">
                {/*
                 * The supplied logo is a single raster whose wordmark is 100%
                 * dark ink, so on the dark theme it all but disappears.
                 * `invert` would fix the wordmark and simultaneously turn the
                 * shield from brand orange to cyan, so instead the logo keeps
                 * its exact colours and sits on a light plate in dark mode.
                 *
                 * The real fix is a dark-theme logo variant from Design; this
                 * holds the line until there is one. Production never hit it
                 * because its dark theme is unfinished.
                 */}
                <Link
                    href="/lx/dashboard"
                    aria-label="Rishihood University"
                    className="shrink-0 rounded-lg dark:bg-white dark:px-2 dark:py-1"
                >
                    <Image
                        src="/rishihood-logo.svg"
                        alt="Rishihood University"
                        width={136}
                        height={63}
                        priority
                        className="h-auto w-[136px] object-contain"
                    />
                </Link>

                <div className="flex shrink-0 items-center gap-3">
                    <ThemeToggle />
                </div>
            </header>

            <div className="px-4 pb-10 sm:px-6">{children}</div>
        </div>
    );
}
