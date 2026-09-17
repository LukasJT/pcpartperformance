module.exports = ({ records, images, esc }) => {
  const photo = (id, eager = false) => {
    const asset = images[id];
    return `<img src="${esc(asset.src)}" alt="${esc(asset.picturedModel)}" width="800" height="500" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
  };
  const categories = [
    ['gpu', 'Graphics cards', 'graphics-cards', 'rtx5070', 'Video memory, power & architecture'],
    ['cpu', 'Processors', 'processors', '9800x3d', 'Cores, clocks & platform'],
    ['ram', 'Memory', 'memory', 'ddr5', 'Capacity, speed & generation'],
    ['ssd', 'Solid-state drives', 'solid-state-drives', '990pro', 'Capacity, interface & endurance']
  ];
  return `
<div class="tech-home">
  <section class="tech-intro" aria-labelledby="home-title">
    <div><p class="tech-kicker">THE HARDWARE REFERENCE</p><h1 id="home-title">Make a better upgrade.</h1><p>Compare PC parts. Understand the specs. Put your build together.</p></div>
    <form class="tech-search" action="/hardware/" method="get" role="search"><label for="home-search">Find your hardware</label><div><input id="home-search" name="q" type="search" placeholder="Search a model or brand" required><button type="submit" aria-label="Search hardware"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button></div><span>Try RTX 5070, Ryzen 7, or Samsung</span></form>
  </section>

  <div class="tech-lead">
    <section class="tech-feature" aria-labelledby="feature-title">
      <div class="tech-feature-heading"><p class="tech-kicker">FEATURED COMPARISON</p><a href="/compare/">All comparisons <span aria-hidden="true">→</span></a></div>
      <h2 id="feature-title">RTX 5070 <span>vs</span> RTX 5060 Ti</h2>
      <p class="tech-feature-deck">Two Blackwell GPUs. Different memory, power, and priorities.</p>
      <a class="tech-product-pair" href="/compare/?parts=rtx5070,rtx5060ti16" aria-label="Compare GeForce RTX 5070 and GeForce RTX 5060 Ti 16 GB">
        <figure>${photo('rtx5070', true)}<figcaption><strong>GeForce RTX 5070</strong><span>12 GB GDDR7</span></figcaption></figure>
        <span class="tech-vs" aria-hidden="true">VS</span>
        <figure>${photo('rtx5060ti16')}<figcaption><strong>GeForce RTX 5060 Ti</strong><span>16 GB GDDR7</span></figcaption></figure>
      </a>
      <div class="tech-feature-bottom"><p>More VRAM doesn’t tell the whole story.<br>See the specifications side by side.</p><a class="tech-button" href="/compare/?parts=rtx5070,rtx5060ti16">Compare these GPUs <span aria-hidden="true">→</span></a></div>
    </section>
    <aside class="tech-desk" aria-labelledby="desk-title">
      <h2 id="desk-title">The upgrade desk</h2>
      <a class="tech-desk-story" href="/learn/gpu/"><span class="tech-kicker">GRAPHICS</span><h3>What actually matters in a graphics card?</h3><p>Start with VRAM, bandwidth, and board power.</p><span class="tech-read">Read the GPU guide <span aria-hidden="true">→</span></span></a>
      <a class="tech-desk-story" href="/learn/cpu/"><span class="tech-kicker">PROCESSORS</span><h3>There’s more to a CPU than GHz.</h3><p>Get to know cores, clocks, and platform support.</p><span class="tech-read">Read the CPU guide <span aria-hidden="true">→</span></span></a>
      <div class="tech-build-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h8"/><circle cx="12" cy="17" r="1.5"/></svg><div><h3>Planning a whole PC?</h3><p>Choose parts and check how they fit together.</p><a href="/builder/">Open PC builder <span aria-hidden="true">→</span></a></div></div>
    </aside>
  </div>

  <section class="tech-categories" aria-labelledby="category-title"><div class="tech-section-heading"><h2 id="category-title">Explore the hardware</h2><a href="/hardware/">Browse all ${records.length.toLocaleString('en-US')} parts <span aria-hidden="true">→</span></a></div><div class="tech-category-grid">${categories.map(([cat, label, slug, id, detail]) => `<a class="tech-category" href="/hardware/${slug}/"><div class="tech-category-image">${photo(id)}</div><div class="tech-category-copy"><span class="tech-count">${records.filter(p => p.cat === cat).length} PARTS</span><h3>${label}</h3><p>${detail}</p></div><span class="tech-category-arrow" aria-hidden="true">↗</span></a>`).join('')}</div></section>

  <section class="tech-guides" aria-labelledby="guides-title"><div class="tech-section-heading"><h2 id="guides-title">Before you buy</h2><a href="/learn/">All hardware guides <span aria-hidden="true">→</span></a></div><div class="tech-guide-grid"><a href="/performance/"><span class="tech-guide-index">01 / GAME FPS</span><h3>What performance can you target?</h3><p>Choose a GPU and CPU to calculate a game-specific FPS range.</p><span class="tech-read">Open FPS calculator <span aria-hidden="true">→</span></span></a><a href="/learn/ram/"><span class="tech-guide-index">02 / MEMORY</span><h3>More RAM or faster RAM?</h3><p>Understand capacity, DDR generations, and latency before choosing a kit.</p><span class="tech-read">Memory explained <span aria-hidden="true">→</span></span></a><a href="/learn/ssd/"><span class="tech-guide-index">03 / STORAGE</span><h3>Choose an SSD that fits.</h3><p>M.2 is a shape. NVMe is an interface. Here’s how to make sense of both.</p><span class="tech-read">Storage explained <span aria-hidden="true">→</span></span></a><a href="/builder/"><span class="tech-guide-index">04 / COMPATIBILITY</span><h3>Check the whole system.</h3><p>Match sockets, memory, case clearance, and power before finalizing your parts.</p><span class="tech-read">Check your build <span aria-hidden="true">→</span></span></a></div></section>
  <div class="tech-source-note"><strong>Specifications with sources.</strong><p>Product pages link to their reference data. For gaming performance, use independent tests alongside the specs.</p><a href="/methodology/">How we use data <span aria-hidden="true">→</span></a></div>
</div>`;
};
