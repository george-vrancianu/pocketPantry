/** The query parameter that carries the Recipe Draft id once it exists, so a reload resumes it. */
export const DRAFT_PARAM = 'draft';

/** The search parameter that holds the "From a link" sheet open: the old "From a link" route redirects to it. */
export const FROM_LINK_PARAM = 'fromLink';

/** The search parameter that holds the "From text" sheet open. */
export const FROM_TEXT_PARAM = 'fromText';

/** The state "Paste text instead" hands the Recipes page: open "From text", naming the site and replacing the failed read. */
export const FROM_TEXT_PREFILL_STATE = 'fromTextPrefill';
