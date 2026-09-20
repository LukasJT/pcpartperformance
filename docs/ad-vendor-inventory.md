# Advertising vendor inventory

Configured display formats: 320×50, 468×60, 728×90, 300×250, 160×300, and 160×600. The native placement uses container `container-64c6692f89dc61438be0463da3e0afa7`. Supplied keys and script URLs are isolated in `dist/ads/*.html`.

All supplied formats are active after consent. Each vendor tag runs in a dedicated iframe with `allow-scripts allow-same-origin`, loaded from the site's alternate domain. Because the ad document is cross-origin from its parent, vendor code cannot reach the iframe element to remove its sandbox. The sandbox grants neither popup nor top-navigation permissions, and referrers are withheld.

There are no popup, popunder, redirect, social-bar, notification, or smart-link formats. No ads.txt seller entry is published because an authorized seller record was not supplied; placeholders must never be invented.

