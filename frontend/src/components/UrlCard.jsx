import { useState } from "react";
import ClickBar from "./ClickBar";
import { getShortUrl, getClicks } from "../constants/config";

export default function UrlCard({ url, onDelete, maxClicks }) {
  const [copied, setCopied]           = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const shortUrl = getShortUrl(url);
  const clicks   = getClicks(url);

  const copy = async () => {
    try { await navigator.clipboard.writeText(shortUrl); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const expiresAt = url.expiresAt || url.expiry;
  const isExpired = expiresAt && new Date(expiresAt) < new Date();
  const customSlug = url.customSlug || url.alias;

  return (
    <div>
      <div className="url-card">
        {/* ── Left: URL info ── */}
        <div style={{ minWidth: 0 }}>
          <a className="short-link" href={shortUrl} target="_blank" rel="noreferrer">
            {shortUrl.replace("http://", "")} ↗
          </a>
          <div className="original-url" title={url.originalUrl || url.longUrl}>
            {url.originalUrl || url.longUrl}
          </div>
          <div className="url-meta">
            <span className="badge badge-blue">🖱 {clicks} click{clicks !== 1 ? "s" : ""}</span>
            {customSlug  && <span className="badge badge-teal">Custom slug</span>}
            {expiresAt   && (
              <span className={`badge ${isExpired ? "badge-amber" : "badge-gray"}`}>
                {isExpired ? "⚠ Expired" : `Exp: ${new Date(expiresAt).toLocaleDateString()}`}
              </span>
            )}
            {url.createdAt && (
              <span className="badge badge-gray">
                {new Date(url.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="card-actions">
          <button className="btn btn-light btn-sm" onClick={copy}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            className="btn btn-light btn-sm"
            onClick={() => setShowAnalytics((v) => !v)}
            title="Toggle analytics"
          >
            {showAnalytics ? "▲" : "📊"}
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(url)}>
            ✕
          </button>
        </div>
      </div>

      {/* ── Inline analytics panel ── */}
      {showAnalytics && (
        <div className="analytics-panel">
          <div className="analytics-inner">
            <div className="analytics-title">Click Analytics</div>
            <div className="stat-row">
              <div className="stat-box">
                <div className="stat-label">Total Clicks</div>
                <div className="stat-value accent">{clicks}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Short Code</div>
                <div className="stat-value" style={{ fontSize: "1rem" }}>
                  {url.shortCode || url.shortId || url.code || "—"}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Created</div>
                <div className="stat-value" style={{ fontSize: "0.88rem" }}>
                  {url.createdAt ? new Date(url.createdAt).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
            <ClickBar clicks={clicks} max={maxClicks} />
          </div>
        </div>
      )}
    </div>
  );
}
