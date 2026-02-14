'use client'
import { useTracker } from '@/hooks/useTracker';
import { SYLLABUS } from '@/lib/syllabus';
import { BookOpen, CheckCircle2, RotateCcw, Activity, Clock, ChevronRight, Sparkles, Calendar, TrendingUp, TrendingDown, Award, AlertTriangle, Flame, CalendarDays, CalendarClock, Timer, Angry, Dumbbell, Star, Crown, Zap, Target, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { useMemo, useState, useEffect } from 'react';
import { ProgressGraph } from '@/components/ProgressGraph';
import { Header } from '@/components/Header';
import { MotivationCard } from '@/components/MotivationCard';

// Detailed Countdown Component
function CountdownCard() {
  const { settings } = useSettings();
  const targetDate = new Date(settings.profile.examDate);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();

  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30);
  const weeks = Math.floor((totalDays % 30) / 7);
  const days = totalDays % 7;

  return (
    <div className="relative glass rounded-2xl p-5 overflow-hidden">
      <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Time Until CA Final {new Date(settings.profile.examDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
        <Timer size={16} className="text-zinc-400 dark:text-zinc-600" />
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <div className="bg-indigo-500 rounded-xl p-3 text-center shadow-lg shadow-indigo-500/20">
          <CalendarDays size={16} className="mx-auto mb-1 text-indigo-200" />
          <div className="text-2xl sm:text-3xl font-bold text-white">{months}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">Months</div>
        </div>
        <div className="bg-violet-500 rounded-xl p-3 text-center shadow-lg shadow-violet-500/20">
          <CalendarClock size={16} className="mx-auto mb-1 text-violet-200" />
          <div className="text-2xl sm:text-3xl font-bold text-white">{weeks}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-violet-100">Weeks</div>
        </div>
        <div className="bg-fuchsia-500 rounded-xl p-3 text-center shadow-lg shadow-fuchsia-500/20">
          <Clock size={16} className="mx-auto mb-1 text-fuchsia-200" />
          <div className="text-2xl sm:text-3xl font-bold text-white">{days}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-100">Days</div>
        </div>
      </div>

      <div className="mt-4 text-center relative z-10">
        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{totalDays} total days remaining</span>
      </div>
    </div>
  );
}

// Performance-based Comment Component
function PerformanceComment({ history }: { history: Array<{ date: string; count: number }> }) {
  const { settings } = useSettings();

  const analysis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const todayActivity = history.find(h => h.date === today)?.count || 0;
    const yesterdayActivity = history.find(h => h.date === yesterday)?.count || 0;

    // Calculate averages
    const last7Days = history.filter(h => {
      const d = new Date(h.date);
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      return d >= weekAgo;
    });
    const weekAvg = last7Days.length > 0
      ? Math.round(last7Days.reduce((sum, h) => sum + h.count, 0) / 7)
      : 0;

    // Streak
    let streak = 0;
    const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const entry of sorted) {
      if (entry.count === 0) break;
      streak++;
    }

    // Analysis logic with goals
    const dailyGoal = settings.study.dailyGoal;
    const weeklyGoal = settings.study.weeklyGoal;
    const weekTotal = last7Days.reduce((sum, h) => sum + h.count, 0);

    let type: 'praise' | 'scold' | 'encourage';
    let message: string;
    let icon: LucideIcon;

    if (streak === 0 && yesterdayActivity > 0) {
      // Broke the streak today
      type = 'scold';
      icon = Angry;
      message = "You broke your streak today! Don't let one day become two. Get back on track NOW!";
    } else if (todayActivity === 0 && new Date().getHours() >= 18) {
      // No activity today and it's evening
      type = 'encourage';
      icon = Dumbbell;
      message = `It's getting late and you haven't studied today. Your daily goal is ${dailyGoal} chapters. Start now!`;
    } else if (todayActivity >= dailyGoal && dailyGoal > 0) {
      // Met or exceeded daily goal
      type = 'praise';
      icon = Flame;
      message = `BEAST MODE! ${todayActivity} chapters today - you crushed your daily goal of ${dailyGoal}!`;
    } else if (weekTotal >= weeklyGoal && weeklyGoal > 0) {
      // Met weekly goal
      type = 'praise';
      icon = Crown;
      message = `Amazing! ${weekTotal} chapters this week - you've hit your weekly goal of ${weeklyGoal}!`;
    } else if (todayActivity > 0 && todayActivity < dailyGoal) {
      // Below daily goal but trying
      type = 'encourage';
      icon = Zap;
      message = `Good start with ${todayActivity}! Push for ${dailyGoal - todayActivity} more to hit your ${dailyGoal} chapter goal!`;
    } else if (streak >= 7) {
      // Long streak maintained
      type = 'praise';
      icon = Crown;
      message = `${streak} days straight! You're in the top tier. Legends maintain streaks!`;
    } else if (todayActivity === 0) {
      // No activity yet
      type = 'encourage';
      icon = BookOpen;
      message = dailyGoal > 0
        ? `Your daily goal is ${dailyGoal} chapters. Let's start strong today!`
        : "Start your CA journey today. Complete your first chapter!";
    } else {
      type = 'praise';
      icon = Sparkles;
      message = "You're putting in the work. Stay focused!";
    }

    return { type, message, icon, todayActivity, streak, weekAvg, weekTotal, dailyGoal, weeklyGoal };
  }, [history, settings]);

  const bgColors = {
    praise: 'bg-emerald-500',
    scold: 'bg-red-500',
    encourage: 'bg-amber-500'
  };

  const icons = {
    praise: Award,
    scold: AlertTriangle,
    encourage: TrendingUp
  };

  const Icon = icons[analysis.type];

  return (
    <div className={`${bgColors[analysis.type]} rounded-2xl p-4 shadow-lg flex items-center gap-4`}>
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <analysis.icon size={24} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} className="text-white/80" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
            {analysis.type === 'praise' ? 'Great Job!' : analysis.type === 'scold' ? 'Wake Up!' : 'Keep Going!'}
          </span>
          {analysis.streak > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
              <Flame size={10} /> {analysis.streak} day streak
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-white leading-snug">
          {analysis.message}
        </p>
      </div>
    </div>
  );
}


