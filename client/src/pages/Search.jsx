import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search({ currentUser }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const doSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { credentials: "include" });
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setSearched(true);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Find People</h2>
      <form onSubmit={doSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
          style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1.25rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Search
        </button>
      </form>

      {searched && results.length === 0 && (
        <p style={{ color: "#888", textAlign: "center" }}>No users found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {results.map((u) => (
          <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.75rem 1rem" }}>
            <div>
              <strong>{u.name}</strong>
              <span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "0.4rem" }}>{u.email}</span>
            </div>
            <button
              onClick={() => navigate(`/profile/${u._id}`)}
              style={{ padding: "0.3rem 0.9rem", cursor: "pointer", borderRadius: "4px", border: "1px solid #4f46e5", color: "#4f46e5", background: "#fff" }}>
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
