export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000";

export const NAV_TABS = [
  { id: "shorten", label: "Shorten" },
  { id: "manage", label: "Manage" },
  { id: "analytics", label: "Analytics" },
];

export const getShortUrl = (url) => {
  if (url?.shortUrl) return url.shortUrl;
  const code = url?.shortCode || url?.shortId || url?.code;
  return code ? `${API_BASE}/${code}` : "";
};

export const getClicks = (url) => url?.clicks ?? url?.clickCount ?? 0;
