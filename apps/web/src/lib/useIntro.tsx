import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addSetupCounts,
  INTRO_PATHS,
  NO_SETUP_COUNTS,
  type LanguagePicks,
  type SetupCounts,
} from './intro';
import { useMarkIntroDone } from './settings';

type IntroApi = {
  /** What Setup really saved in this visit; in memory only, so it starts from zero when Setup resumes. */
  counts: SetupCounts;
  /** Add what a Setup save just wrote. */
  recordSaved: (saved: Partial<SetupCounts>) => void;
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
  const [setupStarted, setSetupStarted] = useState(false);
  const [unsavedLanguages, setUnsavedLanguages] =
    useState<LanguagePicks | null>(null);
  const { mutate } = markDone;

  const recordSaved = useCallback(
    (saved: Partial<SetupCounts>) =>
      setCounts((now) => addSetupCounts(now, saved)),
    [],
  );
  const resumeSetup = useCallback(() => {
    setCounts(NO_SETUP_COUNTS);
    setSetupStarted(false);
  }, []);
  const startSetup = useCallback(() => setSetupStarted(true), []);
  const finishIntro = useCallback(
    () =>
      mutate(undefined, {
        onSuccess: () => navigate(INTRO_PATHS.dashboard, { replace: true }),
      }),
    [mutate, navigate],
  );

  const api = useMemo<IntroApi>(
    () => ({
      counts,
      recordSaved,
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
