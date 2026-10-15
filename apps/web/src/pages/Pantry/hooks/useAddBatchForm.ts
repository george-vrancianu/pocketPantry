import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { translateApiError } from '../../../i18n/translateApiError';
import {
  useCatalogSearch,
  type CatalogSearchResult,
  type StorageLocation,
  type Unit,
} from '../../../lib/catalog';
import { ApiError } from '../../../lib/api';
import { useProductRead, type ProposedLine } from '../../../lib/scan';
import type { CameraResult } from '../../Scan/CameraOverlay';
import {
  defaultExpiryDate,
  parseAmountText,
  useAddBatch,
  type IsoDate,
} from '../../../lib/pantry';

/**
 * What the form starts with, from an open Ingredient card: the Ingredient (its id and name; the
 * form looks up its Catalog defaults), or the typed name of an Unmatched one.
 */
export type AddBatchStart =
  | { ingredient: Pick<CatalogSearchResult, 'id' | 'name'> }
  | { unmatchedName: string };

/** The fields Prefill fills, and that are marked until the Member edits them. */
export type PrefillField = 'ingredient' | 'amount' | 'expiry' | 'description';

const FALLBACK_LOCATION: StorageLocation = 'cupboard';

/** The picked Ingredient: a Catalog search result, or a starting one whose defaults are still loading. */
type PickedIngredient = Pick<CatalogSearchResult, 'id' | 'name'> &
  Partial<CatalogSearchResult>;

