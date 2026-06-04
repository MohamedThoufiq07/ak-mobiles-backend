const fs = require('fs');

let seeder = fs.readFileSync('seeder.js', 'utf8');

const brandImages = {
  Apple: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg',
  Samsung: 'https://m.media-amazon.com/images/I/71CXhVhpM0L._SX679_.jpg',
  OnePlus: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SX679_.jpg',
  Xiaomi: 'https://m.media-amazon.com/images/I/71d1ytcCntL._SX679_.jpg',
  Vivo: 'https://m.media-amazon.com/images/I/61HGW0pE4AL._SX679_.jpg',
  Oppo: 'https://m.media-amazon.com/images/I/71v2jVp4gTL._SX679_.jpg',
  Realme: 'https://m.media-amazon.com/images/I/71LqHn-DwbL._SX679_.jpg',
  Motorola: 'https://m.media-amazon.com/images/I/61HGW0pE4AL._SX679_.jpg'
};

let currentBrand = '';

const lines = seeder.split('\n');
const newLines = lines.map(line => {
  if (line.includes('brand:')) {
    const match = line.match(/brand:\s*'([^']+)'/);
    if (match) currentBrand = match[1];
  }
  
  if (line.includes('url: \'https://fdn2.gsmarena.com/')) {
    const defaultImage = 'https://m.media-amazon.com/images/I/71CXhVhpM0L._SX679_.jpg';
    const newImage = brandImages[currentBrand] || defaultImage;
    return line.replace(/url:\s*'[^']+'/, `url: '${newImage}'`);
  }
  return line;
});

fs.writeFileSync('seeder.js', newLines.join('\n'));
console.log('Images replaced!');
