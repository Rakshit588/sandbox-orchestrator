import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

function TerminalComponent({ commAgentUrl }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    let disposed = false; // guard flag

    const term = new XTerm({
      cursorBlink: true,
      theme: { background: '#1e1e1e' },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    // fit() ko next paint ke baad call karo, taaki dimensions ready ho chuke hon
    requestAnimationFrame(() => {
      if (!disposed) fitAddon.fit();
    });

    const socket = io(commAgentUrl);

    socket.on('output', (data) => {
      if (!disposed) term.write(data); // guard check
    });

    term.onData((data) => {
      if (!disposed) socket.emit('input', data);
    });

    term.attachCustomKeyEventHandler((event) => {
      if (event.ctrlKey && event.key === 'v' && event.type === 'keydown') {
        navigator.clipboard.readText().then((text) => {
          if (!disposed) socket.emit('input', text);
        });
        return false;
      }
      return true;
    });

    const handleContextMenu = (e) => {
      e.preventDefault();
      const selection = term.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    };
    const containerEl = terminalRef.current;
    containerEl.addEventListener('contextmenu', handleContextMenu);

    // window resize pe bhi fit karo, warna resize ke baad terminal misaligned rahega
    const handleResize = () => {
      if (!disposed) fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true; // sabse pehle flag set karo
      window.removeEventListener('resize', handleResize);
      containerEl.removeEventListener('contextmenu', handleContextMenu);
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