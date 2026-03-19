import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile } from "../api/auth";
import { getTasks } from "../api/tasks";
import { useAuth } from "../context/AuthContext";

const STATUS_COLOR = { Pending: "#6b7280", "In Progress": "#2563eb", Completed: "#16a34a" };
const PRIORITY_COLOR = { Low: "#16a34a", Medium: "#d97706", High: "#dc2626" };

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile(token)
      .then(({ data }) => setProfile(data))
      .catch(() => { logout(); navigate("/login"); });

    getTasks(token, { limit: 5, page: 1 })
      .then(({ data }) => setRecentTasks(data.tasks))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        {profile ? (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Member since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "4px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Recent Tasks</strong>
          <Link to="/tasks" style={{ fontSize: 13, color: "#4f46e5" }}>View all →</Link>
        </div>

        {recentTasks.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No tasks yet.</p>
        ) : (
          recentTasks.map((task) => (
            <div key={task._id} style={styles.taskRow}>
              <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{task.title}</span>
              <span style={{ ...styles.badge, background: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
              <span style={{ ...styles.badge, background: STATUS_COLOR[task.status] }}>{task.status}</span>
            </div>
          ))
        )}

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "4px 0" }} />

        <Link to="/tasks"><button style={{ ...styles.button, background: "#4f46e5" }}>Manage Tasks →</button></Link>
        <button style={styles.button} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: 16 },
  card: { padding: 32, border: "1px solid #ddd", borderRadius: 8, width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 },
  button: { padding: "10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14, width: "100%" },
  taskRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb" },
  badge: { fontSize: 11, color: "#fff", padding: "2px 8px", borderRadius: 12, fontWeight: 600, whiteSpace: "nowrap" },
};
