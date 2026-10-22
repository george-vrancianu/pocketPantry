import type { Insets } from './scanGuides';

/**
 * The device's safe-area insets in pt. CSS `env()` cannot be read from script, so a probe element
 * takes them as padding and reports the computed result. Browsers with no safe areas, and jsdom,
 * give 0.
 */
export function readSafeAreaInsets(): Insets {
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;' +
    'padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
  document.body.appendChild(probe);
  try {
    const style = getComputedStyle(probe);
    return {
      top: Number.parseFloat(style.paddingTop) || 0,
      bottom: Number.parseFloat(style.paddingBottom) || 0,
    };
  } finally {
    probe.remove();
  }
}
