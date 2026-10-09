// GitHub-style contribution heatmap
// Shows last 52 weeks of activity as a grid of colored squares

function Heatmap({ entries, color = "#4f46e5", unit = "" }) {
  // build a map of date -> value
  const valueMap = {};
  entries.forEach((e) => {
    valueMap[e.date] = (valueMap[e.date] || 0) + e.value;
  });

  // get max for relative intensity
  const values = Object.values(valueMap);
  const max = values.length ? Math.max(...values) : 1;

  // build 52 weeks * 7 days = 364 days ending today
  const today = new Date();
  const days = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, value: valueMap[dateStr] || 0 });
  }

  // chunk into weeks (columns)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getOpacity = (val) => {
    if (val === 0) return 0;
    return 0.15 + (val / max) * 0.85;
  };

  const months = [];
  weeks.forEach((week, wi) => {
    const month = new Date(week[0].date).toLocaleString("default", { month: "short" });
    if (wi === 0 || months[months.length - 1].label !== month) {
      months.push({ label: month, col: wi });
    }
  });

  return (
    <div>
      {/* month labels */}
      <div style={{ display: "flex", marginLeft: "2px", marginBottom: "2px", position: "relative", height: "16px" }}>
        {months.map((m, i) => (
          <span key={i} style={{
            position: "absolute", left: `${m.col * 13}px`,
            fontSize: "10px", color: "#888",
          }}>{m.label}</span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "2px" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.value} ${unit}`}
                style={{
                  width: "11px", height: "11px", borderRadius: "2px",
                  backgroundColor: day.value === 0 ? "#eee" : color,
                  opacity: day.value === 0 ? 1 : getOpacity(day.value),
                  cursor: "default",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
        <span style={{ fontSize: "10px", color: "#888" }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((o, i) => (
          <div key={i} style={{
            width: "10px", height: "10px", borderRadius: "2px",
            backgroundColor: o === 0 ? "#eee" : color,
            opacity: o === 0 ? 1 : 0.15 + o * 0.85,
          }} />
        ))}
        <span style={{ fontSize: "10px", color: "#888" }}>More</span>
      </div>
    </div>
  );
}

export default Heatmap;
