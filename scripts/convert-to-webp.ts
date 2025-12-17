// Manual script to convert images to WebP
// Run with: npx tsx scripts/convert-to-webp.ts

import sharp from 'sharp';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const QUALITY = 80;
const directories = [
  join(process.cwd(), 'src/assets'),
  join(process.cwd(), 'public'),
];

const imageExtensions = ['.jpg', '.jpeg', '.png'];
let totalConverted = 0;
let totalSkipped = 0;

async function processDirectory(dir: string) {
  if (!existsSync(dir)) {
    return;
  }

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules and other common exclusions
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        
        if (imageExtensions.includes(ext)) {
          const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          
          // Skip if WebP already exists
          if (existsSync(webpPath)) {
            totalSkipped++;
            continue;
          }

          try {
            const imageBuffer = await readFile(fullPath);
            
            // Check if it's a valid image
            const metadata = await sharp(imageBuffer).metadata();
            if (!metadata.width || !metadata.height) {
              continue;
            }

            const webpBuffer = await sharp(imageBuffer)
              .webp({ quality: QUALITY })
              .toBuffer();

            await writeFile(webpPath, webpBuffer);
            totalConverted++;
            
            const relativePath = fullPath.replace(process.cwd(), '').replace(/\\/g, '/');
            console.log(`✓ Converted: ${relativePath} → ${basename(webpPath)}`);
          } catch (error) {
            if (error instanceof Error) {
              console.warn(`⚠ Failed to convert ${entry.name}:`, error.message);
            }
          }
        }
      }
    }
  } catch (error) {
    // Directory might not exist, skip silently
  }
}

async function main() {
  console.log('🖼️  Converting images to WebP format...\n');
  
  for (const dir of directories) {
    await processDirectory(dir);
  }
  
  console.log(`\n✨ Conversion complete!`);
  console.log(`   Converted: ${totalConverted} image(s)`);
  console.log(`   Skipped: ${totalSkipped} image(s) (WebP already exists)\n`);
}

main().catch(console.error);

