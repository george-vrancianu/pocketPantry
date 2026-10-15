import type { TFunction } from 'i18next';
import { formatAmount } from '../../lib/amount';
import type { Unit } from '../../lib/catalog';
import {
  type BaseUnit,
  type PlanIssue,
  type ReasonMeal,
  type WindowDay,
} from '../../lib/mealPlan';
import { fromIso, type IsoDate } from '../../lib/pantry';

type T = TFunction<'dashboard'>;

/** English dates read day first here ("Saturday 17 October"), as Romanian and Danish already do. */
const dateLocale = (language: string) =>
  language === 'en' ? 'en-GB' : language;

const format = (
  language: string,
  iso: IsoDate,
  options: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat(dateLocale(language), options).format(fromIso(iso));

/** "Saturday 17 October". */
export const fullDate = (language: string, iso: IsoDate) =>
  format(language, iso, { weekday: 'long', day: 'numeric', month: 'long' });

export const shortWeekday = (language: string, iso: IsoDate) =>
  format(language, iso, { weekday: 'short' });

export const longWeekday = (language: string, iso: IsoDate) =>
  format(language, iso, { weekday: 'long' });

const dayNumber = (iso: IsoDate) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

/** "Today", "Tomorrow", then the short weekday. */
export function relativeDay(
  t: T,
  language: string,
  iso: IsoDate,
  today: IsoDate,
): string {
  const offset = dayNumber(iso) - dayNumber(today);
  if (offset === 0) return t('mealPlan.today');
  if (offset === 1) return t('mealPlan.tomorrow');
  return shortWeekday(language, iso);
}

/** "Today", "Tomorrow", then the long weekday: the popover's title. */
export function dayTitle(
  t: T,
  language: string,
  iso: IsoDate,
  today: IsoDate,
): string {
  const offset = dayNumber(iso) - dayNumber(today);
  if (offset === 0) return t('mealPlan.today');
  if (offset === 1) return t('mealPlan.tomorrow');
  return longWeekday(language, iso);
}

/** An amount in g, ml or pcs as the Pantry words it: kg and l from 1000. */
export function baseAmount(
  t: T,
  language: string,
  quantity: number,
  unit: BaseUnit | null,
): string {
  if (unit === 'g' && quantity >= 1000) {
    return formatAmount(quantity / 1000, 'kg', language, t as TFunction);
  }
  if (unit === 'ml' && quantity >= 1000) {
    return formatAmount(quantity / 1000, 'l', language, t as TFunction);
  }
  return unit
    ? formatAmount(quantity, unit as Unit, language, t as TFunction)
    : new Intl.NumberFormat(language).format(quantity);
}

/** The accessible name of a day column: "Saturday 17 October: 2 meals, short". */
export function columnName(
  t: T,
  language: string,
  day: WindowDay,
  today: IsoDate,
): string {
  const unavailable = day.slots.filter((slot) => slot.unavailable).length;
  let summary: string;
  if (day.slots.length === 0) {
    summary = t('mealPlan.aria.nothing');
  } else if (day.status === 'unavailable') {
    summary = t('mealPlan.aria.allUnavailable', { count: day.slots.length });
  } else {
    summary = t('mealPlan.aria.meals', {
      count: day.slots.length,
      status: t(`mealPlan.aria.status.${day.status as 'covered'}`),
    });
    if (unavailable > 0) {
      summary += `, ${t('mealPlan.aria.alsoUnavailable', { count: unavailable })}`;
    }
  }
  const date = fullDate(language, day.date);
  return t(
    day.date === today ? 'mealPlan.aria.columnToday' : 'mealPlan.aria.column',
    {
      date,
      summary,
    },
  );
}

/** Who the earlier meals were: one by Recipe, two by Mealtime, more as a count. */
function mealsText(
  t: T,
  language: string,
  meals: ReasonMeal[],
  today: IsoDate,
): string {
  const mealOf = (name: string, meal: ReasonMeal) =>
    t('mealPlan.reason.mealOf', {
      day: relativeDay(t, language, meal.date, today),
      name,
    });
  if (meals.length === 1) return mealOf(meals[0].recipeTitle, meals[0]);
  if (meals.length === 2) {
    return t('mealPlan.reason.and', {
      first: mealOf(
        t(`mealPlan.slot.${meals[0].mealtime}`).toLocaleLowerCase(language),
        meals[0],
      ),
      second: mealOf(
        t(`mealPlan.slot.${meals[1].mealtime}`).toLocaleLowerCase(language),
        meals[1],
      ),
    });
  }
  return t('mealPlan.reason.earlierMeals', { count: meals.length });
}

/** The line under a short ingredient saying why; null when there is nothing to say. */
export function reasonText(
  t: T,
  language: string,
  issue: PlanIssue,
  today: IsoDate,
): string | null {
  const { reason } = issue;
  switch (reason.code) {
    case 'usesLast':
      return t(
        reason.meals.length === 1
          ? 'mealPlan.reason.usesLast'
          : 'mealPlan.reason.useLast',
        { who: mealsText(t, language, reason.meals, today) },
      );
    case 'expires':
      return t('mealPlan.reason.expires', {
        day: relativeDay(t, language, reason.date, today),
      });
    case 'notInPantry':
      return t('mealPlan.reason.notInPantry');
    case 'onlyLeftAfter':
      return t('mealPlan.reason.onlyLeftAfter', {
        amount: baseAmount(t, language, reason.amount, reason.unit),
        who: mealsText(t, language, reason.meals, today),
      });
    case 'onlyInPantry':
      return t('mealPlan.reason.onlyInPantry', {
        amount: baseAmount(t, language, reason.amount, reason.unit),
      });
    case 'noQuantity':
      return null;
  }
}
