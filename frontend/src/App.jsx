import { useState } from 'react';
import './App.css';
import TerminalComponent from './Terminal';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';

function App() {
  const [sandbox, setSandbox] = useState(null);
  const [loading, setLoading] = useState(false);
  const [podReady, setPodReady] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // iframe ko force-reload karne ke liye
  const [selectedFile, setSelectedFile] = useState(null);

  async function createSandbox() {
    setLoading(true);
    setPodReady(false);
    try {
      const response = await fetch('http://localhost:3000/sandboxes', {
        method: 'POST',
      });
      const data = await response.json();
      setSandbox(data);

      // pod ko start hone ke liye zyada time de raha hu - 15 second
      setTimeout(() => {
        setPodReady(true);
      }, 15000);
    } catch (err) {
      console.error('Failed to create sandbox:', err);
    } finally {
      setLoading(false);
    }
  }

  // iframe ko manually reload karne ke liye - key badalne se React use fresh render karta hai
  function refreshPreview() {
    setIframeKey((prev) => prev + 1);
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

        {!podReady ? (
          <p>Sandbox is starting up, please wait...</p>
        ) : (
          <div>
            <button onClick={refreshPreview}>Refresh Preview</button>
            <iframe
              key={iframeKey}
              src={sandbox.url}
              title="Sandbox Preview"
              style={{ width: '100%', height: '400px', border: '1px solid gray', marginTop: '10px' }}
            />

            {/* code editor - file explorer aur editor saath */}
            <div style={{ display: 'flex', marginTop: '10px' }}>
              <FileExplorer
                agentUrl={`http://${sandbox.sandboxId}.agent.localhost`}
                onFileSelect={setSelectedFile}
              />
              <CodeEditor
                agentUrl={`http://${sandbox.sandboxId}.agent.localhost`}
                filePath={selectedFile}
              />
            </div>

            <TerminalComponent commAgentUrl={`http://${sandbox.sandboxId}.agent.localhost`} />
          </div>
        )}
      </div>
    )}
  </div>
);
}

export default App;