import { AlertTriangle, X } from 'lucide-react';

export default function CorsToast({ visible, onClose, onEnableProxy }) {
  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 right-4 z-50 max-w-[90vw] sm:max-w-[380px] bg-surface-elevated border border-warn rounded-xl p-4 sm:p-5 animate-toast"
      style={{ boxShadow: '0 8px 32px rgba(245,158,11,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle
          size={20}
          className="text-warn shrink-0 animate-shake"
          aria-hidden="true"
        />
        <span className="font-semibold text-sm text-txt">CORS Error Detected</span>
        <button
          onClick={onClose}
          aria-label="Dismiss CORS warning"
          className="ml-auto text-txt-3 hover:text-txt transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <X size={16} />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-txt-2 leading-relaxed mb-3">
        The request was blocked by the browser&apos;s CORS policy. Enable the CORS
        Proxy in the sidebar settings to route requests through a reverse proxy.
      </p>

      {/* Action Button */}
      <button
        onClick={onEnableProxy}
        className="w-full sm:w-auto px-4 py-2 bg-warn/15 text-warn border border-warn rounded-lg cursor-pointer font-semibold text-sm animate-breathe transition-all duration-150 hover:bg-warn/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warn"
      >
        Enable CORS Proxy
      </button>
    </div>
  );
}
