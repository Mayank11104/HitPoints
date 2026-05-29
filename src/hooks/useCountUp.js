import { useState, useEffect, useRef } from 'react';

/**
 * Hook that animates a number counting from 0 to `target` using requestAnimationFrame.
 * Uses cubic ease-out for a satisfying deceleration effect.
 *
 * State reset uses the React-recommended "adjusting state during rendering" pattern
 * to avoid synchronous setState inside effects.
 * @see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0);
  const [prevTarget, setPrevTarget] = useState(undefined);
  const rafRef = useRef(null);

  // React-recommended pattern: adjust state during render when props change
  if (target !== prevTarget) {
    setPrevTarget(target);
    if (target === null || target === undefined) {
      setValue(0);
    }
  }

  useEffect(() => {
    if (target === null || target === undefined) {
      return;
    }

    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
