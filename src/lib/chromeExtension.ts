// Single source of truth for the Chrome extension's store ID so every
// "Add to Chrome" link stays in sync, and for the extension's own ID (used
// client-side for chrome.runtime.sendMessage via externally_connectable).
export const CHROME_EXTENSION_ID = 'kokkanejochocedpilnmpdeffjkjnmdc';

const CHROME_WEBSTORE_BASE = `https://chromewebstore.google.com/detail/dyslexia-write/${CHROME_EXTENSION_ID}`;

// Every "Add to Chrome" link gets its own utm_medium so Analytics can show
// which placement actually drives installs, instead of lumping them all
// together as "Unassigned".
export function chromeWebStoreUrl(medium: string): string {
  return `${CHROME_WEBSTORE_BASE}?utm_source=website&utm_medium=${medium}`;
}
