import {
  ASSISTANT_LOCALES,
  assistantMessages,
  assistantSpeech,
  type AssistantLocale,
  type AssistantOutcome,
  type AssistantActionKind,
  type AssistantState,
} from './assistant-speech';

const say = (locale: AssistantLocale, outcomes: AssistantOutcome[]): string =>
  assistantSpeech({ locale, outcomes });

const KINDS: AssistantActionKind[] = [
  'added',
  'quantitySet',
  'alreadyOnList',
  'flaggedRunningLow',
  'addedBecauseRunningLowNoBatch',
  'addedUnmatched',
  'refused',
];
const STATES: AssistantState[] = [
  'capReached',
  'providerFailed',
  'nothingUnderstood',
  'notConfigured',
];

describe('assistantSpeech', () => {
  describe('completeness', () => {
    it('gives every locale exactly the keys of the English messages', () => {
      const keys = (value: Record<string, unknown>): string[] =>
        Object.entries(value)
          .flatMap(([key, v]) =>
            typeof v === 'object' && v !== null
              ? [
                  key,
                  ...keys(v as Record<string, unknown>).map(
                    (k) => `${key}.${k}`,
                  ),
                ]
              : [key],
          )
          .sort();
      for (const locale of ASSISTANT_LOCALES) {
        expect(keys(assistantMessages[locale])).toEqual(
          keys(assistantMessages.en),
        );
      }
    });

    it.each(ASSISTANT_LOCALES)(
      'speaks every outcome and state in %s without placeholders left',
      (locale) => {
        for (const kind of KINDS) {
          const out = say(locale, [{ kind, name: 'X' }]);
          expect(out).toContain('X');
          expect(out).not.toMatch(/[{}]/);
        }
        for (const state of STATES) {
          const out = assistantSpeech({ locale, state });
          expect(out.length).toBeGreaterThan(5);
          expect(out).not.toMatch(/[{}]/);
        }
      },
    );

    it('uses a different sentence for each outcome kind', () => {
      for (const locale of ASSISTANT_LOCALES) {
        const all = KINDS.map((kind) => say(locale, [{ kind, name: 'X' }]));
        expect(new Set(all).size).toBe(KINDS.length);
      }
    });
  });

  describe('locale', () => {
    it('falls back to English for unknown or missing locales', () => {
      const en = say('en', [{ kind: 'added', name: 'milk' }]);
      expect(
        assistantSpeech({
          locale: 'fr',
          outcomes: [{ kind: 'added', name: 'milk' }],
        }),
      ).toBe(en);
      expect(
        assistantSpeech({ outcomes: [{ kind: 'added', name: 'milk' }] }),
      ).toBe(en);
      expect(
        assistantSpeech({
          locale: null,
          outcomes: [{ kind: 'added', name: 'milk' }],
        }),
      ).toBe(en);
    });
  });

  describe('exact wording', () => {
    it('en', () => {
      expect(say('en', [{ kind: 'added', name: 'milk' }])).toBe(
        'Added to your Shopping List: milk.',
      );
      expect(assistantSpeech({ locale: 'en', state: 'capReached' })).toMatch(
        /limit/,
      );
    });
    it('ro', () => {
      expect(say('ro', [{ kind: 'added', name: 'lapte' }])).toBe(
        'Am adăugat pe Lista de cumpărături: lapte.',
      );
    });
    it('da', () => {
      expect(say('da', [{ kind: 'added', name: 'mælk' }])).toBe(
        'Føjet til indkøbslisten: mælk.',
      );
    });
  });

  describe('joining', () => {
    const names = ['a', 'b', 'c', 'd'];
    const items = (n: number): AssistantOutcome[] =>
      names.slice(0, n).map((name) => ({ kind: 'added', name }));

    it.each([
      ['en', 'a', 'a and b', 'a, b, and c'],
      ['ro', 'a', 'a și b', 'a, b și c'],
      ['da', 'a', 'a og b', 'a, b og c'],
    ] as const)('joins 1, 2 and 3+ in %s', (locale, one, two, three) => {
      expect(say(locale, items(1))).toContain(`: ${one}.`);
      expect(say(locale, items(2))).toContain(`: ${two}.`);
      expect(say(locale, items(3))).toContain(`: ${three}.`);
    });

    it('joins same-kind outcomes with quantities ("milk and 2 yogurts")', () => {
      expect(
        say('en', [
          { kind: 'added', name: 'milk' },
          { kind: 'added', name: 'yogurts', quantity: 2 },
        ]),
      ).toBe('Added to your Shopping List: milk and 2 yogurts.');
    });
  });

  describe('quantities and units', () => {
    it('speaks units in words with English plurals', () => {
      const one = say('en', [
        { kind: 'added', name: 'milk', quantity: 1, unit: 'l' },
      ]);
      const two = say('en', [
        { kind: 'added', name: 'milk', quantity: 2, unit: 'l' },
      ]);
      expect(one).toContain('1 litre of milk');
      expect(two).toContain('2 litres of milk');
      expect(
        say('en', [{ kind: 'added', name: 'flour', quantity: 500, unit: 'g' }]),
      ).toContain('500 grams of flour');
      expect(
        say('en', [{ kind: 'added', name: 'rice', quantity: 2, unit: 'kg' }]),
      ).toContain('2 kilograms of rice');
      expect(
        say('en', [
          { kind: 'added', name: 'cream', quantity: 250, unit: 'ml' },
        ]),
      ).toContain('250 millilitres of cream');
    });

    it('counts pieces without a unit word', () => {
      expect(
        say('en', [{ kind: 'added', name: 'eggs', quantity: 6, unit: 'pcs' }]),
      ).toContain('6 eggs');
      expect(
        say('en', [{ kind: 'added', name: 'eggs', quantity: 6 }]),
      ).toContain('6 eggs');
    });

    it('speaks a set quantity as "to <amount>"', () => {
      expect(
        say('en', [
          { kind: 'quantitySet', name: 'milk', quantity: 3, unit: 'l' },
        ]),
      ).toContain('milk to 3 litres');
      expect(
        say('da', [
          { kind: 'quantitySet', name: 'mælk', quantity: 3, unit: 'l' },
        ]),
      ).toContain('mælk til 3 liter');
    });

    it('formats decimals per locale', () => {
      expect(
        say('ro', [{ kind: 'added', name: 'lapte', quantity: 1.5, unit: 'l' }]),
      ).toContain('1,5 litri de lapte');
    });

    it('falls back to the raw code for an unknown unit', () => {
      expect(
        say('en', [{ kind: 'added', name: 'milk', quantity: 2, unit: 'cup' }]),
      ).toContain('2 cup of milk');
    });

    it('does not treat inherited object keys as units', () => {
      expect(
        say('en', [
          { kind: 'added', name: 'milk', quantity: 2, unit: 'constructor' },
        ]),
      ).toContain('2 constructor of milk');
    });

    it('ignores a unit without a quantity', () => {
      expect(say('en', [{ kind: 'added', name: 'milk', unit: 'l' }])).toBe(
        'Added to your Shopping List: milk.',
      );
    });
  });

  describe('Romanian plurals (one / few / other)', () => {
    const litres = (quantity: number): string =>
      say('ro', [{ kind: 'added', name: 'lapte', quantity, unit: 'l' }]);
    const pieces = (quantity: number): string =>
      say('ro', [{ kind: 'added', name: 'mere', quantity, unit: 'pcs' }]);

    it('uses one for 1', () => {
      expect(litres(1)).toContain('1 litru de lapte');
      expect(pieces(1)).toContain('1 mere');
    });
    it('uses few for 2', () => {
      expect(litres(2)).toContain('2 litri de lapte');
      expect(pieces(2)).toContain('2 mere');
    });
    it('uses other, with "de", for 20', () => {
      expect(litres(20)).toContain('20 de litri de lapte');
      expect(pieces(20)).toContain('20 de mere');
    });
    it('treats 12 as few and 100 as other', () => {
      expect(litres(12)).toContain('12 litri');
      expect(litres(100)).toContain('100 de litri');
    });
    it('uses the right gram plurals', () => {
      const g = (quantity: number): string =>
        say('ro', [{ kind: 'added', name: 'făină', quantity, unit: 'g' }]);
      expect(g(1)).toContain('1 gram de făină');
      expect(g(2)).toContain('2 grame de făină');
      expect(g(500)).toContain('500 de grame de făină');
    });
  });

  describe('refused', () => {
    it.each([
      ['en', 'Open Pocket Pantry for', 'eggs and bread'],
      ['ro', 'Deschide Pocket Pantry pentru', 'eggs și bread'],
      ['da', 'Åbn Pocket Pantry for', 'eggs og bread'],
    ] as const)(
      'names the items and points to the app in %s',
      (locale, open, expected) => {
        const out = say(locale, [
          { kind: 'refused', name: 'eggs' },
          { kind: 'refused', name: 'bread' },
        ]);
        expect(out).toBe(`${open} ${expected}.`);
      },
    );
  });

  describe('whole-request states', () => {
    it('differ per state in each locale', () => {
      for (const locale of ASSISTANT_LOCALES) {
        const all = STATES.map((state) => assistantSpeech({ locale, state }));
        expect(new Set(all).size).toBe(STATES.length);
      }
    });
  });

  describe('empty outcomes', () => {
    it.each(ASSISTANT_LOCALES)(
      'reads as "nothing understood" in %s',
      (locale) => {
        expect(say(locale, [])).toBe(
          assistantSpeech({ locale, state: 'nothingUnderstood' }),
        );
      },
    );
  });

  describe('a mixed request', () => {
    it.each(ASSISTANT_LOCALES)(
      'is one sentence mentioning every outcome in %s',
      (locale) => {
        const out = say(locale, [
          { kind: 'added', name: 'milk', quantity: 2, unit: 'l' },
          { kind: 'added', name: 'bread' },
          { kind: 'flaggedRunningLow', name: 'rice' },
          { kind: 'addedUnmatched', name: 'zorblax' },
          { kind: 'refused', name: 'eggs' },
        ]);
        for (const word of ['milk', 'bread', 'rice', 'zorblax', 'eggs']) {
          expect(out).toContain(word);
        }
        expect(out.match(/\./g)).toHaveLength(1);
        expect(out.endsWith('.')).toBe(true);
      },
    );
  });
  // Spec: #459, ADR 0020. Pantry Question answers are spoken before the outcome clauses.
  describe('answers', () => {
    const yes = (name: string): AssistantOutcome => ({ kind: 'yes', name });
    const no = (name: string): AssistantOutcome => ({ kind: 'no', name });

    it('speaks yes and no as sentences of their own', () => {
      expect(say('en', [yes('milk'), no('butter')])).toBe(
        'You have milk. No butter.',
      );
    });

    it('gives each yes its own sentence and groups the nos into one list', () => {
      expect(
        say('en', [yes('milk'), no('butter'), yes('rice'), no('eggs')]),
      ).toBe('You have milk. You have rice. No butter or eggs.');
    });

    it('speaks the answers first, then the outcome clauses', () => {
      expect(say('en', [{ kind: 'added', name: 'eggs' }, yes('milk')])).toBe(
        'You have milk. Added to your Shopping List: eggs.',
      );
    });

    it('is not "nothing understood" when only answers came back', () => {
      expect(say('en', [no('butter')])).not.toBe(
        assistantMessages.en.states.nothingUnderstood,
      );
    });

    it('speaks Romanian', () => {
      expect(say('ro', [yes('lapte'), no('unt'), no('ouă')])).toBe(
        'Ai lapte. Nu ai unt sau ouă.',
      );
    });

    it('speaks Danish', () => {
      expect(say('da', [yes('mælk'), no('smør'), no('æg')])).toBe(
        'Du har mælk. Du har ikke smør eller æg.',
      );
    });

    it('leaves no placeholders in any locale', () => {
      for (const locale of ASSISTANT_LOCALES) {
        expect(say(locale, [yes('X'), no('Y')])).not.toMatch(/[{}]/);
      }
    });
  });

  // Spec: #461. What a yes carries, only expired, and the Shopping List note.
  describe('full answers', () => {
    type Yes = Extract<AssistantOutcome, { kind: 'yes' }>;
    const stock = (details: Partial<Yes>, name = 'milk'): AssistantOutcome => ({
      kind: 'yes',
      name,
      ...details,
    });
    const litres = (quantity: number) => ({ unit: 'l', quantity });

    it('speaks the quantity with its unit', () => {
      expect(say('en', [stock({ totals: [litres(2)] })])).toBe(
        'You have 2 litres of milk.',
      );
    });

    it('uses the singular for one', () => {
      expect(say('en', [stock({ totals: [litres(1)] })])).toBe(
        'You have 1 litre of milk.',
      );
    });

    it('speaks a bare count of pieces without a unit word', () => {
      expect(
        say('en', [stock({ totals: [{ unit: 'pcs', quantity: 6 }] }, 'eggs')]),
      ).toBe('You have 6 eggs.');
    });

    it('reports mixed units separately, never converted', () => {
      expect(
        say('en', [
          stock({
            totals: [litres(1), { unit: 'pcs', quantity: 1 }],
          }),
        ]),
      ).toBe('You have milk: 1 litre and 1 piece.');
    });

    it('speaks the Locations, Expiring Soon and Running low', () => {
      expect(
        say('en', [
          stock({
            totals: [litres(2)],
            locations: ['fridge', 'freezer'],
            expiringSoon: true,
            runningLow: true,
          }),
        ]),
      ).toBe(
        'You have 2 litres of milk in the fridge and in the freezer, some expiring soon, running low.',
      );
    });

    it('speaks Running low alone after a bare yes', () => {
      expect(say('en', [stock({ runningLow: true }, 'salt')])).toBe(
        'You have salt, running low.',
      );
    });

    it('groups only expired into one list', () => {
      expect(
        say('en', [
          { kind: 'onlyExpired', name: 'milk' },
          { kind: 'onlyExpired', name: 'eggs' },
        ]),
      ).toBe('Only expired milk and eggs.');
    });

    it('says which of a no or an only expired are already on the Shopping List', () => {
      expect(
        say('en', [
          { kind: 'no', name: 'butter' },
          { kind: 'no', name: 'rice', onShoppingList: true },
          { kind: 'no', name: 'oil', onShoppingList: true },
          { kind: 'onlyExpired', name: 'milk', onShoppingList: true },
        ]),
      ).toBe(
        'Only expired milk, already on your Shopping List: milk. No butter, rice, or oil, already on your Shopping List: rice and oil.',
      );
    });

    it('speaks yes, only expired and no in that order', () => {
      expect(
        say('en', [
          { kind: 'no', name: 'butter' },
          { kind: 'onlyExpired', name: 'milk' },
          stock({}, 'rice'),
        ]),
      ).toBe('You have rice. Only expired milk. No butter.');
    });

    it('speaks every clause in Romanian', () => {
      expect(
        say('ro', [
          stock(
            {
              totals: [{ unit: 'l', quantity: 21 }],
              locations: ['fridge', 'spices'],
              expiringSoon: true,
              runningLow: true,
            },
            'lapte',
          ),
          stock({ totals: [litres(1), { unit: 'pcs', quantity: 3 }] }, 'unt'),
          { kind: 'onlyExpired', name: 'ouă' },
          { kind: 'no', name: 'pâine', onShoppingList: true },
          { kind: 'no', name: 'orez' },
        ]),
      ).toBe(
        'Ai 21 de litri de lapte în frigider și în dulapul cu condimente, o parte expiră curând, pe cale să se termine. ' +
          'Ai unt: 1 litru și 3 bucăți. ' +
          'Doar produse expirate: ouă. ' +
          'Nu ai pâine sau orez, deja pe Lista de cumpărături: pâine.',
      );
    });

    it('speaks every clause in Danish', () => {
      expect(
        say('da', [
          stock(
            {
              totals: [litres(2)],
              locations: ['cupboard'],
              expiringSoon: true,
              runningLow: true,
            },
            'mælk',
          ),
          stock({ totals: [litres(1), { unit: 'pcs', quantity: 2 }] }, 'smør'),
          { kind: 'onlyExpired', name: 'æg' },
          { kind: 'no', name: 'brød', onShoppingList: true },
          { kind: 'no', name: 'ris' },
        ]),
      ).toBe(
        'Du har 2 liter mælk i skabet, noget udløber snart, ved at løbe tør. ' +
          'Du har smør: 1 liter og 2 stykker. ' +
          'Kun udløbne varer: æg. ' +
          'Du har ikke brød eller ris, allerede på indkøbslisten: brød.',
      );
    });

    it('leaves no placeholders in any locale', () => {
      for (const locale of ASSISTANT_LOCALES) {
        expect(
          say(locale, [
            stock({
              totals: [litres(2), { unit: 'pcs', quantity: 1 }],
              locations: ['spices'],
              expiringSoon: true,
              runningLow: true,
            }),
            { kind: 'onlyExpired', name: 'Y', onShoppingList: true },
            { kind: 'no', name: 'Z', onShoppingList: true },
          ]),
        ).not.toMatch(/[{}]/);
      }
    });
  });
});
