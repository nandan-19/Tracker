
'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
    current: number;
    total: number;
    colorClass: string;
    className?: string;
}

export function ProgressBar({ current, total, colorClass, className }: ProgressBarProps) {
    const percentage = Math.round((current / total) * 100) || 0;
    return (
        <div className={cn("w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden", className)}>
            <div
                className={cn("h-full rounded-full transition-all duration-500 ease-out", colorClass)}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
}
