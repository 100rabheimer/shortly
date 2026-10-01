import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">404</p>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">Page not found</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            The page you requested does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            <Home className="h-4 w-4" />
            Back to home
          </button>
        </div>
      </main>
    </>
  );
}
