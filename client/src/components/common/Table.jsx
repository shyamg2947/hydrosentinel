import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Table = ({
  columns,
  data = [],
  keyField = '_id',
  isLoading = false,
  emptyMessage = 'No records found matching criteria.',
  page = 1,
  pages = 1,
  total = 0,
  onPageChange,
  children,
  className = ''
}) => {
  // If children are passed, render as compound table wrapper
  if (children) {
    return (
      <div className={`w-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            {children}
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
              {columns?.map((col, idx) => (
                <th key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns?.map((_, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns?.length || 1} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row[keyField] || rIdx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {columns?.map((col, cIdx) => (
                    <td key={cIdx} className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row, rIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing page <span className="font-semibold text-slate-700 dark:text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pages}</span> ({total} total items)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compound subcomponents
Table.Header = ({ children, className = '' }) => (
  <thead className={`bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider ${className}`}>
    {children}
  </thead>
);

Table.Body = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/60 ${className}`}>
    {children}
  </tbody>
);

Table.Row = ({ children, className = '', ...props }) => (
  <tr className={`transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

Table.Head = ({ children, className = '', ...props }) => (
  <th className={`py-3.5 px-4 font-semibold ${className}`} {...props}>
    {children}
  </th>
);

Table.Cell = ({ children, className = '', ...props }) => (
  <td className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 ${className}`} {...props}>
    {children}
  </td>
);

export default Table;
