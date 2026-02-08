
'use client';

import { useMemo } from 'react';
import { Zap } from 'lucide-react';

const MOTIVATIONS = [
    "Aim for CA 1st Rank.",
    "Don't be lazy.",
    "Consistency beats intensity.",
    "One chapter at a time.",
    "You're closer than you think.",
    "Study now, celebrate later.",
    "Discipline > Motivation.",
    "Make past you proud.",
    "Every revision counts.",
    "CA Final is within reach.",
    "Push through today.",
    "Champions train daily.",
    "No shortcuts. Only hard work.",
    "Make it happen.",
    "Future CA in the making."
];

export function MotivationCard() {
    const message = useMemo(() => {
        // Pick based on day of year for variety
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
    }, []);

    return (
        <div className="relative h-full min-h-[120px] rounded-2xl p-6 flex flex-col justify-center overflow-hidden backdrop-blur-xl bg-gradient-to-br from-violet-500/90 via-indigo-500/90 to-purple-600/90 border border-white/20 shadow-lg">
            {/* Glassmorphism Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-yellow-300" size={18} fill="currentColor" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">Today's Focus</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-white leading-snug">
                    {message}
                </p>
            </div>
        </div>
    );
}
