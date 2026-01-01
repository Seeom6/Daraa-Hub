'use client';

/**
 * AuthDivider Component
 * 
 * Divider with text for auth pages
 */

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = 'أو' }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200 dark:border-slate-700" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-gray-500 dark:text-gray-400">
          {text}
        </span>
      </div>
    </div>
  );
}

