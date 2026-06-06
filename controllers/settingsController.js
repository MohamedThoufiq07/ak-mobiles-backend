const Settings = require('../models/Settings');

// @desc    Get store settings (public — storefront reads flash sale config)
// @route   GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update store settings (admin)
// @route   PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    const { flashSaleActive, flashSaleTitle, flashSaleSubtitle, flashSaleEndsAt } = req.body;
    const settings = await Settings.getSingleton();

    if (flashSaleActive !== undefined) settings.flashSaleActive = flashSaleActive;
    if (flashSaleTitle !== undefined) settings.flashSaleTitle = flashSaleTitle;
    if (flashSaleSubtitle !== undefined) settings.flashSaleSubtitle = flashSaleSubtitle;
    if (flashSaleEndsAt !== undefined) settings.flashSaleEndsAt = flashSaleEndsAt || null;

    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
