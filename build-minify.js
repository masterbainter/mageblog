#!/usr/bin/env node

/**
 * Build Script - Minify index.html
 * Compresses inline CSS and JavaScript while preserving functionality
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const SOURCE_FILE = path.join(__dirname, 'index.html');
const OUTPUT_FILE = path.join(__dirname, 'index.min.html');
const BACKUP_FILE = path.join(__dirname, 'index.html.backup');

console.log('🧙 Grand Magus Build Spell - Minification\n');

// Read source file
console.log('📖 Reading source grimoire...');
const html = fs.readFileSync(SOURCE_FILE, 'utf8');
const originalSize = Buffer.byteLength(html, 'utf8');
console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);

// Minification options
const options = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    useShortDoctype: true,
    caseSensitive: true, // Preserve case for custom elements
    keepClosingSlash: true,
    conservativeCollapse: false, // Aggressive whitespace removal
    preserveLineBreaks: false
};

console.log('\n✨ Casting minification enchantment...');

// Minify
minify(html, options)
    .then(minified => {
        const minifiedSize = Buffer.byteLength(minified, 'utf8');
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

        console.log(`   Minified size: ${(minifiedSize / 1024).toFixed(2)} KB`);
        console.log(`   💾 Savings: ${savings}% (${((originalSize - minifiedSize) / 1024).toFixed(2)} KB reduced)`);

        // Write minified version
        fs.writeFileSync(OUTPUT_FILE, minified, 'utf8');
        console.log(`\n✅ Minified grimoire written to: ${OUTPUT_FILE}`);

        // Optionally create backup and replace original
        console.log('\n🔄 To deploy minified version:');
        console.log(`   1. Backup: cp index.html index.html.backup`);
        console.log(`   2. Deploy: mv index.min.html index.html`);
        console.log(`   3. Restore: mv index.html.backup index.html`);

        console.log('\n✨ Minification spell complete!\n');
    })
    .catch(err => {
        console.error('\n❌ Minification spell failed:', err.message);
        process.exit(1);
    });
