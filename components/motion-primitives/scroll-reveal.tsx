'use client';

import { motion, useInView, type Transition } from 'motion/react';
import { useRef, type ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    y?: number;
    className?: string;
    once?: boolean;
}

export function ScrollReveal({
    children,
    delay = 0,
    duration = 0.6,
    y = 30,
    className,
    once = true,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, margin: '-80px' });

    const transition: Transition = {
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // custom ease-out curve
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
            transition={transition}
            className={className}
        >
            {children}
        </motion.div>
    );
}
