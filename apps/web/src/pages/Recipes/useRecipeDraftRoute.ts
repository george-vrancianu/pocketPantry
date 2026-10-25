import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecipeDraft, type RecipeDraftView } from '../../lib/recipeDrafts';

/** The query parameter that carries the Recipe Draft id once it exists, so a reload resumes it. */
export const DRAFT_PARAM = 'draft';

/**
 * A form page's relation to the `draft` URL parameter (ADR 0028): which form
 * instance to show, the Recipe Draft to resume, and putting a new id in the URL.
 * Render the form with `key={formKey}` once `loading` and `error` are clear.
 */
export function useRecipeDraftRoute(): {
  formKey: string;
  /** The Recipe Draft to open the form on; undefined for a blank or supplied form. */
  resumed: RecipeDraftView | undefined;
  loading: boolean;
  error: unknown;
  /** Call with the id once it exists: puts it in the URL by replacing the entry. */
  onDraftId: (id: string) => void;
} {
  const location = useLocation();
  const navigate = useNavigate();
  const draftParam = new URLSearchParams(location.search).get(DRAFT_PARAM);
  // `own` is the Recipe Draft this form created itself (it already holds it).
  // A new navigation (even to this same route) starts the form afresh, but not our own `draft` param.
  const [formInstance, setFormInstance] = useState({
    key: location.key,
    seen: location.key,
    own: null as string | null,
  });
  if (formInstance.seen !== location.key) {
    const ours = formInstance.own !== null && draftParam === formInstance.own;
    setFormInstance({
      key: ours ? formInstance.key : location.key,
      seen: location.key,
      own: ours ? formInstance.own : null,
    });
  }
  const resumeId =
    draftParam !== null && draftParam !== formInstance.own ? draftParam : null;
  const resuming = useRecipeDraft(resumeId, formInstance.key);
  return {
    formKey: formInstance.key,
    resumed: resumeId !== null ? resuming.data : undefined,
    loading: resumeId !== null && !resuming.data && !resuming.error,
    error: resumeId !== null ? resuming.error : null,
    onDraftId: (id) => {
      if (id === draftParam) return;
      setFormInstance((current) => ({ ...current, own: id }));
      // Replace: the Recipe Draft is the same page, not a new step in the history.
      const search = new URLSearchParams(location.search);
      search.set(DRAFT_PARAM, id);
      navigate(
        { pathname: location.pathname, search: `?${search}` },
        { replace: true, state: location.state },
      );
    },
  };
}
