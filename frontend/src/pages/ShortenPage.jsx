import { useState } from "react";
import { shortenUrl } from "../api/urlApi";
import { API_BASE } from "../constants/config";

export default function ShortenPage({ onShortened }) {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [expiryInMinutes, setExpiryInMinutes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!longUrl.trim()) return;
    console.log("Sending:", { url: longUrl, customSlug, expiryInMinutes });
    setLoading(true);
    setError(null);
    setResult(null);
    setRateLimited(false);

    try {
      const data = await shortenUrl({ url: longUrl, customSlug, expiryInMinutes });
      setResult(data);
      onShortened?.();
      setLongUrl("");
      setCustomSlug("");
      setExpiryInMinutes("");
    } catch (err) {
      if (err.rateLimited) setRateLimited(true);
      else setError(err.message || "Cannot connect to backend. Is the server running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  const shortUrl = result?.shortUrl || (result?.shortCode ? `${API_BASE}/${result.shortCode}` : "");

  const copy = async () => {
    try { await navigator.clipboard.writeText(shortUrl); } catch { }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-tag">Redis · MongoDB · Base62 · Rate Limiting</div>
        <h1>
          Shorten any URL<br />
          <span>in seconds</span>
        </h1>
        <p>
          Collision-safe Base62 encoding, Redis caching, and real-time click
          analytics — all in one platform.
        </p>

        {/* ── Shorten form ── */}
        <div className="shorten-box">
          <div className="input-row">
            <input
              className="url-input"
              type="url"
              placeholder="Paste your long URL here..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleShorten()}
            />
            <button
              className="btn btn-primary"
              onClick={handleShorten}
              disabled={loading || !longUrl.trim()}
            >
              {loading && <span className="spin">⟳</span>}
              {loading ? "Shortening..." : "Shorten →"}
            </button>
          </div>

          <button
            className="advanced-toggle"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "▲" : "▼"} Advanced options
          </button>

          {showAdvanced && (
            <div className="advanced-panel">
              <input
                className="small-input"
                placeholder="Custom slug (optional)"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
              />
              <input
                className="small-input"
                type="number"
                placeholder="Expire in minutes (optional)"
                value={expiryInMinutes}
                onChange={(e) => setExpiryInMinutes(e.target.value)}
                min="1"
              />
            </div>
          )}

          {result && (
            <div className="result-card" style={{ marginTop: "1rem" }}>
              <div>
                <div className="result-label">Your short URL</div>
                <div className="result-url">{shortUrl}</div>
              </div>
              <button className="btn btn-light btn-sm" onClick={copy}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          )}

          {error && (
            <div className="error-bar" style={{ marginTop: "1rem" }}>⚠ {error}</div>
          )}

          {rateLimited && (
            <div className="rate-limit-bar" style={{ marginTop: "1rem" }}>
              <span>🚦</span>
              <span>
                Rate limit reached. Sliding-window protection is active. Try
                again in a moment.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="main-content">
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              marginBottom: "1.1rem",
            }}
          >
            How it works
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  padding: "1rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 3 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: "🔗", title: "Paste URL", desc: "Submit any valid URL to the shortener" },
  { icon: "⚡", title: "Base62 Encoding", desc: "Collision-safe short code generated with nanoid" },
  { icon: "💾", title: "Redis Cache", desc: "Lookups served from cache for ultra-low latency" },
  { icon: "📊", title: "Click Analytics", desc: "Every redirect tracked and stored in real-time" },
  { icon: "🚦", title: "Rate Limiting", desc: "Sliding-window algorithm prevents abuse" },
];
