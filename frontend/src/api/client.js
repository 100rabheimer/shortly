const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function toError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.serverMessage = message;
  return error;
}

async function request(path, options, fallbackMessage) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch {
    // Network down ya server unreachable: status 0 use karenge
    throw toError(0, 'Could not reach the server. Try again.');
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // Body JSON nahi hai (jaise HTML error page), isliye generic message use hoga
  }

  if (!response.ok) {
    throw toError(response.status, payload?.message || fallbackMessage);
  }

  return payload;
}

export function shortenUrl(url) {
  return request(
    '/api/shorten',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    },
    'Something went wrong'
  );
}

export function getStats(code) {
  return request(
    `/api/stats/${encodeURIComponent(code)}`,
    undefined,
    'Failed to fetch stats'
  );
}