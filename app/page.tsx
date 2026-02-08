'use client'
import { useTracker } from '@/hooks/useTracker';
import { SYLLABUS } from '@/lib/syllabus';
import { BookOpen, CheckCircle2, RotateCcw, Activity, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useMemo, useState, useEffect } from 'react';
import { ProgressGraph } from '@/components/ProgressGraph';
import { Header } from '@/components/Header';

export default function Dashboard() {
  const { trackerData, isLoaded, history } = useTracker();
  const { user } = useAuth();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const targetDate = new Date('2027-01-01');
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays > 0 ? diffDays : 0);
  }, []);

  const stats = useMemo(() => {
    let totalChapters = 0;
    let completed = 0;
    let revision = 0;
    let inProgress = 0;

    SYLLABUS.forEach(sub => {
      sub.chapters.forEach(ch => {
        totalChapters++;
        const entry = trackerData[ch];
        const status = entry?.status || 'NOT_STARTED';
        if (status === 'COMPLETED') completed++;
        else if (status === 'REV_1' || status === 'REV_2') revision++;
        else if (status === 'IN_PROGRESS') inProgress++;
      });
    });

    return { totalChapters, completed, revision, inProgress };
  }, [trackerData]);

  const totalProgress = Math.round((stats.completed / (stats.totalChapters || 1)) * 100) || 0;

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-12 space-y-6 animate-in fade-in duration-300">
        <div className="space-y-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-12 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <Header />
        <div className="text-right hidden md:block">
          <div className="text-xs text-zinc-400 uppercase font-semibold mb-1">Overall Completion</div>
          <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-white">{totalProgress}%</div>
        </div>
      </div>

      {/* Progress Graph - Full Width */}
      <ProgressGraph history={history || []} />

      {/* Countdown Card with Glassmorphism */}
      <div className="relative rounded-2xl p-6 flex items-center justify-between overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Time Remaining</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tighter text-indigo-600 dark:text-indigo-400">{daysLeft}</span>
            <span className="text-zinc-600 dark:text-zinc-400">Days</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Target: Jan 1, 2027</p>
        </div>
        <Clock className="text-zinc-200 dark:text-zinc-800 group-hover:text-indigo-100 dark:group-hover:text-indigo-900/20 transition-colors duration-500" size={64} />
      </div>

      {/* Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Chapters', val: stats.totalChapters, icon: BookOpen, color: 'text-zinc-500', bg: 'from-zinc-100/80 to-zinc-50/50 dark:from-zinc-800/50 dark:to-zinc-900/50' },
          { label: 'In Progress', val: stats.inProgress, icon: Activity, color: 'text-amber-500', bg: 'from-amber-100/80 to-amber-50/50 dark:from-amber-900/30 dark:to-amber-900/10' },
          { label: 'Revising', val: stats.revision, icon: RotateCcw, color: 'text-blue-500', bg: 'from-blue-100/80 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-900/10' },
          { label: 'Completed', val: stats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'from-emerald-100/80 to-emerald-50/50 dark:from-emerald-900/30 dark:to-emerald-900/10' },
        ].map((stat, i) => (
          <div key={i} className={`relative rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[120px] sm:h-32 overflow-hidden backdrop-blur-md bg-gradient-to-br ${stat.bg} border border-white/30 dark:border-zinc-700/30 shadow-sm hover:shadow-md transition-shadow`}>
            <stat.icon size={20} className={stat.color} />
            <div>
              <div className="text-2xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{stat.val}</div>
              <div className="text-[10px] sm:text-xs text-zinc-500 font-medium mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Summary List with Glassmorphism */}
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg">
        <div className="p-6 border-b border-zinc-100/50 dark:border-zinc-800/50">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Subject Progress</h3>
        </div>
        <div className="divide-y divide-zinc-100/50 dark:divide-zinc-800/50">
          {SYLLABUS.map(sub => {
            const subChapters = sub.chapters;
            const completedCount = subChapters.filter(c => trackerData[c]?.status === 'COMPLETED').length;
            const revisionCount = subChapters.filter(c => trackerData[c]?.status?.startsWith('REV')).length;
            const inProgressCount = subChapters.filter(c => trackerData[c]?.status === 'IN_PROGRESS').length;
            const totalCount = subChapters.length;

            const completedWidth = (completedCount / totalCount) * 100;
            const revisionWidth = (revisionCount / totalCount) * 100;
            const inProgressWidth = (inProgressCount / totalCount) * 100;

            return (
              <Link
                key={sub.id}
                href={`/subject/${sub.id}`}
                className="p-4 sm:p-5 min-h-[72px] flex items-center justify-between hover:bg-white/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors group active:bg-white/70 dark:active:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${sub.bgSoft} ${sub.color}`}>
                    {sub.shortName}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">{sub.code}</div>
                    <div className="text-xs sm:text-sm text-zinc-500 truncate mb-1.5">{sub.name}</div>

                    {/* Segmented Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-full flex overflow-hidden">
                      {completedWidth > 0 && <div style={{ width: `${completedWidth}%` }} className="h-full bg-emerald-500" />}
                      {revisionWidth > 0 && <div style={{ width: `${revisionWidth}%` }} className="h-full bg-blue-500" />}
                      {inProgressWidth > 0 && <div style={{ width: `${inProgressWidth}%` }} className="h-full bg-amber-500" />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{Math.round((completedCount / totalCount) * 100)}%</div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
