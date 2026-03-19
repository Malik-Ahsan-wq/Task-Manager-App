import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import EyeIcon from "../components/EyeIcon";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input style={styles.input} type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <div style={styles.pwdWrap}>
          <input style={{ ...styles.input, paddingRight: 40, margin: 0 }}
            type={showPwd ? "text" : "password"} placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="button" style={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
            <EyeIcon visible={showPwd} />
          </button>
        </div>
        <button style={styles.button} type="submit">Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  form: { display: "flex", flexDirection: "column", gap: 12, width: 320, padding: 32, border: "1px solid #ddd", borderRadius: 8 },
  input: { padding: "10px 12px", fontSize: 14, border: "1px solid #ccc", borderRadius: 4, width: "100%", boxSizing: "border-box" },
  pwdWrap: { position: "relative", display: "flex", alignItems: "center" },
  eyeBtn: { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#6b7280" },
  button: { padding: "10px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 },
  error: { color: "red", fontSize: 13 },
};
