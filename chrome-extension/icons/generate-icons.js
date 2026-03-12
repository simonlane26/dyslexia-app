// Run with Node: node generate-icons.js
// Requires: npm install canvas (or use any image editor to create PNGs from icon.svg)
// Alternatively, just convert icon.svg to 16x16, 48x48, 128x128 PNG using any tool.

const fs = require('fs');

// Simple SVG icon — purple rounded square with "DW" text
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#2563eb"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#g)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="Arial, sans-serif" font-weight="800" font-size="52"
    fill="white" letter-spacing="-2">DW</text>
</svg>`;

fs.writeFileSync('icon.svg', svg(128));
console.log('icon.svg created — convert to icon16.png, icon48.png, icon128.png');
console.log('Use: https://cloudconvert.com/svg-to-png or any image editor');
