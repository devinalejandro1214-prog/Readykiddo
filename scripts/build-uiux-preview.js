const { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const source = join(root, 'uiux-preview');
const output = join(root, '.uiux-preview-dist');

if (!existsSync(source)) {
  throw new Error('Missing uiux-preview source directory.');
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

// Existing runtime assets power the connected game links. Internal docs,
// tests, repository metadata, and automation files are intentionally excluded.
cpSync(join(root, 'assets'), join(output, 'assets'), { recursive: true });

const connectedRuntimePages = [
  'game-loader.html',
  'game.html',
  'game-candyland.html',
  'space-defender.html',
  'world-reveal.html',
  'child-home.html',
  'onboarding.html'
];

for (const page of connectedRuntimePages) {
  cpSync(join(root, page), join(output, page));
}

// Preview-only repair: defer the optional companion until the document body
// exists. The production source file is left unchanged by this experiment.
const gameLoaderPath = join(output, 'game-loader.html');
const gameLoader = readFileSync(gameLoaderPath, 'utf8').replace(
  '<script src="assets/js/zoey-companion.js"></script>',
  '<script defer src="assets/js/zoey-companion.js"></script>'
);
writeFileSync(gameLoaderPath, gameLoader);

writeFileSync(join(output, '_redirects'), [
  '/today  /index.html#home  302',
  '/activities  /index.html#activities  302',
  '/milestones  /index.html#milestones  302',
  '/grown-ups  /index.html#parent  302',
  '/play  /index.html#game  302',
  ''
].join('\n'));

writeFileSync(join(output, '_headers'), [
  '/*',
  '  X-Frame-Options: DENY',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
  '',
  '/preview-assets/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  '/assets/*',
  '  Cache-Control: public, max-age=3600',
  ''
].join('\n'));

console.log(`UI/UX preview built at ${output}`);
