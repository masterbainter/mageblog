#!/usr/bin/env node

/**
 * Convert Blog Images to WebP
 * Converts PNG images to WebP format for 25-35% size reduction
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BLOG_DIR = path.join(__dirname, 'blog');

async function convertImagesToWebP() {
    console.log('🖼️  Converting blog images to WebP format...\n');

    const blogDirs = fs.readdirSync(BLOG_DIR).filter(dir => {
        return fs.statSync(path.join(BLOG_DIR, dir)).isDirectory();
    });

    let totalConverted = 0;
    let totalSavings = 0;

    for (const blogDir of blogDirs) {
        const blogPath = path.join(BLOG_DIR, blogDir);
        const files = fs.readdirSync(blogPath);

        const pngFiles = files.filter(f => f.endsWith('.png'));

        if (pngFiles.length === 0) continue;

        console.log(`📁 ${blogDir}`);

        for (const pngFile of pngFiles) {
            const pngPath = path.join(blogPath, pngFile);
            const webpFile = pngFile.replace('.png', '.webp');
            const webpPath = path.join(blogPath, webpFile);

            // Skip if WebP already exists
            if (fs.existsSync(webpPath)) {
                console.log(`   ⏭️  ${pngFile} -> already converted`);
                continue;
            }

            try {
                const pngSize = fs.statSync(pngPath).size;

                // Convert to WebP with quality 85 (good balance)
                await sharp(pngPath)
                    .webp({ quality: 85 })
                    .toFile(webpPath);

                const webpSize = fs.statSync(webpPath).size;
                const savings = pngSize - webpSize;
                const savingsPercent = ((savings / pngSize) * 100).toFixed(1);

                console.log(`   ✅ ${pngFile} -> ${webpFile}`);
                console.log(`      ${(pngSize / 1024).toFixed(1)} KB -> ${(webpSize / 1024).toFixed(1)} KB (${savingsPercent}% smaller)`);

                totalConverted++;
                totalSavings += savings;
            } catch (error) {
                console.error(`   ❌ Error converting ${pngFile}:`, error.message);
            }
        }

        console.log('');
    }

    console.log('═'.repeat(60));
    console.log(`\n✨ Conversion Complete!\n`);
    console.log(`Images converted:       ${totalConverted}`);
    console.log(`Total space saved:      ${(totalSavings / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Average savings:        ${totalConverted > 0 ? (totalSavings / totalConverted / 1024).toFixed(1) : 0} KB per image`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Update generate-pages.js to use .webp files`);
    console.log(`   2. Keep .png files as fallback for older browsers`);
    console.log(`   3. Commit and push changes\n`);
}

convertImagesToWebP().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
