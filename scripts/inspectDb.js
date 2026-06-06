// READ-ONLY database inspection. Deletes nothing. Reports anomalies so we can
// decide together what (if anything) is "unwanted".
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const Product = require('../models/Product');

const isBadUrl = (u) => {
  if (!u || typeof u !== 'string' || u.trim() === '') return 'empty';
  const s = u.toLowerCase();
  if (s.includes('placehold')) return 'placeholder';
  if (s.includes('example.com')) return 'example.com';
  if (s.includes('via.placeholder')) return 'placeholder';
  if (s.includes('no+image') || s.includes('no-image')) return 'no-image';
  if (s.startsWith('data:')) return 'data-uri';
  if (!s.startsWith('http')) return 'not-a-url';
  return null;
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Scanning products (read-only)...\n');

  const products = await Product.find({}).lean();
  console.log(`Total products: ${products.length}\n`);

  const noImages = [];
  const badUrls = [];   // {id, name, url, reason}
  const dupWithinProduct = [];
  const urlToProducts = new Map(); // url -> [names] (cross-product dup detection)

  for (const p of products) {
    const imgs = Array.isArray(p.images) ? p.images : [];
    if (imgs.length === 0) {
      noImages.push({ id: p._id, name: p.name });
      continue;
    }
    const seen = new Set();
    for (const img of imgs) {
      const url = img?.url;
      const reason = isBadUrl(url);
      if (reason) badUrls.push({ id: p._id, name: p.name, url: url || '(none)', reason });
      if (url) {
        if (seen.has(url)) dupWithinProduct.push({ id: p._id, name: p.name, url });
        seen.add(url);
        if (!urlToProducts.has(url)) urlToProducts.set(url, []);
        urlToProducts.get(url).push(p.name);
      }
    }
  }

  const crossDup = [...urlToProducts.entries()].filter(([, names]) => new Set(names).size > 1);

  console.log(`--- Products with NO images: ${noImages.length} ---`);
  noImages.slice(0, 30).forEach((p) => console.log(`  • ${p.name}  [${p.id}]`));

  console.log(`\n--- Bad / placeholder / empty image URLs: ${badUrls.length} ---`);
  badUrls.slice(0, 50).forEach((b) => console.log(`  • [${b.reason}] ${b.name}\n      ${b.url}`));

  console.log(`\n--- Duplicate URL repeated WITHIN the same product: ${dupWithinProduct.length} ---`);
  dupWithinProduct.slice(0, 30).forEach((d) => console.log(`  • ${d.name}\n      ${d.url}`));

  console.log(`\n--- Same URL used across DIFFERENT products: ${crossDup.length} ---`);
  crossDup.slice(0, 30).forEach(([url, names]) => console.log(`  • ${url}\n      used by: ${[...new Set(names)].join(', ')}`));

  await mongoose.disconnect();
  console.log('\nDone. Nothing was modified.');
})().catch((e) => {
  console.error('Inspection failed:', e.message);
  process.exit(1);
});
