#!/usr/bin/env node
/**
 * Generates a set of favicon PNG files from the Swedish logo (logo.png).
 *
 * Usage: node generate_favicons.js
 *
 * Output files:
 *   favicon-16x16.png    — Browser tab (small)
 *   favicon-32x32.png    — Browser tab / taskbar
 *   favicon-48x48.png    — Windows site icon
 *   favicon-192x192.png  — Android Chrome
 *   apple-touch-icon.png — iOS / macOS home screen (180x180)
 */

const { Jimp } = require('jimp');

const INPUT = 'logo.png';

const SIZES = [
  { file: 'favicon-16x16.png',    size: 16  },
  { file: 'favicon-32x32.png',    size: 32  },
  { file: 'favicon-48x48.png',    size: 48  },
  { file: 'favicon-192x192.png',  size: 192 },
  { file: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicons() {
  console.log(`Reading ${INPUT}...`);
  const source = await Jimp.read(INPUT);

  for (const { file, size } of SIZES) {
    const copy = source.clone();
    copy.resize({ w: size, h: size });
    await copy.write(file);
    console.log(`  Created ${file} (${size}x${size})`);
  }

  console.log('\nAll favicons generated.\n');
  console.log('Add these tags inside the <head> of index.html:\n');
  console.log(`  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">`);
  console.log(`  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">`);
  console.log(`  <link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png">`);
  console.log(`  <link rel="icon" type="image/png" sizes="192x192" href="favicon-192x192.png">`);
  console.log(`  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">`);
}

generateFavicons().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
