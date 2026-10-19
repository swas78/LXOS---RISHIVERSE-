import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/store/ReduxProvider";
import "./globals.css";

export const metadata: Metadata = {
    title: "RishiVerse Frontend Module Scaffold",
    description: "Contributor kit for rishiverse-frontend-v2 modules",
};

/*
 * Applied before first paint so a stored dark choice does not flash light
 * first. It only re-applies a class the user already picked; with nothing
 * stored it does nothing at all and the tokens fall through to
 * `prefers-color-scheme`.
 */
const NO_FLASH = `try{var m=localStorage.getItem("lx-theme");if(m==="dark"||m==="light")document.documentElement.classList.add(m)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
            </head>
            <body>
                <ReduxProvider>
                    {children}
                    <Toaster richColors position="top-right" />
                </ReduxProvider>
            </body>
        </html>
    );
}
