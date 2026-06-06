// Removes EXACT-duplicate image URLs repeated WITHIN a single product's images
// array. Keeps the first occurrence (your correct URL) and preserves order.
// Does NOT change any image address. Does NOT touch images shared across
// different products (e.g. an accessory reusing a phone photo).
//
// Run modes:
//   node scripts/dedupeImages.js          -> DRY RUN: preview + write backup, no DB writes
//   node scripts/dedupeImages.js --apply  -> apply the dedupe (after a backup is written)
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const Product = require('../models/Product');
const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}).lean();

  const affected = [];
  for (const p of products) {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const seen = new Set();
    const deduped = [];
    for (const img of imgs) {
      const url = img?.url;
      if (url && seen.has(url)) continue; // drop redundant duplicate
      if (url) seen.add(url);
      deduped.push(img);
    }
    if (deduped.length !== imgs.length) {
      affected.push({ id: p._id, name: p.name, before: imgs, after: deduped });
    }
  }

  console.log(`Products with within-product duplicate images: ${affected.length}\n`);
  affected.forEach((a) => {
    console.log(`• ${a.name}  (${a.before.length} -> ${a.after.length} images)`);
  });

  if (affected.length === 0) {
    await mongoose.disconnect();
    console.log('\nNothing to dedupe.');
    return;
  }

  // Always write a backup of the affected products' ORIGINAL images.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `backup-images-${stamp}.json`);
  fs.writeFileSync(
    backupPath,
    JSON.stringify(affected.map((a) => ({ id: a.id, name: a.name, images: a.before })), null, 2)
  );
  console.log(`\nBackup of original images written to:\n  ${backupPath}`);

  if (!APPLY) {
    console.log('\nDRY RUN — no database changes made. Re-run with --apply to perform the dedupe.');
    await mongoose.disconnect();
    return;
  }

  // Apply: bulk update only the images field of affected products.
  const ops = affected.map((a) => ({
    updateOne: { filter: { _id: a.id }, update: { $set: { images: a.after } } },
  }));
  const result = await Product.bulkWrite(ops);
  console.log(`\nAPPLIED. Modified ${result.modifiedCount} products. No image addresses were changed — only redundant duplicates removed.`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
