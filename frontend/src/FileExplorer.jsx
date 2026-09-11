import { useState, useEffect } from 'react';

// sandbox ki files ki list dikhata hai, click karne pe file select hoti hai
function FileExplorer({ agentUrl, onFileSelect }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch(`${agentUrl}/files`)
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => console.error('Failed to load files:', err));
  }, [agentUrl]);

  return (
    <div style={{ width: '200px', borderRight: '1px solid gray', padding: '10px' }}>
      <h4>Files</h4>
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