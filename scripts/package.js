// Script to package the built extension into solve-to-scroll.zip
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

console.log('Build completed. Packaging extension into distribution zip...');

// Simple zip packer using archiver or powershell Compress-Archive
import { execSync } from 'child_process';

const distPath = path.resolve('dist');
const zipPath = path.resolve('solve-to-scroll.zip');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

try {
  execSync(`powershell -Command "Compress-Archive -Path '${distPath}/*' -DestinationPath '${zipPath}' -Force"`);
  console.log(`Successfully created package: ${zipPath}`);
} catch (e) {
  console.log('Packaging warning:', e.message);
}
