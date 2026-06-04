const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Simple script to batch-replace all product image URLs in seeder.js
const fs = require('fs');
let content = fs.readFileSync('seeder.js', 'utf8');

const replacements = [
  // APPLE - all Apple products currently use the same Amazon URL
  // iPhone 15 Pro Max
  {
    old: "{ url: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg', alt: 'iPhone 15 Pro Max Front' }",
    new: "{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', alt: 'iPhone 15 Pro Max Front' }"
  },
  {
    old: "{ url: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg', alt: 'iPhone 15 Pro Max Back' }",
    new: "{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', alt: 'iPhone 15 Pro Max Back' }"
  },
  {
    old: "{ url: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg', alt: 'iPhone 15 Pro Max Side' }",
    new: "{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', alt: 'iPhone 15 Pro Max Side' }"
  },
  // iPhone 15
  {
    old: "{ url: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg', alt: 'iPhone 15 Front' }",
    new: "{ url: 'https://images.unsplash.com/photo-1697490046569-5eb4de0d56ec?w=400&q=80', alt: 'iPhone 15 Front' }"
  },
  {
    old: "{ url: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg', alt: 'iPhone 15 Back' }",
    new: "{ url: 'https://images.unsplash.com/photo-1697490046569-5eb4de0d56ec?w=400&q=80', alt: 'iPhone 15 Back' }"
  },
  // iPhone 14
  {
    old: "{ url: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg', alt: 'iPhone 14 Front' }",
    new: "{ url: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=400&q=80', alt: 'iPhone 14 Front' }"
  },
  {
    old: "{ url: 'https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg', alt: 'iPhone 14 Back' }",
    new: "{ url: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=400&q=80', alt: 'iPhone 14 Back' }"
  },
];

// Replace each one
for (const r of replacements) {
  content = content.replace(r.old, r.new);
}

// Now bulk-replace remaining brand images by alt text patterns
const bulkReplacements = [
  // Samsung
  ['Samsung Galaxy S24 Ultra', 'https://images.unsplash.com/photo-1706220037591-6dff50c96ee8?w=400&q=80'],
  ['Samsung Galaxy S24', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80'],
  ['Samsung Galaxy A55', 'https://images.samsung.com/is/image/samsung/p6pim/africa_en/sm-a556elvwafb/gallery/africa-en-galaxy-a55-5g-sm-a556-sm-a556elvwafb-540306677?$1164_776_PNG$'],
  // OnePlus
  ['OnePlus 12 Front', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80'],
  ['OnePlus 12 Back', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80'],
  ['OnePlus 12R', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80'],
  // Xiaomi
  ['Xiaomi 14', 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80'],
  ['Redmi Note 13 Pro', 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=400&q=80'],
  ['Redmi 13C', 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&q=80'],
  // Vivo
  ['Vivo X100 Pro', 'https://images.unsplash.com/photo-1622957040803-26a4508d6e3d?w=400&q=80'],
  ['Vivo V30 Pro', 'https://in-exstatic-vivofs.vivo.com/gdHFRinHEMrj3yPG/1709635464671/567a7babdae995ffb47306d1a22b2b3f.png'],
  ['Vivo T3 5G', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&q=80'],
  // Oppo
  ['Oppo Find X7 Ultra', 'https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=400&q=80'],
  ['Oppo Reno 11 Pro', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80'],
  // Realme
  ['Realme GT 5 Pro', 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&q=80'],
  ['Realme 12 Pro', 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80'],
  // Motorola
  ['Motorola Edge 50 Pro', 'https://images.unsplash.com/photo-1587502537745-84b86da1204f?w=400&q=80'],
  ['Moto G84', 'https://images.unsplash.com/photo-1551355738-1875b9b0c524?w=400&q=80'],
  // Nothing
  ['Nothing Phone (2) Front', 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&q=80'],
  ['Nothing Phone (2) Back', 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&q=80'],
  ['Nothing Phone (2a)', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80'],
  // Google
  ['Google Pixel 8 Pro', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80'],
  ['Google Pixel 8a', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80'],
];

// For each bulk replacement, find lines with the alt text and replace the amazon url
for (const [altMatch, newUrl] of bulkReplacements) {
  const regex = new RegExp(
    `\\{ url: '[^']+', alt: '${altMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^']*' \\}`,
    'g'
  );
  content = content.replace(regex, (match) => {
    const altText = match.match(/alt: '([^']+)'/)[1];
    return `{ url: '${newUrl}', alt: '${altText}' }`;
  });
}

fs.writeFileSync('seeder.js', content);
console.log('✅ seeder.js image URLs updated!');
