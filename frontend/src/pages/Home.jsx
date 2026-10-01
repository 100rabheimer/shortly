import { ArrowRight, LoaderCircle, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { shortenUrl } from '../api/client';
import CopyButton from '../components/CopyButton';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { truncateUrl } from '../utils/dates';

const RECENT_KEY = 'shortly_recent';

function readRecentLinks() {
  try {
    const stored = window.localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wakeMessage, setWakeMessage] = useState(false);
  const [result, setResult] = useState(null);
  const [recentLinks, setRecentLinks] = useState([]);

  useEffect(() => {
    setRecentLinks(readRecentLinks());
  }, []);

  useEffect(() => {
    if (!loading) {
      setWakeMessage(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setWakeMessage(true);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [loading]);

  const updateRecentLinks = (nextItem) => {
    const items = readRecentLinks();
    const updated = [nextItem, ...items].slice(0, 5);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecentLinks(updated);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    setLoading(true);
    setError('');
    setWakeMessage(false);

    try {
      const payload = await shortenUrl(url.trim());
      const item = {
        shortCode: payload.shortCode,
        shortUrl: payload.shortUrl,
        originalUrl: url.trim(),
      };

      setResult(item);
      updateRecentLinks(item);
      setUrl('');
    } catch (err) {
      const message =
        err?.status >= 500 || !err?.status
          ? 'Something went wrong. Try again.'
          : err.serverMessage || 'Something went wrong. Try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Link2 className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.2em]">Shortly</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Shorten a link
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            Paste a long URL and get a short one you can track.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="url-input" className="sr-only">
              URL to shorten
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                className="h-11 flex-1 rounded-lg border border-gray-200 bg-white px-3.5 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-400"
                aria-invalid={Boolean(error)}
                aria-describedby="shorten-error"
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                {loading ? <Spinner className="h-4 w-4 border-2 border-white/30 border-t-white" /> : <ArrowRight className="h-4 w-4" />}
                <span>{loading ? 'Shortening' : 'Shorten'}</span>
              </button>
            </div>

            <div aria-live="polite" id="shorten-error" className="mt-3 min-h-5">
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              {wakeMessage && !error && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Waking up the server, this can take up to a minute on the first request.
                </p>
              )}
            </div>
          </form>
        </section>

        {result && (
          <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your short link</p>
                <p className="mt-1 truncate text-lg font-medium text-gray-900 dark:text-white">{result.shortUrl}</p>
              </div>

              <div className="flex items-center gap-2">
                <CopyButton value={result.shortUrl} label="Copy" className="h-10" />
                <button
                  type="button"
                  onClick={() => navigate(`/stats/${result.shortCode}`)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:text-blue-400"
                >
                  View stats
                </button>
              </div>
            </div>
          </section>
        )}

        {recentLinks.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent links</h2>

            <ul className="mt-4 space-y-3">
              {recentLinks.map((item) => (
                <li
                  key={`${item.shortCode}-${item.originalUrl}`}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{item.shortUrl}</p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{truncateUrl(item.originalUrl, 52)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <CopyButton value={item.shortUrl} label="Copy" className="h-9" />
                    <Link
                      to={`/stats/${item.shortCode}`}
                      className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-blue-400"
                    >
                      Stats
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
