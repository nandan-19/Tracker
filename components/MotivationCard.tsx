
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Quote, Shuffle, Sparkles } from 'lucide-react';

const MOTIVATIONS = [
    { text: "Aim for CA 1st Rank.", emoji: "🏆" },
    { text: "Don't be lazy.", emoji: "⚡" },
    { text: "Consistency beats intensity.", emoji: "🔥" },
    { text: "One chapter at a time.", emoji: "📖" },
    { text: "You're closer than you think.", emoji: "🎯" },
    { text: "Study now, celebrate later.", emoji: "🎉" },
    { text: "Discipline > Motivation.", emoji: "💪" },
    { text: "Make past you proud.", emoji: "⭐" },
    { text: "Every revision counts.", emoji: "✨" },
    { text: "CA Final is within reach.", emoji: "🚀" },
    { text: "Push through today.", emoji: "💫" },
    { text: "Champions train daily.", emoji: "🥇" },
    { text: "No shortcuts. Only hard work.", emoji: "🔨" },
    { text: "Make it happen.", emoji: "🌟" },
    { text: "Future CA in the making.", emoji: "👑" }
];

// Vibrant solid color themes (no gradients)
const COLOR_THEMES = [
    { bg: 'bg-cyan-500', accent: 'bg-cyan-400', text: 'text-cyan-950', ring: 'ring-cyan-300' },
    { bg: 'bg-rose-500', accent: 'bg-rose-400', text: 'text-rose-950', ring: 'ring-rose-300' },
    { bg: 'bg-amber-400', accent: 'bg-amber-300', text: 'text-amber-950', ring: 'ring-amber-200' },
    { bg: 'bg-violet-500', accent: 'bg-violet-400', text: 'text-violet-950', ring: 'ring-violet-300' },
    { bg: 'bg-emerald-500', accent: 'bg-emerald-400', text: 'text-emerald-950', ring: 'ring-emerald-300' },
    { bg: 'bg-orange-500', accent: 'bg-orange-400', text: 'text-orange-950', ring: 'ring-orange-300' },
];

export function MotivationCard() {
    const [shuffleCount, setShuffleCount] = useState(0);
    const [isShuffling, setIsShuffling] = useState(false);

    const { message, theme } = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const index = (dayOfYear + shuffleCount) % MOTIVATIONS.length;
        const themeIndex = (dayOfYear + shuffleCount) % COLOR_THEMES.length;
        return {
            message: MOTIVATIONS[index],
            theme: COLOR_THEMES[themeIndex]
        };
    }, [shuffleCount]);

    const handleShuffle = useCallback(() => {
        setIsShuffling(true);
        setShuffleCount(prev => prev + 1);
        setTimeout(() => setIsShuffling(false), 300);
    }, []);

    return (
        <div className={`relative h-full min-h-[130px] rounded-2xl overflow-hidden ${theme.bg} shadow-xl ring-4 ${theme.ring} ring-opacity-30`}>
            {/* Decorative elements - solid shapes */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 ${theme.accent} rounded-full opacity-40`} />
            <div className={`absolute -bottom-6 -left-6 w-20 h-20 ${theme.accent} rounded-full opacity-30`} />
            <div className={`absolute top-1/2 right-4 w-2 h-16 ${theme.accent} rounded-full opacity-50 -translate-y-1/2`} />

            {/* Giant quote mark */}
            <Quote
                className={`absolute -bottom-2 right-2 ${theme.text} opacity-10`}
                size={80}
                strokeWidth={1}
            />

            {/* Content */}
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className={`${theme.text} opacity-70`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text} opacity-70`}>
                            Daily Fuel
                        </span>
                    </div>
                    <button
                        onClick={handleShuffle}
                        className={`p-1.5 rounded-lg ${theme.accent} hover:opacity-80 active:scale-90 transition-all`}
                        aria-label="Shuffle quote"
                    >
                        <Shuffle
                            size={12}
                            className={`${theme.text} ${isShuffling ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>

                <div className={`mt-3 ${isShuffling ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`}>
                    <span className="text-3xl mr-2 block mb-1">{message.emoji}</span>
                    <p className={`text-base md:text-lg font-bold ${theme.text} leading-snug`}>
                        {message.text}
                    </p>
                </div>
            </div>
        </div>
    );
}
