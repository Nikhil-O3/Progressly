import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard({ user }) {
  const [metrics, setMetrics] = useState([]);
  const [form, setForm] = useState({ name: "", unit: "", type: "number", color: "#4f46e5", isPublic: true });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/metrics", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMetrics(data); });
  }, []);

  const templates = [
    { label: "⏱️ Study Time", name: "Study Hours", unit: "hours", type: "number", color: "#3b82f6" },
    { label: "💻 LeetCode", name: "LeetCode Daily", unit: "problems", type: "count", color: "#10b981" },
    { label: "🏃 Running", name: "Running Distance", unit: "km", type: "number", color: "#f59e0b" },
    { label: "🧘 Meditation", name: "Daily Meditation", unit: "done", type: "boolean", color: "#8b5cf6" },
    { label: "🏋️ Workout", name: "Pushups / Reps", unit: "reps", type: "count", color: "#ef4444" },
    { label: "⏳ Focus", name: "Deep Work Focus", unit: "minutes", type: "duration", color: "#4f46e5" },
  ];

  const applyTemplate = (tpl) => {
    setForm({
      name: tpl.name,
      unit: tpl.unit,
      type: tpl.type,
      color: tpl.color,
      isPublic: true,
    });
  };

  const createMetric = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to create"); return; }
    setMetrics([...metrics, data]);
    setForm({ name: "", unit: "", type: "number", color: "#4f46e5", isPublic: true });
    setShowForm(false);
  };

  const deleteMetric = async (id) => {
    if (!confirm("Delete this metric and all its entries?")) return;
    await fetch(`/api/metrics/${id}`, { method: "DELETE", credentials: "include" });
    setMetrics(metrics.filter((m) => m._id !== id));
  };

  const typeLabels = {
    number: "Decimal (e.g. 2.5 hrs)",
    count: "Count (e.g. 5 problems)",
    boolean: "Habit (Yes / No)",
    duration: "Duration (Minutes)",
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>My Metrics</h2>
          <p style={{ margin: "0.2rem 0 0", color: "#888", fontSize: "0.85rem" }}>Track goals, custom units & daily habits</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(""); }}
          style={{ padding: "0.5rem 1rem", cursor: "pointer", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600" }}>
          {showForm ? "Cancel" : "+ New Metric"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createMetric} style={{ border: "1px solid #e5e7eb", padding: "1.25rem", borderRadius: "8px", marginBottom: "1.5rem", background: "#fafafa" }}>
          <h3 style={{ marginTop: 0, fontSize: "1.05rem" }}>Create Custom Metric</h3>
          
          {/* Quick presets */}
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.78rem", color: "#666", fontWeight: "600" }}>QUICK TEMPLATES:</span>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
              {templates.map((tpl) => (
                <button
                  type="button"
                  key={tpl.label}
                  onClick={() => applyTemplate(tpl)}
                  style={{
                    fontSize: "0.78rem", padding: "0.25rem 0.6rem", border: "1px solid #ddd",
                    borderRadius: "16px", cursor: "pointer", background: "#fff", color: "#333",
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Metric Name</label><br />
            <input
              placeholder="e.g. Study Hours, LeetCode Problems, Morning Run"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Data Type</label><br />
              <select
                value={form.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  let defaultUnit = form.unit;
                  if (newType === "boolean") defaultUnit = "done";
                  if (newType === "duration") defaultUnit = "minutes";
                  setForm({ ...form, type: newType, unit: defaultUnit });
                }}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem", border: "1px solid #ddd", borderRadius: "4px", background: "#fff" }}
              >
                <option value="number">Number (Decimal / Float)</option>
                <option value="count">Count (Integer / Reps)</option>
                <option value="boolean">Habit (Yes / No Completed)</option>
                <option value="duration">Duration (Minutes / Time)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Unit Label</label><br />
              <input
                placeholder="e.g. hours, problems, reps, km"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>Chart Color</label><br />
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ marginTop: "0.25rem", height: "36px", width: "60px", cursor: "pointer" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1rem" }}>
              <input type="checkbox" id="pub" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
              <label htmlFor="pub" style={{ fontSize: "0.85rem" }}>Show on public profile & feed</label>
            </div>
          </div>

          {error && <p style={{ color: "red", margin: "0.25rem 0" }}>{error}</p>}
          <button type="submit" style={{ padding: "0.5rem 1.25rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
            Create Metric
          </button>
        </form>
      )}

      {metrics.length === 0 && !showForm && (
        <p style={{ color: "#888", textAlign: "center", marginTop: "3rem" }}>
          No metrics yet. Click "+ New Metric" to start tracking something.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {metrics.map((m) => (
          <div key={m._id} style={{
            border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderLeft: `4px solid ${m.color}`,
          }}>
            <div>
              <strong style={{ fontSize: "1.05rem" }}>{m.name}</strong>
              <span style={{ marginLeft: "0.4rem", color: "#888", fontSize: "0.85rem" }}>· {m.unit}</span>
              <span style={{
                marginLeft: "0.5rem", fontSize: "0.72rem", background: "#f3f4f6",
                color: "#6b7280", padding: "0.1rem 0.4rem", borderRadius: "4px", textTransform: "capitalize"
              }}>
                {m.type || "number"}
              </span>
              {m.isPublic && (
                <span style={{ marginLeft: "0.3rem", fontSize: "0.72rem", color: "#4f46e5", background: "#ede9fe", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>public</span>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => navigate(`/metric/${m._id}`)}
                style={{ padding: "0.3rem 0.8rem", cursor: "pointer", borderRadius: "4px", background: "#f9fafb", border: "1px solid #d1d5db" }}>View</button>
              <button onClick={() => deleteMetric(m._id)}
                style={{ padding: "0.3rem 0.8rem", cursor: "pointer", borderRadius: "4px", color: "#dc2626", borderColor: "#fecaca", background: "#fff" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {metrics.length > 0 && (
        <p style={{ marginTop: "1.5rem", color: "#888", fontSize: "0.85rem" }}>
          Share your profile: <a href={`/profile/${user._id}`}>/profile/{user._id}</a>
        </p>
      )}
    </div>
  );
}

export default Dashboard;
