import { describe, expect, it } from 'vitest';
import { THEME_IDS as API_THEME_IDS } from '../../../../apps/api/src/settings/settings.schemas';
import { THEME_IDS } from './themes';

describe('Theme ids', () => {
  // The API keeps its own copy to validate a saved Theme; the two must not drift.
  it('match the ids the API accepts as a Member Preference', () => {
    expect([...API_THEME_IDS]).toEqual([...THEME_IDS]);
  });
});
