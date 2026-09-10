const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000";

export async function shortenUrl({ url, customSlug, expiryInMinutes }) {
  const body = { originalUrl: url };
  if (customSlug?.trim()) body.customSlug = customSlug.trim();
  if (expiryInMinutes) body.expiryInMinutes = parseInt(expiryInMinutes, 10);

  const res = await fetch(`${API_BASE}/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    const err = new Error("Rate limit exceeded");
    err.rateLimited = true;
    throw err;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export async function fetchAllUrls() {
  const res = await fetch(`${API_BASE}/urls`);
  if (!res.ok) throw new Error("Failed to fetch URLs");
  return await res.json();
}

export async function fetchUrlStats(shortCode) {
  const res = await fetch(`${API_BASE}/analytics/${shortCode}`);
  if (res.status === 404) throw new Error("Short URL not found");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return await res.json();
}

export async function deleteUrl(shortCode) {
  const res = await fetch(`${API_BASE}/urls/${shortCode}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete URL");
  return await res.json();
}