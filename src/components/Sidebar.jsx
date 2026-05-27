import { Trash2, Clock, Settings, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { METHOD_CONFIG, formatTime } from '../utils/helpers';

export default function Sidebar({
  history,
  onSelectItem,
  onClear,
  settings,
  onSettingsChange,
  isOpen,
  onClose,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[300px] lg:w-[260px]
          bg-surface-sidebar border-r border-line
          flex flex-col transition-transform duration-300 ease-in-out
          lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
        role="complementary"
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-line">
          <img
            src="/logo.svg"
            alt="HitPoints logo"
            className="w-8 h-8 shrink-0"
          />
          <span
            className="font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            HitPoints
          </span>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-txt-3 hover:text-txt transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── History List ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-[11px] font-semibold text-txt-3 uppercase tracking-widest">
              History ({history.length})
            </span>
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="flex items-center gap-1 text-[11px] text-txt-3 hover:text-fail transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                aria-label="Clear all history"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          {/* History cards */}
          <ul className="space-y-1.5" role="list">
            {history.map((item, i) => {
              const isWs = item.type === 'WS';
              const mc = isWs ? null : METHOD_CONFIG[item.method];
              const badgeClasses = isWs
                ? 'bg-warn/15 text-warn'
                : `${mc?.bgDim || ''} ${mc?.text || ''}`;
              const label = isWs ? 'WS' : item.method;
              const displayUrl = item.url.length > 24 ? item.url.substring(0, 24) + '…' : item.url;

              return (
                <li key={`${item.timestamp}-${i}`}>
                  <button
                    onClick={() => { onSelectItem(item); onClose(); }}
                    className="
                      w-full flex items-center gap-3 p-2.5 rounded-lg
                      bg-surface-card border border-line cursor-pointer
                      text-left shimmer-hover
                      transition-all duration-150
                      hover:border-line-2 hover:-translate-y-px
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                    "
                    style={{ animation: `slideInLeft 250ms ease-out ${i * 40}ms both` }}
                    aria-label={`${label} ${item.url}`}
                  >
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md shrink-0 ${badgeClasses}`}>
                      {label}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-txt truncate">{displayUrl}</div>
                      <div className="text-[10px] text-txt-3 mt-0.5">{formatTime(item.timestamp)}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {history.length === 0 && (
            <div className="flex flex-col items-center py-10 text-txt-3 text-xs">
              <Clock size={24} strokeWidth={1} className="mb-2 opacity-30" />
              <span>No requests yet</span>
            </div>
          )}
        </div>

        {/* ── Settings ── */}
        <div className="px-4 py-4 border-t border-line">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={14} className="text-txt-3" />
            <span className="text-[11px] font-semibold text-txt-3 uppercase tracking-widest">
              Settings
            </span>
          </div>

          {/* CORS Proxy Toggle */}
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="cors-toggle" className="text-xs text-txt-2 cursor-pointer">
              CORS Proxy
            </label>
            <button
              id="cors-toggle"
              onClick={() => onSettingsChange({ ...settings, corsProxy: !settings.corsProxy })}
              className="transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              role="switch"
              aria-checked={settings.corsProxy}
              aria-label="Toggle CORS proxy"
            >
              {settings.corsProxy
                ? <ToggleRight size={28} className="text-ok" />
                : <ToggleLeft size={28} className="text-txt-3" />
              }
            </button>
          </div>

          {/* Proxy URL input — slides down */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: settings.corsProxy ? '50px' : '0px' }}
          >
            <input
              value={settings.proxyUrl}
              onChange={(e) => onSettingsChange({ ...settings, proxyUrl: e.target.value })}
              placeholder="https://cors-proxy.example/"
              aria-label="CORS proxy URL"
              className="w-full px-2.5 py-2 bg-surface-card text-txt border border-line rounded-lg text-[11px] font-mono outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none focus-visible:border-accent/40 transition-colors"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
