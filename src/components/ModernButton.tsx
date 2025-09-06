'use client';

import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/**
 * ModernButton
 * - Client component
 * - Tailwind classes
 * - Variants + sizes
 * - Optional loading state
 */
export function ModernButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...rest
}: ModernButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-transform duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const variants: Record<Variant, string> = {
    primary:
      'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-slate-100 text-slate-700 border border-slate-300 hover:scale-[1.02] active:scale-[0.98]',
    success:
      'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]',
    danger:
      'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-500 border border-slate-200 hover:scale-[1.02] active:scale-[0.98]',
  };

  const classes = [base, sizes[size], variants[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={classes}
      {...rest}
    >
      {loading ? (
        <>
          <span
            className="w-4 h-4 mr-1 border-2 rounded-full border-b-transparent animate-spin"
            aria-hidden
          />
          <span>Working…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default ModernButton;
