import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

function TerminalComponent({ commAgentUrl }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    const term = new XTerm({
      cursorBlink: true,
      theme: { background: '#1e1e1e' },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    const socket = io(commAgentUrl);

    socket.on('output', (data) => {
      term.write(data);
    });

    term.onData((data) => {
      socket.emit('input', data);
    });

    // Ctrl+V se paste karne ke liye - clipboard se text padhke terminal ko bhej raha hu
    term.attachCustomKeyEventHandler((event) => {
      if (event.ctrlKey && event.key === 'v' && event.type === 'keydown') {
        navigator.clipboard.readText().then((text) => {
          socket.emit('input', text);
        });
        return false; // browser ke default paste behavior ko rok raha hu
      }
      return true;
    });

    // right-click se copy karne ke liye - selected text ko clipboard me daal raha hu
    terminalRef.current.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const selection = term.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    });

    return () => {
      socket.disconnect();
      term.dispose();
    };
  }, [commAgentUrl]);

  return (
  <div
    ref={terminalRef}
    style={{ height: '300px', border: '1px solid #3c3c3c', padding: '4px' }}
  />
);
}

export default TerminalComponent;