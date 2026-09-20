# Advertising vendor inventory

Configured display formats: 320×50, 468×60, 728×90, 300×250, 160×300, and 160×600. The native placement uses container `container-64c6692f89dc61438be0463da3e0afa7`. Supplied keys and script URLs are isolated in `dist/ads/*.html`.

All supplied formats are currently dormant. Browser validation on September 20, 2026 showed the display tag throws a `SecurityError` when cookie access is withheld by the required sandbox. Enabling same-origin privileges on these same-origin, script-capable frames would weaken the promised popup/redirect containment. Enable only after the vendor supplies a tag that works with `sandbox="allow-scripts"`, or after the ad documents are served from a separately controlled origin and retested.

There are no popup, popunder, redirect, social-bar, notification, or smart-link formats. No ads.txt seller entry is published because an authorized seller record was not supplied; placeholders must never be invented.
