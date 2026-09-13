import { useState, useEffect } from 'react';

function FileExplorer({ agentUrl, onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);

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
      handleSelect(fileName);
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
      if (selectedPath === filePath) setSelectedPath(null);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  }

  function handleSelect(path) {
    setSelectedPath(path);
    onFileSelect(path);
  }

  // file extension ke hisaab se ek chhota icon/label deta hai
  function getFileIcon(fileName) {
    const ext = fileName.split('.').pop();
    const icons = { jsx: '⚛', js: '📜', json: '{}', css: '🎨', html: '🌐', md: '📝' };
    return icons[ext] || '📄';
  }

  return (
    <div style={{
      width: '220px',
      background: '#252526',
      borderRight: '1px solid #3c3c3c',
      padding: '10px 0',
      fontSize: '13px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 8px' }}>
        <span style={{ color: '#969696', fontWeight: 600, letterSpacing: '0.5px' }}>EXPLORER</span>
        <button className="btn-primary" onClick={createNewFile} style={{ padding: '2px 8px', fontSize: '12px' }}>
          + New
        </button>
      </div>
      {files
        .filter((f) => f.type === 'file')
        .map((file) => (
          <div
            key={file.path}
            onClick={() => handleSelect(file.path)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 12px',
              background: selectedPath === file.path ? '#37373d' : 'transparent',
              color: selectedPath === file.path ? '#ffffff' : '#cccccc',
            }}
          >
            <span>{getFileIcon(file.name)} {file.path}</span>
            <button
              onClick={(e) => deleteFile(file.path, e)}
              style={{ background: 'none', border: 'none', color: '#969696', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        ))}
    </div>
  );
}

export default FileExplorer;