/** Add-Batch form state: Catalog defaults pre-fill Location and expiry, and the Member can override them. */
export function useAddBatchForm({
  onSaved,
  start,
}: {
  onSaved: () => void;
  start?: AddBatchStart;
}) {
  const { t, i18n } = useTranslation();
  const addBatch = useAddBatch(i18n.language);

  const [startingIngredient] = useState(() =>
    start && 'ingredient' in start ? start.ingredient : null,
  );
  const [ingredient, setIngredient] = useState<PickedIngredient | null>(
    startingIngredient,
  );
  // The text the search field starts with: the starting Ingredient's name, or the Unmatched name.
  const [initialQuery] = useState(() =>
    start === undefined
      ? ''
      : 'ingredient' in start
        ? start.ingredient.name
        : start.unmatchedName,
  );
  const [unmatchedName, setUnmatchedName] = useState<string | null>(() =>
    start && 'unmatchedName' in start ? start.unmatchedName : null,
  );
  const [quantity, setQuantity] = useState('');
  // The Member's own unit choice, or none: then the picked Ingredient's default unit applies.
  const [chosenUnit, setChosenUnit] = useState<Unit | null>(null);
  // The unit a dropped Ingredient had on screen: kept while its name is edited, never carried to the next pick.
  const [frozenUnit, setFrozenUnit] = useState<Unit | null>(null);
  const unit: Unit = chosenUnit ?? frozenUnit ?? ingredient?.defaultUnit ?? 'g';
  const [location, setLocation] = useState<StorageLocation>(FALLBACK_LOCATION);
  const [expiryDate, setExpiryDate] = useState<IsoDate | null>(null);
  const [description, setDescription] = useState('');

  // `touched`: the Member has set the field, so Prefill leaves it alone. A form opened from an
  // Ingredient's row has its Ingredient set from the start.
  const [touched, setTouched] = useState({
    location: false,
    expiry: false,
    ingredient: start !== undefined,
    amount: false,
    description: false,
  });
  const touch = (field: keyof typeof touched) =>
    setTouched((was) => ({ ...was, [field]: true }));
  // Fields Prefill filled and the Member has not edited since, and whether its Ingredient match is shaky.
  const [prefilled, setPrefilled] = useState<ReadonlySet<PrefillField>>(
    new Set(),
  );
  const [checkIngredient, setCheckIngredient] = useState(false);
  const edit = (field: PrefillField) => {
    touch(field);
    setPrefilled((was) => {
      const next = new Set(was);
      next.delete(field);
      return next;
    });
    if (field === 'ingredient') setCheckIngredient(false);
  };

  const selectIngredient = (result: CatalogSearchResult) => {
    edit('ingredient');
    setIngredient(result);
    setUnmatchedName(null);
    // A frozen unit belonged to the dropped Ingredient: the new one's default applies.
    setFrozenUnit(null);
    // Keep a unit the Member chose with an amount before the pick ("2 kg", then Parmesan); with no amount, the new Ingredient's unit applies.
    if (quantity.trim() === '') setChosenUnit(null);
    setLocation(result.defaults.location ?? FALLBACK_LOCATION);
    const days = result.defaults.expiryDays;
    setExpiryDate(days === null ? null : defaultExpiryDate(days, new Date()));
  };

  // A starting Ingredient has only its id and name: its Catalog defaults come from searching its
  // name, which the search field has already asked for, and apply as if it had been picked there
  // (so it then shows as the picked token).
  const startingLookup = useCatalogSearch(
    startingIngredient?.name ?? '',
    i18n.language,
  );
  const startingDefaults = startingLookup.data?.find(
    (result) => result.id === startingIngredient?.id,
  );
  // The fields stay editable while the lookup is out: what the Member sets in that time is kept.
  // The lookup can also miss (the name search may not return the id): the save still sends the
  // starting `ingredientId`, and Location and expiry stay on their fallbacks.
  useEffect(() => {
    if (!startingDefaults || ingredient !== startingIngredient) return;
    setIngredient(startingDefaults);
    if (!touched.location)
      setLocation(startingDefaults.defaults.location ?? FALLBACK_LOCATION);
    const days = startingDefaults.defaults.expiryDays;
    if (!touched.expiry && !prefilled.has('expiry'))
      setExpiryDate(days === null ? null : defaultExpiryDate(days, new Date()));
    // Once, when the lookup lands; not again after the Member has picked or typed something else.
  }, [startingDefaults]);

  /** Dropping the picked Ingredient must not change the unit on screen: freeze the Ingredient's unit first. */
  const clearIngredient = () => {
    if (ingredient && chosenUnit === null) setFrozenUnit(unit);
    setIngredient(null);
  };

  const changeQuery = () => {
    edit('ingredient');
    clearIngredient();
    setUnmatchedName(null);
  };

  const chooseTypedName = (name: string) => {
    edit('ingredient');
    setUnmatchedName(name);
    clearIngredient();
    setExpiryDate(null);
  };

  const { value: quantityValue, valid: quantityValid } =
    parseAmountText(quantity);
  const canSave =
    (ingredient !== null || Boolean(unmatchedName)) &&
    quantityValid &&
    !addBatch.isPending;

  /**
   * Writes a Product Scan's line into the fields the Member has not touched and marks them. Location
   * and expiry keep the Catalog-default fallback when the line gives none.
   */
  const applyPrefill = (read: ProposedLine) => {
    const marks = new Set<PrefillField>();
    const matched = touched.ingredient ? null : read.match;
    if (!touched.ingredient) {
      if (read.match) {
        setIngredient(read.match);
        setUnmatchedName(null);
        setFrozenUnit(null);
        setCheckIngredient(read.lowConfidence);
        marks.add('ingredient');
      } else if (read.name.trim()) {
        setIngredient(null);
        setUnmatchedName(read.name.trim());
        setCheckIngredient(false);
        marks.add('ingredient');
      }
    }
    if (matched && !touched.location)
      setLocation(matched.defaults.location ?? FALLBACK_LOCATION);
    if (!touched.expiry) {
      if (read.expiryDate) {
        setExpiryDate(read.expiryDate as IsoDate);
        marks.add('expiry');
      } else if (!touched.ingredient) {
        const days = matched?.defaults.expiryDays ?? null;
        setExpiryDate(
          days === null ? null : defaultExpiryDate(days, new Date()),
        );
      }
    }
    if (!touched.amount && read.quantity !== null) {
      // In the form's own notation ("0,5" in ro and da), so it parses back as typed text does.
      setQuantity(
        new Intl.NumberFormat(i18n.language, {
          useGrouping: false,
          maximumFractionDigits: 3,
        }).format(read.quantity),
      );
      setChosenUnit(read.unit);
      marks.add('amount');
    }
    if (!touched.description && read.productDescription) {
      setDescription(read.productDescription);
      marks.add('description');
    }
    setPrefilled((was) => new Set([...was, ...marks]));
  };
  // The read outlives the render that started it: it fills what is untouched when it lands.
  const prefillNow = useRef(applyPrefill);
  prefillNow.current = applyPrefill;

  const [cameraOpen, setCameraOpen] = useState(false);
  const productRead = useProductRead(i18n.language);
  const readPhoto = (result: CameraResult) => {
    setCameraOpen(false);
    productRead.mutate(result, {
      onSuccess: (read) => prefillNow.current(read),
    });
  };
  const readError = productRead.error
    ? productRead.error instanceof ApiError &&
      productRead.error.code === 'scan.cap_reached'
      ? t('pantry:form.prefill.cap')
      : translateApiError(t, productRead.error)
    : null;
  const camera = {
    open: cameraOpen,
    openCamera: () => setCameraOpen(true),
    cancel: () => setCameraOpen(false),
    onResult: readPhoto,
    /** A Product Scan is being read; the form stays editable. */
    reading: productRead.isPending,
    readError,
    prefilled,
    checkIngredient,
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    addBatch.mutate(
      {
        ...(ingredient
          ? { ingredientId: ingredient.id }
          : { rawName: unmatchedName as string }),
        quantity: quantityValue,
        unit: quantityValue === null ? null : unit,
        location,
        expiryDate,
        productDescription: description.trim() || null,
      },
      { onSuccess: onSaved },
    );
  };

  return {
    ingredient,
    /** The picked Ingredient as the search field's token: only once its Catalog result is on hand. */
    selected: ingredient?.parentCategory
      ? (ingredient as CatalogSearchResult)
      : null,
    initialQuery,
    unmatchedName,
    quantity,
    unit,
    location,
    expiryDate,
    /** The Default Expiry in days for the "Usual" quick pick: only for a chosen Ingredient that has one. */
    usualDays: ingredient?.defaults?.expiryDays ?? null,
    description,
    canSave,
    quantityValid,
    saving: addBatch.isPending,
    error: addBatch.error ? translateApiError(t, addBatch.error) : null,
    selectIngredient,
    changeQuery,
    chooseTypedName,
    setQuantity: (value: string) => {
      edit('amount');
      setQuantity(value);
    },
    setUnit: (value: Unit) => {
      edit('amount');
      setChosenUnit(value);
    },
    setLocation: (value: StorageLocation) => {
      touch('location');
      setLocation(value);
    },
    setExpiryDate: (value: IsoDate | null) => {
      edit('expiry');
      setExpiryDate(value);
    },
    setDescription: (value: string) => {
      edit('description');
      setDescription(value);
    },
    submit,
    camera,
  };
}
