import { useState } from "react";

function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });
    if (res.ok) {
      const profile = await fetch("/api/me/profile", { credentials: "include" });
      const user = await profile.json();
      setUser(user);
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label><br />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label><br />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ width: "100%", padding: "0.6rem", cursor: "pointer" }}>Login</button>
      </form>
      <p style={{ marginTop: "1rem" }}>No account? <a href="/register">Register</a></p>
    </div>
  );
}

export default Login;
