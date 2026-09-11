import { useState } from 'react';
import './App.css';
import TerminalComponent from './Terminal';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';

function App() {
  const [sandboxes, setSandboxes] = useState([]); // saare active sandboxes ki list
  const [activeSandboxId, setActiveSandboxId] = useState(null); // abhi kaunsa dikh raha hai
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);

  async function createSandbox() {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/sandboxes', {
        method: 'POST',
      });
      const data = await response.json();

      // naya sandbox list me add kar raha hu, podReady flag ke saath
      const newSandbox = { ...data, podReady: false };
      setSandboxes((prev) => [...prev, newSandbox]);
      setActiveSandboxId(data.sandboxId);

      // har 2 second me backend se poochta hu "ready hua kya", jab tak sach me ready na ho
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `http://localhost:3000/sandboxes/${data.sandboxId}/status`
          );
          const statusData = await statusRes.json();

          if (statusData.ready) {
            clearInterval(pollInterval); // ready ho gaya, ab polling band kar do
            setSandboxes((prev) =>
              prev.map((sb) =>
                sb.sandboxId === data.sandboxId ? { ...sb, podReady: true } : sb
              )
            );
          }
        } catch (err) {
          console.error('Status check failed:', err);
        }
      }, 2000);

      // agar 60 second me bhi ready na ho, polling band kar do (safety net)
      setTimeout(() => clearInterval(pollInterval), 60000);
    } catch (err) {
      console.error('Failed to create sandbox:', err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSandbox(sandboxId) {
    try {
      await fetch(`http://localhost:3000/sandboxes/${sandboxId}`, {
        method: 'DELETE',
      });
      setSandboxes((prev) => prev.filter((sb) => sb.sandboxId !== sandboxId));
      if (activeSandboxId === sandboxId) {
        setActiveSandboxId(null);
      }
    } catch (err) {
      console.error('Failed to delete sandbox:', err);
    }
  }

  function refreshPreview() {
    setIframeKey((prev) => prev + 1);
  }

  const activeSandbox = sandboxes.find((sb) => sb.sandboxId === activeSandboxId);

  return (
    <div>
      <h1>Instant IDE</h1>
      <button onClick={createSandbox} disabled={loading}>
        {loading ? 'Creating...' : 'Create Sandbox'}
      </button>

      {/* saare active sandboxes ki tab-jaisi list */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        {sandboxes.map((sb) => (
          <div
            key={sb.sandboxId}
            style={{
              padding: '6px 12px',
              border: '1px solid gray',
              cursor: 'pointer',
              background: sb.sandboxId === activeSandboxId ? '#ddd' : 'white',
            }}
          >
            <span onClick={() => setActiveSandboxId(sb.sandboxId)}>
              {sb.sandboxId}
            </span>
            <button onClick={() => deleteSandbox(sb.sandboxId)} style={{ marginLeft: '8px' }}>
              x
            </button>
          </div>
        ))}
      </div>

      {activeSandbox && (
        <div>
          <p>Sandbox: {activeSandbox.sandboxId}</p>
          <p>URL: {activeSandbox.url}</p>

          {!activeSandbox.podReady ? (
            <p>Sandbox is starting up, please wait...</p>
          ) : (
            <div>
              <button onClick={refreshPreview}>Refresh Preview</button>
              <iframe
                key={`${activeSandbox.sandboxId}-${iframeKey}`}
                src={activeSandbox.url}
                title="Sandbox Preview"
                style={{ width: '100%', height: '400px', border: '1px solid gray', marginTop: '10px' }}
              />

              <div style={{ display: 'flex', marginTop: '10px' }}>
                <FileExplorer
                  agentUrl={`http://${activeSandbox.sandboxId}.agent.localhost`}
                  onFileSelect={setSelectedFile}
                />
                <CodeEditor
                  agentUrl={`http://${activeSandbox.sandboxId}.agent.localhost`}
                  filePath={selectedFile}
                />
              </div>

              <TerminalComponent
                key={activeSandbox.sandboxId}
                commAgentUrl={`http://${activeSandbox.sandboxId}.agent.localhost`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;