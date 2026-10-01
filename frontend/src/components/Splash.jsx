import { Link2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Splash({ visible, onDismiss }) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showDuration = prefersReducedMotion ? 1500 : 3500;
    const fadeDuration = prefersReducedMotion ? 0 : 700;
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    if (apiBase) {
      fetch(`${apiBase}/`, { method: 'GET', cache: 'no-store' }).catch(() => {
        // The backend may be cold-starting on Render, so we intentionally ignore wake-up failures.
      });
    }

    setIsVisible(true);

  let hideTimer;
const finishTimer = window.setTimeout(() => {
  setIsVisible(false);
  hideTimer = window.setTimeout(onDismiss, fadeDuration);
}, showDuration);

return () => {
  window.clearTimeout(finishTimer);
  window.clearTimeout(hideTimer);
};
  }, [visible, onDismiss]);

  if (!visible && !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ease-out dark:bg-gray-950 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-live="polite"
    >
      <div className="relative flex w-full max-w-xl flex-col items-center px-6 text-center">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute -top-16 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white"
          aria-label="Skip splash screen"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-3 text-gray-900 dark:text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-500/10">
            <Link2 className="h-6 w-6" />
          </span>
          <span className="splash-wordmark text-5xl font-medium tracking-[-0.03em]">Shortly</span>
        </div>

        <p className="splash-tagline mt-2 text-lg text-gray-600 dark:text-gray-300">
          Short links. Clear analytics.
        </p>

        <div className="mt-8 h-1 w-52 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="splash-progress h-full rounded-full bg-blue-600" />
        </div>
      </div>
    </div>
  );
}
