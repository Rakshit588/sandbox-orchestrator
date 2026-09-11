import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

// ye component ek sandbox ke comm-agent se connect hoke real terminal dikhata hai
function TerminalComponent({ commAgentUrl }) {
  const terminalRef = useRef(null); // is div me xterm render hoga

  useEffect(() => {
    // xterm terminal instance bana raha hu
    const term = new XTerm({
      cursorBlink: true,
      theme: { background: '#1e1e1e' },
    });

    // fit addon - terminal ko apne container ke size ke hisaab se fit karta hai
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // comm-agent se socket.io connection bana raha hu
    const socket = io(commAgentUrl);

    // jab server se output aaye, terminal me likh raha hu
    socket.on('output', (data) => {
      term.write(data);
    });

    // jab user terminal me type kare, server ko bhej raha hu
    term.onData((data) => {
      socket.emit('input', data);
    });

    // cleanup - component hatne pe connection aur terminal dono clean kar raha hu
    return () => {
      socket.disconnect();
      term.dispose();
    };
  }, [commAgentUrl]);

  return <div ref={terminalRef} style={{ height: '300px', marginTop: '10px' }} />;
}

export default TerminalComponent;