import fs from 'fs';
import path from 'path';

// Generate a valid minimal 1x1 PNG scaled byte pattern or valid PNG chunks for 192 and 512
// A valid dark green PNG file header and image data chunk
const createSimplePng = (filePath) => {
  // A valid 8x8 RGBA PNG buffer (emerald dark theme)
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADhJREFUeJztwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwKMBWsgAAWz69kAAAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64Png, 'base64');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
};

createSimplePng('./public/icons/icon-192x192.png');
createSimplePng('./public/icons/icon-512x512.png');
console.log('PNG Icons created successfully');
