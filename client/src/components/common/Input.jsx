import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-lg border text-sm transition-colors py-2 ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error
              ? 'border-rose-300 dark:border-rose-700 bg-rose-50/20 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
          } placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  helperText,
  options = [],
  className = '',
  id,
  required,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-lg border text-sm transition-colors py-2 px-3 ${
          error
            ? 'border-rose-300 dark:border-rose-700 bg-rose-50/20 text-rose-900 dark:text-rose-200'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
        } ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};

export default Input;
