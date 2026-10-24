/** The name of a language code in the UI Language ("fr" in English is "French"); the code itself when the runtime has no name for it. */
export function languageName(code: string, uiLanguage: string): string {
  try {
    const name = new Intl.DisplayNames([uiLanguage], {
      type: 'language',
    }).of(code);
    return name && name !== code ? name : code;
  } catch {
    return code;
  }
}
