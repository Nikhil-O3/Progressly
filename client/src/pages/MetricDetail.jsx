import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend,
} from "chart.js";
import Heatmap from "../components/Heatmap.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function MetricDetail() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [metric, setMetric] = useState(null);
  const [form, setForm] = useState({ value: "", date: new Date().toISOString().split("T")[0], note: "" });
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("chart"); // "chart" | "heatmap" | "history"

  // Metric edit state
  const [isEditingMetric, setIsEditingMetric] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", unit: "", type: "number", color: "#4f46e5", isPublic: true });
  const [metricMsg, setMetricMsg] = useState("");

  // Entry edit state
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editEntryData, setEditEntryData] = useState({ value: "", note: "" });

  useEffect(() => {
    loadStats();
  }, [id]);

  const loadStats = () => {
    fetch(`/api/metrics/${id}/stats`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.metric) {
          setMetric(data.metric);
          setEditForm({
            name: data.metric.name,
            unit: data.metric.unit,
            type: data.metric.type || "number",
            color: data.metric.color,
            isPublic: data.metric.isPublic !== false,
          });
          // Set default form value for boolean
          if (data.metric.type === "boolean") {
            setForm((f) => ({ ...f, value: "1" }));
          }
        }
        setStats(data);
      });
  };

  const handleUpdateMetric = async (e) => {
    e.preventDefault();
    setMetricMsg("");
    const res = await fetch(`/api/metrics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setMetric(updated);
      setIsEditingMetric(false);
      setMetricMsg("Metric updated!");
      loadStats();
    } else {
      setMetricMsg("Failed to update metric");
    }
  };

  const logEntry = async (e) => {
    e.preventDefault();
    setMsg("");
    const val = metric?.type === "boolean" ? 1 : Number(form.value);
    const res = await fetch(`/api/metrics/${id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, value: val }),
    });
    if (res.ok) {
      setMsg("✓ Logged!");
      setForm({ ...form, value: metric?.type === "boolean" ? "1" : "", note: "" });
      loadStats();
    } else {
      const d = await res.json();
      setMsg(d.error || "Failed");
    }
  };

  const handleSaveEntry = async (entryId) => {
    const res = await fetch(`/api/metrics/${id}/entries/${entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        value: Number(editEntryData.value),
        note: editEntryData.note,
      }),
    });
    if (res.ok) {
      setEditingEntryId(null);
      loadStats();
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/metrics/${id}/entries/${entryId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      loadStats();
    }
  };

  if (!stats || !metric) return <div style={{ padding: "2rem" }}>Loading...</div>;

  const chartData = {
    labels: stats.entries.map((e) => e.date),
    datasets: [{
      label: `${metric.name} (${metric.unit})`,
      data: stats.entries.map((e) => e.value),
      borderColor: metric.color,
      backgroundColor: metric.color + "22",
      tension: 0.3,
      fill: true,
      pointRadius: 3,
    }],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/dashboard" style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>← My Metrics</a>
        <button
          onClick={() => setIsEditingMetric(!isEditingMetric)}
          style={{ padding: "0.3rem 0.8rem", fontSize: "0.82rem", cursor: "pointer", border: "1px solid #d1d5db", borderRadius: "4px", background: "#f9fafb" }}
        >
          {isEditingMetric ? "Cancel Edit" : "⚙ Edit Metric"}
        </button>
      </div>

      {/* Inline Metric Editor */}
      {isEditingMetric && (
        <form onSubmit={handleUpdateMetric} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.2rem", margin: "1rem 0", background: "#f9fafb" }}>
          <h4 style={{ margin: "0 0 0.8rem" }}>Update Metric Settings</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required
                style={{ width: "100%", padding: "0.4rem", marginTop: "0.2rem", border: "1px solid #ddd", borderRadius: "4px" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Unit</label>
              <input value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} required
                style={{ width: "100%", padding: "0.4rem", marginTop: "0.2rem", border: "1px solid #ddd", borderRadius: "4px" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Data Type</label>
              <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                style={{ width: "100%", padding: "0.4rem", marginTop: "0.2rem", border: "1px solid #ddd", borderRadius: "4px", background: "#fff" }}>
                <option value="number">Number (Decimal)</option>
                <option value="count">Count (Integer)</option>
                <option value="boolean">Habit (Yes / No)</option>
                <option value="duration">Duration (Minutes)</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1.2rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Color</label>
              <input type="color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} style={{ height: "30px", width: "40px" }} />
              <label style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <input type="checkbox" checked={editForm.isPublic} onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })} />
                Public
              </label>
            </div>
          </div>
          {metricMsg && <p style={{ color: "green", fontSize: "0.85rem", margin: "0.3rem 0" }}>{metricMsg}</p>}
          <button type="submit" style={{ padding: "0.4rem 1rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
            Save Changes
          </button>
        </form>
      )}

      <h2 style={{ marginTop: "0.5rem", marginBottom: "0.25rem" }}>
        <span style={{ borderLeft: `4px solid ${metric.color}`, paddingLeft: "0.5rem" }}>{metric.name}</span>
      </h2>
      <p style={{ color: "#888", margin: "0 0 1.5rem 0.6rem", fontSize: "0.9rem" }}>
        Unit: <strong>{metric.unit}</strong> · Type: <span style={{ textTransform: "capitalize", background: "#f3f4f6", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>{metric.type || "number"}</span>
      </p>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "🔥 Day Streak", value: stats.streak },
          { label: metric.type === "boolean" ? "Completed Days" : `Total ${metric.unit}`, value: stats.total },
          { label: metric.type === "boolean" ? "Total Logs" : `Avg / day`, value: metric.type === "boolean" ? stats.entries.length : stats.avg },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.75rem 1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: "700", color: metric.color }}>{s.value}</div>
            <div style={{ color: "#888", fontSize: "0.8rem", marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log entry form adapted to type */}
      <form onSubmit={logEntry} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.2rem", marginBottom: "1.5rem", background: "#fafafa" }}>
        <h4 style={{ margin: "0 0 0.75rem" }}>Log Entry</h4>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          
          {metric.type === "boolean" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.5rem" }}>
              <input
                type="checkbox"
                id="doneCheckbox"
                checked={form.value === "1" || form.value === 1}
                onChange={(e) => setForm({ ...form, value: e.target.checked ? "1" : "0" })}
                style={{ width: "18px", height: "18px" }}
              />
              <label htmlFor="doneCheckbox" style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                Completed today ({metric.unit})
              </label>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: "0.8rem", color: "#555" }}>
                Value ({metric.unit}) {metric.type === "count" && "· integer"}
              </label><br />
              <input
                type="number"
                step={metric.type === "count" ? "1" : "any"}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
                style={{ padding: "0.4rem", width: "100px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
              {/* Quick increment buttons */}
              {metric.type === "count" && (
                <div style={{ display: "flex", gap: "0.2rem", marginTop: "0.3rem" }}>
                  {[1, 5, 10].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setForm({ ...form, value: String((Number(form.value) || 0) + n) })}
                      style={{ fontSize: "0.7rem", padding: "0.1rem 0.3rem", border: "1px solid #ccc", borderRadius: "3px", cursor: "pointer", background: "#fff" }}
                    >+{n}</button>
                  ))}
                </div>
              )}
              {metric.type === "duration" && (
                <div style={{ display: "flex", gap: "0.2rem", marginTop: "0.3rem" }}>
                  {[15, 30, 60].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setForm({ ...form, value: String((Number(form.value) || 0) + n) })}
                      style={{ fontSize: "0.7rem", padding: "0.1rem 0.3rem", border: "1px solid #ccc", borderRadius: "3px", cursor: "pointer", background: "#fff" }}
                    >+{n}m</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label style={{ fontSize: "0.8rem", color: "#555" }}>Date</label><br />
            <input type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }} />
          </div>

          <div style={{ flex: 1, minWidth: "120px" }}>
            <label style={{ fontSize: "0.8rem", color: "#555" }}>Note (optional)</label><br />
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Day reflection, achievements"
              style={{ padding: "0.4rem", width: "100%", border: "1px solid #ddd", borderRadius: "4px" }} />
          </div>

          <button type="submit" style={{ padding: "0.45rem 1.2rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
            Log
          </button>
        </div>
        {msg && <p style={{ color: msg.startsWith("✓") ? "green" : "red", margin: "0.5rem 0 0", fontSize: "0.85rem" }}>{msg}</p>}
      </form>

      {stats.entries.length === 0 ? (
        <p style={{ color: "#aaa", textAlign: "center", padding: "2rem" }}>No entries yet. Log your first one above!</p>
      ) : (
        <>
          {/* Tab switcher */}
          <div style={{ display: "flex", gap: "0", marginBottom: "1rem", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", width: "fit-content" }}>
            {["chart", "heatmap", "history"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "0.4rem 0.9rem", cursor: "pointer", border: "none",
                background: tab === t ? "#4f46e5" : "#fff", color: tab === t ? "#fff" : "#555",
                fontSize: "0.85rem", textTransform: "capitalize", fontWeight: tab === t ? "600" : "400",
              }}>{t}</button>
            ))}
          </div>

          {tab === "chart" && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem" }}>
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          )}

          {tab === "heatmap" && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.25rem", overflowX: "auto" }}>
              <p style={{ color: "#888", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>Last 52 weeks of activity</p>
              <Heatmap entries={stats.entries} color={metric.color} unit={metric.unit} />
            </div>
          )}

          {tab === "history" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Value</th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Note</th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.entries].reverse().map((e) => (
                  <tr key={e._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.5rem" }}>{e.date}</td>
                    <td style={{ padding: "0.5rem", fontWeight: "600" }}>
                      {editingEntryId === e._id ? (
                        <input
                          type="number"
                          value={editEntryData.value}
                          onChange={(ev) => setEditEntryData({ ...editEntryData, value: ev.target.value })}
                          style={{ width: "70px", padding: "0.2rem" }}
                        />
                      ) : (
                        <>
                          {metric.type === "boolean" ? (e.value > 0 ? "✓ Done" : "✗ Not Done") : e.value}{" "}
                          <span style={{ color: "#888", fontWeight: "400", fontSize: "0.8rem" }}>{metric.unit}</span>
                        </>
                      )}
                    </td>
                    <td style={{ padding: "0.5rem", color: "#888" }}>
                      {editingEntryId === e._id ? (
                        <input
                          value={editEntryData.note}
                          onChange={(ev) => setEditEntryData({ ...editEntryData, note: ev.target.value })}
                          style={{ width: "90%", padding: "0.2rem" }}
                        />
                      ) : (
                        e.note || "—"
                      )}
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right" }}>
                      {editingEntryId === e._id ? (
                        <div style={{ display: "flex", gap: "0.3rem", justifyContent: "flex-end" }}>
                          <button onClick={() => handleSaveEntry(e._id)} style={{ padding: "0.2rem 0.5rem", cursor: "pointer", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "3px" }}>Save</button>
                          <button onClick={() => setEditingEntryId(null)} style={{ padding: "0.2rem 0.5rem", cursor: "pointer", border: "1px solid #ddd", borderRadius: "3px" }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.3rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => { setEditingEntryId(e._id); setEditEntryData({ value: e.value, note: e.note || "" }); }}
                            style={{ padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.78rem", border: "1px solid #ddd", borderRadius: "3px", background: "#fff" }}>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(e._id)}
                            style={{ padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.78rem", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "3px", background: "#fff" }}>
                            Del
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default MetricDetail;
