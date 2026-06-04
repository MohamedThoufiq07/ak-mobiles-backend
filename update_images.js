const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./models/Product');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

// Image mapping: product name pattern -> new image URL
// Sorted longest match first so "iPhone 15 Pro Max" matches before "iPhone 15 Pro"
const IMAGE_MAP = [
  // ===== SMARTPHONES =====
  // APPLE
  { match: 'iPhone 15 Pro Max', url: 'https://image.cdn.shpy.in/301826/1-1708521332360.jpeg?format=webp' },
  { match: 'iPhone 15', url: 'https://image.cdn.shpy.in/301826/1-1708520956671.jpeg?width=600&format=webp' },
  { match: 'iPhone 14', url: 'https://grest.in/cdn/shop/files/Frame_3_5.png?v=1775222416&width=3840' },

  // SAMSUNG
  { match: 'Galaxy S24 Ultra', url: 'https://pngdownload.io/wp-content/uploads/2024/02/Samsung-Galaxy-S24-Ultra-Titanium-Violet-Smartphone-transparent-PNG-image-jpg.webp' },
  { match: 'Galaxy S24', url: 'https://static.vecteezy.com/system/resources/previews/041/329/788/non_2x/samsung-galaxy-s24-ultra-titanium-blue-back-view-free-png.png' },

  // VIVO
  { match: 'Vivo X100', url: 'https://in-exstatic-vivofs.vivo.com/gdHFRinHEMrj3yPG/1702983248432/61ad5ee6e72682f52d8aa495e314c56c.png' },
  { match: 'Vivo V30', url: 'https://in-exstatic-vivofs.vivo.com/gdHFRinHEMrj3yPG/1709633883246/7e1e7e35082e2abf290ec7c423d4361f.png' },
  { match: 'Vivo T3', url: 'https://img-prd-pim.poorvika.com/cdn-cgi/image/width=500,height=500,quality=75/product/vivo-t3-5g-cosmic-blue-128gb-8gb-ram-front-back-view.png' },

  // OPPO
  { match: 'Oppo Find X7', url: 'https://cdn.beebom.com/mobile/oppo-find-x7-ultra/oppo-find-x7-ultra-back-and-front.png' },
  { match: 'Oppo Reno 11', url: 'https://www.giztop.com/media/catalog/product/cache/97cc1143d2e20f2b0c8ea91aaa12053c/o/p/oppo_reno_11-1_1_.png' },

  // XIAOMI / REDMI
  { match: 'Xiaomi 14', url: 'https://i05.appmifile.com/886_item_uk/07/06/2024/f6882a3273c493e81ddafd8366010e8c.png' },
  { match: 'Redmi 13C', url: 'https://img-prd-pim.poorvika.com/prodvarval/Redmi-13-5g-orchid-pink-128gb-6gb-ram-Front-Back-View-Thumbnail.png' },
  { match: 'Redmi Note 13 Pro', url: 'https://i03.appmifile.com/789_item_in/04/07/2024/291d6375bb3ce600675227b27a29ac3c.png' },

  // REALME
  { match: 'Realme GT 5 Pro', url: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt5-pro.jpg' },
  { match: 'Realme 12 Pro', url: 'https://img-prd-pim.poorvika.com/cdn-cgi/image/width=500,height=500,quality=75/product/realme-12-pro-5g-Navigator-beige-256gb-8gb-ram-front-back-view.png' },

  // NOTHING
  { match: 'Nothing Phone (2a)', url: 'https://cdn.shopify.com/s/files/1/0585/2479/5086/products/black-1.png?v=1709369706' },
  { match: 'Nothing Phone (2)', url: 'https://www.pngall.com/wp-content/uploads/13/Nothing-Phone-1-PNG-Photos.png' },

  // NOKIA
  { match: 'Nokia G42', url: 'https://cdn.beebom.com/mobile/nokia-g42-5g3.png' },

  // MOTOROLA
  { match: 'Motorola Edge 50', url: 'https://motorolain.vtexassets.com/arquivos/ids/159178/motorola-edge-50-pro-PDP-ecomm-render-color5-5-.png?v=638614765175970000' },
  { match: 'Moto G84', url: 'https://p3-ofp.static.pub//fes/cms/2025/07/04/2qxujwoenuvy55t3ornuxcs6sdgtqk899280.png' },

  // ONEPLUS
  { match: 'OnePlus 12R', url: 'https://oasis.opstatics.com/content/dam/oasis/page/2024/global/product/aston/aston_blue.png' },
  { match: 'OnePlus 12', url: 'https://image01-in.oneplus.net/media/202407/04/9052428d8c69bd8bb884c7913af5fa73.png' },

  // ===== ACCESSORIES =====
  // EARBUDS
  { match: 'AirPods Pro', url: 'https://www.sathya.store/img/product/xnmxLT0B28I9PDZW.png' },
  { match: 'WF-1000XM5', url: 'https://media.tatacroma.com/Croma%20Assets/Entertainment/Wireless%20Earbuds/Images/301580_0_eu3o0d.png' },
  { match: 'Galaxy Buds2 Pro', url: 'https://png.pngtree.com/png-vector/20250220/ourmid/pngtree-pink-samsung-galaxy-buds-2-pro-wireless-bluetooth-earphones-clipart-illustration-png-image_15539537.png' },
  { match: 'OnePlus Buds 3', url: 'https://oasis.opstatics.com/content/dam/oasis/page/2024/global/product/euler/spec_blue.png' },
  { match: 'Airdopes 141', url: 'https://www.boat-lifestyle.com/cdn/shop/files/AD141-FI_Grey01.png?v=1698391770' },

  // CHARGERS
  { match: 'Apple 20W USB-C', url: 'https://inventstore.in/wp-content/uploads/2023/06/adapter-20w.png' },
  { match: 'Samsung 25W USB-C', url: 'https://media-ik.croma.com/prod/https://media.tatacroma.com/Croma%20Assets/Communication/Chargers%20and%20Batteries/Images/222115_0_u6y7vy.png' },
  { match: 'Anker 511 Charger', url: 'https://store.ooredoo.com.kw/media/catalog/product/cache/fe0a302af94e109db698e86ead4007fa/a/r/artboard_1_7.png' },
  { match: 'SUPERVOOC 80W', url: 'https://image01-eu.oneplus.net/media/202503/03/4feb5923d1dfed07c14dfe30329681d8.png' },
  { match: 'Spigen ArcStation', url: 'https://incredideals.co/cdn/shop/files/619o71RvKDL__AC_SL1500_1cc8878b-bd65-41a7-9743-b861efce8b4c_jpg.webp?v=1737264381' },

  // SMART WATCHES
  { match: 'Apple Watch Series 9', url: 'https://pngimg.com/uploads/apple_watch/apple_watch_PNG13.png' },
  { match: 'Galaxy Watch 6', url: 'https://www.myg.in/images/thumbnails/300/300/detailed/87/61fDRIfPQEL._SX679_-removebg-preview.png.png' },
  { match: 'OnePlus Watch 2', url: 'https://image01-in.oneplus.net/india-oneplus-statics-file/epb/202402/26/2JL5MkAYL9E27en1.png' },
  { match: 'Noise ColorFit Pro 5', url: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/ciw/2026/2/20/ed44186a-11c6-4fbf-8fef-2b317f7f596f_K1WNTQ5QLR_MN_19022026.png' },
  { match: 'Wave Sigma', url: 'https://www.boat-lifestyle.com/cdn/shop/files/WaveSigma-FI_Black01_600x.png?v=1692856673' },

  // POWER BANKS
  { match: 'Mi Power Bank 3i', url: 'https://gadgetshieldz.com/cdn/shop/files/mi-3i-20000mah-power-bank-cosmic-orange-full.webp?v=1778740283&width=1080&width=1080' },
  { match: 'Anker PowerCore 24K', url: 'https://cdn.shopify.com/s/files/1/0917/4807/3750/files/A1289011-Anker_737_Power_Bank_PowerCore_24K_5_cbe40b31-37b4-4a09-8b6c-b5f7fce2f651.png?v=1739687842' },
  { match: 'Ambrane Stylo', url: 'https://img-prd-pim.poorvika.com/cdn-cgi/image/width=500,height=500,quality=75/product/ambrane-stylo-n20-22-5w-20000-mah-power-bank-Purple-Front-view.png' },
  { match: 'URBN 10000mAh', url: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/ciw/2026/2/20/108c1933-df4a-407e-b672-c30ddcd05880_MUHEXI81IT_MN_20022026.png' },
  { match: 'Realme 10000mAh Power Bank', url: 'https://m.media-amazon.com/images/I/71Hg2IZMj9L._AC_UF894,1000_QL80_.jpg' },
];

const findImageUrl = (productName) => {
  // Sort by match length descending so more specific matches come first
  const sorted = [...IMAGE_MAP].sort((a, b) => b.match.length - a.match.length);
  for (const entry of sorted) {
    if (productName.includes(entry.match)) {
      return entry.url;
    }
  }
  return null;
};

const updateImages = async () => {
  try {
    await connectDB();
    const products = await Product.find({});
    console.log(`Found ${products.length} products in database`);

    let updated = 0;
    for (const product of products) {
      const newUrl = findImageUrl(product.name);
      if (newUrl) {
        product.images = product.images.map(img => ({
          ...img.toObject ? img.toObject() : img,
          url: newUrl
        }));
        await product.save();
        updated++;
        console.log(`  ✅ ${product.name} → image updated`);
      } else {
        console.log(`  ⏭️  ${product.name} → no matching URL provided, skipped`);
      }
    }

    console.log(`\n🎉 Updated ${updated}/${products.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateImages();
