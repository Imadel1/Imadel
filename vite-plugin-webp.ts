// Vite plugin for automatic WebP conversion
import type { Plugin } from 'vite';
import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

interface WebPOptions {
  quality?: number;
}

export function vitePluginWebp(options: WebPOptions = {}): Plugin {
  const {
    quality = 80,
  } = options;

  return {
    name: 'vite-plugin-webp',
    enforce: 'pre',
    async buildStart() {
      // Convert images during build
      if (process.env.NODE_ENV === 'production' || process.env.VITE_BUILD) {
        await convertImagesToWebP(quality);
      }
    },
    async generateBundle() {
      // Ensure WebP versions are available
      if (process.env.NODE_ENV === 'production' || process.env.VITE_BUILD) {
        await convertImagesToWebP(quality);
      }
    },
  };
}

async function convertImagesToWebP(quality: number) {
  const directories = [
    join(process.cwd(), 'src/assets'),
    join(process.cwd(), 'public'),
  ];

  const imageExtensions = ['.jpg', '.jpeg', '.png'];
  const converted = new Set<string>();
  let totalConverted = 0;

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
            
            // Skip if already converted or WebP already exists
            if (converted.has(fullPath) || existsSync(webpPath)) {
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
                .webp({ quality })
                .toBuffer();

              await writeFile(webpPath, webpBuffer);
              converted.add(fullPath);
              totalConverted++;
              
              const relativePath = fullPath.replace(process.cwd(), '').replace(/\\/g, '/');
              console.log(`✓ Converted: ${relativePath} → ${basename(webpPath)}`);
            } catch (error) {
              // Silently skip if conversion fails (might not be an image)
              if (error instanceof Error && error.message.includes('Input file is missing')) {
                continue;
              }
            }
          }
        }
      }
    } catch (error) {
      // Directory might not exist, skip silently
    }
  }

  for (const dir of directories) {
    await processDirectory(dir);
  }
  
  if (totalConverted > 0) {
    console.log(`\n✨ Converted ${totalConverted} image(s) to WebP format\n`);
  }
}

