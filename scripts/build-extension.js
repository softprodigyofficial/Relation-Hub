import { copyFileSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

console.log('Building Chrome extension...');

try {
  copyFileSync(
    join(rootDir, 'src', 'content.css'),
    join(distDir, 'content.css')
  );
  console.log('Copied content.css');

  const iconSvg = readFileSync(join(rootDir, 'public', 'icon.svg'), 'utf-8');

  const sizes = [16, 32, 48, 128];
  sizes.forEach(size => {
    const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop stop-color="#06B6D4"/>
      <stop offset="1" stop-color="#0EA5E9"/>
    </linearGradient>
  </defs>
  <path d="M64 36C55.2 36 48 43.2 48 52C48 60.8 55.2 68 64 68C72.8 68 80 60.8 80 52C80 43.2 72.8 36 64 36Z" fill="white"/>
  <path d="M88 68C81.4 68 76 73.4 76 80V92H52V80C52 73.4 46.6 68 40 68C33.4 68 28 73.4 28 80V96C28 98.2 29.8 100 32 100H96C98.2 100 100 98.2 100 96V80C100 73.4 94.6 68 88 68Z" fill="white"/>
  <path d="M96 44C91.6 44 88 47.6 88 52C88 56.4 91.6 60 96 60C100.4 60 104 56.4 104 52C104 47.6 100.4 44 96 44Z" fill="white" opacity="0.8"/>
  <path d="M32 44C27.6 44 24 47.6 24 52C24 56.4 27.6 60 32 60C36.4 60 40 56.4 40 52C40 47.6 36.4 44 32 44Z" fill="white" opacity="0.8"/>
</svg>`;
    writeFileSync(join(distDir, `icon${size}.svg`), canvas);
    console.log(`Created icon${size}.svg`);
  });

  const readme = `# RelationHub Chrome Extension

## Installation Instructions

1. Open Chrome and navigate to chrome://extensions/
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select the 'dist' folder from this project
5. The RelationHub extension is now installed!

## Usage

- Click the extension icon to open the main dashboard
- Visit any website and click the floating button in the bottom right to open the sidebar
- The extension will automatically detect email addresses on the page
- Sign in to save contacts and track interactions

## Features

- Automatic email detection on any webpage
- Contact management with company, title, and notes
- Interaction logging (emails, calls, meetings, notes)
- Meeting scheduling
- Beautiful, modern interface
- Secure data storage with Supabase

## Note

You need to have valid Supabase credentials in your .env file for the extension to work properly.
`;

  writeFileSync(join(distDir, 'README.md'), readme);
  console.log('Created README.md');

  const manifestUpdates = {
    icons: {
      '16': 'icon16.svg',
      '32': 'icon32.svg',
      '48': 'icon48.svg',
      '128': 'icon128.svg'
    }
  };

  const manifestPath = join(distDir, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  Object.assign(manifest, manifestUpdates);
  manifest.action.default_icon = manifestUpdates.icons;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Updated manifest.json');

  console.log('\nExtension built successfully!');
  console.log('To install: Load the "dist" folder as an unpacked extension in Chrome');

} catch (error) {
  console.error('Error building extension:', error);
  process.exit(1);
}
