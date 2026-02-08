
'use client';

import { useTracker } from '@/hooks/useTracker';
import { SYLLABUS, STATUS_STATES } from '@/lib/syllabus';
import { useAuth } from '@/providers/AuthProvider';
import { useMemo } from 'react';
import {
    BookOpen, CheckCircle2, RotateCcw, Activity, Flame, Trophy,
    ArrowLeft, Target, TrendingUp, Calendar, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { ProgressGraph } from '@/components/ProgressGraph';

export default function StatsPage() {
    const { trackerData, isLoaded, history } = useTracker();
    const { user } = useAuth();

    const stats = useMemo(() => {
        let totalChapters = 0;
        let completed = 0;
        let revision1 = 0;
        let revision2 = 0;
        let inProgress = 0;
        let notStarted = 0;

        const subjectStats: {
            id: string;
            name: string;
            shortName: string;
            color: string;
            bgSoft: string;
            total: number;
            completed: number;
            revision: number;
            inProgress: number;
            notStarted: number;
            progress: number;
        }[] = [];

        SYLLABUS.forEach(sub => {
            let subCompleted = 0;
            let subRevision = 0;
            let subInProgress = 0;
            let subNotStarted = 0;

            sub.chapters.forEach(ch => {
                totalChapters++;
                const entry = trackerData[ch];
                const status = entry?.status || 'NOT_STARTED';

                if (status === 'COMPLETED') { completed++; subCompleted++; }
                else if (status === 'REV_1') { revision1++; subRevision++; }
                else if (status === 'REV_2') { revision2++; subRevision++; }
                else if (status === 'IN_PROGRESS') { inProgress++; subInProgress++; }
                else { notStarted++; subNotStarted++; }
            });

            subjectStats.push({
                id: sub.id,
                name: sub.name,
                shortName: sub.shortName,
                color: sub.color,
                bgSoft: sub.bgSoft,
                total: sub.chapters.length,
                completed: subCompleted,
                revision: subRevision,
                inProgress: subInProgress,
                notStarted: subNotStarted,
                progress: Math.round((subCompleted / sub.chapters.length) * 100)
            });
        });

        // Streak calculation
        const sortedHistory = [...history].filter(h => h.count > 0).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const hasToday = sortedHistory.find(h => h.date === today);
        let checkDate = new Date();
        if (!hasToday) {
            const hasYesterday = sortedHistory.find(h => h.date === yesterday);
            if (!hasYesterday) currentStreak = 0;
            else checkDate.setDate(checkDate.getDate() - 1);
        }

        if (hasToday || sortedHistory.find(h => h.date === yesterday)) {
            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                const hasActivity = history.find(h => h.date === dateStr && h.count > 0);
                if (hasActivity) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        const sortedAsc = [...history].filter(h => h.count > 0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        for (let i = 0; i < sortedAsc.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prev = new Date(sortedAsc[i - 1].date);
                const curr = new Date(sortedAsc[i].date);
                const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
            }
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        }

        // Activity this week/month
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const weekActivity = history.filter(h => h.date >= oneWeekAgo).reduce((sum, h) => sum + h.count, 0);
        const monthActivity = history.filter(h => h.date >= oneMonthAgo).reduce((sum, h) => sum + h.count, 0);
        const totalActivity = history.reduce((sum, h) => sum + h.count, 0);

        return {
            totalChapters,
            completed,
            revision: revision1 + revision2,
            revision1,
            revision2,
            inProgress,
            notStarted,
            subjectStats,
            currentStreak,
            longestStreak,
            weekActivity,
            monthActivity,
            totalActivity,
            overallProgress: Math.round((completed / (totalChapters || 1)) * 100)
        };
    }, [trackerData, history]);

    if (!isLoaded) {
        return (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-12 space-y-6 animate-in fade-in duration-300">
                <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-12 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <ArrowLeft size={20} className="text-zinc-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Statistics</h1>
                    <p className="text-sm text-zinc-500">A detailed breakdown of your CA Final preparation</p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-5 shadow-lg">
                    <Target size={24} className="mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{stats.overallProgress}%</div>
                    <div className="text-sm opacity-80">Overall Progress</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5 shadow-lg">
                    <CheckCircle2 size={24} className="mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{stats.completed}</div>
                    <div className="text-sm opacity-80">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg">
                    <Flame size={24} className="mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{stats.currentStreak}</div>
                    <div className="text-sm opacity-80">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
                    <Trophy size={24} className="mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{stats.longestStreak}</div>
                    <div className="text-sm opacity-80">Longest Streak</div>
                </div>
            </div>

            {/* Activity Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <ProgressGraph history={history} />
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Calendar size={16} />
                        Activity Summary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">This Week</span>
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">{stats.weekActivity}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">This Month</span>
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">{stats.monthActivity}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">All Time</span>
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">{stats.totalActivity}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <BarChart3 size={16} />
                    Status Distribution
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Completed', value: stats.completed, color: 'bg-emerald-500', icon: CheckCircle2 },
                        { label: 'Revision 2', value: stats.revision2, color: 'bg-indigo-500', icon: RotateCcw },
                        { label: 'Revision 1', value: stats.revision1, color: 'bg-blue-500', icon: RotateCcw },
                        { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-500', icon: Activity },
                        { label: 'Not Started', value: stats.notStarted, color: 'bg-zinc-300 dark:bg-zinc-700', icon: BookOpen },
                    ].map((item) => (
                        <div key={item.label} className="text-center">
                            <div className="relative mx-auto w-16 h-16 mb-2">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-zinc-100 dark:text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path
                                        className={item.color.replace('bg-', 'text-')}
                                        strokeDasharray={`${(item.value / stats.totalChapters) * 100}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                    {item.value}
                                </div>
                            </div>
                            <div className="text-xs text-zinc-500 font-medium">{item.label}</div>
                        </div>
                    ))}
                </div>

                {/* Full Bar */}
                <div className="mt-6 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex overflow-hidden">
                    {stats.completed > 0 && <div style={{ width: `${(stats.completed / stats.totalChapters) * 100}%` }} className="h-full bg-emerald-500" />}
                    {stats.revision2 > 0 && <div style={{ width: `${(stats.revision2 / stats.totalChapters) * 100}%` }} className="h-full bg-indigo-500" />}
                    {stats.revision1 > 0 && <div style={{ width: `${(stats.revision1 / stats.totalChapters) * 100}%` }} className="h-full bg-blue-500" />}
                    {stats.inProgress > 0 && <div style={{ width: `${(stats.inProgress / stats.totalChapters) * 100}%` }} className="h-full bg-amber-500" />}
                </div>
                <div className="mt-3 flex justify-between text-xs text-zinc-500">
                    <span>{stats.totalChapters - stats.notStarted} of {stats.totalChapters} started</span>
                    <span>{Math.round(((stats.totalChapters - stats.notStarted) / stats.totalChapters) * 100)}% coverage</span>
                </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Subject Breakdown
                </h3>

                <div className="space-y-4">
                    {stats.subjectStats.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${sub.bgSoft} ${sub.color}`}>
                                {sub.shortName}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{sub.name}</span>
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-2">{sub.progress}%</span>
                                </div>
                                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full flex overflow-hidden">
                                    {sub.completed > 0 && <div style={{ width: `${(sub.completed / sub.total) * 100}%` }} className="h-full bg-emerald-500" />}
                                    {sub.revision > 0 && <div style={{ width: `${(sub.revision / sub.total) * 100}%` }} className="h-full bg-blue-500" />}
                                    {sub.inProgress > 0 && <div style={{ width: `${(sub.inProgress / sub.total) * 100}%` }} className="h-full bg-amber-500" />}
                                </div>
                            </div>
                            <div className="hidden sm:flex gap-2 text-xs text-zinc-500 shrink-0">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{sub.completed}</span>
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{sub.revision}</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{sub.inProgress}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
