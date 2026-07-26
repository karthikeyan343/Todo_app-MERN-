import { useCallback, useEffect, useState } from 'react';
import ServerWakeMessage from './ServerWakeMessage';
import './Todo.css';
const formatDateTimeLocal = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const formatDueDate = (value) => {
  if (!value) {
    return 'No due date';
  }

  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const Todo = ({ apiUrl, user, onLogout }) => {
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState(-1);
  const [editTitle, setEdiTitle] = useState('');
  const [editDescription, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const requestOptions = {
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    }
  };

  const showMessage = (message) => {
    setMsg(message);
    setTimeout(() => {
      setMsg('');
    }, 3000);
  };

  const handleUnauthorized = useCallback(() => {
    setError('Your session expired. Please login again.');
    onLogout();
  }, [onLogout]);

  const handleSubmit = () => {
    setError('');

    if (title.trim() !== '' && description.trim() !== '' && dueDate) {
      setSaving(true);
     const dueDateUtc=new Date(dueDate).toISOString();
      fetch(`${apiUrl}/todos`, {
        method: 'POST',
        ...requestOptions,
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDateUtc
        })
      })
        .then((res) => {
          if (res.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
          }

          if (!res.ok) {
            throw new Error('Unable to create todo');
          }

          return res.json();
        })
        .then((createdTodo) => {
          setTodos([createdTodo, ...todos]);
          setTitle('');
          setDesc('');
          setDueDate('');
          showMessage('Task added successfully');
        })
        .catch((err) => {
          console.log(err);
          if (err.message !== 'Unauthorized') {
            setError('Unable to create todo');
          }
        })
        .finally(() => setSaving(false));
    } else {
      setError('Please enter title, description, and due date.');
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEdiTitle(item.title);
    setEditDesc(item.description);
    setEditDueDate(formatDateTimeLocal(item.dueDate));
  };

  const handleEditCancel = () => {
    setEditId(-1);
  };

  const handleUpdate = () => {
    setError('');

    if (editTitle.trim() !== '' && editDescription.trim() !== '' && editDueDate) {
      setSaving(true);
    const editDueDateUtc=new Date(editDueDate).toISOString();
      fetch(`${apiUrl}/todos/${editId}`, {
        method: 'PUT',
        ...requestOptions,
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          dueDate: editDueDateUtc
        })
      })
        .then((res) => {
          if (res.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
          }

          if (!res.ok) {
            throw new Error('Unable to update todo');
          }

          return res.json();
        })
        .then((updatedTodo) => {
          const updatedTodos = todos.map((item) => (
            item._id === editId ? updatedTodo : item
          ));

          setTodos(updatedTodos);
          setEdiTitle('');
          setEditDesc('');
          setEditDueDate('');
          showMessage('Task updated successfully');
          setEditId(-1);
        })
        .catch((err) => {
          console.log(err);
          if (err.message !== 'Unauthorized') {
            setError('Unable to update todo');
          }
        })
        .finally(() => setSaving(false));
    } else {
      setError('Please enter title, description, and due date.');
    }
  };

  const handleComplete = (item) => {
    fetch(`${apiUrl}/todos/${item._id}`, {
      method: 'PUT',
      ...requestOptions,
      body: JSON.stringify({ completed: !item.completed })
    })
      .then((res) => {
        if (res.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }

        if (!res.ok) {
          throw new Error('Unable to update task status');
        }

        return res.json();
      })
      .then((updatedTodo) => {
        setTodos(todos.map((todo) => (
          todo._id === updatedTodo._id ? updatedTodo : todo
        )));
      })
      .catch((err) => {
        console.log(err);
        if (err.message !== 'Unauthorized') {
          setError('Unable to update task status');
        }
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure to delete this task?')) {
      fetch(`${apiUrl}/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
        .then((res) => {
          if (res.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
          }

          if (!res.ok) {
            throw new Error('Unable to delete todo');
          }

          setTodos(todos.filter((item) => item._id !== id));
        })
        .catch((err) => {
          console.log(err);
          if (err.message !== 'Unauthorized') {
            setError('Unable to delete todo');
          }
        });
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetch(`${apiUrl}/todos`, {
      credentials: 'include'
    })
      .then((res) => {
        if (res.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }

        if (!res.ok) {
          throw new Error('Unable to load tasks');
        }

        return res.json();
      })
      .then((res) => {
        if (!cancelled) {
          setTodos(res);
        }
      })
      .catch((err) => {
        console.log(err);
        if (!cancelled && err.message !== 'Unauthorized') {
          setError('Unable to load tasks. Please wait and refresh once the server wakes up.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl, handleUnauthorized]);

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="p-3 text-white rounded shadow-sm todo-header">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <div>
                <h3 className="mb-0">TaskFlow - User Task Management With Email Reminders</h3>
                <p className="mb-0 small">Logged in as {user.name}</p>
              </div>
              <button className="btn btn-light btn-sm" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
          <div className="mt-4">
          <div className="marquee-container">
    <div className="marquee-content">
        📢 <strong>Demo Notice:</strong> Email reminders are automatically scheduled approximately <strong>24 hours before</strong> the due date. This application is hosted on <strong>Render's Free Tier</strong>, so the server may become inactive during periods of no traffic. If this happens, reminder emails may be delayed until the server becomes active again.
    </div>
</div>
            <h4>Add Task</h4>

            {msg && <p className="text-success">{msg}</p>}
            {saving && <ServerWakeMessage title="Connecting to server..." />}

            <div className="row g-2">
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold" htmlFor="taskTitle">
                  Task Title
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  placeholder="Task Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold" htmlFor="taskDescription">
                  Description
                </label>
                <input
                  id="taskDescription"
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold" htmlFor="taskDueDate">
                  Due Date
                </label>
                <input
                  id="taskDueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="col-12 col-md-2">
                <label className="form-label fw-semibold invisible d-none d-md-block">
                  Action
                </label>
                <button
                  className="btn btn-dark w-100"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? 'Please wait...' : 'Add Task'}
                </button>
              </div>
            </div>

            {error && <p className="text-danger mt-2">{error}</p>}
          </div>

          <div className="mt-4">
            <h4>Tasks</h4>

            {loading && <ServerWakeMessage title="Loading tasks..." />}

            {!loading && todos.length === 0 && (
              <div className="alert alert-info">No tasks found. Create your first task.</div>
            )}

            <ul className="list-group">
              {!loading && todos.map((item) => (
                <li
                  key={item._id}
                  className="list-group-item bg-light shadow-sm rounded my-2"
                >
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1 w-100">
                      {editId === -1 || editId !== item._id ? (
                        <>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={Boolean(item.completed)}
                              onChange={() => handleComplete(item)}
                            />
                            <div className={`fw-bold ${item.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                              {item.title}
                            </div>
                          </div>
                          <div className="text-muted mt-1">{item.description}</div>
                          <div className="small text-primary mt-1">
                            Due Date: {formatDueDate(item.dueDate)}
                            {item.reminderSent ? ' - reminder sent' : ''}
                          </div>
                        </>
                      ) : (
                        <div className="row g-2">
                          <div className="col-12 col-md-3">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEdiTitle(e.target.value)}
                              className="form-control"
                            />
                          </div>

                          <div className="col-12 col-md-4">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="form-control"
                            />
                          </div>

                          <div className="col-12 col-md-5">
                            <input
                              type="datetime-local"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="form-control"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      {editId === -1 || editId !== item._id ? (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handleUpdate}
                          disabled={saving}
                        >
                          {saving ? 'Please wait...' : 'Update'}
                        </button>
                      )}

                      {editId === -1 || editId !== item._id ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;
