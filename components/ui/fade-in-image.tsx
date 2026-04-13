"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "../../lib/utils";

export const FadeInImage = ({ className, alt, ...props }: ImageProps) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <span className={cn("relative overflow-hidden block", props.fill && "h-full w-full")}>
            {isLoading && (
                <span className="absolute inset-0 z-10 flex items-center justify-center bg-muted block">
                    <span className="h-full w-full animate-pulse bg-[var(--surface-strong)] block" />
                </span>
            )}
            <Image
                {...props}
                alt={alt}
                className={cn(
                    "transition-all duration-700 ease-in-out",
                    isLoading ? "scale-110 blur-xl grayscale opacity-0" : "scale-100 blur-0 grayscale-0 opacity-100",
                    className
                )}
                onLoad={() => setIsLoading(false)}
            />
        </span>
    );
};
