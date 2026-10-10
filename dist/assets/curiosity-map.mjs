const interests = {
  ai: { caption: 'a mind for intelligence.', note: 'Learning, reasoning, and building AI scientists.' },
  molecules: { caption: 'small molecules, big questions.', note: 'Geometry meets molecular design.' },
  flight: { caption: 'always looking up.', note: 'Always curious about new fields, new knowledge, and landscapes yet to be explored.' },
  play: { caption: 'curious, on and off the field.', note: 'Running, football, and table tennis.' },
  space: { caption: 'a universe of questions.', note: 'Distant worlds, cosmic mysteries, and the urge to explore.' },
  discovery: { caption: 'scientific discovery.', note: 'Building AI scientists that ask questions, test ideas, and uncover new knowledge.' }
};
const layouts = [
  { ai: [49,16], molecules: [83,47], flight: [72,82], play: [28,82], space: [17,47] },
  { ai: [83,47], molecules: [72,82], flight: [28,82], play: [17,47], space: [49,16] },
  { ai: [28,82], molecules: [17,47], flight: [49,16], play: [83,47], space: [72,82] }
];

export function initCuriosityMap(root) {
  const nodes = [...root.querySelectorAll('[data-interest]')];
  const connections = [...root.querySelectorAll('[data-connection]')];
  const caption = root.querySelector('[data-orbit-caption]');
  const note = root.querySelector('[data-orbit-note]');
  const status = root.querySelector('[data-orbit-status]');
  const center = root.querySelector('[data-shuffle]');
  let pinned = null, hovered = null, focused = null, layout = 0;

  function render(announce = false) {
    const active = hovered || focused || pinned;
    const text = interests[active];
    caption.textContent = text ? text.caption : 'a few things in my orbit.';
    note.textContent = text ? text.note : 'Pick a sketch. Tap ✧ to rearrange.';
    for (const node of nodes) {
      node.classList.toggle('is-active', node.dataset.interest === active);
      node.setAttribute('aria-pressed', String(node.dataset.interest === pinned));
    }
    center.classList.toggle('is-active', active === 'discovery');
    center.setAttribute('aria-pressed', String(pinned === 'discovery'));
    for (const path of connections) path.classList.toggle('is-active', active === 'discovery' || path.dataset.connection === active);
    if (announce) status.textContent = text ? text.note : 'All five interests connected.';
  }

  function position() {
    for (const node of nodes) {
      const [x,y] = layouts[layout][node.dataset.interest];
      node.style.setProperty('--x', x + '%');
      node.style.setProperty('--y', y + '%');
    }
    for (const path of connections) {
      const [px,py] = layouts[layout][path.dataset.connection];
      const x = px * 3.6, y = py * 3.6;
      const bend = x < 176 ? -14 : 14;
      path.setAttribute('d', `M176 173Q${(176+x)/2+bend} ${(173+y)/2-10} ${x} ${y}`);
    }
  }

  function attachPreview(node, key) {
    node.addEventListener('pointerenter', () => { hovered = key; render(); });
    node.addEventListener('pointerleave', () => { if (hovered === key) hovered = null; render(); });
    node.addEventListener('focus', () => { focused = key; render(); });
    node.addEventListener('blur', () => { if (focused === key) focused = null; render(); });
  }
  for (const node of nodes) {
    const key = node.dataset.interest;
    attachPreview(node, key);
    node.addEventListener('click', () => { pinned = pinned === key ? null : key; render(true); });
  }
  attachPreview(center, 'discovery');
  center.addEventListener('click', () => {
    layout = (layout + 1) % layouts.length;
    pinned = 'discovery'; hovered = focused = null;
    position(); render();
    status.textContent = interests.discovery.note + ' Orbit rearranged.';
  });
  position(); render();
}
