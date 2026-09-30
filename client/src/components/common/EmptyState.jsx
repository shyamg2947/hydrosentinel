import React from 'react';
import { Database } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Database,
  title = 'No records found',
  description = 'There is currently no data to display for this view or filter.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full mb-3 flex items-center justify-center">
        {React.isValidElement(Icon) ? (
          Icon
        ) : typeof Icon === 'function' ? (
          <Icon className="w-8 h-8" />
        ) : (
          <Database className="w-8 h-8" />
        )}
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
