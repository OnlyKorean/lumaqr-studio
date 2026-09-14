import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { DesignDoc } from '../types/design';
import { loadCurrent, saveCurrent } from '../lib/storage';
import { makeDemoDoc } from '../lib/demo';

/**
 * Design state with undo/redo.
 * History granularity: rapid changes to the *same field* (typing, dragging a
 * slider) collapse into one step; switching fields or using a discrete control
 * always starts a new step. Cap: last 20 states.
 */

const HISTORY_CAP = 20;
const COALESCE_MS = 600;

interface HistState {
  present: DesignDoc;
  past: DesignDoc[];
  future: DesignDoc[];
  lastKey: string;
  lastT: number;
}

type Action =
  | { type: 'set'; key: string; force?: boolean; next: DesignDoc }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'load'; doc: DesignDoc };

function reducer(s: HistState, a: Action): HistState {
  switch (a.type) {
    case 'set': {
      const now = Date.now();
      const next = { ...a.next, updatedAt: now };
      const coalesce = !a.force && a.key === s.lastKey && now - s.lastT < COALESCE_MS;
      if (coalesce) {
        return { ...s, present: next, lastT: now };
      }
      if (next === s.present) return s;
      return {
        present: next,
        past: [...s.past, s.present].slice(-HISTORY_CAP),
        future: [],
        lastKey: a.key,
        lastT: now,
      };
    }
    case 'undo': {
      if (s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1];
      return {
        present: prev,
        past: s.past.slice(0, -1),
        future: [s.present, ...s.future].slice(0, HISTORY_CAP),
        lastKey: '',
        lastT: 0,
      };
    }
    case 'redo': {
      if (s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      return {
        present: next,
        past: [...s.past, s.present].slice(-HISTORY_CAP),
        future: rest,
        lastKey: '',
        lastT: 0,
      };
    }
    case 'load':
      return { present: a.doc, past: [], future: [], lastKey: '', lastT: 0 };
  }
}

interface DesignStoreValue {
  doc: DesignDoc;
  canUndo: boolean;
  canRedo: boolean;
  undoDepth: number;
  /** Apply an update. `key` identifies the field (for history coalescing). */
  set: (mutate: (d: DesignDoc) => DesignDoc, opts?: { key?: string; force?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  load: (doc: DesignDoc) => void;
}

const Ctx = createContext<DesignStoreValue | null>(null);

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): HistState => {
    const present = loadCurrent() ?? makeDemoDoc();
    return { present, past: [], future: [], lastKey: '', lastT: 0 };
  });
  const timer = useRef<number | undefined>(undefined);

  // Persist the working design so a refresh keeps everything.
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => saveCurrent(state.present), 250);
    return () => window.clearTimeout(timer.current);
  }, [state.present]);

  const value = useMemo<DesignStoreValue>(
    () => ({
      doc: state.present,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      undoDepth: state.past.length,
      set: (mutate, opts) => {
        dispatch({ type: 'set', key: opts?.key ?? 'general', force: opts?.force, next: mutate(state.present) });
      },
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
      load: (doc) => dispatch({ type: 'load', doc }),
    }),
    [state],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDesign(): DesignStoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDesign must be used inside <DesignProvider>');
  return v;
}
