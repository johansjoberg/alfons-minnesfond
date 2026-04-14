#!/usr/bin/env node
/**
 * Removes the white background from a PNG image by flood-filling
 * from the four corners and making near-white pixels transparent.
 *
 * Usage: node remove_background.js <input.png> <output.png>
 *
 * Example:
 *   node remove_background.js raw_logo_english.png logo_english.png
 */

const { Jimp, intToRGBA, rgbaToInt } = require('jimp');

const TOLERANCE = 20; // how close to white a pixel must be to be considered background

function isNearWhite(r, g, b) {
  return r >= 255 - TOLERANCE && g >= 255 - TOLERANCE && b >= 255 - TOLERANCE;
}

async function removeBackground(inputPath, outputPath) {
  console.log(`Reading ${inputPath}...`);
  const img = await Jimp.read(inputPath);
  const { width, height } = img;

  // Track which pixels have been visited
  const visited = new Uint8Array(width * height);

  // Flood fill queue starting from all four corners
  const queue = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];

  let transparent = 0;

  while (queue.length > 0) {
    const [x, y] = queue.pop();

    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const color = intToRGBA(img.getPixelColor(x, y));

    if (!isNearWhite(color.r, color.g, color.b)) continue;

    // Make this pixel transparent
    img.setPixelColor(rgbaToInt(255, 255, 255, 0), x, y);
    transparent++;

    // Add neighbours
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  console.log(`Made ${transparent} pixels transparent (out of ${width * height} total).`);
  console.log(`Writing ${outputPath}...`);
  await img.write(outputPath);
  console.log('Done.');
}

const [, , input, output] = process.argv;

if (!input || !output) {
  console.error('Usage: node remove_background.js <input.png> <output.png>');
  process.exit(1);
}

removeBackground(input, output).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
