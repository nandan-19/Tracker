'use client';

import { useState, useMemo, useCallback } from 'react';
import {
    Quote, Shuffle, Sparkles, Trophy, Zap, Flame, BookOpen, Target,
    PartyPopper, Dumbbell, Star, Sparkle, Rocket, Moon, Medal, Hammer,
    Sun, Crown, ArrowRight
} from 'lucide-react';

const MOTIVATIONS = [
    { text: "Aim for CA 1st Rank.", icon: Trophy, tip: "Top 50 All India Rank is within reach" },
    { text: "Don't be lazy.", icon: Zap, tip: "Start with just 5 minutes" },
    { text: "Consistency beats intensity.", icon: Flame, tip: "Daily progress compounds" },
    { text: "One chapter at a time.", icon: BookOpen, tip: "Break it down, build it up" },
    { text: "You're closer than you think.", icon: Target, tip: "Every revision counts double" },
    { text: "Study now, celebrate later.", icon: PartyPopper, tip: "Success is the best party" },
    { text: "Discipline > Motivation.", icon: Dumbbell, tip: "Build unbreakable habits" },
    { text: "Make past you proud.", icon: Star, tip: "Your future self thanks you" },
    { text: "Every revision counts.", icon: Sparkle, tip: "3 revisions = mastery" },
    { text: "CA Final is within reach.", icon: Rocket, tip: "327 days of focused effort" },
    { text: "Push through today.", icon: Moon, tip: "Tomorrow starts tonight" },
    { text: "Champions train daily.", icon: Medal, tip: "Excellence is a habit" },
    { text: "No shortcuts. Only hard work.", icon: Hammer, tip: "The grind is the glory" },
    { text: "Make it happen.", icon: Sun, tip: "Action beats intention" },
    { text: "Future CA in the making.", icon: Crown, tip: "Own your title already" }
];

// Vibrant solid color themes (no gradients)
const COLOR_THEMES = [
    { bg: 'bg-cyan-500', accent: 'bg-cyan-400', text: 'text-cyan-950', ring: 'ring-cyan-300', tipBg: 'bg-cyan-600' },
    { bg: 'bg-rose-500', accent: 'bg-rose-400', text: 'text-rose-950', ring: 'ring-rose-300', tipBg: 'bg-rose-600' },
    { bg: 'bg-amber-400', accent: 'bg-amber-300', text: 'text-amber-950', ring: 'ring-amber-200', tipBg: 'bg-amber-500' },
    { bg: 'bg-violet-500', accent: 'bg-violet-400', text: 'text-violet-950', ring: 'ring-violet-300', tipBg: 'bg-violet-600' },
    { bg: 'bg-emerald-500', accent: 'bg-emerald-400', text: 'text-emerald-950', ring: 'ring-emerald-300', tipBg: 'bg-emerald-600' },
    { bg: 'bg-orange-500', accent: 'bg-orange-400', text: 'text-orange-950', ring: 'ring-orange-300', tipBg: 'bg-orange-600' },
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

    const IconComponent = message.icon;

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

                <div className={`mt-2 flex-1 flex flex-col justify-center ${isShuffling ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${theme.accent} flex items-center justify-center shrink-0`}>
                            <IconComponent size={22} className={theme.text} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <p className={`text-base md:text-lg font-bold ${theme.text} leading-snug`}>
                                {message.text}
                            </p>
                            {/* Tip section to fill space */}
                            <div className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 ${theme.tipBg} rounded-full`}>
                                <ArrowRight size={10} className="text-white/80" />
                                <span className="text-[10px] font-semibold text-white/90">
                                    {message.tip}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
