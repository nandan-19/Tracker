
'use client';

import { useTracker } from '@/hooks/useTracker';
import { SYLLABUS } from '@/lib/syllabus';
import { BookOpen, CheckCircle2, PieChart, RotateCcw, Activity, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ProgressBar';
import { useAuth } from '@/providers/AuthProvider';
import { useMemo, useState, useEffect } from 'react';

export default function Dashboard() {
  const { trackerData, isLoaded } = useTracker();
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
        const status = trackerData[ch];
        if (status === 'COMPLETED') completed++;
        else if (status === 'REV_1' || status === 'REV_2') revision++;
        else if (status === 'IN_PROGRESS') inProgress++;
      });
    });

    return { totalChapters, completed, revision, inProgress };
  }, [trackerData]);

  const totalProgress = Math.round((stats.completed / (stats.totalChapters || 1)) * 100) || 0;

  if (!isLoaded) return <div className="p-12 text-center text-zinc-500">Loading tracking data...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {user ? `Welcome back.` : 'Welcome, Future CA.'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Here is an overview of your preparation status.</p>
          {!user && (
            <div className="mt-4">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Log in to sync your progress &rarr;
              </Link>
            </div>
          )}
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-zinc-400 uppercase font-semibold mb-1">Overall Completion</div>
          <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-white">{totalProgress}%</div>
        </div>
      </div>

      {/* Countdown Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Time Remaining</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tighter text-red-600 dark:text-red-400">{daysLeft}</span>
            <span className="text-zinc-600 dark:text-zinc-400">Days</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Target: Jan 1, 2027</p>
        </div>
        <Clock className="text-zinc-200 dark:text-zinc-800 group-hover:text-red-100 dark:group-hover:text-red-900/20 transition-colors duration-500" size={64} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Chapters', val: stats.totalChapters, icon: BookOpen, color: 'text-zinc-500' },
          { label: 'In Progress', val: stats.inProgress, icon: Activity, color: 'text-amber-500' },
          { label: 'Revising', val: stats.revision, icon: RotateCcw, color: 'text-blue-500' },
          { label: 'Completed', val: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-32 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <stat.icon size={20} className={stat.color} />
            <div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.val}</div>
              <div className="text-xs text-zinc-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Summary List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Subject Progress</h3>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {SYLLABUS.map(sub => (
            <Link
              key={sub.id}
              href={`/subject/${sub.id}`}
              className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${sub.bgSoft} ${sub.color}`}>
                  {sub.shortName}
                </div>
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{sub.code}</div>
                  <div className="text-xs text-zinc-500">{sub.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 hidden sm:block">
                  <ProgressBar current={sub.chapters.filter(c => trackerData[c] === 'COMPLETED').length} total={sub.chapters.length} colorClass={sub.bgColor} />
                </div>
                <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
