import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStats } from '../api/client';
import ClicksChart from '../components/ClicksChart';
import MetricCard from '../components/MetricCard';
import Navbar from '../components/Navbar';
import ReferrersTable from '../components/ReferrersTable';
import { fillMissingDates, formatShortDate, getTodayUtcClicks, getTopReferrer } from '../utils/dates';

export default function Stats() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    setNotFound(false);

    try {
      const data = await getStats(code);
      setStats(data);
    } catch (err) {
      if (err?.status === 404) {
        setNotFound(true);
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [code]);

  const chartData = useMemo(() => {
    if (!stats?.clicksPerDay?.length) {
      return [];
    }

    return fillMissingDates(stats.clicksPerDay, new Date());
  }, [stats]);

  const todayClicks = stats ? getTodayUtcClicks(stats.clicksPerDay || []) : 0;
  const topReferrer = stats ? getTopReferrer(stats.referrers || []) : { referrer: 'direct', clicks: 0 };

  if (notFound) {
    return (
      <>
        <Navbar />
        <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
          <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Stats</p>
            <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">Short link not found</h1>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              This shortened URL does not exist or may have been removed.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Back to home
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={fetchStats}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-blue-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Short link</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">/{code}</h1>
          </div>
        </header>

        {loading && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800" />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {stats.totalClicks === 0 && (
              <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                No clicks yet. Share your link to start tracking.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard title="Total clicks" value={stats.totalClicks} accent={true} />
              <MetricCard title="Today (UTC)" value={todayClicks} />
              <MetricCard title="Top source" value={topReferrer.referrer || 'direct'} />
            </div>

            {stats.totalClicks > 0 && (
              <div className="mt-6 space-y-6">
                <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Clicks per day</h2>
                  <ClicksChart data={chartData} />
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Referrers</h2>
                  <ReferrersTable referrers={stats.referrers || []} />
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
