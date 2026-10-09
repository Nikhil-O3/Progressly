import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from "chart.js";
import Heatmap from "../components/Heatmap.jsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function PublicProfile({ currentUser }) {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [followData, setFollowData] = useState({ following: false, followerCount: 0, followingCount: 0 });
  const [error, setError] = useState("");
  const isOwnProfile = currentUser && currentUser._id === userId;

  useEffect(() => {
    fetch(`/api/profile/${userId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setProfile)
      .catch(() => setError("Profile not found or private."));

    if (currentUser && !isOwnProfile) {
      fetch(`/api/users/${userId}/follow-status`, { credentials: "include" })
        .then((r) => r.json())
        .then(setFollowData);
    }
  }, [userId]);

  const toggleFollow = async () => {
    const method = followData.following ? "DELETE" : "POST";
    const res = await fetch(`/api/users/${userId}/follow`, { method, credentials: "include" });
    const data = await res.json();
    setFollowData((prev) => ({
      ...data,
      followerCount: data.following ? prev.followerCount + 1 : prev.followerCount - 1,
      followingCount: prev.followingCount,
    }));
  };

  if (error) return <div style={{ padding: "2rem", color: "#dc2626" }}>{error}</div>;
  if (!profile) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
      {/* Profile header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.25rem" }}>{profile.user.name}</h2>
          <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>
            {followData.followerCount} followers · {followData.followingCount} following
          </p>
          {profile.fromCache && (
            <span style={{ fontSize: "0.7rem", color: "#888", background: "#f5f5f5", padding: "0.1rem 0.4rem", borderRadius: "4px", marginTop: "0.25rem", display: "inline-block" }}>cached</span>
          )}
        </div>
        {currentUser && !isOwnProfile && (
          <button onClick={toggleFollow} style={{
            padding: "0.4rem 1.2rem", cursor: "pointer", borderRadius: "6px",
            background: followData.following ? "#fff" : "#4f46e5",
            color: followData.following ? "#4f46e5" : "#fff",
            border: "1px solid #4f46e5", fontWeight: "600",
          }}>
            {followData.following ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {profile.metrics.length === 0 && (
        <p style={{ color: "#888" }}>No public metrics shared yet.</p>
      )}

      {profile.metrics.map(({ metric, entries, total }) => {
        const chartData = {
          labels: entries.slice(-14).map((e) => e.date),
          datasets: [{
            label: metric.name,
            data: entries.slice(-14).map((e) => e.value),
            backgroundColor: metric.color + "99",
            borderColor: metric.color,
            borderWidth: 1,
          }],
        };
        return (
          <div key={metric._id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.25rem", borderLeft: `4px solid ${metric.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <strong style={{ fontSize: "1.05rem" }}>{metric.name}</strong>
                <span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "0.4rem" }}>· {metric.unit}</span>
                <span style={{ marginLeft: "0.4rem", fontSize: "0.72rem", background: "#f3f4f6", color: "#6b7280", padding: "0.1rem 0.4rem", borderRadius: "4px", textTransform: "capitalize" }}>
                  {metric.type || "number"}
                </span>
              </div>
              <span style={{ color: "#555", fontSize: "0.85rem" }}>
                {metric.type === "boolean" ? (
                  <>Completed: <strong style={{ color: metric.color }}>{total} days</strong></>
                ) : (
                  <>Total: <strong style={{ color: metric.color }}>{total} {metric.unit}</strong></>
                )}
              </span>
            </div>

            {/* Heatmap */}
            <div style={{ marginBottom: "1rem", overflowX: "auto" }}>
              <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 0.5rem" }}>Activity heatmap</p>
              <Heatmap entries={entries} color={metric.color} unit={metric.unit} />
            </div>

            {/* Bar chart - last 14 days */}
            {entries.length > 0 && (
              <>
                <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 0.5rem" }}>Last 14 entries</p>
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PublicProfile;
