/** `from` is a YYYY-MM-DD date; the result is that date plus `days`. */
export function addDays(from: string, days: number): string {
  const result = new Date(Date.parse(`${from}T00:00:00Z`) + days * 86_400_000);
  return result.toISOString().slice(0, 10);
}
