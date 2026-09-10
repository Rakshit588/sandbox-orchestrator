import { useState } from 'react';
import './App.css';

function App() {
  // sandbox create hone ke baad uska data yaha store hoga
  const [sandbox, setSandbox] = useState(null);
  const [loading, setLoading] = useState(false);

  // backend ke /sandboxes route ko call karta hai naya sandbox banane ke liye
  async function createSandbox() {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/sandboxes', {
        method: 'POST',
      });
      const data = await response.json();
      setSandbox(data);
    } catch (err) {
      console.error('Failed to create sandbox:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Instant IDE</h1>
      <button onClick={createSandbox} disabled={loading}>
        {loading ? 'Creating...' : 'Create Sandbox'}
      </button>

      {sandbox && (
        <div>
          <p>Sandbox created: {sandbox.sandboxId}</p>
          <p>URL: {sandbox.url}</p>

          {/* live preview - sandbox ke andar chal rahe vite server ko dikhata hai */}
          <iframe
            src={sandbox.url}
            title="Sandbox Preview"
            style={{ width: '100%', height: '400px', border: '1px solid gray', marginTop: '10px' }}
          />
        </div>
      )}
    </div>
  );
}

export default App;