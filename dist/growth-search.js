(() => {
  'use strict';
  const form = document.querySelector('.growth-site-search');
  if (!form) return;
  const query = form.elements.q, out = document.querySelector('[data-growth-search-results]');
  const status = document.querySelector('[data-growth-search-status]');
  const buttons = [...document.querySelectorAll('[data-search-type]')];
  let index = [], ready = false, type = 'all', timer, interacted = false;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const normalized = PCP_SEARCH_CORE.normalize, kind = PCP_SEARCH_CORE.group;
  out.id ||= 'growth-search-results'; status.id ||= 'growth-search-status';
  query.setAttribute('aria-controls', out.id);
  query.setAttribute('aria-describedby', status.id);
  query.setAttribute('aria-keyshortcuts', 'ArrowDown ArrowUp');
  const links = () => [...out.querySelectorAll('[data-search-result-link]')];
  function updateURL(q) {
    const url = new URL(location.href);
    q ? url.searchParams.set('q', query.value.trim().slice(0, 120)) : url.searchParams.delete('q');
    type !== 'all' ? url.searchParams.set('type', type) : url.searchParams.delete('type');
    if (url.href !== location.href) history.replaceState(null, '', url);
  }
  function draw() {
    if (!ready) return;
    const raw = query.value.slice(0, 120), q = normalized(raw);
    if (!q && type === 'all') {
      status.textContent = 'Enter a model or question, or choose a result type to browse.';
      out.innerHTML = ''; updateURL(q); return;
    }
    const rows = PCP_SEARCH_CORE.search(index, raw, type);
    const displayed = rows.slice(0, 60);
    out.innerHTML = displayed.map(({ row, reason }) => `<article class="growth-search-result"><span>${esc(row.kind || kind(row))}</span><h2><a data-search-result-link href="${esc(row.url)}">${esc(PCP_SEARCH_CORE.displayTitle(row.title))}</a></h2>${reason ? '<p>' + esc(reason) + '</p>' : ''}</article>`).join('');
    status.textContent = q
      ? `${rows.length} matching results${rows.length > 60 ? '; showing the first 60. Add a model or more words to narrow them.' : '.'}`
      : `Browse ${type}, or enter a model or question.`;
    if (!rows.length) {
      out.innerHTML = '<p>No matching result. Check the exact model or part number, clear the result-type filter, or browse <a href="/hardware/">hardware</a> and <a href="/tools/">tools</a>.</p>';
    }
    updateURL(q);
  }
  function focusResult(position) {
    const results = links();
    if (!results.length) return false;
    const link = results[position < 0 ? results.length - 1 : Math.min(position, results.length - 1)];
    link.focus(); link.scrollIntoView?.({ block: 'nearest' }); return true;
  }
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); draw(); });
  query.addEventListener('input', () => { interacted = true; clearTimeout(timer); timer = setTimeout(draw, 140); });
  query.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    clearTimeout(timer); draw();
    if (focusResult(event.key === 'ArrowUp' ? -1 : 0)) event.preventDefault();
  });
  out.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const results = links(), current = results.indexOf(document.activeElement);
    if (current < 0) return;
    if (event.key === 'Escape' || event.key === 'ArrowUp' && current === 0) {
      event.preventDefault(); query.focus();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      focusResult(event.key === 'Home' ? 0 : event.key === 'End' ? -1 : current + (event.key === 'ArrowDown' ? 1 : -1));
    }
  });
  for (const button of buttons) button.addEventListener('click', () => {
    interacted = true; type = button.dataset.searchType;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button))); draw();
  });
  function restore() {
    const params = new URLSearchParams(location.search);
    query.value = (params.get('q') || '').slice(0, 120);
    type = buttons.some(button => button.dataset.searchType === params.get('type')) ? params.get('type') : 'all';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.searchType === type))); draw();
  }
  window.addEventListener('popstate', restore);
  async function load() {
    status.textContent = 'Loading the search index…'; out.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/data/search-index.json');
      if (!response.ok) throw Error('Search is temporarily unavailable.');
      const rows = await response.json();
      if (!Array.isArray(rows)) throw Error('The search response could not be read.');
      index = rows.filter(PCP_SEARCH_CORE.safeRow); ready = true;
      if (interacted) draw(); else restore();
    } catch {
      status.textContent = 'Search is temporarily unavailable. Browse hardware, guides or tools, or try again.';
      out.innerHTML = '<button type="button" class="button secondary" data-search-retry>Try loading search again</button>';
      out.querySelector('button').addEventListener('click', load, { once: true });
    } finally { out.setAttribute('aria-busy', 'false'); }
  }
  load();
})();
