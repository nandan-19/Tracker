
'use client';

import { useTracker } from '@/hooks/useTracker';
import { SYLLABUS } from '@/lib/syllabus';
import { StatusBadge } from '@/components/StatusBadge';
import { notFound } from 'next/navigation';
import { use, useMemo, useState } from 'react';
import { Search, Filter, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { trackerData, toggleStatus, getUpdatedAt } = useTracker();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const subject = SYLLABUS.find(s => s.id === id);

    if (!subject) {
        notFound();
    }

    const completedCount = subject.chapters.filter(ch => trackerData[ch]?.status === 'COMPLETED').length;
    const progress = Math.round((completedCount / subject.chapters.length) * 100);

    // Filter chapters based on search and status
    const filteredChapters = useMemo(() => {
        return subject.chapters.filter((chapter, idx) => {
            const matchesSearch = chapter.toLowerCase().includes(searchQuery.toLowerCase());
            const status = trackerData[chapter]?.status || 'NOT_STARTED';
            const matchesFilter = statusFilter === 'all' || status === statusFilter;
            return matchesSearch && matchesFilter;
        });
    }, [subject.chapters, searchQuery, statusFilter, trackerData]);

    // Format relative time
    const formatRelativeTime = (dateStr: string | null) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-12 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4 sm:space-y-5">

                {/* Back navigation */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Subject Header with Glassmorphism */}
                <div className="glass rounded-2xl p-5 sm:p-6 md:p-8 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${subject.bgColor}`} />
                    <div className="absolute right-0 bottom-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3 flex-1">
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

                        {/* Progress Ring */}
                        <div className="flex items-center gap-6 sm:gap-8 glass-subtle p-4 rounded-xl w-full md:w-auto self-start md:self-center">
                            <div className="flex items-center gap-4">
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
                                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Overall</div>
                                    <div className="font-mono text-base sm:text-lg font-medium text-zinc-900 dark:text-white">
                                        {completedCount} <span className="text-zinc-400 text-xs sm:text-sm">/ {subject.chapters.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />

                            <div className="hidden sm:flex flex-col gap-1 min-w-[100px]">
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">In Progress</span>
                                    <span className="font-bold text-amber-500">{subject.chapters.filter(ch => trackerData[ch]?.status === 'IN_PROGRESS').length}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Revision</span>
                                    <span className="font-bold text-blue-500">{subject.chapters.filter(ch => trackerData[ch]?.status?.startsWith('REV')).length}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Completed</span>
                                    <span className="font-bold text-emerald-500">{completedCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="glass rounded-xl p-3 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search chapters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {['all', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === filter
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {filter === 'all' ? 'All' : filter === 'NOT_STARTED' ? 'Not Started' : filter === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chapter List */}
                <div className="space-y-2">
                    {filteredChapters.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center">
                            <p className="text-zinc-500">No chapters match your search</p>
                        </div>
                    ) : (
                        filteredChapters.map((chapter, idx) => {
                            const originalIdx = subject.chapters.indexOf(chapter);
                            const updatedAt = getUpdatedAt(chapter);
                            const relativeTime = formatRelativeTime(updatedAt);

                            return (
                                <div
                                    key={originalIdx}
                                    className="group glass-subtle rounded-xl p-3.5 sm:p-4 flex flex-row items-center gap-3 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 transition-all ${trackerData[chapter]?.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                            {trackerData[chapter]?.status === 'COMPLETED' ? '✓' : originalIdx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className={`text-sm sm:text-base font-medium leading-relaxed transition-colors ${trackerData[chapter]?.status === 'COMPLETED' ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                                {chapter}
                                            </div>
                                            {relativeTime && (
                                                <div className="text-[10px] text-zinc-400 mt-0.5">
                                                    Updated {relativeTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="shrink-0 sm:ml-auto">
                                        <StatusBadge
                                            status={trackerData[chapter]?.status || 'NOT_STARTED'}
                                            onClick={() => toggleStatus(chapter)}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
