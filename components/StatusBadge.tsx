
'use client';

import { STATUS_STATES } from '@/lib/syllabus';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StatusBadgeProps {
    status: string;
    onClick: () => void;
    className?: string;
}

export function StatusBadge({ status, onClick, className }: StatusBadgeProps) {
    const config = STATUS_STATES[status] || STATUS_STATES.NOT_STARTED;
    const isCompleted = status === 'COMPLETED';

    return (
        <button
            onClick={onClick}
            className={cn(
                // Mobile-first: full width with proper touch target
                "w-full sm:w-32 min-h-[44px] px-4 py-3 sm:py-2.5",
                "rounded-xl text-xs sm:text-[10px] uppercase tracking-wide font-bold",
                "border-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                "text-center select-none touch-manipulation",
                "shadow-sm hover:shadow-lg",
                config.color,
                className
            )}
            title="Click to change status"
        >
            <span className="flex items-center justify-center gap-1.5">
                {isCompleted && <Check size={12} strokeWidth={3} />}
                {config.label}
            </span>
        </button>
    );
}
