/**
 * The `[index, name]` tuples of the Tag text inside `prompt` (the part after "Tags: "),
 * as an AI read's prompt offers them. Null when the prompt has no Tag text.
 */
export function promptTags(prompt: string): [number, string][] | null {
  const marker = 'Tags: [';
  const at = prompt.lastIndexOf(marker);
  if (at < 0) return null;
  const start = at + marker.length - 1;
  let depth = 0;
  let inString = false;
  for (let i = start; i < prompt.length; i++) {
    const char = prompt[i];
    if (inString) {
      if (char === '\\') i++;
      else if (char === '"') inString = false;
    } else if (char === '"') inString = true;
    else if (char === '[') depth++;
    else if (char === ']') {
      depth--;
      if (depth === 0) {
        return JSON.parse(prompt.slice(start, i + 1)) as [number, string][];
      }
    }
  }
  return null;
}

/** The index the prompt's Tag text gives the Tag called `name`. */
export function tagIndexIn(prompt: string, name: string): number {
  const tuple = promptTags(prompt)?.find(([, tagName]) => tagName === name);
  if (!tuple) throw new Error(`No Tag "${name}" in the prompt's Tags`);
  return tuple[0];
}

/** The names of the Tags a prompt offers, in index order. */
export function offeredTagNames(prompt: string): string[] {
  return (promptTags(prompt) ?? []).map(([, name]) => name);
}
