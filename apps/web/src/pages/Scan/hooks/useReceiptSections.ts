import { useRef, useState } from 'react';
import { useReceiptScan } from '../../../lib/receiptScan';
import {
  MAX_RECEIPT_SECTIONS,
  mergeReceiptSections,
  type MergedReceipt,
  type ReceiptSectionResult,
} from '../../../lib/receiptSections';

/** One photographed stretch of the receipt and what was read from it. */
export type ReceiptSection = ReceiptSectionResult & {
  /** The prepared image that was sent, for the thumbnail. */
  thumbnail: string;
};

/**
 * The in-memory batch of Receipt Sections of one receipt. Each section is one
 * request, sent one at a time. The next photo goes to `target`: the section being
 * retaken, the one whose request just failed, or a new one at the end.
 */
export function useReceiptSections(locale: string) {
  const scan = useReceiptScan(locale);
  const [sections, setSections] = useState<ReceiptSection[]>([]);
  /** The section whose result the Member is looking at, if any. */
  const [selected, setSelected] = useState<number | null>(null);
  const [retaking, setRetaking] = useState<number | null>(null);
  const [failed, setFailed] = useState<{
    index: number;
    error: unknown;
  } | null>(null);
  const [readingIndex, setReadingIndex] = useState<number | null>(null);

  /** Bumped by `reset()`: a response for an older batch is thrown away. */
  const generation = useRef(0);

  const target = failed?.index ?? retaking ?? sections.length;
  const full = target >= MAX_RECEIPT_SECTIONS;

  /** Sends one prepared photo as the target section and waits for the result. */
  const submit = async (image: string) => {
    if (full) return;
    const index = target;
    const started = generation.current;
    setReadingIndex(index);
    setSelected(null);
    try {
      const result = await scan.mutateAsync(image);
      if (started !== generation.current) return;
      setSections((current) => {
        const next = [...current];
        next[index] = { ...result, thumbnail: image };
        return next;
      });
      setFailed(null);
      setRetaking(null);
      setSelected(index);
    } catch (error) {
      if (started === generation.current) setFailed({ index, error });
    } finally {
      if (started === generation.current) setReadingIndex(null);
    }
  };

  return {
    sections,
    selected,
    pending: readingIndex !== null,
    /** 1-based number of the section being read, while one is. */
    readingNumber: readingIndex === null ? null : readingIndex + 1,
    /** No more sections may be added (retaking an existing one is still fine). */
    full,
    error: failed?.error ?? null,
    /** Which section the failed request was for. */
    failedIndex: failed?.index ?? null,
    /** A result or failure is on screen: the camera waits until the Member decides what to do. */
    deciding: selected !== null || failed !== null,
    submit,
    select: (index: number) => {
      setSelected(index);
      setFailed(null);
      setRetaking(null);
    },
    /** The next photo replaces this section's result. */
    retake: (index: number) => {
      setRetaking(index);
      setSelected(null);
      setFailed(null);
    },
    remove: (index: number) => {
      setSections((current) => current.filter((_, i) => i !== index));
      setSelected(null);
      setRetaking(null);
      setFailed(null);
    },
    /** Back to the camera for a new section. */
    nextPhoto: () => {
      setSelected(null);
      setRetaking(null);
      setFailed(null);
    },
    reset: () => {
      generation.current += 1;
      setReadingIndex(null);
      setSections([]);
      setSelected(null);
      setRetaking(null);
      setFailed(null);
      scan.reset();
    },
    merged: (): MergedReceipt => mergeReceiptSections(sections),
  };
}
