'use client';

import { useMemo, useState, useCallback } from 'react';
import { Flame, X, BookOpen, CheckCircle2, RotateCcw, Activity, Calendar, TrendingUp, Zap } from 'lucide-react';
import { SYLLABUS } from '@/lib/syllabus';

interface ChapterData {
    status: string;
    updatedAt: string;
}

interface TrackerDataMap {
    [chapterName: string]: ChapterData;
}

interface ProgressGraphProps {
    history: { date: string; count: number }[];
    trackerData?: TrackerDataMap;
}

// Status display config
const STATUS_DISPLAY: { [key: string]: { label: string; color: string; icon: typeof CheckCircle2 } } = {
    'COMPLETED': { label: 'Completed', color: 'text-emerald-500', icon: CheckCircle2 },
    'REV_1': { label: 'Revision 1', color: 'text-blue-500', icon: RotateCcw },
    'REV_2': { label: 'Revision 2', color: 'text-indigo-500', icon: RotateCcw },
    'IN_PROGRESS': { label: 'In Progress', color: 'text-amber-500', icon: Activity },
    'NOT_STARTED': { label: 'Started', color: 'text-zinc-500', icon: BookOpen },
};

export function ProgressGraph({ history, trackerData = {} }: ProgressGraphProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { data, stats, pathD, areaD, maxCount } = useMemo(() => {
        const today = new Date();
        const days = [];
        const numDays = 14;

        for (let i = numDays - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const entry = history.find(h => h.date === dateStr);
            days.push({
                date: dateStr,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                count: entry ? entry.count : 0
            });
        }

        // Calculate Stats
        const currentStreak = calculateStreak(history);
        const longestStreak = calculateLongestStreak(history);
        const totalChapters = history.reduce((acc, curr) => acc + curr.count, 0);
        const weekTotal = days.slice(-7).reduce((acc, d) => acc + d.count, 0);
        const prevWeekTotal = days.slice(0, 7).reduce((acc, d) => acc + d.count, 0);
        const weekChange = prevWeekTotal > 0 ? Math.round(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100) : 0;

        // Calculate SVG Path
        const width = 100;
        const height = 50;

        const max = Math.max(...days.map(d => d.count), 5);
        const stepX = (width) / (numDays - 1);

        const points = days.map((day, i) => {
            const x = i * stepX;
            const y = height - ((day.count / max) * height);
            return [x, y];
        });

        let d = `M ${points[0][0]} ${points[0][1]}`;

        for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = points[i];
            const [x1, y1] = points[i + 1];
            const cx0 = x0 + (stepX / 2);
            const cy0 = y0;
            const cx1 = x1 - (stepX / 2);
            const cy1 = y1;

            d += ` C ${cx0} ${cy0}, ${cx1} ${cy1}, ${x1} ${y1}`;
        }

        const areaPath = `${d} L ${width} ${height} L 0 ${height} Z`;

        return {
            data: days,
            stats: { currentStreak, longestStreak, totalChapters, weekTotal, weekChange },
            pathD: d,
            areaD: areaPath,
            maxCount: max
        };
    }, [history]);

    // Get chapters updated on a specific date
    const getChaptersForDate = useCallback((date: string): { chapter: string; subject: string; status: string; subjectColor: string }[] => {
        const chapters: { chapter: string; subject: string; status: string; subjectColor: string }[] = [];

        Object.entries(trackerData).forEach(([chapterName, chapterData]) => {
            if (chapterData.updatedAt) {
                const updatedDate = chapterData.updatedAt.split('T')[0];
                if (updatedDate === date) {
                    // Find which subject this chapter belongs to
                    const subject = SYLLABUS.find(s => s.chapters.includes(chapterName));
                    chapters.push({
                        chapter: chapterName,
                        subject: subject?.shortName || 'Unknown',
                        status: chapterData.status,
                        subjectColor: subject?.color || 'text-zinc-500'
                    });
                }
            }
        });

        return chapters;
    }, [trackerData]);

    const selectedDayData = useMemo(() => {
        if (!selectedDate) return null;
        const dayInfo = data.find(d => d.date === selectedDate);
        const chapters = getChaptersForDate(selectedDate);
        return { dayInfo, chapters };
    }, [selectedDate, data, getChaptersForDate]);

    function calculateStreak(history: { date: string; count: number }[]) {
        if (!history.length) return 0;
        const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let streak = 0;
        let checkDate = new Date();
        const hasToday = sorted.find(h => h.date === today && h.count > 0);

        if (!hasToday) {
            const hasYesterday = sorted.find(h => h.date === yesterday && h.count > 0);
            if (!hasYesterday) return 0;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasActivity = history.find(h => h.date === dateStr && h.count > 0);
            if (hasActivity) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }

    function calculateLongestStreak(history: { date: string; count: number }[]) {
        if (!history.length) return 0;
        const sorted = [...history].filter(h => h.count > 0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (!sorted.length) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1].date);
            const curr = new Date(sorted[i].date);
            const diffTime = Math.abs(curr.getTime() - prev.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        }
        return maxStreak;
    }

    const handlePointClick = (date: string) => {
        setSelectedDate(selectedDate === date ? null : date);
    };

    return (
        <div className="p-5 sm:p-6 h-full flex flex-col relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" />
                        Learning Velocity
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                        Click on any point to see what you studied
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* Today's Count */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                        <Zap className="text-indigo-500" size={12} />
                        <div>
                            <div className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Today</div>
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 leading-none">{data[data.length - 1]?.count || 0}</div>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                        <Flame className="text-orange-500" size={12} />
                        <div>
                            <div className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Streak</div>
                            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-none">{stats.currentStreak}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph */}
            <div className="relative h-28 w-full">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    ))}

                    {/* Area */}
                    <path d={areaD} fill="url(#lineGradient)" />

                    {/* Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="rgb(79, 70, 229)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                    />

                    {/* Clickable Points */}
                    {data.map((d, i) => {
                        const max = Math.max(...data.map(d => d.count), 5);
                        const x = i * (100 / (data.length - 1));
                        const y = 50 - ((d.count / max) * 50);
                        const isSelected = selectedDate === d.date;
                        const hasActivity = d.count > 0;

                        return (
                            <g key={d.date} className="cursor-pointer" onClick={() => handlePointClick(d.date)}>
                                {/* Larger hit area */}
                                <circle cx={x} cy={y} r="4" fill="transparent" />

                                {/* Visible point */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isSelected ? "3" : hasActivity ? "2" : "1.5"}
                                    className={`
                                        transition-all duration-200
                                        ${isSelected
                                            ? 'fill-indigo-600 dark:fill-indigo-400'
                                            : hasActivity
                                                ? 'fill-indigo-500 dark:fill-indigo-400'
                                                : 'fill-zinc-300 dark:fill-zinc-600'}
                                    `}
                                    style={{ filter: isSelected ? 'drop-shadow(0 0 4px rgb(79, 70, 229))' : undefined }}
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Selection ring */}
                                {isSelected && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill="none"
                                        stroke="rgb(79, 70, 229)"
                                        strokeWidth="1"
                                        strokeOpacity="0.5"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* X-Axis Labels */}
                <div className="absolute bottom-[-18px] left-0 right-0 flex justify-between">
                    {data.map((d, i) => (
                        <button
                            key={d.date}
                            onClick={() => handlePointClick(d.date)}
                            className={`text-[9px] font-medium transition-colors ${selectedDate === d.date
                                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                }`}
                        >
                            {d.dayName[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            {selectedDayData && (
                <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-indigo-500" />
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                {selectedDayData.dayInfo?.fullDate}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                {selectedDayData.chapters.length} updates
                            </span>
                        </div>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                            <X size={14} className="text-zinc-500" />
                        </button>
                    </div>

                    {selectedDayData.chapters.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedDayData.chapters.map((ch, idx) => {
                                const statusConfig = STATUS_DISPLAY[ch.status] || STATUS_DISPLAY['NOT_STARTED'];
                                const Icon = statusConfig.icon;
                                return (
                                    <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ch.subjectColor} bg-current/10`}>
                                            {ch.subject}
                                        </span>
                                        <span className="flex-1 text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate">
                                            {ch.chapter}
                                        </span>
                                        <span className={`flex items-center gap-1 text-[10px] font-bold ${statusConfig.color}`}>
                                            <Icon size={10} />
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-sm text-zinc-500">
                            <BookOpen size={24} className="mx-auto mb-2 opacity-30" />
                            No study activity on this day
                        </div>
                    )}
                </div>
            )}

            {/* Footer Stats */}
            <div className="mt-auto pt-4 flex justify-between items-center text-[10px] text-zinc-400 relative z-10">
                <div className="flex gap-3">
                    <span>Week: <strong className="text-zinc-600 dark:text-zinc-300">{stats.weekTotal}</strong></span>
                    <span>Total: <strong className="text-zinc-600 dark:text-zinc-300">{stats.totalChapters}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                    {stats.weekChange !== 0 && (
                        <span className={stats.weekChange > 0 ? 'text-emerald-500' : 'text-red-500'}>
                            {stats.weekChange > 0 ? '+' : ''}{stats.weekChange}% vs last week
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
