import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import PortalDashboard from './components/PortalDashboard';
import { getCurrentUser } from './services/placementService';

function App() {
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(window.localStorage.getItem('token')));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authToken) return undefined;

    let active = true;
    getCurrentUser()
      .then((response) => {
        if (active) {
          setUser(response.data.data);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) {
          if (requestError.response?.status === 401) {
            window.localStorage.removeItem('token');
            setAuthToken(null);
            setUser(null);
          } else {
            setError(requestError.response?.data?.message || requestError.message || 'Could not load your account.');
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authToken]);

  const handleAuthenticated = (authenticatedUser) => {
    window.localStorage.setItem('token', authenticatedUser.token);
    setUser(authenticatedUser);
    setAuthToken(authenticatedUser.token);
    setLoading(false);
  };

  const handleSignOut = () => {
    window.localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setError('');
  };

  if (!authToken) return <AuthForm onAuthenticated={handleAuthenticated} />;
  if (loading) {
    return <main className="min-h-screen bg-slate-900 p-10 text-center text-slate-300">Loading your account...</main>;
  }
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-900 p-10 text-center text-rose-300">
        {error || 'Could not load your account.'}
        <button onClick={handleSignOut} className="ml-3 underline">Sign out</button>
      </main>
    );
  }

  return <PortalDashboard user={user} onSignOut={handleSignOut} />;
}

export default App;
