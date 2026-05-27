import { useCountUp } from '../hooks/useCountUp';

export default function ResponseStats({ status, timeMs, sizeBytes }) {
  const animStatus = useCountUp(status, 500);
  const animTime = useCountUp(timeMs, 700);
  const animSize = useCountUp(sizeBytes, 800);

  const statusColor =
    status >= 500 ? 'fail' :
    status >= 400 ? 'warn' : 'ok';

  const statusBg = {
    ok: 'bg-ok/15',
    warn: 'bg-warn/15',
    fail: 'bg-fail/15',
  }[statusColor];

  const statusText = {
    ok: 'text-ok',
    warn: 'text-warn',
    fail: 'text-fail',
  }[statusColor];

  const statusBarBg = {
    ok: 'bg-ok',
    warn: 'bg-warn',
    fail: 'bg-fail',
  }[statusColor];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"
      role="group"
      aria-label="Response statistics"
    >
      {/* Status Card */}
      <div
        className={`relative overflow-hidden rounded-xl border border-line p-3.5 backdrop-blur-lg animate-slide-up ${statusBg}`}
        aria-label={`Status code: ${status}`}
      >
        <div className="text-[11px] text-txt-2 font-medium uppercase tracking-wider mb-1">
          Status
        </div>
        <div className={`text-2xl sm:text-3xl font-bold font-mono ${statusText}`}>
          {animStatus}
        </div>
        <div className={`stat-progress ${statusBarBg}`} />
      </div>

      {/* Time Card */}
      <div
        className="relative overflow-hidden rounded-xl border border-line p-3.5 backdrop-blur-lg bg-note/15 animate-slide-up"
        style={{ animationDelay: '100ms' }}
        aria-label={`Response time: ${timeMs} milliseconds`}
      >
        <div className="text-[11px] text-txt-2 font-medium uppercase tracking-wider mb-1">
          Time
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-note">
          {animTime}
          <span className="text-sm ml-1 text-txt-3">ms</span>
        </div>
        <div className="stat-progress bg-note" style={{ animationDelay: '100ms' }} />
      </div>

      {/* Size Card */}
      <div
        className="relative overflow-hidden rounded-xl border border-line p-3.5 backdrop-blur-lg glass-card animate-slide-up"
        style={{ animationDelay: '200ms' }}
        aria-label={`Response size: ${sizeBytes} bytes`}
      >
        <div className="text-[11px] text-txt-2 font-medium uppercase tracking-wider mb-1">
          Size
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-txt">
          {animSize}
          <span className="text-sm ml-1 text-txt-3">B</span>
        </div>
        <div className="stat-progress bg-txt-2" style={{ animationDelay: '200ms' }} />
      </div>
    </div>
  );
}
