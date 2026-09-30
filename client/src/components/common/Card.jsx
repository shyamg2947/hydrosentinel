import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
  bodyClassName = '',
  footer,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || action || Icon) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="truncate">
              {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800/80">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
