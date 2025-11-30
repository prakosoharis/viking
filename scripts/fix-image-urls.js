#!/usr/bin/env node

/**
 * Script untuk fix image_url di database yang punya format salah
 * Contoh format salah: ".deluwang.online/api/assets/xxx.jpg"
 * Format benar: "/assets/xxx.jpg"
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin';

// Upload Schema
const uploadSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
  status: { type: String, default: 'completed' }
});

const Upload = mongoose.model('Upload', uploadSchema);

async function fixImageUrls() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all uploads
    const uploads = await Upload.find({});
    console.log(`📊 Found ${uploads.length} uploads in database\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    for (const upload of uploads) {
      const originalUrl = upload.image_url;
      let needsUpdate = false;
      let newUrl = originalUrl;

      // Check if URL needs fixing
      if (originalUrl.includes('/assets/')) {
        // Extract just the /assets/filename.jpg part
        const assetsIndex = originalUrl.indexOf('/assets/');
        newUrl = originalUrl.substring(assetsIndex);

        // If it's different, needs update
        if (newUrl !== originalUrl) {
          needsUpdate = true;
        }
      } else if (!originalUrl.startsWith('/assets/') && !originalUrl.startsWith('http')) {
        // Malformed path without /assets/ prefix
        console.log(`⚠️  Skipping malformed URL: ${originalUrl}`);
        continue;
      }

      if (needsUpdate) {
        console.log(`🔧 Fixing: ${originalUrl}`);
        console.log(`   ➜ New:  ${newUrl}`);

        upload.image_url = newUrl;
        await upload.save();
        fixedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Cleanup Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Total uploads: ${uploads.length}`);
    console.log(`✅ Already correct: ${alreadyCorrectCount}`);
    console.log(`🔧 Fixed: ${fixedCount}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
console.log('='.repeat(60));
console.log('🛠️  Vikings Invoice - Image URL Fixer');
console.log('='.repeat(60) + '\n');

fixImageUrls()
  .then(() => {
    console.log('\n✨ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