export default function Page() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { trackerData, history, isLoaded } = useTracker();

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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-12 space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <Header />
        <div className="text-right hidden md:block">
          <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Overall</div>
          <div className="text-3xl font-mono font-bold text-gradient">{totalProgress}%</div>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse-glow relative overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
                 border: '2px solid #FFD700',
                 boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), 0 4px 20px rgba(0, 0, 0, 0.2)'
               }}>
            {/* Animated background shimmer */}
            <div className="absolute inset-0 opacity-20"
                 style={{
                   background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), transparent)',
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite'
                 }}></div>
            <Crown size={16} className="relative z-10 animate-pulse" style={{ color: '#FFD700' }} strokeWidth={2.5} />
            <span className="text-sm font-black relative z-10 text-gold uppercase tracking-wide"
                  style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>
              {settings.profile.targetRank}
            </span>
            <Zap size={14} className="relative z-10 animate-pulse" style={{ color: '#FFD700' }} />
          </div>
        </div>
      </div>

      {/* Mobile Target Rank Card - Premium Gold/Neon Display */}
      <div className="md:hidden relative overflow-hidden rounded-3xl mb-5 animate-pulse-glow"
           style={{
             background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
             border: '2px solid transparent',
             backgroundClip: 'padding-box'
           }}>
        {/* Animated gold border */}
        <div className="absolute inset-0 rounded-3xl p-[2px] -z-10"
             style={{
               background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700, #FFED4E)',
               backgroundSize: '400% 400%',
               animation: 'gold-shimmer 3s linear infinite'
             }}>
        </div>
        
        {/* Neon glow effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-40"
             style={{ background: 'radial-gradient(circle, #FFD700, transparent)' }} />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-30"
             style={{ background: 'radial-gradient(circle, #FF6B35, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full blur-3xl opacity-20"
             style={{ background: 'radial-gradient(circle, #F72585, transparent)' }} />
        
        {/* Floating crown icon with animation */}
        <Crown
          className="absolute -bottom-4 right-4 opacity-10 animate-float"
          size={100}
          strokeWidth={1}
          style={{ color: '#FFD700' }}
        />
        
        <div className="relative z-10 p-6">
          {/* Header with premium styling */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-gold animate-pulse" style={{ color: '#FFD700' }} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold"
                    style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}>
                Target Rank
              </span>
            </div>
            <Zap size={18} className="animate-pulse" style={{ color: '#FFD700' }} />
          </div>
          
          {/* Large Target Rank with Premium Gold Gradient Text */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 animate-neon-pulse"
                 style={{
                   background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                   boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)'
                 }}>
              <Crown size={32} className="animate-float" style={{ color: '#1a1a1a' }} strokeWidth={3} />
            </div>
            <div className="flex-1">
              <div className="text-5xl font-black leading-none mb-2 text-neon"
                   style={{ 
                     textShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 107, 53, 0.3)',
                     letterSpacing: '-0.02em'
                   }}>
                {settings.profile.targetRank}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-60"
                   style={{ color: '#FFD700' }}>
                Your Destination
              </div>
            </div>
          </div>
          
          {/* Progress Badge with neon styling */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-neon-pulse"
               style={{
                 background: 'linear-gradient(135deg, #FFD700, #FF6B35)',
                 boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
               }}>
            <TrendingUp size={14} style={{ color: '#1a1a1a' }} strokeWidth={3} />
            <span className="text-sm font-black" style={{ color: '#1a1a1a' }}>
              {totalProgress}% COMPLETE
            </span>
          </div>
        </div>
      </div>

      {/* Top Row: Motivation + Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MotivationCard />

        {/* Detailed Countdown Card */}
        <CountdownCard />
      </div>

      {/* Performance Comment */}
      <PerformanceComment history={history || []} />

      {/* Progress Graph */}
      <div className="glass rounded-2xl overflow-hidden">
        <ProgressGraph history={history || []} trackerData={trackerData} />
      </div>

      {/* Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Chapters', val: stats.totalChapters, icon: BookOpen, gradient: 'from-slate-100 to-slate-50 dark:from-zinc-800/50 dark:to-zinc-900/50', iconColor: 'text-slate-600 dark:text-zinc-400', borderColor: 'border-slate-200 dark:border-zinc-700' },
          { label: 'In Progress', val: stats.inProgress, icon: Activity, gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-amber-950/20', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-200 dark:border-amber-800/50' },
          { label: 'Revising', val: stats.revision, icon: RotateCcw, gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-blue-950/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-800/50' },
          { label: 'Completed', val: stats.completed, icon: CheckCircle2, gradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-emerald-950/20', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-200 dark:border-emerald-800/50' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`relative rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[110px] overflow-hidden bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} hover:shadow-lg transition-all duration-300 group`}
          >
            <stat.icon size={18} className={`${stat.iconColor} group-hover:scale-110 transition-transform`} />
            <div>
              <div className="text-2xl font-bold text-zinc-800 dark:text-white">{stat.val}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 uppercase tracking-wide">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Summary List with Glassmorphism */}
      <div id="subjects" className="glass rounded-2xl overflow-hidden scroll-mt-20">
        <div className="p-5 border-b border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">Subject Progress</h3>
          </div>
          <div className="text-xs text-zinc-400">Tap to explore</div>
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
            const progress = Math.round((completedCount / totalCount) * 100);

            return (
              <Link
                key={sub.id}
                href={`/subject/${sub.id}`}
                className="p-4 sm:p-5 min-h-[72px] flex items-center justify-between hover:bg-white/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-all duration-200 group active:bg-white/70 dark:active:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${sub.bgSoft} ${sub.color} shadow-sm`}>
                    {sub.shortName}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="font-medium text-sm sm:text-base text-zinc-900 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{sub.code}</div>
                    <div className="text-xs text-zinc-500 truncate mb-2">{sub.name}</div>

                    {/* Segmented Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full flex overflow-hidden">
                      {completedWidth > 0 && <div style={{ width: `${completedWidth}%` }} className="h-full bg-emerald-500" />}
                      {revisionWidth > 0 && <div style={{ width: `${revisionWidth}%` }} className="h-full bg-blue-500" />}
                      {inProgressWidth > 0 && <div style={{ width: `${inProgressWidth}%` }} className="h-full bg-amber-500" />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className={`text-sm font-bold ${progress === 100 ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'}`}>{progress}%</div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
