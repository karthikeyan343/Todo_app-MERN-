import { useEffect, useState } from 'react';
import './App.css';
import Auth from './Auth';
import Todo from './Todo';
import ServerWakeMessage from './ServerWakeMessage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${apiUrl}/auth/me`, {
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) {
          return null;
        }

        return res.json();
      })
      .then((data) => {
        if (!cancelled && data?.user) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
      .finally(() => {
        setUser(null);
      });
  };

  if (checkingAuth) {
    return (
      <div className="container mt-4">
        <ServerWakeMessage title="Checking login..." />
      </div>
    );
  }

  if (!user) {
    return <Auth apiUrl={apiUrl} onAuth={setUser} />;
  }

  return <Todo apiUrl={apiUrl} user={user} onLogout={handleLogout} />;
}

export default App;
