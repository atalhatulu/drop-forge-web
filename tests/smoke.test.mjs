import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('HTML loads split CSS and JS entrypoints', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /href="\.\/styles\/game\.css"/);
  assert.match(html, /src="\.\/src\/game\.js"/);
  assert.match(html, /<canvas\b/i);
});

test('source files contain game logic and styles', () => {
  const js = readFileSync('src/game.js', 'utf8');
  const css = readFileSync('styles/game.css', 'utf8');
  assert.ok(js.length > 50000);
  assert.ok(css.length > 5000);
});
