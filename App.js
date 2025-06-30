import React, { useEffect, useState } from "react";
import * as api from "./api";

const PRIORITY_LABELS = {
  1: "Низкий",
  2: "Средний",
  3: "Высокий",
};

const CATEGORY_OPTIONS = ["Общее", "Работа", "Учёба", "Личное", "Другое"];

function App() {
  const [telegram, setTelegram] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ completed: null, category: "", priority: null });
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Общее",
    priority: 2,
    due_date: "",
  });

  useEffect(() => {
    if (window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      setTelegram(tg);
      const userData = tg.initDataUnsafe.user;
      setUser(userData);
      api.createUser(userData.id, userData.username);
      loadTasks(userData.id);
    }
  }, []);

  const loadTasks = async (telegram_id, filtersObj = filters) => {
    const res = await api.getTasks(telegram_id, filtersObj);
    setTasks(res.data);
  };

  const handleAddTask = async () => {
    if (!form.title.trim()) return alert("Введите название задачи");
    const taskData = {
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      completed: false,
    };
    await api.createTask(user.id, taskData);
    setForm({ title: "", description: "", category: "Общее", priority: 2, due_date: "" });
    loadTasks(user.id);
  };

  const toggleComplete = async (task) => {
    await api.updateTask(user.id, task.id, { ...task, completed: !task.completed });
    loadTasks(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить задачу?")) {
      await api.deleteTask(user.id, id);
      loadTasks(user.id);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value === "" ? null : value };
    setFilters(newFilters);
    loadTasks(user.id, newFilters);
  };

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", fontFamily: "Arial, sans-serif", padding: 10 }}>
      <h1>Планировщик задач</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>Новая задача</h2>
        <input
          type="text"
          placeholder="Название"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <textarea
          placeholder="Описание (необязательно)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{ width: "100%", padding: 8, marginBottom: 8, resize: "vertical" }}
          rows={3}
        />
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ flex: 1, padding: 8 }}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            style={{ flex: 1, padding: 8 }}
          >
            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            style={{ flex: 1, padding: 8 }}
          />
        </div>
        <button onClick={handleAddTask} style={{ padding: "10px 20px", fontSize: 16 }}>
          Добавить задачу
        </button>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2>Фильтры</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            value={filters.completed === null ? "" : filters.completed ? "true" : "false"}
            onChange={(e) => handleFilterChange("completed", e.target.value === "" ? null : e.target.value === "true")}
            style={{ padding: 8, minWidth: 150 }}
          >
            <option value="">Все</option>
            <option value="false">Активные</option>
            <option value="true">Выполненные</option>
          </select>
          <select
            value={filters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            style={{ padding: 8, minWidth: 150 }}
          >
            <option value="">Все категории</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filters.priority || ""}
            onChange={(e) => handleFilterChange("priority", e.target.value ? Number(e.target.value) : null)}
            style={{ padding: 8, minWidth: 150 }}
          >
            <option value="">Все приоритеты</option>
            {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2>Задачи</h2>
        {tasks.length === 0 ? (
          <p>Задачи не найдены</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                style={{
                  padding: 10,
                  marginBottom: 8,
                  borderRadius: 6,
                  backgroundColor: task.completed ? "#d4edda" : "#f8d7da",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggleComplete(task)}>
                  <strong style={{ textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</strong>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {task.description && <div>{task.description}</div>}
                    <div>Категория: {task.category}</div>
                    <div>Приоритет: {PRIORITY_LABELS[task.priority]}</div>
                    {task.due_date && <div>Дедлайн: {new Date(task.due_date).toLocaleDateString()}</div>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  style={{
                    marginLeft: 10,
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                  title="Удалить задачу"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
