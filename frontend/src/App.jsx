import { useState } from "react";
import Navbar from "./components/Navbar";
import ShortenPage   from "./pages/ShortenPage";
import ManagePage    from "./pages/ManagePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import "./styles/global.css";

export default function App() {
  const [tab, setTab]           = useState("shorten");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleShortened = () => setRefreshKey((k) => k + 1);

  return (
    <div className="app">
      <Navbar activeTab={tab} onTabChange={setTab} />

      {tab === "shorten"   && <ShortenPage onShortened={handleShortened} />}
      {tab === "manage"    && <ManagePage    key={refreshKey} />}
      {tab === "analytics" && <AnalyticsPage key={refreshKey} />}
    </div>
  );
}
