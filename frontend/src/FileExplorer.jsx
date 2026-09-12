import { useState, useEffect } from 'react';

function FileExplorer({ agentUrl, onFileSelect }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadFiles();
  }, [agentUrl]);

  function loadFiles() {
    fetch(`${agentUrl}/files`)
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => console.error('Failed to load files:', err));
  }

  async function createNewFile() {
    const fileName = prompt('Enter new file name (e.g. src/NewComponent.jsx):');
    if (!fileName) return;

    try {
      await fetch(`${agentUrl}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fileName, content: '' }),
      });
      loadFiles();
      onFileSelect(fileName);
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  }

  // file delete karta hai, confirm poochne ke baad
  async function deleteFile(filePath, e) {
    e.stopPropagation(); // parent ke onClick (file open karne wale) ko trigger hone se roka
    if (!confirm(`Delete ${filePath}?`)) return;

    try {
      await fetch(`${agentUrl}/file?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });
      loadFiles();
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  }

  return (
    <div style={{ width: '200px', borderRight: '1px solid gray', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Files</h4>
        <button onClick={createNewFile}>+ New</button>
      </div>
      {files
        .filter((f) => f.type === 'file')
        .map((file) => (
          <div
            key={file.path}
            onClick={() => onFileSelect(file.path)}
            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0' }}
          >
            <span>{file.path}</span>
            <button onClick={(e) => deleteFile(file.path, e)}>x</button>
          </div>
        ))}
    </div>
  );
}

export default FileExplorer;