import { useState, useEffect } from 'react';
import PropertyList from './components/PropertyList';
import CreateProperty from './components/CreateProperty';
import PasswordlessAuth from './components/PasswordlessAuth';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

function App() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setView('list');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <PasswordlessAuth onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Property Listings</h1>
        <nav>
          <button onClick={() => setView('list')}>Browse Properties</button>
          <button onClick={() => setView('create')}>List Property</button>
          <button onClick={handleSignOut}>Sign Out</button>
        </nav>
      </header>

      <main className="main">
        {view === 'list' ? (
          <PropertyList />
        ) : (
          <CreateProperty onSuccess={() => setView('list')} />
        )}
      </main>
    </div>
  );
}

export default App;
