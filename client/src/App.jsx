import React, { useState, useEffect } from 'react';

function App() {
  const [apiMessage, setApiMessage] = useState('Loading...');
  const [dbStatus, setDbStatus] = useState('Loading...');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch from the Express API
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => {
        setApiMessage(data.message);
        setDbStatus(data.database);
      })
      .catch((err) => {
        setError(err.message);
        setApiMessage('Failed to connect to API');
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐐 Top Goats</h1>
        <p className="tagline">Independent Music Ecosystem</p>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>API Status</h2>
          <p className={apiMessage === 'Failed to connect to API' ? 'error' : 'success'}>
            {apiMessage}
          </p>
        </section>

        <section className="card">
          <h2>Database Status</h2>
          <p className={dbStatus === 'Failed to connect to database' ? 'error' : 'success'}>
            {dbStatus}
          </p>
        </section>

        {error && (
          <section className="card error-card">
            <h2>Error</h2>
            <p>{error}</p>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Top Goats v0.1.0 — Built for independent musicians</p>
      </footer>
    </div>
  );
}

export default App;