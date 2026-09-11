import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // Auth Functions
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/register' : '/login';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      if (isRegister) {
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setTasks([]);
  };

  // CRUD Functions
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Title is required');

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/tasks/${editingId}` : `${API_BASE}/tasks`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setEditingId(null);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
  };

  // UI View: Login / Register Form
  if (!token) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleAuth}>
          <div>
            <label>Email: </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <br />
          <div>
            <label>Password: </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <br />
          <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
        </form>
        <br />
        <button onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    );
  }

  // UI View: Task Dashboard
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
      <h2>Task Dashboard</h2>

      {/* Create / Edit Form */}
      <form onSubmit={handleSaveTask} style={{ marginBottom: '20px' }}>
        <h3>{editingId ? 'Edit Task' : 'Create New Task'}</h3>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br /><br />
        <button type="submit">{editingId ? 'Update Task' : 'Add Task'}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }}>
            Cancel
          </button>
        )}
      </form>

      {/* Task List */}
      <h3>Your Tasks</h3>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} style={{ marginBottom: '10px' }}>
              <strong>{task.title}</strong> - {task.description}
              <br />
              <button onClick={() => handleEdit(task)}>Edit</button>
              <button onClick={() => handleDelete(task.id)} style={{ marginLeft: '5px' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}