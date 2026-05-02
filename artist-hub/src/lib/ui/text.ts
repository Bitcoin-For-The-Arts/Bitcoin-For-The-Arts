export function insertAtCursor(
  el: HTMLTextAreaElement | HTMLInputElement | null,
  value: string,
  insert: string,
): string {
  const v = value ?? '';
  const ins = insert ?? '';
  if (!ins) return v;

  if (!el) return v + ins;

  const start = typeof el.selectionStart === 'number' ? el.selectionStart : v.length;
  const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : v.length;
  const next = v.slice(0, start) + ins + v.slice(end);

  // Keep the caret right after the inserted emoji.
  queueMicrotask(() => {
    try {
      el.focus();
      const pos = start + ins.length;
      el.setSelectionRange(pos, pos);
    } catch {
      // ignore
    }
  });

  return next;
}

