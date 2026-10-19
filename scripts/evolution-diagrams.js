/* Original educational diagrams. These controls explain a mechanism; they do
   not inspect hardware, run CFD or certify physical/electrical compatibility. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { window.PCP_HARDWARE_DIAGRAMS = api; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.mount, { once: true }); else api.mount(); }
})(function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const number = (value, min = 0, max = 1000) => value === '' || value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max ? null : Number(value);
  const choose = (value, choices, fallback) => choices.includes(value) ? value : fallback;
  function evaluate(kind, values = {}) {
    if (kind === 'airflow') {
      const front = choose(values.front, ['in', 'out'], 'in'), rear = choose(values.rear, ['in', 'out'], 'out');
      return { front, rear, state: front === rear ? 'check' : 'example', readout: 'Front: ' + (front === 'in' ? 'intake' : 'exhaust') + '. Rear: ' + (rear === 'in' ? 'intake' : 'exhaust') + '. ' + (front === rear ? 'Both point the same way relative to the enclosure; consider where replacement air enters or leaves.' : 'The arrows show one possible path through the case.') + ' Fan count alone does not establish case pressure or temperatures.' };
    }
    if (kind === 'memory') {
      const count = choose(String(values.modules), ['1', '2', '4'], '2');
      const slots = count === '1' ? ['A2'] : count === '2' ? ['A2', 'B2'] : ['A1', 'A2', 'B1', 'B2'];
      return { count, slots, state: 'example', readout: 'ASUS four-slot example: populate ' + slots.join(' and ') + '. Confirm the exact board’s recommended layout, memory generation, kit support and CPU limits. This does not establish BIOS support or a stable memory speed.' };
    }
    if (kind === 'lanes') {
      const m2 = values.m2 !== false && values.m2 !== 'off', pcie = values.pcie === true || values.pcie === 'on';
      return { m2, pcie, state: m2 && pcie ? 'shared' : 'example', m2Lanes: m2 ? pcie ? 2 : 4 : 0, pcieLanes: pcie ? 2 : 0,
        readout: 'MSI MAG B650 TOMAHAWK WIFI: ' + (m2 ? 'M2_3 uses up to PCIe 4.0 ×' + (pcie ? 2 : 4) : 'M2_3 is empty') + '; ' + (pcie ? 'PCI_E2 uses up to PCIe 4.0 ×2' : 'PCI_E2 is empty') + '. ' + (m2 && pcie ? 'MSI documents ×2 for each when both are occupied.' : 'Other slots and CPU-dependent restrictions must still be checked.') + ' Lane count is not a measured transfer rate or an FPS prediction.' };
    }
    if (kind === 'fan') {
      const pins = choose(values.pins, ['3', '4'], '4'), mode = choose(values.mode, ['pwm', 'dc'], 'pwm'), duty = number(values.duty, 0, 100) ?? 50;
      const readout = mode === 'pwm' ? pins === '4' ? duty + '% illustrative PWM command on the fourth wire. This is a control duty, not an RPM percentage; response and stop behavior depend on the fan.' : 'A three-pin fan has no separate PWM control wire. A PWM-only header setting does not provide the same speed control; check supported DC/voltage mode.' : 'DC mode changes supply voltage rather than a separate PWM command. Supported voltage control, startup behavior and usable range depend on the header and fan.';
      return { pins, mode, duty, state: pins === '3' && mode === 'pwm' ? 'check' : 'example', readout };
    }
    if (kind === 'gpu') {
      const card = number(values.card, 1, 500), space = number(values.space, 1, 700), obstruction = number(values.obstruction, 0, 200);
      const remaining = card === null || space === null || obstruction === null ? null : Math.round((space - card - obstruction) * 10) / 10;
      return { card, space, obstruction, remaining, state: remaining === null ? 'invalid' : remaining <= 0 ? 'check' : 'calculation',
        readout: remaining === null ? 'Enter all three measurements: card 1–500 mm, available case length 1–700 mm and added obstruction 0–200 mm.' : space + ' − ' + card + ' − ' + obstruction + ' = ' + remaining + ' mm length remainder. ' + (remaining <= 0 ? 'There is no positive length allowance in these inputs.' : 'A positive remainder addresses only this one axis.') + ' Check width/height, slot thickness, power-cable routing, supports and installed radiator placement separately. Do not subtract an obstruction twice if the case figure already includes it.' };
    }
    if (kind === 'power') {
      const connector = choose(values.connector, ['atx', 'eps', 'pcie', 'modern'], 'eps');
      const facts = {
        atx: ['24-pin ATX', 12, 2, 'Motherboard main power. Use the board and PSU instructions for the exact connection.'],
        eps: ['4+4-pin EPS/CPU', 4, 2, 'CPU power near the processor. This is not the same cable as a 6+2-pin PCIe lead.'],
        pcie: ['6+2-pin PCIe', 4, 2, 'A common graphics-card power lead. Do not substitute an EPS/CPU cable because it also has eight contacts.'],
        modern: ['12+4-pin GPU connector', 6, 2, 'Twelve larger power contacts plus four smaller sideband contacts are shown conceptually. Follow the exact GPU, connector and PSU cable instructions.']
      }[connector];
      return { connector, name: facts[0], columns: facts[1], rows: facts[2], state: 'check', readout: facts[0] + ': ' + facts[3] + ' The drawing is not a pinout or wiring guide. Modular PSU-side connectors are not universally interchangeable; use only cables explicitly approved for the exact PSU.' };
    }
    if (kind === 'storage') {
      const size = choose(values.size, ['2230', '2242', '2280', '22110'], '2280'), protocol = choose(values.protocol, ['nvme', 'sata'], 'nvme');
      return { size, length: Number(size.slice(2)), protocol, state: 'example', readout: 'M.2 ' + size + ' is 22 mm wide and ' + Number(size.slice(2)) + ' mm long. ' + (protocol === 'nvme' ? 'A PCIe/NVMe drive needs a socket that supports PCIe/NVMe.' : 'A SATA M.2 drive needs a socket that supports SATA.') + ' The outline and mounting position do not establish protocol, keying or thickness compatibility. Check the motherboard manual before ordering; power off before installing or removing an M.2 drive.' };
    }
    if (kind === 'cooling') {
      const placement = choose(values.placement, ['air', 'top', 'front', 'bottom'], 'top');
      const explanations = {
        air: 'Tower-cooler example. Check socket mounting, RAM clearance and total installed height. Raising a front fan to clear RAM can also increase the required case height.',
        top: 'CPU-block-pump example: a top radiator places the radiator above the pump. Verify the exact cooler instructions, roof thickness clearance, motherboard/RAM space and tube reach.',
        front: 'CPU-block-pump example: a front radiator with tubes at the bottom can keep its upper section above the pump. Verify tube reach and the space removed from the GPU area.',
        bottom: 'In this CPU-block-pump example, the pump is above the bottom radiator. Review the manufacturer’s installation guidance before choosing this arrangement; pumps located elsewhere need different analysis.'
      };
      return { placement, state: placement === 'bottom' ? 'check' : 'example', readout: explanations[placement] + ' This illustration does not estimate temperature, noise or cooling capacity.' };
    }
    return { state: 'invalid', readout: 'This diagram is unavailable.' };
  }
  const rect = (x, y, w, h, cls = '') => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" class="' + cls + '"/>';
  const text = (x, y, value, cls = '') => '<text x="' + x + '" y="' + y + '" class="' + cls + '">' + escape(value) + '</text>';
  const path = (d, cls = '') => '<path d="' + d + '" class="' + cls + '"/>';
  const fan = (x, y) => '<g class="hd-fan">' + rect(x - 23, y - 23, 46, 46) + '<circle cx="' + x + '" cy="' + y + '" r="17"/>' + path('m' + (x - 9) + ' ' + (y - 13) + ' 18 26m-24-16 30 6m-30 0 30-6') + '</g>';
  const arrow = (x, y, reverse = false) => '<g class="hd-direction">' + path(reverse ? 'M' + (x + 42) + ' ' + y + 'h-42m10-9-10 9 10 9' : 'M' + x + ' ' + y + 'h42m-10-9 10 9-10 9', 'hd-energy') + '</g>';
  function artwork(kind, values = {}) {
    const s = evaluate(kind, values);
    let art = '';
    if (kind === 'airflow') art = rect(115, 28, 330, 235, 'hd-case') + rect(210, 75, 142, 128) + rect(230, 100, 52, 50, 'hd-accent') + fan(145, 112) + fan(145, 190) + fan(414, 112) + arrow(50, 112, s.front === 'out') + arrow(50, 190, s.front === 'out') + arrow(468, 112, s.rear === 'in') + text(119, 290, 'Front') + text(398, 290, 'Rear');
    if (kind === 'memory') {
      art = rect(70, 38, 130, 155) + rect(100, 80, 70, 70, 'hd-accent') + text(92, 222, 'CPU') + path('M200 110h40v-20h40M240 110v52h40', 'hd-energy');
      ['A1', 'A2', 'B1', 'B2'].forEach((slot, i) => { art += rect(290 + i * 51, 42, 29, 190, s.slots.includes(slot) ? 'hd-selected' : 'hd-muted') + text(290 + i * 51, 260, slot); });
    }
    if (kind === 'lanes') art = rect(32, 104, 132, 88, 'hd-accent') + text(49, 154, 'Chipset') + path('M164 148h90', s.m2 || s.pcie ? 'hd-energy' : 'hd-muted') + path('M254 148V70h96', s.m2 ? 'hd-energy' : 'hd-muted') + path('M254 148v80h96', s.pcie ? 'hd-energy' : 'hd-muted') + rect(352, 32, 175, 78, s.m2 ? 'hd-selected' : 'hd-muted') + text(377, 64, 'M2_3') + text(377, 91, s.m2 ? 'up to ×' + s.m2Lanes : 'Empty') + rect(352, 190, 175, 78, s.pcie ? 'hd-selected' : 'hd-muted') + text(377, 222, 'PCI_E2') + text(377, 250, s.pcie ? 'up to ×2' : 'Empty');
    if (kind === 'fan') {
      art = fan(120, 140) + path('M150 125h84M150 140h84M150 155h84' + (s.pins === '4' ? 'M150 170h84' : '')) + rect(234, 104, 65, 88) + text(325, 76, s.mode === 'pwm' ? 'Control signal' : 'Voltage control');
      if (s.mode === 'pwm') { const high = Math.round(s.duty * .65); let wave = 'M320 190'; for (let i = 0; i < 3; i++) wave += 'h' + (65 - high) + 'v-65h' + high + 'v65'; art += path(wave, s.pins === '4' ? 'hd-energy' : 'hd-muted'); }
      else art += path('M320 190h35v-20h35v-25h35v-25h80', 'hd-energy');
      art += text(78, 235, s.pins + '-pin fan');
    }
    if (kind === 'gpu') {
      const width = Math.min(s.card ?? 300, 500) * .72, enclosure = Math.min(s.space ?? 340, 700) * .72;
      art = rect(42, 32, Math.max(100, Math.min(enclosure, 480)), 222, 'hd-case') + rect(55, 112, width, 68, 'hd-accent') + path('M55 180l16 13h' + width + 'l-16-13', 'hd-muted') + '<circle cx="95" cy="146" r="22"/><circle cx="152" cy="146" r="22"/>' + path('M55 211h' + width, 'hd-energy') + text(70, 239, 'Length') + path('M' + (75 + width) + ' 112v68') + text(Math.min(100 + width, 450), 156, 'Height') + text(Math.min(100 + width, 440), 221, 'Thickness') + path('M70 112v-35h45', 'hd-muted') + text(82, 62, 'Cable route');
    }
    if (kind === 'power') {
      const gap = s.columns === 12 ? 29 : 43, width = s.columns * gap + 22, start = (560 - width) / 2;
      art = rect(start, 90, width, 105, 'hd-case');
      for (let y = 0; y < s.rows; y++) for (let x = 0; x < s.columns; x++) art += rect(start + 15 + x * gap, 105 + y * 43, gap - 9, 28, s.connector === 'eps' && x > 1 || s.connector === 'pcie' && x > 2 ? 'hd-selected' : 'hd-accent');
      if (s.connector === 'modern') for (let x = 0; x < 4; x++) art += rect(start + 50 + x * 25, 68, 16, 12, 'hd-selected');
      art += text(80, 250, s.name);
    }
    if (kind === 'storage') {
      ['2230', '2242', '2280', '22110'].forEach((size, i) => { const y = 23 + i * 70, length = Number(size.slice(2)) * 3.2; art += rect(120, y, length, 44, s.size === size ? 'hd-selected' : 'hd-muted') + path('M129 ' + (y + 8) + 'v28M136 ' + (y + 8) + 'v28') + text(28, y + 29, size); });
    }
    if (kind === 'cooling') {
      art = rect(70, 22, 420, 250, 'hd-case') + rect(220, 91, 145, 155) + rect(245, 120, 55, 55, 'hd-accent') + text(235, 207, s.placement === 'air' ? 'CPU' : 'Pump');
      if (s.placement === 'air') art += rect(240, 71, 78, 114, 'hd-selected') + fan(278, 128);
      else {
        const x = s.placement === 'front' ? 90 : 185, y = s.placement === 'top' ? 35 : s.placement === 'bottom' ? 231 : 68;
        art += rect(x, y, s.placement === 'front' ? 32 : 220, s.placement === 'front' ? 170 : 27, 'hd-selected') + path(s.placement === 'front' ? 'M105 229c30 55 145-5 145-53M117 229c35 35 160 15 160-53' : 'M245 120C170 120 145 ' + y + ' 194 ' + y + 'M286 120c100 0 120-30 110 ' + (y - 80), 'hd-energy');
      }
    }
    return '<svg viewBox="0 0 560 315" role="img" aria-label="' + escape(({ airflow: 'Conceptual case airflow directions', memory: 'Four memory slots with the example selected slots highlighted', lanes: 'Documented conditional lane allocation for the named MSI motherboard', fan: 'Conceptual fan control wires and signal', gpu: 'Illustrative graphics card length, height and cable route', power: 'Connector contact counts only, not a wiring pinout', storage: 'M.2 lengths drawn using one common linear scale', cooling: 'Conceptual cooler placement with CPU-block pump assumption' })[kind] || 'Hardware diagram') + '" class="hd-art" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + art + '</svg>';
  }
  function readValues(card) { const values = {}; card.querySelectorAll('[data-diagram-input]').forEach(input => { values[input.dataset.diagramInput] = input.type === 'checkbox' ? input.checked : input.value; }); return values; }
  function mount() {
    const page = document.querySelector('[data-hardware-diagrams]');
    if (!page || page.dataset.mounted) return;
    page.dataset.mounted = 'true';
    const cards = [...page.querySelectorAll('[data-hardware-diagram]')];
    function update(card) { const kind = card.dataset.hardwareDiagram, values = readValues(card), state = evaluate(kind, values); card.dataset.diagramState = state.state; card.querySelector('[data-diagram-art]').innerHTML = artwork(kind, values); card.querySelector('[data-diagram-result]').textContent = state.readout; card.querySelectorAll('input[type="number"]').forEach(input => { input.setAttribute('aria-invalid', String(number(input.value, Number(input.min), Number(input.max)) === null)); }); }
    cards.forEach(card => { card.addEventListener('input', () => update(card)); card.addEventListener('change', () => update(card)); update(card); });
    const motion = page.querySelector('[data-diagram-motion]'), reduced = window.matchMedia('(prefers-reduced-motion: reduce)'), root = document.documentElement;
    let running = false;
    function syncMotion() {
      const reduce = reduced.matches || root?.dataset.motion === 'reduced', ambientPaused = root?.dataset.ambient === 'off';
      // A preference override cancels the earlier opt-in. Re-enabling motion in
      // Appearance never restarts a diagram until its own button is pressed.
      if (reduce || ambientPaused) running = false;
      const playing = running && !reduce && !ambientPaused && !document.hidden;
      page.dataset.diagramMotion = String(playing);
      motion?.setAttribute('aria-pressed', String(playing));
      if (motion) { motion.textContent = reduce ? 'Reduced motion enabled' : ambientPaused ? 'Ambient motion paused' : running ? 'Pause diagram motion' : 'Animate diagrams'; motion.disabled = reduce || ambientPaused; }
    }
    motion?.addEventListener('click', () => { running = !running; syncMotion(); }); reduced.addEventListener?.('change', syncMotion); document.addEventListener('visibilitychange', syncMotion); window.addEventListener('pcp:appearance', syncMotion);
    if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { entries.forEach(entry => { entry.target.dataset.diagramVisible = String(entry.isIntersecting); }); }, { threshold: .1 }); cards.forEach(card => observer.observe(card)); }
    else cards.forEach(card => { card.dataset.diagramVisible = 'true'; });
    syncMotion();
  }
  return { evaluate, artwork, number, readValues, mount };
});
