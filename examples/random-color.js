#!/usr/bin/env runx

/**
 * @runx {
 *   "dependencies": {
 *     "randomcolor": "0.6.2",
 *     "chalk": "latest"
 *   }
 * }
 */

import chalk from 'chalk';
import randomColor from 'randomcolor';

console.log(chalk.bold('=== Random Color Palette Generator ===\n'));

const palettes = [
  { label: 'Vibrant', options: { luminosity: 'bright', count: 5 } },
  { label: 'Pastel', options: { luminosity: 'light', count: 5 } },
  { label: 'Dark', options: { luminosity: 'dark', count: 5 } },
  { label: 'Blue Tones', options: { hue: 'blue', count: 5 } },
  { label: 'Warm', options: { hue: 'orange', count: 5 } },
];

for (const { label, options } of palettes) {
  const colors = randomColor(options);
  const swatches = colors.map((c) => chalk.hex(c)(`██ ${c}`)).join('  ');
  console.log(chalk.bold(`${label}:`));
  console.log(`  ${swatches}\n`);
}
