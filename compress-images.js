#!/usr/bin/env node

/**
 * Compress and resize all images on the site for faster loading
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const QUALITY = 85; // JPEG quality (0-100)
const HOMEPAGE_MAX_WIDTH = 800; // Max width for homepage images
const BLOG_IMAGE_SIZE = 800; // Blog images are square, resize to 800x800

// Images to compress
const imagesToCompress = [
    // Homepage images
    { path: 'images/grimoire-book.jpg', maxWidth: HOMEPAGE_MAX_WIDTH },
    { path: 'images/wizard-artifacts.jpg', maxWidth: HOMEPAGE_MAX_WIDTH },
    { path: 'images/wizard-1.jpg', maxWidth: HOMEPAGE_MAX_WIDTH },
    { path: 'images/wizard-2.jpg', maxWidth: HOMEPAGE_MAX_WIDTH },
    { path: 'images/wizard-3.jpg', maxWidth: HOMEPAGE_MAX_WIDTH },
    { path: 'images/wizard-4.jpg', maxWidth: HOMEPAGE_MAX_WIDTH },
    { path: 'images/scrolls-and-books.jpg', maxWidth: HOMEPAGE_MAX_WIDTH },
];

async function compressImage(imagePath, maxWidth) {
    const fullPath = path.join(__dirname, imagePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${imagePath} (not found)`);
        return { skipped: true };
    }

    const originalStats = fs.statSync(fullPath);
    const originalSize = originalStats.size;

    // Create a temporary file
    const tempPath = fullPath + '.tmp';

    try {
        // Resize and compress
        await sharp(fullPath)
            .resize(maxWidth, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: QUALITY, progressive: true })
            .toFile(tempPath);

        // Replace original with compressed version
        fs.renameSync(tempPath, fullPath);

        const newStats = fs.statSync(fullPath);
        const newSize = newStats.size;
        const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

        return {
            originalSize,
            newSize,
            savings,
            skipped: false
        };
    } catch (error) {
        console.error(`❌ Error compressing ${imagePath}:`, error.message);
        // Clean up temp file if it exists
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        return { error: true };
    }
}

async function compressBlogImages() {
    console.log('🔍 Looking for blog post images...\n');

    const blogDir = path.join(__dirname, 'blog');
    if (!fs.existsSync(blogDir)) {
        console.log('No blog directory found');
        return [];
    }

    const blogImages = [];
    const postDirs = fs.readdirSync(blogDir);

    for (const postDir of postDirs) {
        const postPath = path.join(blogDir, postDir);
        if (!fs.statSync(postPath).isDirectory()) continue;

        const files = fs.readdirSync(postPath);
        for (const file of files) {
            if (file.endsWith('.png') || file.endsWith('.jpg')) {
                blogImages.push({
                    path: path.join('blog', postDir, file),
                    maxWidth: BLOG_IMAGE_SIZE
                });
            }
        }
    }

    return blogImages;
}

async function compressAllImages() {
    console.log('🗜️  Image Compression Tool\n');
    console.log(`Settings:`);
    console.log(`  - JPEG Quality: ${QUALITY}%`);
    console.log(`  - Homepage Max Width: ${HOMEPAGE_MAX_WIDTH}px`);
    console.log(`  - Blog Image Size: ${BLOG_IMAGE_SIZE}x${BLOG_IMAGE_SIZE}px\n`);

    // Find all blog images
    const blogImages = await compressBlogImages();
    const allImages = [...imagesToCompress, ...blogImages];

    console.log(`📊 Found ${allImages.length} images to compress\n`);

    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allImages.length; i++) {
        const { path: imagePath, maxWidth } = allImages[i];
        process.stdout.write(`[${i + 1}/${allImages.length}] ${imagePath}... `);

        const result = await compressImage(imagePath, maxWidth);

        if (result.skipped) {
            console.log('⚠️  SKIPPED');
            skippedCount++;
        } else if (result.error) {
            console.log('❌ ERROR');
            errorCount++;
        } else {
            const originalKB = Math.round(result.originalSize / 1024);
            const newKB = Math.round(result.newSize / 1024);
            console.log(`✅ ${originalKB}KB → ${newKB}KB (${result.savings}% savings)`);

            totalOriginalSize += result.originalSize;
            totalNewSize += result.newSize;
            processedCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Compression Summary:\n');
    console.log(`  Processed: ${processedCount} images`);
    if (skippedCount > 0) console.log(`  Skipped: ${skippedCount} images`);
    if (errorCount > 0) console.log(`  Errors: ${errorCount} images`);
    console.log(`  Original Total: ${Math.round(totalOriginalSize / 1024)} KB`);
    console.log(`  New Total: ${Math.round(totalNewSize / 1024)} KB`);
    console.log(`  Total Savings: ${((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
}

compressAllImages().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
