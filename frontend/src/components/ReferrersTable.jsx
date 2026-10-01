export default function ReferrersTable({ referrers = [] }) {
  const rows = [...referrers].sort((a, b) => Number(b.clicks) - Number(a.clicks));

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        No referrer data yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.referrer || 'direct'}-${row.clicks}`} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{row.referrer || 'direct'}</td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
