import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  useCreateRecipeDraft,
  useUpdateRecipeDraft,
  type RecipeDraftContent,
  type RecipeDraftKind,
} from './recipeDrafts';

/** Quiet time after the last edit before it is sent. */
export const AUTOSAVE_DELAY_MS = 1500;

export type AutosaveStatus = 'idle' | 'saving' | 'saved';

export type AutosaveOptions = {
  /** What the Recipe Draft is for, and (for a Variant) its base. Fixed once it exists. */
  kind: RecipeDraftKind;
  baseRecipeId: string | null;
  /** The form as it is now, in the API's content shape (`contentOfForm`). */
  content: RecipeDraftContent;
  /**
   * The content of the untouched form: no Recipe Draft exists until `content`
   * differs from it. Null when the form starts with something to keep (a
   * supplied fill), which then creates one on its first save.
   */
  blank: RecipeDraftContent | null;
  /** False keeps the form out of autosave (the default is on). */
  enabled?: boolean;
  /** A Recipe Draft being resumed: the form already holds its content. */
  resumed?: { id: string; version: number };
};

export type Autosave = {
  status: AutosaveStatus;
  /** The Recipe Draft's id once it exists. */
  draftId: string | null;
  /** Sends what is pending now (after a request in flight); resolves to the Recipe Draft id, or null if there is none. Never rejects. */
  flush: () => Promise<string | null>;
  /** The Recipe is being created: send nothing until `resume` (a Recipe Draft being consumed must not be updated). */
  pause: () => void;
  /** The create failed: carry on, sending whatever changed meanwhile. */
  resume: () => void;
  /** The Recipe was saved and ended the Recipe Draft: send nothing more. */
  stop: () => void;
};

/**
 * Keeps the form as a Recipe Draft on the server (ADR 0028): created on the
 * first real content, then updated `AUTOSAVE_DELAY_MS` after the last edit,
 * one request at a time (edits made meanwhile go out together afterwards),
 * and flushed when the form unmounts and on `pagehide` (that one with `keepalive`: the browser caps such a body at 64 KB, and an edit queued behind a request in flight is lost at unload).
 */
export function useRecipeDraftAutosave(options: AutosaveOptions): Autosave {
  const create = useCreateRecipeDraft();
  const update = useUpdateRecipeDraft();
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [draftId, setDraftId] = useState<string | null>(
    options.resumed?.id ?? null,
  );
  const json = JSON.stringify(options.content);
  const latest = useRef(options);
  const writes = useRef({
    create: create.mutateAsync,
    update: update.mutateAsync,
  });
  // Before any other effect of this render reads them.
  useLayoutEffect(() => {
    latest.current = options;
    writes.current = { create: create.mutateAsync, update: update.mutateAsync };
  });

  const run = useRef({
    id: options.resumed?.id ?? null,
    version: options.resumed?.version ?? 0,
    // The JSON last known to be on the server; a resumed form starts equal to it.
    sent: options.resumed ? json : (null as string | null),
    busy: null as Promise<void> | null,
    again: false,
    timer: null as ReturnType<typeof setTimeout> | null,
    stopped: false,
    paused: false,
  });

  const isUnchanged = (current: string) => {
    const state = run.current;
    if (latest.current.enabled === false) return true;
    if (current === state.sent) return true;
    const blank = latest.current.blank;
    return (
      state.id === null && blank !== null && current === JSON.stringify(blank)
    );
  };

  const drain = useCallback((keepalive = false): Promise<void> => {
    const state = run.current;
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
    if (state.stopped || state.paused) return Promise.resolve();
    if (state.busy) {
      // Something is in flight: send the newest right after it.
      state.again = true;
      return state.busy;
    }
    const send = async () => {
      try {
        do {
          state.again = false;
          const { content, kind, baseRecipeId } = latest.current;
          const sending = JSON.stringify(content);
          if (state.stopped || isUnchanged(sending)) break;
          setStatus('saving');
          if (state.id === null) {
            const made = await writes.current.create({
              kind,
              baseRecipeId,
              content,
              keepalive,
            });
            state.id = made.id;
            state.version = made.version;
            setDraftId(made.id);
          } else {
            const saved = await writes.current.update({
              id: state.id,
              version: state.version,
              content,
              keepalive,
            });
            state.version = saved.version;
          }
          state.sent = sending;
        } while (state.again);
        if (!state.stopped) {
          setStatus(
            isUnchanged(JSON.stringify(latest.current.content))
              ? 'saved'
              : 'saving',
          );
        }
      } catch {
        // Failure handling (notice, retry, conflicts) is not here yet.
        setStatus('idle');
      }
    };
    // Cleared after the assignment, even when `send` finishes without waiting.
    state.busy = send().finally(() => {
      state.busy = null;
    });
    return state.busy;
  }, []);

  // Each edit restarts the quiet period.
  const schedule = useCallback(() => {
    const state = run.current;
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
    if (state.stopped || state.paused) return;
    if (isUnchanged(JSON.stringify(latest.current.content))) {
      // Back to what the server holds (or to blank): nothing is pending any more.
      if (!state.busy) {
        setStatus((now) =>
          now === 'saving' ? (state.id ? 'saved' : 'idle') : now,
        );
      }
      return;
    }
    setStatus('saving');
    state.timer = setTimeout(() => {
      state.timer = null;
      void drain();
    }, AUTOSAVE_DELAY_MS);
  }, [drain]);
  useEffect(schedule, [json, schedule]);

  // Leaving the form sends what is pending; so does the page going away, which must outlive it.
  useEffect(() => {
    const onHide = () => void drain(true);
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      void drain();
    };
  }, [drain]);

  const flush = useCallback(async () => {
    await drain();
    return run.current.id;
  }, [drain]);

  const stop = useCallback(() => {
    const state = run.current;
    state.stopped = true;
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
  }, []);

  const pause = useCallback(() => {
    const state = run.current;
    state.paused = true;
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
  }, []);

  const resume = useCallback(() => {
    run.current.paused = false;
    schedule();
  }, [schedule]);

  return { status, draftId, flush, pause, resume, stop };
}
