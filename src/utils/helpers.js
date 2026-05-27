/**
 * JSON syntax highlighting — returns HTML string with colored spans.
 * Colors reference the design tokens defined in index.css @theme.
 */
export function highlightJSON(json) {
  if (!json) return '';
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let color = 'var(--color-syn-num)';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          color = 'var(--color-syn-key)';
          match = match.replace(/:$/, '');
          return `<span style="color:${color}">${match}</span>:`;
        } else {
          color = 'var(--color-syn-str)';
        }
      } else if (/true|false/.test(match)) {
        color = 'var(--color-syn-bool)';
      } else if (/null/.test(match)) {
        color = 'var(--color-syn-null)';
      }
      return `<span style="color:${color}">${match}</span>`;
    }
  );
}

export function prettyJSON(str) {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

/**
 * Method configuration with Tailwind v4 class mappings.
 * All class names are full literal strings so Tailwind's scanner detects them.
 */
export const METHOD_CONFIG = {
  GET: {
    label: 'GET',
    hex: '#3B82F6',
    text: 'text-method-get',
    bg: 'bg-method-get',
    bgDim: 'bg-method-get/15',
    border: 'border-method-get/40',
    ring: 'ring-method-get/30',
    shadow: '0 0 8px rgba(59,130,246,0.3)',
  },
  POST: {
    label: 'POST',
    hex: '#10B981',
    text: 'text-method-post',
    bg: 'bg-method-post',
    bgDim: 'bg-method-post/15',
    border: 'border-method-post/40',
    ring: 'ring-method-post/30',
    shadow: '0 0 8px rgba(16,185,129,0.3)',
  },
  PUT: {
    label: 'PUT',
    hex: '#F59E0B',
    text: 'text-method-put',
    bg: 'bg-method-put',
    bgDim: 'bg-method-put/15',
    border: 'border-method-put/40',
    ring: 'ring-method-put/30',
    shadow: '0 0 8px rgba(245,158,11,0.3)',
  },
  DELETE: {
    label: 'DELETE',
    hex: '#EF4444',
    text: 'text-method-delete',
    bg: 'bg-method-delete',
    bgDim: 'bg-method-delete/15',
    border: 'border-method-delete/40',
    ring: 'ring-method-delete/30',
    shadow: '0 0 8px rgba(239,68,68,0.3)',
  },
  PATCH: {
    label: 'PATCH',
    hex: '#A855F7',
    text: 'text-method-patch',
    bg: 'bg-method-patch',
    bgDim: 'bg-method-patch/15',
    border: 'border-method-patch/40',
    ring: 'ring-method-patch/30',
    shadow: '0 0 8px rgba(168,85,247,0.3)',
  },
};

export const METHODS = Object.keys(METHOD_CONFIG);

/**
 * Returns a formatted timestamp string from a Date.now() value.
 */
export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
