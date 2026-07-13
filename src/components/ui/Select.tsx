import React from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ className, label, options, error, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label ? (
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none',
            error ? 'border-destructive focus-visible:ring-destructive' : '',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Dropdown Chevron Arrow positioning with logical properties */}
        <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-muted-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-destructive font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}
