
'use client';

import { useMemo } from 'react';
import { Flame, Trophy } from 'lucide-react';

interface ProgressGraphProps {
    history: { date: string; count: number }[];
}

export function ProgressGraph({ history }: ProgressGraphProps) {
    const { data, stats, pathD, areaD, maxCount } = useMemo(() => {
        const today = new Date();
        const days = [];
        const numDays = 14;

        // Generate last 14 days data
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

        // Calculate SVG Path
        // Width: 100%, Height: 100px (internal coords)
        const width = 100; // viewBox width
        const height = 50; // viewBox height
        const padding = 5;

        const max = Math.max(...days.map(d => d.count), 5); // Minimum max of 5
        const stepX = (width) / (numDays - 1);

        const points = days.map((day, i) => {
            const x = i * stepX;
            const y = height - ((day.count / max) * height);
            return [x, y];
        });

        // Create Smooth Path (Cubic Bezier)
        let d = `M ${points[0][0]} ${points[0][1]}`;

        for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = points[i];
            const [x1, y1] = points[i + 1];
            // Control points for smooth curve
            const cx0 = x0 + (stepX / 2);
            const cy0 = y0;
            const cx1 = x1 - (stepX / 2);
            const cy1 = y1;

            d += ` C ${cx0} ${cy0}, ${cx1} ${cy1}, ${x1} ${y1}`;
        }

        const areaPath = `${d} L ${width} ${height} L 0 ${height} Z`;

        return {
            data: days,
            stats: { currentStreak, longestStreak, totalChapters },
            pathD: d,
            areaD: areaPath,
            maxCount: max
        };
    }, [history]);

    function calculateStreak(history: { date: string; count: number }[]) {
        if (!history.length) return 0;
        const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let streak = 0;
        let checkDate = new Date();
        const hasToday = sorted.find(h => h.date === today && h.count > 0);

        // If no activity today, check if streak is alive from yesterday
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
        // Simplified: Max streak in recorded history
        // Ideally we need contiguous dates check
        // This is a rough estimation based on available data points being contiguous
        // Since the history array only stores dates with activity (mostly), we need to fill gaps to check contiguity?
        // Actually, my implementation stores sparse data.
        // Correct way: Sort by date, check difference between consecutive dates.

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

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Learning Velocity
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Recent activity across chapters & revisions
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                        <Flame className="text-orange-500" size={14} />
                        <div>
                            <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Streak</div>
                            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 leading-none">{stats.currentStreak}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative h-24 w-full mt-4">
                {/* SVG Graph */}
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <path d={areaD} fill="url(#lineGradient)" />

                    {/* Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="rgb(79, 70, 229)"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                    />

                    {/* Points */}
                    {data.map((d, i) => {
                        const max = Math.max(...data.map(d => d.count), 5);
                        const x = i * (100 / (data.length - 1));
                        const y = 50 - ((d.count / max) * 50);

                        return (
                            <g key={d.date} className="group cursor-pointer">
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="1.5"
                                    className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-zinc-900 stroke-2 transition-all group-hover:r-2"
                                    vectorEffect="non-scaling-stroke"
                                />
                                {/* Tooltip using foreignObject or simple overlay logic? SVG tooltips are tricky. Let's rely on React state or simpler HTML overlay if needed. 
                                    Actually, for simplicity in this artifact, let's just show count on hover using standard title or simpler technique. 
                                */}
                                <title>{d.fullDate}: {d.count} activities</title>
                            </g>
                        );
                    })}
                </svg>

                {/* X-Axis Labels */}
                <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-1">
                    {data.map((d, i) => (
                        i % 2 === 0 && ( // Show every other label
                            <div key={d.date} className="text-[9px] text-zinc-400 font-medium">
                                {d.dayName[0]}
                            </div>
                        )
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center text-[10px] text-zinc-400">
                <div>Total: {stats.totalChapters} actions</div>
                <div>Last 14 Days</div>
            </div>
        </div>
    );
}
