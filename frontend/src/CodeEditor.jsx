import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

// select ki hui file ka content load karta hai, edit hone pe save bhi karta hai
function CodeEditor({ agentUrl, filePath }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!filePath) return;
    fetch(`${agentUrl}/file?path=${encodeURIComponent(filePath)}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content))
      .catch((err) => console.error('Failed to load file:', err));
  }, [filePath, agentUrl]);

  // file ko server pe save karta hai
  async function saveFile() {
    try {
      await fetch(`${agentUrl}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content }),
      });
      alert('Saved!');
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }

  if (!filePath) return <div style={{ flex: 1, padding: '10px' }}>Select a file to edit</div>;

  return (
    <div style={{ flex: 1 }}>
      <button onClick={saveFile}>Save</button>
      <Editor
        height="400px"
        language="javascript"
        value={content}
        onChange={(value) => setContent(value)}
        theme="vs-dark"
      />
    </div>
  );
}

export default CodeEditor;