import { useState } from "react";

function Register({ setUser }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });
    if (res.status === 201) {
      setMsg("Registered! Logging you in...");
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
        credentials: "include",
      });
      if (loginRes.ok) {
        const profile = await fetch("/api/me/profile", { credentials: "include" });
        const user = await profile.json();
        setUser(user);
      }
    } else {
      const data = await res.json();
      setError(data.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Full Name</label><br />
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label><br />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label><br />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }} />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {msg && <p style={{ color: "green" }}>{msg}</p>}
        <button type="submit" style={{ width: "100%", padding: "0.6rem", cursor: "pointer" }}>Register</button>
      </form>
      <p style={{ marginTop: "1rem" }}>Have an account? <a href="/login">Login</a></p>
    </div>
  );
}

export default Register;
