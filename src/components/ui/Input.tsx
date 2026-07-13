import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, type = 'text', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label ? (
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">
          {label}
        </label>
      ) : null}
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          error ? 'border-destructive focus-visible:ring-destructive' : '',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      ) : null}
    </div>
  );
}
