import { NAV_TABS } from "../constants/config";

export default function Navbar({ activeTab, onTabChange }) {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-dot" /> Snippr
      </div>
      <nav className="nav-tabs">
        {NAV_TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
