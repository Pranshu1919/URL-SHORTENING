import { useState } from "react";
import { useUrls } from "../hooks/useUrls";
import { fetchUrlStats } from "../api/urlApi";
import { getClicks } from "../constants/config";

export default function AnalyticsPage() {
  const { urls, loading, error, reload } = useUrls();

  const [lookup, setLookup]             = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError]   = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleLookup = async () => {
    const code = lookup.trim().replace(/.*\//, "");
    if (!code) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const data = await fetchUrlStats(code);
      setLookupResult(data);
    } catch (err) {
      setLookupError(err.message || "Could not fetch stats.");
    } finally {
      setLookupLoading(false);
    }
  };

  const totalClicks = urls.reduce((s, u) => s + getClicks(u), 0);
  const avgClicks   = urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : 0;
  const sorted      = [...urls].sort((a, b) => getClicks(b) - getClicks(a));
  const topUrl      = sorted[0];
  const maxClicks   = sorted[0] ? getClicks(sorted[0]) : 1;

  return (
    <div className="main-content">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">Analytics Dashboard</div>
        <button className="btn btn-light btn-sm" onClick={reload}>↺ Refresh</button>
      </div>

      {/* ── Global stats ── */}
      <div className="stats-grid">
        <div className="global-stat">
          <div className="global-stat-label">Total URLs</div>
          <div className="global-stat-value purple">{urls.length}</div>
        </div>
        <div className="global-stat">
          <div className="global-stat-label">Total Clicks</div>
          <div className="global-stat-value teal">{totalClicks}</div>
        </div>
        <div className="global-stat">
          <div className="global-stat-label">Avg Clicks / URL</div>
          <div className="global-stat-value amber">{avgClicks}</div>
        </div>
        <div className="global-stat">
          <div className="global-stat-label">Top Performer</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, marginTop: 4, wordBreak: "break-all" }}>
            {topUrl ? (topUrl.shortCode || topUrl.shortId || topUrl.code || "—") : "—"}
          </div>
        </div>
      </div>

      {/* ── Lookup ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            marginBottom: "0.9rem",
          }}
        >
          Lookup URL Stats
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="search-bar"
            style={{ margin: 0, flex: 1 }}
            placeholder="Enter short code or full short URL…"
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <button
            className="btn btn-primary"
            onClick={handleLookup}
            disabled={lookupLoading || !lookup.trim()}
          >
            {lookupLoading ? <span className="spin">⟳</span> : "Lookup"}
          </button>
        </div>

        {lookupResult && (
          <div
            style={{
              marginTop: "1rem",
              background: "#f8fafc",
              borderRadius: 9,
              padding: "1rem",
              border: "1px solid #e2e8f0",
            }}
          >
            <div className="stat-row">
              <div className="stat-box">
                <div className="stat-label">Clicks</div>
                <div className="stat-value accent">
                  {lookupResult.clicks ?? lookupResult.clickCount ?? 0}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Short Code</div>
                <div className="stat-value" style={{ fontSize: "0.9rem" }}>
                  {lookupResult.shortCode || lookupResult.shortId || lookup}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Created</div>
                <div className="stat-value" style={{ fontSize: "0.82rem" }}>
                  {lookupResult.createdAt
                    ? new Date(lookupResult.createdAt).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 6, wordBreak: "break-all" }}>
              {lookupResult.originalUrl || lookupResult.longUrl}
            </div>
          </div>
        )}

        {lookupError && (
          <div className="error-bar" style={{ marginTop: "0.75rem" }}>
            {lookupError}
          </div>
        )}
      </div>

      {error && (
        <div className="error-bar" style={{ marginBottom: "1rem" }}>{error}</div>
      )}

      {/* ── Leaderboard ── */}
      {loading ? (
        <div className="empty-state">
          <span className="spin" style={{ fontSize: "1.5rem" }}>⟳</span>
        </div>
      ) : sorted.length > 0 ? (
        <div className="top-urls-table">
          <div className="table-header">
            <div>Short URL</div>
            <div>Clicks</div>
            <div>Created</div>
          </div>
          {sorted.map((url, i) => {
            const clicks = getClicks(url);
            const code   = url.shortCode || url.shortId || url.code;
            return (
              <div key={url._id || i} className="table-row">
                <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                  <span className={`rank-badge ${i === 0 ? "gold" : ""}`}>{i + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#6366f1" }}>
                      {code}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 240,
                      }}
                    >
                      {url.originalUrl || url.longUrl}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{clicks}</div>
                  <div className="click-bar-track" style={{ height: 5, width: 60, marginTop: 4 }}>
                    <div
                      className="click-bar-fill"
                      style={{
                        width: `${maxClicks > 0 ? (clicks / maxClicks) * 100 : 0}%`,
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  {url.createdAt ? new Date(url.createdAt).toLocaleDateString() : "—"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No data yet</div>
          <div className="empty-sub">Shorten some URLs to see analytics</div>
        </div>
      )}
    </div>
  );
}
