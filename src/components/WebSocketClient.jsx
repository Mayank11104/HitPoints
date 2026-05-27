import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Wifi, WifiOff, Send, Search, Trash2, Cable,
  FileJson, Check, X, ChevronsDown, ChevronsUp,
} from 'lucide-react';
import { formatTime, prettyJSON } from '../utils/helpers';

/* ── Connection state visual config ── */
const STATE_CONFIG = {
  DISCONNECTED: { color: 'text-txt-3', bg: 'bg-surface-card', label: 'Disconnected', dot: 'bg-txt-3', anim: '' },
  CONNECTING:   { color: 'text-warn',  bg: 'bg-warn/10',      label: 'Connecting',   dot: 'bg-warn',  anim: 'animate-pulse-badge' },
  CONNECTED:    { color: 'text-ok',    bg: 'bg-ok/10',        label: 'Connected',    dot: 'bg-ok',    anim: 'animate-breathe' },
  ERROR:        { color: 'text-fail',  bg: 'bg-fail/10',      label: 'Error',        dot: 'bg-fail',  anim: 'animate-shake' },
};

export default function WebSocketClient({ onHistoryAdd, fillData }) {
  const [wsUrl, setWsUrl] = useState('');
  const [connState, setConnState] = useState('DISCONNECTED');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [jsonValid, setJsonValid] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const wsRef = useRef(null);
  const logEndRef = useRef(null);

  // Fill form from history selection
  useEffect(() => {
    if (fillData && fillData.type === 'WS') {
      setWsUrl(fillData.url || '');
    }
  }, [fillData]);

  // Auto-scroll message log
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const connect = useCallback(() => {
    if (!wsUrl.trim()) return;
    setConnState('CONNECTING');
    setMessages((p) => [...p, { type: 'system', content: 'Connecting…', time: Date.now() }]);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnState('CONNECTED');
        setMessages((p) => [...p, { type: 'system', content: 'Connection established', time: Date.now() }]);
        onHistoryAdd({ type: 'WS', url: wsUrl, timestamp: Date.now() });
      };
      ws.onmessage = (e) => {
        setMessages((p) => [...p, { type: 'in', content: e.data, time: Date.now() }]);
      };
      ws.onerror = () => {
        setConnState('ERROR');
        setMessages((p) => [...p, { type: 'system', content: 'Connection error', time: Date.now(), isError: true }]);
      };
      ws.onclose = (e) => {
        setConnState('DISCONNECTED');
        setMessages((p) => [...p, { type: 'system', content: `Disconnected (code: ${e.code})`, time: Date.now() }]);
        wsRef.current = null;
      };
    } catch (err) {
      setConnState('ERROR');
      setMessages((p) => [...p, { type: 'system', content: err.message, time: Date.now(), isError: true }]);
    }
  }, [wsUrl, onHistoryAdd]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(() => {
    if (!draft.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(draft);
    setMessages((p) => [...p, { type: 'out', content: draft, time: Date.now() }]);
    setDraft('');
    setJsonValid(null);
  }, [draft]);

  const validateJSON = () => {
    try {
      JSON.parse(draft);
      setJsonValid(true);
    } catch {
      setJsonValid(false);
    }
  };

  const clearLog = () => setMessages([]);

  const filteredMessages = searchFilter
    ? messages.filter((m) => m.content.toLowerCase().includes(searchFilter.toLowerCase()))
    : messages;

  const cs = STATE_CONFIG[connState];
  const isConnected = connState === 'CONNECTED';

  return (
    <div className="flex flex-col h-full animate-fade">
      {/* ── URL + Connection Controls ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 items-stretch sm:items-center">
        <input
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (isConnected ? disconnect() : connect())}
          placeholder="ws://localhost:8080 or wss://echo.websocket.events"
          aria-label="WebSocket URL"
          className="flex-1 px-4 py-2.5 bg-surface-card text-txt border border-line rounded-lg font-mono text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        />

        {/* Connection Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-line ${cs.bg} ${cs.anim} relative shrink-0`}
          role="status"
          aria-live="polite"
          aria-label={`Connection status: ${cs.label}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${cs.dot}`}
            style={{ boxShadow: connState !== 'DISCONNECTED' ? `0 0 8px currentColor` : 'none' }}
          />
          {connState === 'CONNECTED' && (
            <div className="absolute left-[18px] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-ok animate-ring pointer-events-none" />
          )}
          <span className={`text-[11px] font-semibold font-mono ${cs.color}`}>{cs.label}</span>
        </div>

        {/* Connect / Disconnect */}
        <button
          onClick={isConnected ? disconnect : connect}
          aria-label={isConnected ? 'Disconnect WebSocket' : 'Connect WebSocket'}
          className={`
            flex items-center justify-center gap-2 px-5 py-2.5 border-none rounded-lg
            cursor-pointer font-bold text-sm transition-all duration-150 shrink-0
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none
            ${isConnected
              ? 'bg-fail/15 text-fail hover:bg-fail/25'
              : 'bg-ok/15 text-ok hover:bg-ok/25'
            }
          `}
        >
          {isConnected ? <><WifiOff size={16} /> Disconnect</> : <><Wifi size={16} /> Connect</>}
        </button>
      </div>

      {/* ── Message Composer ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <textarea
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setJsonValid(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) sendMessage(); }}
          placeholder="Message payload (Ctrl+Enter to send)"
          rows={3}
          aria-label="WebSocket message payload"
          className="flex-1 px-3 py-2.5 bg-surface-card text-txt border border-line rounded-lg font-mono text-sm leading-relaxed outline-none resize-y min-h-[60px] transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        />
        <div className="flex sm:flex-col gap-2">
          <button
            onClick={sendMessage}
            disabled={!isConnected}
            aria-label="Send WebSocket message"
            className={`
              flex items-center justify-center gap-2 px-4 py-2.5 border-none rounded-lg
              font-semibold text-sm transition-all duration-150 cursor-pointer
              focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none
              ${isConnected
                ? 'bg-note text-white hover:bg-note/90'
                : 'bg-surface-elevated text-txt-3 opacity-40 cursor-default'
              }
            `}
          >
            <Send size={14} /> Send
          </button>
          <button
            onClick={validateJSON}
            aria-label="Validate JSON payload"
            className={`
              flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-card
              border border-line rounded-lg cursor-pointer text-[11px] font-medium
              transition-all duration-150
              focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none
              ${jsonValid === true ? 'text-ok border-ok/30' :
                jsonValid === false ? 'text-fail border-fail/30' : 'text-txt-2'}
            `}
          >
            {jsonValid === true ? <Check size={12} /> : jsonValid === false ? <X size={12} /> : <FileJson size={12} />}
            {jsonValid === true ? 'Valid' : jsonValid === false ? 'Invalid' : 'Validate'}
          </button>
        </div>
      </div>

      {/* ── Log Controls ── */}
      <div className="flex gap-2 mb-3 items-center">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3 pointer-events-none"
          />
          <input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter messages…"
            aria-label="Filter WebSocket messages"
            className="w-full pl-8 pr-3 py-2 bg-surface-card text-txt border border-line rounded-lg text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          />
        </div>
        <button
          onClick={() => setAutoScroll((p) => !p)}
          title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          aria-label={`Auto-scroll ${autoScroll ? 'enabled' : 'disabled'}`}
          aria-pressed={autoScroll}
          className={`
            w-9 h-9 flex items-center justify-center bg-surface-card border border-line
            rounded-lg cursor-pointer transition-all
            focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none
            ${autoScroll ? 'text-ok' : 'text-txt-3'}
          `}
        >
          {autoScroll ? <ChevronsDown size={16} /> : <ChevronsUp size={16} />}
        </button>
        <button
          onClick={clearLog}
          aria-label="Clear message log"
          className="w-9 h-9 flex items-center justify-center bg-surface-card border border-line rounded-lg cursor-pointer text-txt-3 hover:text-fail transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* ── Message Log ── */}
      <div
        className="flex-1 overflow-y-auto bg-surface-card rounded-xl border border-line p-3"
        role="log"
        aria-label="WebSocket message log"
        aria-live="polite"
      >
        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-txt-3">
            <Cable size={36} strokeWidth={1} className="mb-3 opacity-30" />
            <span className="text-sm">No messages yet</span>
          </div>
        )}

        {filteredMessages.map((msg, i) => {
          const ts = formatTime(msg.time);

          /* System event */
          if (msg.type === 'system') {
            return (
              <div
                key={i}
                className={`text-center py-1.5 text-[11px] italic animate-fade ${msg.isError ? 'text-fail' : 'text-txt-3'}`}
              >
                <span className="mr-2 font-mono text-[10px]">{ts}</span>
                {msg.content}
              </div>
            );
          }

          /* IN / OUT message */
          const isIn = msg.type === 'in';
          let formattedContent;
          try {
            formattedContent = JSON.stringify(JSON.parse(msg.content), null, 2);
          } catch {
            formattedContent = msg.content;
          }

          return (
            <div
              key={i}
              className={`flex mb-2 animate-slide-right ${isIn ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`
                  max-w-[90%] sm:max-w-[80%] px-3 py-2 rounded-lg border-l-[3px]
                  ${isIn ? 'bg-ok/10 border-l-ok' : 'bg-note/10 border-l-note'}
                `}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className={`text-[10px] font-bold font-mono uppercase ${isIn ? 'text-ok' : 'text-note'}`}>
                    {isIn ? 'IN' : 'OUT'}
                  </span>
                  <span className="text-[10px] text-txt-3 font-mono">{ts}</span>
                </div>
                <pre className="font-mono text-xs leading-relaxed text-txt whitespace-pre-wrap break-words m-0">
                  {formattedContent}
                </pre>
              </div>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
