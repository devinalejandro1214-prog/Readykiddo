const { execFileSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { dirname, join } = require('path');

const root = join(__dirname, '..');
const htmlFiles = [
    'index.html',
    'onboarding.html',
    'world-reveal.html',
    'game-loader.html',
    'game.html',
    'game-candyland.html'
];
const jsFiles = [
    'assets/js/main.js',
    'assets/js/onboarding.js',
    'assets/js/world-reveal.js',
    'assets/js/feedback-widget.js',
    'assets/js/games/color-sort-game.js',
    'assets/js/games/game-registry.js',
    'assets/js/games/game-shell.js',
    'assets/js/games/item-data.js',
    'assets/js/games/shape-definitions.js',
    'assets/js/games/shape-recognition-game.js',
    'netlify/functions/feedback.js'
];

let failures = 0;

for (const file of jsFiles) {
    try {
        execFileSync(process.execPath, ['--check', join(root, file)], { stdio: 'pipe' });
    } catch (error) {
        failures += 1;
        console.error(`JS syntax check failed: ${file}`);
        process.stderr.write(error.stderr || '');
    }
}

for (const htmlFile of htmlFiles) {
    const absoluteHtml = join(root, htmlFile);
    if (!existsSync(absoluteHtml)) {
        failures += 1;
        console.error(`Missing HTML file: ${htmlFile}`);
        continue;
    }

    const html = readFileSync(absoluteHtml, 'utf8');
    const refs = collectReferences(html);
    for (const ref of refs) {
        if (/^(https?:|mailto:|tel:|#|\/api\/)/.test(ref)) continue;
        const cleanRef = ref.split(/[?#]/)[0];
        const resolved = join(dirname(absoluteHtml), cleanRef);
        if (!existsSync(resolved)) {
            failures += 1;
            console.error(`Missing referenced asset in ${htmlFile}: ${ref}`);
        }
    }
}

if (failures > 0) {
    process.exit(1);
}

console.log('Static validation passed.');

function collectReferences(html) {
    const refs = [];
    const patterns = [
        /\ssrc="([^"]+)"/g,
        /\shref="([^"]+)"/g,
        /\ssrcset="([^"]+)"/g
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            if (pattern.source.includes('srcset')) {
                refs.push(...match[1].split(',').map((entry) => entry.trim().split(/\s+/)[0]));
            } else {
                refs.push(match[1]);
            }
        }
    }

    return refs;
}
