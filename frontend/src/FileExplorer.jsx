import { useState, useEffect } from 'react';

// sandbox ki files ki list dikhata hai, click karne pe file select hoti hai
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

  // naya file banata hai - naam poochkar, khali content ke saath server pe save karta hai
  async function createNewFile() {
    const fileName = prompt('Enter new file name (e.g. src/NewComponent.jsx):');
    if (!fileName) return;

    try {
      await fetch(`${agentUrl}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fileName, content: '' }),
      });
      loadFiles(); // list ko refresh kar raha hu taaki nayi file dikhe
      onFileSelect(fileName); // nayi file ko turant editor me khol raha hu
    } catch (err) {
      console.error('Failed to create file:', err);
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
            style={{ cursor: 'pointer', padding: '4px 0' }}
          >
            {file.path}
          </div>
        ))}
    </div>
  );
}

export default FileExplorer;