import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addSetupCounts,
  advanceFrom,
  INTRO_PATHS,
  introPath,
  type IntroStep,
  NO_SETUP_COUNTS,
  type LanguagePicks,
  type SetupCounts,
} from './intro';
import { useMarkIntroDone } from './settings';

type IntroApi = {
  /** What Setup really saved in this visit; in memory only, so it starts from zero when Setup resumes. */
  counts: SetupCounts;
  /**
   * Add what a Setup save just wrote. Name the `step` it happened in so `useAutoAdvance` knows that step
   * saved something (even a save that wrote no Batch or Shopping Item).
   */
  recordSaved: (saved: Partial<SetupCounts>, step?: IntroStep) => void;
  /** The steps where something was saved in this visit; in memory only. */
  savedSteps: ReadonlySet<IntroStep>;
  /** Called by Set up or skip: a new visit to Setup starts counting from zero. */
  resumeSetup: () => void;
  /** The Member chose "Show me how": the Scan screen may be used from Setup. */
  setupStarted: boolean;
  startSetup: () => void;
  /** Picks that sign-up could not save, so Set up or skip can say what the Member chose; in memory only. */
  unsavedLanguages: LanguagePicks | null;
  setUnsavedLanguages: (picks: LanguagePicks | null) => void;
  /** Reach the Dashboard from the Intro: marks the Member done, then goes there. */
  finishIntro: () => void;
  finishing: boolean;
  finishError: Error | null;
};

const IntroContext = createContext<IntroApi | null>(null);

/** Holds the Intro's in-memory state for one visit. Mounted once, inside the router and query provider. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const markDone = useMarkIntroDone();
  const [counts, setCounts] = useState(NO_SETUP_COUNTS);
  const [savedSteps, setSavedSteps] = useState<ReadonlySet<IntroStep>>(
    new Set(),
  );
  const [setupStarted, setSetupStarted] = useState(false);
  const [unsavedLanguages, setUnsavedLanguages] =
    useState<LanguagePicks | null>(null);
  const { mutate } = markDone;

  const recordSaved = useCallback(
    (saved: Partial<SetupCounts>, step?: IntroStep) => {
      setCounts((now) => addSetupCounts(now, saved));
      if (step) setSavedSteps((now) => new Set(now).add(step));
    },
    [],
  );
  const resumeSetup = useCallback(() => {
    setCounts(NO_SETUP_COUNTS);
    setSavedSteps(new Set());
    setSetupStarted(false);
  }, []);
  const startSetup = useCallback(() => setSetupStarted(true), []);
  const finishIntro = useCallback(
    () =>
      mutate(undefined, {
        onSuccess: () => {
          // Setup is over: the Scan screen is the normal one again.
          setSetupStarted(false);
          navigate(INTRO_PATHS.dashboard, { replace: true });
        },
      }),
    [mutate, navigate],
  );

  const api = useMemo<IntroApi>(
    () => ({
      counts,
      recordSaved,
      savedSteps,
      resumeSetup,
      setupStarted,
      startSetup,
      unsavedLanguages,
      setUnsavedLanguages,
      finishIntro,
      finishing: markDone.isPending,
      finishError: markDone.error,
    }),
    [
      counts,
      recordSaved,
      savedSteps,
      resumeSetup,
      setupStarted,
      startSetup,
      unsavedLanguages,
      finishIntro,
      markDone.isPending,
      markDone.error,
    ],
  );
  return <IntroContext.Provider value={api}>{children}</IntroContext.Provider>;
}

export function useIntro(): IntroApi {
  const api = useContext(IntroContext);
  if (!api) throw new Error('useIntro needs an IntroProvider');
  return api;
}

/**
 * The auto-advance rule (`advanceFrom` in `intro.ts`) for a step that holds a collection: when `empty`
 * turns true and a save was recorded for `step`, goes on to the next step (replacing this one in the
 * history). Returns whether it is moving on, so the screen can render nothing meanwhile. Use it on any
 * screen of the step: Snap's overview now, Say it's Voice Inbox later.
 */
export function useAutoAdvance(step: IntroStep, empty: boolean): boolean {
  const navigate = useNavigate();
  const { savedSteps } = useIntro();
  const to = advanceFrom(step, { empty, savedHere: savedSteps.has(step) });
  useEffect(() => {
    if (to) navigate(introPath(to), { replace: true });
  }, [to, navigate]);
  return to !== null;
}
