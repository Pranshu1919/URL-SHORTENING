import { useState } from "react";
import { useUrls } from "../hooks/useUrls";
import UrlCard from "../components/UrlCard";
import Toast from "../components/Toast";
import { getClicks } from "../constants/config";

export default function ManagePage() {
  const { urls, loading, error, reload, remove } = useUrls();
  const [search, setSearch] = useState("");
  const [toast, setToast]   = useState(null);

  const handleDelete = async (url) => {
    try {
      await remove(url);
      setToast("URL deleted successfully");
    } catch {
      setToast("Delete failed. Check backend.");
    }
  };

  const filtered = urls.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.originalUrl || u.longUrl || "").toLowerCase().includes(q) ||
      (u.shortCode || u.shortId || u.code || "").toLowerCase().includes(q)
    );
  });

  const maxClicks = Math.max(...urls.map(getClicks), 1);

  return (
    <div className="main-content">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="section-header">
        <div className="section-title">Manage URLs</div>
        <button className="btn btn-light btn-sm" onClick={reload}>
          {loading ? <span className="spin">⟳</span> : "↺"} Refresh
        </button>
      </div>

      <input
        className="search-bar"
        placeholder="Search by original URL or short code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && (
        <div className="error-bar" style={{ marginBottom: "1rem" }}>{error}</div>
      )}

      {loading && !urls.length ? (
        <div className="empty-state">
          <div className="empty-icon"><span className="spin">⟳</span></div>
          <div className="empty-title">Loading URLs…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <div className="empty-title">
            {search ? "No results found" : "No URLs yet"}
          </div>
          <div className="empty-sub">
            {search
              ? "Try a different search term"
              : "Shorten your first URL to see it here"}
          </div>
        </div>
      ) : (
        <div className="url-list">
          {filtered.map((url, i) => (
            <UrlCard
              key={url._id || url.shortCode || i}
              url={url}
              onDelete={handleDelete}
              maxClicks={maxClicks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
