import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTasks, createTask, updateTask, completeTask, deleteTask } from "../api/tasks";

const EMPTY = { title: "", description: "", status: "Pending", priority: "Medium", dueDate: "" };
const PRIORITY_COLOR = { Low: "#16a34a", Medium: "#d97706", High: "#dc2626" };
const STATUS_COLOR = { Pending: "#6b7280", "In Progress": "#2563eb", Completed: "#16a34a" };
const LIMIT = 5;

export default function Tasks() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Filters & pagination state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [sortByDue, setSortByDue] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async (params) => {
    try {
      const { data } = await getTasks(token, params);
      setTasks(data.tasks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      logout(); navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    const params = { page, limit: LIMIT };
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    if (filterPriority) params.priority = filterPriority;
    if (sortByDue) params.sortByDue = sortByDue;
    load(params);
  }, [page, search, filterStatus, filterPriority, sortByDue]);

  // Reset to page 1 when any filter changes
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      editId ? await updateTask(token, editId, form) : await createTask(token, form);
      setForm(EMPTY); setEditId(null); setShowForm(false);
      const newPage = editId ? page : 1;
      setPage(newPage);
      load({ page: newPage, limit: LIMIT, search, status: filterStatus, priority: filterPriority, sortByDue });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (task) => {
    setForm({ title: task.title, description: task.description, status: task.status,
      priority: task.priority, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "" });
    setEditId(task._id);
    setShowForm(true);
  };

  const handleComplete = async (id) => {
    await completeTask(token, id);
    load({ page, limit: LIMIT, search, status: filterStatus, priority: filterPriority, sortByDue });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(token, id);
    const newPage = tasks.length === 1 && page > 1 ? page - 1 : page;
    setPage(newPage);
    load({ page: newPage, limit: LIMIT, search, status: filterStatus, priority: filterPriority, sortByDue });
  };

  const handleCancel = () => { setForm(EMPTY); setEditId(null); setShowForm(false); setError(""); };

  return (
    <div style={s.page}>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 1;
          display: block;
          cursor: pointer;
          padding: 2px;
          filter: invert(0.4);
        }
        input[type="date"]::-webkit-date-and-time-value { text-align: left; }
        input[type="date"] { color-scheme: light; }
      `}</style>
      {/* Header */}
      <div style={s.header}>
        <h2 style={{ margin: 0 }}>My Tasks <span style={s.totalBadge}>{total}</span></h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={s.btnPrimary} onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }}>
            + New Task
          </button>
          <button style={s.btnDanger} onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={s.filters}>
        <input style={{ ...s.input, flex: 2 }} placeholder="🔍 Search by title..."
          value={search} onChange={handleFilterChange(setSearch)} />
        <select style={s.input} value={filterStatus} onChange={handleFilterChange(setFilterStatus)}>
          <option value="">All Statuses</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select style={s.input} value={filterPriority} onChange={handleFilterChange(setFilterPriority)}>
          <option value="">All Priorities</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select style={s.input} value={sortByDue} onChange={handleFilterChange(setSortByDue)}>
          <option value="">Sort: Default</option>
          <option value="asc">Due Date ↑</option>
          <option value="desc">Due Date ↓</option>
        </select>
        {(search || filterStatus || filterPriority || sortByDue) && (
          <button style={s.btnGray} onClick={() => {
            setSearch(""); setFilterStatus(""); setFilterPriority(""); setSortByDue(""); setPage(1);
          }}>Clear</button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={s.overlay}>
          <form onSubmit={handleSubmit} style={s.modal}>
            <h3 style={{ margin: "0 0 16px" }}>{editId ? "Edit Task" : "New Task"}</h3>
            {error && <p style={s.error}>{error}</p>}
            <input style={s.input} placeholder="Title *" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea style={{ ...s.input, resize: "vertical", minHeight: 72 }}
              placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div style={s.row}>
              <select style={s.input} value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <select style={s.input} value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div style={s.dateWrap}>
              <label style={s.dateLabel}>Due Date</label>
              <input style={{ ...s.input, ...s.dateInput }} type="date" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div style={s.row}>
              <button style={s.btnPrimary} type="submit">{editId ? "Update" : "Create"}</button>
              <button style={s.btnGray} type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Task List */}
      <div style={s.list}>
        {tasks.length === 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", marginTop: 48 }}>No tasks found.</p>
        )}
        {tasks.map((task) => (
          <div key={task._id} style={{ ...s.card, opacity: task.status === "Completed" ? 0.7 : 1 }}>
            <div style={s.cardTop}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>{task.title}</span>
              <div style={s.badges}>
                <span style={{ ...s.badge, background: PRIORITY_COLOR[task.priority] }}>{task.priority}</span>
                <span style={{ ...s.badge, background: STATUS_COLOR[task.status] }}>{task.status}</span>
              </div>
            </div>
            {task.description && <p style={s.desc}>{task.description}</p>}
            {task.dueDate && <p style={s.due}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
            <div style={s.actions}>
              {task.status !== "Completed" && (
                <button style={s.btnSuccess} onClick={() => handleComplete(task._id)}>✓ Complete</button>
              )}
              <button style={s.btnGray} onClick={() => handleEdit(task)}>Edit</button>
              <button style={s.btnDanger} onClick={() => handleDelete(task._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={s.pageBtn} disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
          {getPaginationRange(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} style={s.ellipsis}>...</span>
            ) : (
              <button key={p} style={{ ...s.pageBtn, ...(p === page ? s.pageBtnActive : {}) }}
                onClick={() => setPage(p)}>{p}</button>
            )
          )}
          <button style={s.pageBtn} disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

// Generates page numbers with ellipsis: [1, '...', 4, 5, 6, '...', 20]
function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

const s = {
  page: { maxWidth: 760, margin: "0 auto", padding: "24px 16px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  totalBadge: { fontSize: 13, background: "#e5e7eb", color: "#374151", padding: "2px 8px", borderRadius: 12, fontWeight: 500 },
  filters: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fff" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  badges: { display: "flex", gap: 6, flexShrink: 0 },
  badge: { fontSize: 11, color: "#fff", padding: "2px 8px", borderRadius: 12, fontWeight: 600 },
  desc: { margin: "8px 0 0", color: "#6b7280", fontSize: 14 },
  due: { margin: "6px 0 0", fontSize: 13, color: "#9ca3af" },
  actions: { display: "flex", gap: 8, marginTop: 12 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 10, padding: 28, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "9px 12px", fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, width: "100%", boxSizing: "border-box" },
  dateWrap: { display: "flex", flexDirection: "column", gap: 4 },
  dateLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500, paddingLeft: 2 },
  dateInput: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    paddingRight: 12,
    minHeight: 40,
    color: "#111827",
  },
  error: { color: "#dc2626", fontSize: 13, margin: 0 },
  pagination: { display: "flex", justifyContent: "center", gap: 6, marginTop: 24, flexWrap: "wrap" },
  pageBtn: { padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13 },
  pageBtnActive: { background: "#4f46e5", color: "#fff", borderColor: "#4f46e5", fontWeight: 600 },
  btnPrimary: { padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  btnSuccess: { padding: "6px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  btnDanger: { padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  btnGray: { padding: "6px 12px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
};
