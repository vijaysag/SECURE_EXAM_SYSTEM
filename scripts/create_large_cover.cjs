const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

const width = 800;
const height = 600;

const png = new PNG({ width, height });

for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;
        // Generate random noise or gradient
        png.data[idx] = Math.floor(Math.random() * 255);     // Red
        png.data[idx + 1] = Math.floor(Math.random() * 255); // Green
        png.data[idx + 2] = Math.floor(Math.random() * 255); // Blue
        png.data[idx + 3] = 255;                             // Alpha (Opacity)
    }
}

const buffer = PNG.sync.write(png);
fs.writeFileSync(path.join(__dirname, '../test_assets/large_cover.png'), buffer);
console.log("Created large_cover.png (800x600)");
