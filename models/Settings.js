const mongoose = require('mongoose');

// Single global settings document for store-wide config (e.g. the flash sale).
const settingsSchema = new mongoose.Schema(
  {
    flashSaleActive: { type: Boolean, default: false },
    flashSaleTitle: { type: String, default: 'Flash Sale' },
    flashSaleSubtitle: { type: String, default: "Deals ending soon! Lowest prices of the month." },
    flashSaleEndsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Helper: always work with one settings doc (create on first access).
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
