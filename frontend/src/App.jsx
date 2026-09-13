import { useState } from 'react';
import './App.css';
import TerminalComponent from './Terminal';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';

function App() {
  const [sandboxes, setSandboxes] = useState([]);
  const [activeSandboxId, setActiveSandboxId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [activePanel, setActivePanel] = useState('editor'); // 'editor' ya 'preview'

  async function createSandbox() {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/sandboxes', {
        method: 'POST',
      });
      const data = await response.json();

      const newSandbox = { ...data, podReady: false };
      setSandboxes((prev) => [...prev, newSandbox]);
      setActiveSandboxId(data.sandboxId);

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `http://localhost:3000/sandboxes/${data.sandboxId}/status`
          );
          const statusData = await statusRes.json();

          if (statusData.ready) {
            clearInterval(pollInterval);
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
      {/* Header - branding aur create button */}
      <div className="app-header">
        <h1>⚡ Instant IDE</h1>
        <button className="btn-primary" onClick={createSandbox} disabled={loading}>
          {loading ? 'Creating...' : '+ New Sandbox'}
        </button>
      </div>

      {/* Tabs - saare active sandboxes */}
      {sandboxes.length > 0 && (
        <div className="sandbox-tabs">
          {sandboxes.map((sb) => (
            <div
              key={sb.sandboxId}
              className={`sandbox-tab ${sb.sandboxId === activeSandboxId ? 'active' : ''}`}
            >
              <span onClick={() => setActiveSandboxId(sb.sandboxId)}>
                {sb.sandboxId}
              </span>
              <button onClick={() => deleteSandbox(sb.sandboxId)}>×</button>
            </div>
          ))}
        </div>
      )}

      {activeSandbox && (
        <div>
          {!activeSandbox.podReady ? (
            <p style={{ padding: '20px', color: '#cccccc' }}>Sandbox is starting up, please wait...</p>
          ) : (
            <div style={{ display: 'flex', height: 'calc(100vh - 90px)' }}>
              {/* Left sidebar - File Explorer, poori height */}
              <FileExplorer
                agentUrl={`http://${activeSandbox.sandboxId}.agent.localhost`}
                onFileSelect={setSelectedFile}
              />

              {/* Right side - editor/preview upar (tab-switched), terminal neeche */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Tab switcher - Editor ya Preview */}
                  <div style={{ display: 'flex', background: '#252526', borderBottom: '1px solid #3c3c3c' }}>
                    <button
                      onClick={() => setActivePanel('editor')}
                      style={{
                        padding: '8px 16px',
                        background: activePanel === 'editor' ? '#1e1e1e' : 'transparent',
                        color: activePanel === 'editor' ? '#ffffff' : '#969696',
                        border: 'none',
                        borderTop: activePanel === 'editor' ? '2px solid #0e639c' : '2px solid transparent',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => setActivePanel('preview')}
                      style={{
                        padding: '8px 16px',
                        background: activePanel === 'preview' ? '#1e1e1e' : 'transparent',
                        color: activePanel === 'preview' ? '#ffffff' : '#969696',
                        border: 'none',
                        borderTop: activePanel === 'preview' ? '2px solid #0e639c' : '2px solid transparent',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Preview
                    </button>
                    {activePanel === 'preview' && (
                      <button
                        className="btn-primary"
                        onClick={refreshPreview}
                        style={{ marginLeft: 'auto', marginRight: '8px', padding: '4px 10px', fontSize: '12px', alignSelf: 'center' }}
                      >
                        ↻ Refresh
                      </button>
                    )}
                  </div>

                  {/* Jo bhi active hai, wahi poora space le */}
                  <div style={{ flex: 1, overflow: 'auto', display: activePanel === 'editor' ? 'block' : 'none' }}>
                    <CodeEditor
                      agentUrl={`http://${activeSandbox.sandboxId}.agent.localhost`}
                      filePath={selectedFile}
                    />
                  </div>
                  <div style={{ flex: 1, display: activePanel === 'preview' ? 'flex' : 'none', flexDirection: 'column' }}>
                    <iframe
                      key={`${activeSandbox.sandboxId}-${iframeKey}`}
                      src={activeSandbox.url}
                      title="Sandbox Preview"
                      style={{ flex: 1, border: 'none' }}
                    />
                  </div>
                </div>

                {/* Terminal - bottom panel, fixed height */}
                <div style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    background: '#252526',
                    padding: '6px 12px',
                    fontSize: '13px',
                    color: '#969696',
                    borderTop: '1px solid #3c3c3c',
                  }}>
                    TERMINAL
                  </div>
                  <TerminalComponent
                    key={activeSandbox.sandboxId}
                    commAgentUrl={`http://${activeSandbox.sandboxId}.agent.localhost`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state - jab koi sandbox nahi hai */}
      {sandboxes.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          color: '#969696',
        }}>
          <h2 style={{ color: '#cccccc' }}>Welcome to Instant IDE</h2>
          <p>Click "+ New Sandbox" above to spin up an isolated development environment.</p>
        </div>
      )}
    </div>
  );
}

export default App;