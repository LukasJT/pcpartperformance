// The body outline and appearance preview have separate jobs and separate views.
module.exports=({phones,options,silhouette,esc})=>`<section class="phone-workspace" aria-label="Phone comparison">
<form data-phone-size class="phone-size-form">
<div class="phone-picker-row"><label for="phone-a">First phone<select data-phone-picker id="phone-a" name="a" aria-label="First phone">${options('iphone-16')}</select></label><button class="button secondary phone-swap" type="button" data-phone-swap aria-label="Swap the two phones">Swap</button><label for="phone-b">Second phone<select data-phone-picker id="phone-b" name="b" aria-label="Second phone">${options('pixel-9')}</select></label></div>
<div class="phone-mode-row"><div class="phone-mode-switch" role="group" aria-label="Comparison view"><button type="button" data-phone-mode="design" aria-pressed="false" aria-controls="phone-design-view">Design & angles</button><button type="button" data-phone-mode="size" aria-pressed="true" aria-controls="phone-size-view">Size & dimensions</button></div><p data-phone-mode-help>Open a 3D view, then drag to explore the phone.</p></div>
<div id="phone-design-view" data-phone-design hidden></div>
<section id="phone-size-view" data-phone-size-view aria-label="Same-scale body outlines"><div class="phone-size-toolbar"><h2>Side by side</h2><label class="phone-overlay-toggle"><input name="overlay" type="checkbox"> Overlay phones</label></div><label class="phone-folded-toggle" data-phone-folded-option hidden><input name="folded" type="checkbox"> Folded size</label><div class="phone-scale" data-phone-scale>${[phones[0],phones[2]].map(p=>`<figure>${silhouette(p)}<figcaption>${esc(p.name)}</figcaption></figure>`).join('')}</div><p class="phone-scale-note">Same-scale outlines. Not actual size on your screen.</p></section>
<section class="phone-measurements" aria-label="Phone dimensions"><h2>Dimensions</h2><div data-phone-measurements></div></section>
<output class="phone-difference" aria-live="polite">Choose two phones to compare their dimensions.</output>
<noscript><p>Interactive views need JavaScript. <a href="/phones/">Read the numerical specifications</a>.</p></noscript>
</form></section>`;
