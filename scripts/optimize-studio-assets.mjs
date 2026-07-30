// One-off: convert public/studio/*.png product photography to .webp
// (quality ~82, same dimensions) and remove the source PNGs. Re-run any
// time new studio photography lands in public/studio.
import { readdir, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve(process.cwd(), 'public/studio');

const files = (await readdir(dir)).filter(f => f.toLowerCase().endsWith('.png'));

if (files.length === 0) {
  console.log('No PNGs found in', dir);
  process.exit(0);
}

for (const file of files) {
  const src = path.join(dir, file);
  const dest = path.join(dir, file.replace(/\.png$/i, '.webp'));
  await sharp(src).webp({ quality: 82 }).toFile(dest);
  const { size } = await stat(dest);
  console.log(`${file} -> ${path.basename(dest)}  (${(size / 1024).toFixed(1)} KB)`);
  if (size > 150 * 1024) {
    console.warn(`  WARNING: ${path.basename(dest)} exceeds 150KB`);
  }
  await unlink(src);
}

console.log('Done.');
