export function formatShortDate(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(`${dateString}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

export function fillMissingDates(clicksPerDay = [], endDate = new Date()) {
  if (!clicksPerDay.length) {
    return [];
  }

  const latestDate = new Date(`${endDate.toISOString().slice(0, 10)}T00:00:00Z`);
  const earliestDate = new Date(`${clicksPerDay[0].date}T00:00:00Z`);
  const clicksMap = new Map(
    clicksPerDay.map((item) => [item.date, Number(item.clicks) || 0])
  );

  const chartData = [];

  for (let current = new Date(earliestDate); current <= latestDate; current.setUTCDate(current.getUTCDate() + 1)) {
    const dateKey = current.toISOString().slice(0, 10);
    chartData.push({
      date: dateKey,
      clicks: clicksMap.get(dateKey) || 0,
    });
  }

  return chartData;
}

export function getTodayUtcClicks(clicksPerDay = []) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const match = clicksPerDay.find((entry) => entry.date === todayKey);
  return match ? Number(match.clicks) || 0 : 0;
}

export function getTopReferrer(referrers = []) {
  if (!referrers.length) {
    return { referrer: 'direct', clicks: 0 };
  }

  const sorted = [...referrers].sort((a, b) => Number(b.clicks) - Number(a.clicks));
  const top = sorted[0];

  return {
    referrer: top?.referrer || 'direct',
    clicks: Number(top?.clicks) || 0,
  };
}

export function truncateUrl(value, maxLength = 42) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
