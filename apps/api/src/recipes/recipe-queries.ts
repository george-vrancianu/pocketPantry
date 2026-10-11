/**
 * Awaits lazy query builders one after the other. A transaction has a single
 * connection, which must not run two queries at once.
 */
export async function inOrder<const T extends readonly unknown[]>(
  queries: T,
): Promise<{ -readonly [K in keyof T]: Awaited<T[K]> }> {
  const results: unknown[] = [];
  for (const query of queries) results.push(await query);
  return results as { -readonly [K in keyof T]: Awaited<T[K]> };
}
