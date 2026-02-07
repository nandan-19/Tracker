
'use className';

import { STATUS_STATES } from '@/lib/syllabus';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    onClick: () => void;
    className?: string;
}

export function StatusBadge({ status, onClick, className }: StatusBadgeProps) {
    const config = STATUS_STATES[status] || STATUS_STATES.NOT_STARTED;

    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wide font-bold border transition-all duration-200 hover:opacity-80 active:scale-95 w-28 text-center select-none",
                config.color,
                className
            )}
        >
            {config.label}
        </button>
    );
}
