(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const spring = 'cubic-bezier(.16,1.25,.35,1)';
  const settle = 'cubic-bezier(.16,1,.3,1)';
  const animate = (element, frames, options) => {
    if (!reduced.matches && element?.animate) return element.animate(frames, options);
  };

  // A shared sliding surface follows pointer and keyboard focus without moving links.
  const nav = document.querySelector('.liquid-nav');
  const indicator = nav?.querySelector('.nav-indicator');
  function placeIndicator(link, immediate = false) {
    if (!indicator || !link) { if (indicator) indicator.style.opacity = '0'; return; }
    const parent = nav.getBoundingClientRect(), target = link.getBoundingClientRect();
    indicator.style.transitionDuration = immediate || reduced.matches ? '0ms' : '';
    indicator.style.width = target.width + 'px';
    indicator.style.height = target.height + 'px';
    indicator.style.transform = `translate(${target.left-parent.left}px, ${target.top-parent.top}px)`;
    indicator.style.opacity = '1';
  }
  const current = () => nav?.querySelector('[aria-current="page"]');
  if (nav) {
    for (const link of nav.querySelectorAll('a')) {
      link.addEventListener('pointerenter', () => placeIndicator(link));
      link.addEventListener('focus', () => placeIndicator(link));
    }
    nav.addEventListener('pointerleave', () => placeIndicator(nav.contains(document.activeElement) ? document.activeElement : current()));
    nav.addEventListener('focusout', () => requestAnimationFrame(() => { if (!nav.contains(document.activeElement)) placeIndicator(current()); }));
    placeIndicator(current(), true);
    document.fonts?.ready.then(() => placeIndicator(current(), true));
    if ('ResizeObserver' in window) new ResizeObserver(() => placeIndicator(current(), true)).observe(nav);
  }

  // Scroll entrances are progressive enhancement: content stays visible without JS.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: .08, rootMargin: '0px 0px -12px 0px' });
    const elements = document.querySelectorAll('.hero-copy, .hero-matchup, .home-browse, .home-guidance, .home-fit, .page-heading, .guide-card, .part-hero, .record-detail, .guide-terms section, .method-grid details, .library-callout');
    elements.forEach((element, index) => {
      element.classList.add('will-reveal');
      element.style.setProperty('--reveal-delay', Math.min(index % 4 * 55, 165) + 'ms');
      observer.observe(element);
    });
  }

  let pointerFrame = 0;
  document.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches) return;
    const target = event.target.closest('.button, .guide-card, .category-links a, .hero-matchup');
    if (!target) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const box = target.getBoundingClientRect();
      target.style.setProperty('--pointer-x', (event.clientX-box.left) + 'px');
      target.style.setProperty('--pointer-y', (event.clientY-box.top) + 'px');
      if (target.classList.contains('magnetic')) {
        target.style.setProperty('--magnet-x', ((event.clientX-box.left-box.width/2)*.035) + 'px');
        target.style.setProperty('--magnet-y', ((event.clientY-box.top-box.height/2)*.07) + 'px');
      }
    });
  }, { passive: true });
  for (const button of document.querySelectorAll('.magnetic')) button.addEventListener('pointerleave', () => {
    button.style.setProperty('--magnet-x','0px'); button.style.setProperty('--magnet-y','0px');
  });

  // Soft press/release responses also apply to controls added after a comparison changes.
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const target=event.target.closest('button:not(:disabled), .button, .category-links a, .guide-card');
    if (!target) return;
    animate(target, [{ scale: '1' }, { scale: '.975' }, { scale: '1' }], { duration: 420, easing: spring });
  }, { passive:true });
  document.addEventListener('toggle', event => {
    if (event.target.tagName !== 'DETAILS' || !event.target.open) return;
    for (const child of [...event.target.children].filter(el=>el.tagName!=='SUMMARY')) animate(child, [{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:settle});
  }, true);
  function animateResults(scope) {
    if (scope === 'comparison') {
      document.querySelectorAll('.product-card').forEach((element,index)=>animate(element,[{opacity:.3,transform:'translateY(10px) scale(.992)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:480,delay:index*55,easing:settle}));
      document.querySelectorAll('.metric-track>span').forEach((element,index)=>animate(element,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:700,delay:Math.min(index*45,220),easing:settle}));
    }
  }
  document.addEventListener('pcp:render', event=>animateResults(event.detail.scope));
  animateResults(document.body.dataset.page==='compare'?'comparison':'');
  reduced.addEventListener?.('change', () => {
    if (reduced.matches) {
      document.getAnimations?.().forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});
      document.querySelectorAll('.will-reveal').forEach(el=>el.classList.add('revealed'));
    }
    placeIndicator(current(),true);
  });
})();
