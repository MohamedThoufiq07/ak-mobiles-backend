// Minimal in-memory TTL cache — no external dependency (Redis) needed.
// Good for small, frequently-read, rarely-changed data like featured/top products.

const store = new Map(); // key -> { value, expires }

const get = (key) => {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
};

// ttlMs defaults to 5 minutes
const set = (key, value, ttlMs = 5 * 60 * 1000) => {
  store.set(key, { value, expires: Date.now() + ttlMs });
};

// Clear everything, or only keys starting with a given prefix
const clear = (prefix) => {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

module.exports = { get, set, clear };
