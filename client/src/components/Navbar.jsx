function Navbar({ user, setUser }) {
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0.6rem 1.5rem", borderBottom: "1px solid #e5e7eb",
      background: "#fff", position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <a href="/" style={{ fontWeight: "700", textDecoration: "none", color: "#111", fontSize: "1.1rem" }}>Progressly</a>
        <a href="/" style={{ textDecoration: "none", color: "#555", fontSize: "0.9rem" }}>Feed</a>
        <a href="/dashboard" style={{ textDecoration: "none", color: "#555", fontSize: "0.9rem" }}>My Metrics</a>
        <a href="/search" style={{ textDecoration: "none", color: "#555", fontSize: "0.9rem" }}>Search</a>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <a href={`/profile/${user._id}`} style={{ textDecoration: "none", color: "#4f46e5", fontSize: "0.9rem" }}>{user.name}</a>
        <button onClick={logout} style={{ padding: "0.3rem 0.8rem", cursor: "pointer", fontSize: "0.85rem" }}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
