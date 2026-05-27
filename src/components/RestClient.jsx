import { useState, useCallback, useEffect } from 'react';
import {
  Send, Plus, Minus, FileJson, Copy, Globe, Check,
} from 'lucide-react';
import { METHOD_CONFIG, METHODS, highlightJSON, prettyJSON } from '../utils/helpers';
import ResponseStats from './ResponseStats';
import CorsToast from './CorsToast';

export default function RestClient({ settings, onHistoryAdd, fillData }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [restTab, setRestTab] = useState('headers');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(null);
  const [showCorsToast, setShowCorsToast] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fill form from history selection
  useEffect(() => {
    if (fillData && fillData.type === 'REST') {
      setMethod(fillData.method || 'GET');
      setUrl(fillData.url || '');
      setHeaders(fillData.headers?.length ? fillData.headers : [{ key: '', value: '' }]);
      setBody(fillData.body || '');
      setResponse(null);
      setRestTab('headers');
    }
  }, [fillData]);

  const addHeader = () => setHeaders((p) => [...p, { key: '', value: '' }]);
  const removeHeader = (i) => setHeaders((p) => p.filter((_, idx) => idx !== i));
  const updateHeader = (i, field, val) =>
    setHeaders((p) => p.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));

  const formatBody = () => setBody(prettyJSON(body));

  const sendRequest = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResponse(null);
    setFlash(null);
    setShowCorsToast(false);

    const reqHeaders = {};
    headers.forEach((h) => {
      if (h.key.trim()) reqHeaders[h.key.trim()] = h.value;
    });

    const fetchUrl =
      settings.corsProxy && settings.proxyUrl
        ? settings.proxyUrl.replace(/\/+$/, '') + '/' + url
        : url;

    const options = { method, headers: reqHeaders };
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
      options.body = body;
      if (!reqHeaders['Content-Type']) options.headers['Content-Type'] = 'application/json';
    }

    const startTime = performance.now();
    try {
      const res = await fetch(fetchUrl, options);
      const elapsed = Math.round(performance.now() - startTime);
      const text = await res.text();
      const resHeaders = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs: elapsed,
        sizeBytes: new Blob([text]).size,
        body: text,
        headers: resHeaders,
      });
      setFlash('green');
      setRestTab('response');
      setTimeout(() => setFlash(null), 500);
      onHistoryAdd({ type: 'REST', method, url, headers: [...headers], body, timestamp: Date.now() });
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setShowCorsToast(true);
      }
      setResponse({
        status: 0,
        statusText: 'Network Error',
        timeMs: elapsed,
        sizeBytes: 0,
        body: err.message || 'Request failed',
        headers: {},
        isError: true,
      });
      setFlash('red');
      setRestTab('response');
      setTimeout(() => setFlash(null), 500);
    } finally {
      setLoading(false);
    }
  }, [method, url, headers, body, settings, onHistoryAdd]);

  const copyResponse = async () => {
    if (response?.body) {
      await navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const mc = METHOD_CONFIG[method];
  const subTabs = ['headers', 'body', 'response'];

  return (
    <div className="flex flex-col h-full animate-fade">
      {/* ── URL Bar ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        {/* Method selector */}
        <div
          className={`relative ${mc.bgDim} ${mc.text} ${mc.border} border rounded-lg font-mono font-bold text-sm shrink-0`}
        >
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            aria-label="HTTP method"
            className="
              w-full sm:w-[110px] px-3 py-2.5 bg-transparent cursor-pointer
              outline-none font-mono font-bold text-sm
              focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none rounded-lg
            "
            style={{ color: 'inherit' }}
          >
            {METHODS.map((m) => (
              <option key={m} value={m} className="bg-surface-elevated text-txt">{m}</option>
            ))}
          </select>
        </div>

        {/* URL input */}
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
          placeholder="Enter request URL..."
          aria-label="Request URL"
          className="
            flex-1 px-4 py-2.5 bg-surface-card text-txt border border-line rounded-lg
            font-mono text-sm outline-none transition-colors duration-150
            focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none
          "
          style={{ borderColor: undefined }}
        />

        {/* Send button */}
        <button
          onClick={sendRequest}
          disabled={loading}
          aria-label="Send request"
          className={`
            flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5
            text-white border-none rounded-lg cursor-pointer font-bold text-sm
            transition-all duration-150 min-w-[100px]
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none
            disabled:opacity-50 disabled:cursor-default
            ${loading ? 'bg-surface-elevated' : mc.bg}
          `}
          style={{
            animation:
              flash === 'green' ? 'none' : flash === 'red' ? 'shake 400ms ease-in-out' : 'none',
            boxShadow:
              flash === 'green'
                ? '0 0 20px rgba(16,185,129,0.5)'
                : flash === 'red'
                ? '0 0 20px rgba(239,68,68,0.5)'
                : 'none',
          }}
        >
          {loading ? (
            <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-loader" />
          ) : (
            <>
              <Send size={16} /> Send
            </>
          )}
        </button>
      </div>

      {/* ── Sub Tabs ── */}
      <div
        className="flex gap-0 border-b border-line mb-4 overflow-x-auto"
        role="tablist"
        aria-label="Request configuration tabs"
      >
        {subTabs.map((t) => (
          <button
            key={t}
            onClick={() => setRestTab(t)}
            role="tab"
            aria-selected={restTab === t}
            aria-controls={`panel-${t}`}
            className={`
              relative px-4 sm:px-5 py-2.5 bg-transparent border-none cursor-pointer
              text-sm capitalize transition-colors duration-200 whitespace-nowrap
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${restTab === t ? 'text-txt font-semibold' : 'text-txt-3 font-normal hover:text-txt-2'}
            `}
          >
            {t}
            {restTab === t && (
              <div
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded"
                style={{ background: mc.hex }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div
        className="flex-1 overflow-y-auto animate-fade"
        role="tabpanel"
        id={`panel-${restTab}`}
      >
        {/* Headers Tab */}
        {restTab === 'headers' && (
          <div className="space-y-2">
            {headers.map((h, i) => (
              <div
                key={i}
                className="flex gap-2 animate-slide-left"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <input
                  value={h.key}
                  onChange={(e) => updateHeader(i, 'key', e.target.value)}
                  placeholder="Header key"
                  aria-label={`Header ${i + 1} key`}
                  className="flex-1 px-3 py-2 bg-surface-card text-txt border border-line rounded-lg font-mono text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                />
                <input
                  value={h.value}
                  onChange={(e) => updateHeader(i, 'value', e.target.value)}
                  placeholder="Header value"
                  aria-label={`Header ${i + 1} value`}
                  className="flex-[2] px-3 py-2 bg-surface-card text-txt border border-line rounded-lg font-mono text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                />
                <button
                  onClick={() => removeHeader(i)}
                  aria-label={`Remove header ${i + 1}`}
                  className="w-9 h-9 flex items-center justify-center bg-surface-card border border-line rounded-lg cursor-pointer text-fail hover:bg-fail/10 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-card border border-line rounded-lg cursor-pointer text-xs text-txt-2 hover:text-txt hover:border-line-2 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <Plus size={14} /> Add Header
            </button>
          </div>
        )}

        {/* Body Tab */}
        {restTab === 'body' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-end mb-2">
              <button
                onClick={formatBody}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card border border-line rounded-lg cursor-pointer text-xs text-note hover:bg-note/10 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                <FileJson size={14} /> Format JSON
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{ "key": "value" }'
              aria-label="Request body (JSON)"
              className="flex-1 min-h-[200px] p-4 bg-surface-card text-txt border border-line rounded-xl font-mono text-sm leading-relaxed outline-none resize-y transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            />
          </div>
        )}

        {/* Response Tab */}
        {restTab === 'response' && (
          <div>
            {response && (
              <>
                {/* Animated Stats */}
                <ResponseStats
                  key={`${response.timeMs}-${response.status}`}
                  status={response.status}
                  timeMs={response.timeMs}
                  sizeBytes={response.sizeBytes}
                />

                {/* Response Headers */}
                <div className="bg-surface-card rounded-xl border border-line p-4 mb-3 animate-slide-up" style={{ animationDelay: '250ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-txt-2 uppercase tracking-wider">
                      Response Headers
                    </span>
                  </div>
                  <div className="max-h-[120px] overflow-y-auto">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-xs font-mono py-1 border-b border-line last:border-b-0">
                        <span className="text-note min-w-[120px] sm:min-w-[160px] shrink-0 break-all">{k}</span>
                        <span className="text-txt-2 break-all">{v}</span>
                      </div>
                    ))}
                    {Object.keys(response.headers).length === 0 && (
                      <span className="text-xs text-txt-3 italic">
                        No headers available (CORS may restrict visibility)
                      </span>
                    )}
                  </div>
                </div>

                {/* Response Body */}
                <div className="bg-surface-card rounded-xl border border-line p-4 animate-slide-up relative" style={{ animationDelay: '350ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-txt-2 uppercase tracking-wider">
                      Response Body
                    </span>
                    <button
                      onClick={copyResponse}
                      className="flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-line rounded-lg cursor-pointer text-[11px] text-txt-2 hover:text-txt transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                      aria-label="Copy response body"
                    >
                      {copied ? <><Check size={12} className="text-ok" /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <pre
                    dangerouslySetInnerHTML={{ __html: highlightJSON(prettyJSON(response.body)) }}
                    className="font-mono text-xs leading-relaxed text-txt max-h-[400px] overflow-auto whitespace-pre-wrap break-words m-0"
                  />
                </div>
              </>
            )}

            {!response && (
              <div className="flex flex-col items-center justify-center py-16 text-txt-3 animate-fade">
                <Globe size={48} strokeWidth={1} className="mb-4 opacity-30" />
                <span className="text-sm">Send a request to see the response</span>
              </div>
            )}
          </div>
        )}
      </div>

      <CorsToast
        visible={showCorsToast}
        onClose={() => setShowCorsToast(false)}
        onEnableProxy={() => setShowCorsToast(false)}
      />
    </div>
  );
}
