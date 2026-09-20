# Advertising placement plan

Placements and vendor documents are implemented but currently dormant because the supplied tag failed the required sandbox test. When a compatible tag is available, ads load only after affirmative consent and near-viewport visibility. They are labeled and kept out of primary controls. Responsive horizontal placements select 728×90, 468×60, or 320×50 by measured container width. Product pages use one 300×250 unit. Native units appear only after substantial content. Guides use no more than three units; mobile layouts use no rail.

Every vendor script runs in an iframe with `sandbox="allow-scripts"`. Popups, top navigation, new-window permissions, automatic redirects, autoplay and notifications are not permitted. If the vendor cannot fill a placement under those restrictions, the slot must remain empty rather than loosening containment.
