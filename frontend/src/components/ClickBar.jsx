export default function ClickBar({ clicks, max }) {
  const pct = max > 0 ? Math.min(100, (clicks / max) * 100) : 0;

  return (
    <div className="click-bar-wrap">
      <div className="click-bar-label">
        {clicks} click{clicks !== 1 ? "s" : ""}
      </div>
      <div className="click-bar-track">
        <div className="click-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
