
'use client';

import { Quote } from 'lucide-react';
import { useMemo } from 'react';

const QUOTES = [
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "CA is not just a course, it's a journey of character building.", author: "Unknown" }
];

export function QuoteCard() {
    // Select a random quote based on the day of the year to keep it consistent for the day
    const quote = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return QUOTES[dayOfYear % QUOTES.length];
    }, []);

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <Quote className="absolute top-4 right-4 text-white/20" size={48} />
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <p className="text-lg sm:text-x font-medium leading-relaxed font-serif italic text-white/95">
                    "{quote.text}"
                </p>
                <div className="text-sm font-semibold text-indigo-100 uppercase tracking-wider">
                    — {quote.author}
                </div>
            </div>
        </div>
    );
}
