import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile(token)
      .then(({ data }) => setProfile(data))
      .catch(() => { logout(); navigate("/login"); });
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Dashboard</h2>
        {profile ? (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Member since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
        <button style={styles.button} onClick={handleLogout}>Logout</button>
        <Link to="/tasks"><button style={{ ...styles.button, background: "#4f46e5" }}>Manage Tasks →</button></Link>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  card: { padding: 32, border: "1px solid #ddd", borderRadius: 8, minWidth: 300, display: "flex", flexDirection: "column", gap: 12 },
  button: { padding: "10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 },
};
