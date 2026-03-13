/**
 * ShortageStats — Dashboard stat cards showing aggregate counts.
 *
 * Displays: Current Shortages (ongoing), Recently Resolved (terminated), Total Records.
 * Fetches counts on mount with 5-minute sessionStorage cache.
 */

import { useState, useEffect } from 'react';
import { fetchStats } from '../lib/fda-api';
import type { ShortageStatsData } from '../lib/fda-types';

export default function ShortageStats() {
  const [stats, setStats] = useState<ShortageStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchStats()
      .then((data) => {
        if (mounted) setStats(data);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    {
      label: 'Ongoing Actions',
      value: stats?.ongoing,
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-900/50',
      icon: (
        <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
    },
    {
      label: 'Terminated',
      value: stats?.terminated,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
      icon: (
        <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      label: 'Total Records',
      value: stats?.total,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-50 dark:bg-slate-800/50',
      borderColor: 'border-slate-200 dark:border-slate-700',
      icon: (
        <svg className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-5 transition-shadow hover:shadow-md`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">{card.icon}</div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              {loading ? (
                <div className="mt-1 h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              ) : error ? (
                <p className="mt-1 text-sm text-slate-400">--</p>
              ) : (
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value?.toLocaleString() ?? '--'}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
