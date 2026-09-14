import { useEffect } from 'react';

interface ShortcutHandlers {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
}

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/**
 * Global editor shortcuts:
 *  Ctrl/Cmd+Z        undo      (skipped while typing — native text undo wins)
 *  Ctrl/Cmd+Shift+Z  redo      (also Ctrl/Cmd+Y)
 *  Ctrl/Cmd+S        save design
 *  Ctrl/Cmd+E        focus export panel
 */
export function useShortcuts(h: ShortcutHandlers): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        if (isEditable(e.target)) return;
        e.preventDefault();
        h.onUndo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        if (isEditable(e.target)) return;
        e.preventDefault();
        h.onRedo();
      } else if (key === 's') {
        e.preventDefault();
        h.onSave();
      } else if (key === 'e') {
        e.preventDefault();
        h.onExport();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [h.onUndo, h.onRedo, h.onSave, h.onExport]);
}
