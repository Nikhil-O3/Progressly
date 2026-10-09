import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Feed({ user }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/users/feed", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setFeed(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading feed...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ margin: 0 }}>Feed</h2>
        <a href="/search" style={{ fontSize: "0.85rem", color: "#4f46e5" }}>Find people to follow →</a>
      </div>

      {feed.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed #ddd", borderRadius: "8px", color: "#888" }}>
          <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Your feed is empty.</p>
          <p style={{ fontSize: "0.85rem" }}>Follow people from the <a href="/search">Search</a> page to see their progress here.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {feed.map(({ entry, metric, user: entryUser }) => (
          <div key={entry._id} style={{
            border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem",
            borderLeft: `4px solid ${metric.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  onClick={() => navigate(`/profile/${entryUser._id}`)}
                  style={{ fontWeight: "700", cursor: "pointer", color: "#111" }}
                >{entryUser.name}</span>
                {metric.type === "boolean" ? (
                  <>
                    <span style={{ color: "#888", fontSize: "0.85rem" }}> completed </span>
                    <span style={{ fontWeight: "600", color: metric.color }}>{metric.name}</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: "#888", fontSize: "0.85rem" }}> logged </span>
                    <span style={{ fontWeight: "600", color: metric.color }}>{entry.value} {metric.unit}</span>
                    <span style={{ color: "#888", fontSize: "0.85rem" }}> in </span>
                    <span style={{ fontWeight: "600" }}>{metric.name}</span>
                  </>
                )}
              </div>
              <span style={{ color: "#aaa", fontSize: "0.78rem", whiteSpace: "nowrap", marginLeft: "0.5rem" }}>{entry.date}</span>
            </div>
            {entry.note && (
              <p style={{ margin: "0.4rem 0 0", color: "#555", fontSize: "0.85rem", fontStyle: "italic" }}>"{entry.note}"</p>
            )}
          </div>
        ))}
      </div>

      {/* My metrics shortcut */}
      <div style={{ marginTop: "2rem", borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem" }}>
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem", color: "#555" }}>Your quick links</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <a href="/dashboard" style={{ padding: "0.4rem 0.9rem", border: "1px solid #4f46e5", borderRadius: "6px", color: "#4f46e5", textDecoration: "none", fontSize: "0.85rem" }}>My Metrics</a>
          <a href={`/profile/${user._id}`} style={{ padding: "0.4rem 0.9rem", border: "1px solid #ddd", borderRadius: "6px", color: "#555", textDecoration: "none", fontSize: "0.85rem" }}>My Profile</a>
        </div>
      </div>
    </div>
  );
}

export default Feed;
