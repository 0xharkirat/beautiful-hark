"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ mobile = false }: { mobile?: boolean }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === ';') {
                e.preventDefault();
                setTheme(theme === 'dark' ? 'light' : 'dark');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [theme, setTheme]);

    const toggle = () => mounted && setTheme(theme === "dark" ? "light" : "dark");
    const label = theme === "dark" ? "Light mode" : "Dark mode";

    if (mobile) {
        return (
            <button
                type="button"
                onClick={toggle}
                aria-label="Toggle theme"
                className="flex w-full items-center gap-2 border-b border-transparent pb-1 text-muted-foreground transition-colors hover:border-accent-red hover:text-accent-red"
            >
                <div className="relative flex size-4 items-center">
                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute inset-0 m-auto size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </div>
                <span>{label}</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative flex cursor-pointer items-center p-0.5 text-muted-foreground transition-colors hover:text-accent-red"
        >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 m-auto size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
