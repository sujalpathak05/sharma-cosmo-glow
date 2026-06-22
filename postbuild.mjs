import { readFileSync, writeFileSync } from 'fs';

const path = './dist/index.html';
let html = readFileSync(path, 'utf-8');

// Make Tailwind CSS non-render-blocking so the static hero shell paints immediately.
// The browser loads CSS in the background; the static shell (inline styles only)
// is visible before CSS arrives. React mounts ~1-2s later, by which point CSS is parsed.
html = html.replace(
  /(<link rel="stylesheet" crossorigin href="[^"]*\.css")>/g,
  '$1 media="print" onload="this.media=\'all\'">'
);

writeFileSync(path, html);
console.log('✓ CSS is non-render-blocking');
