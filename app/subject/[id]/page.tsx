
'use client';

import { useTracker } from '@/hooks/useTracker';
import { SYLLABUS } from '@/lib/syllabus';
import { StatusBadge } from '@/components/StatusBadge';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { trackerData, toggleStatus } = useTracker();

    const subject = SYLLABUS.find(s => s.id === id);

    if (!subject) {
        notFound();
    }

    const completedCount = subject.chapters.filter(ch => trackerData[ch] === 'COMPLETED').length;
    const progress = Math.round((completedCount / subject.chapters.length) * 100);

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4 sm:space-y-6">
                {/* Subject Header */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${subject.bgColor}`}></div>
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${subject.bgSoft} ${subject.color}`}>
                                    {subject.code}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
                                {subject.name}
                            </h1>
                            {subject.description && (
                                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                                    {subject.description}
                                </p>
                            )}
                        </div>

                        {/* Progress Ring / Circle */}
                        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 w-fit">
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-zinc-200 dark:text-zinc-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className={`${subject.color}`} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                    {progress}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-400 uppercase font-semibold">Completed</div>
                                <div className="font-mono text-base sm:text-lg font-medium text-zinc-900 dark:text-white">
                                    {completedCount} <span className="text-zinc-400 text-xs sm:text-sm">/ {subject.chapters.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chapter List */}
                <div className="space-y-2">
                    {subject.chapters.map((chapter, idx) => (
                        <div
                            key={idx}
                            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm"
                        >
                            <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                <div className="mt-0.5 sm:mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 shrink-0">
                                    {idx + 1}
                                </div>
                                <div className={`text-sm sm:text-base font-medium leading-relaxed transition-colors flex-1 ${trackerData[chapter] === 'COMPLETED' ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                    {chapter}
                                </div>
                            </div>

                            <div className="flex justify-stretch">
                                <StatusBadge
                                    status={trackerData[chapter] || 'NOT_STARTED'}
                                    onClick={() => toggleStatus(chapter)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
