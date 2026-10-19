/**
 * The mobile browser the blocked-microphone steps are written for, or null when the user agent does not
 * say so reliably (other browsers, iPadOS in desktop mode, desktop): the sheet then shows both lists.
 * iPhone Safari is the only iOS browser with the "aA" menu, so Chrome, Firefox and Edge on iOS are not it;
 * Chrome on Android is told apart from Samsung Internet, Edge, Opera and Firefox.
 */
export function detectMobileBrowser(
  userAgent: string = currentUserAgent(),
): 'safari' | 'chrome' | null {
  if (/iPhone|iPod/.test(userAgent)) {
    return /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(userAgent)
      ? null
      : /Safari\//.test(userAgent)
        ? 'safari'
        : null;
  }
  if (/Android/.test(userAgent)) {
    return /Chrome\//.test(userAgent) &&
      !/SamsungBrowser|EdgA|OPR\/|Firefox|Vivaldi|DuckDuckGo|; wv\)/.test(
        userAgent,
      )
      ? 'chrome'
      : null;
  }
  return null;
}

function currentUserAgent() {
  try {
    return navigator.userAgent;
  } catch {
    return '';
  }
}
