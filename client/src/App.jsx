import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MetricDetail from "./pages/MetricDetail.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";
import Search from "./pages/Search.jsx";
import Feed from "./pages/Feed.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me/profile", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <BrowserRouter>
      {user && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Feed user={user} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/metric/:id" element={user ? <MetricDetail /> : <Navigate to="/login" />} />
        <Route path="/search" element={user ? <Search currentUser={user} /> : <Navigate to="/login" />} />
        <Route path="/profile/:userId" element={<PublicProfile currentUser={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
