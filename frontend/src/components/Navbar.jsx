import { Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-900 dark:text-white" aria-label="Go to home page">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-500/10">
            <Link2 className="h-4 w-4" />
          </span>
          <span className="text-xl font-medium tracking-tight">Shortly</span>
        </Link>
      </div>
    </header>
  );
}
