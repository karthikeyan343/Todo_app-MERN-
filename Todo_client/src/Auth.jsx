import { useState } from 'react';
import ServerWakeMessage from './ServerWakeMessage';

const Auth = ({ apiUrl, onAuth }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister
      ? { name, email, password }
      : { email, password };

    fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || 'Authentication failed');
          });
        }

        return res.json();
      })
      .then((data) => {
        onAuth(data.user);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="p-3 text-white text-center rounded shadow-sm todo-header">
            <h3 className="mb-0">TaskFlow - User Task Management</h3>
          </div>

          <div className="mt-4 p-4 border rounded bg-white shadow-sm">
            <h4 className="mb-3">{isRegister ? 'Register' : 'Login'}</h4>

            {loading && <ServerWakeMessage title="Connecting to server..." />}

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {error && <p className="text-danger">{error}</p>}

              <button className="btn btn-dark w-100" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
              </button>
            </form>

            <button
              type="button"
              className="btn btn-link w-100 mt-3"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister ? 'Already have an account? Login' : 'New user? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
