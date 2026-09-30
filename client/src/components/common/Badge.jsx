import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    normal: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    critical: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50',
    offline: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
  };

  const dotColors = {
    default: 'bg-slate-500',
    normal: 'bg-emerald-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500 animate-pulse',
    critical: 'bg-rose-500 animate-ping',
    danger: 'bg-rose-500 animate-ping',
    info: 'bg-sky-500',
    purple: 'bg-purple-500',
    offline: 'bg-slate-400'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${variants[variant] || variants.default} ${sizes[size]} ${className}`}>
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className={`h-2 w-2 rounded-full ${dotColors[variant] || dotColors.default}`} />
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
