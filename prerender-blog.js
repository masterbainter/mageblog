#!/usr/bin/env node

/**
 * Pre-render Blog Content
 * Injects the latest blog post directly into index.html
 * Eliminates client-side fetch delay for instant display
 */

const fs = require('fs');
const path = require('path');

const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');
const INDEX_SOURCE = path.join(__dirname, 'index.html.backup');
const INDEX_OUTPUT = path.join(__dirname, 'index.html');

console.log('🎨 Pre-rendering latest chronicle into grimoire...\n');

// Check if backup exists, if not use current index.html as source
const sourceFile = fs.existsSync(INDEX_SOURCE) ? INDEX_SOURCE : INDEX_OUTPUT;

// Load blog posts
if (!fs.existsSync(BLOG_DATA_FILE)) {
    console.error('❌ blog-posts.json not found!');
    process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(BLOG_DATA_FILE, 'utf8'));

if (posts.length === 0) {
    console.log('⚠️  No blog posts found. Skipping pre-render.');
    process.exit(0);
}

// Get latest post
const latestPost = posts[0];
console.log(`📖 Latest post: ${latestPost.date}`);
console.log(`   Content length: ${latestPost.content.length} characters`);

// Parse date
const [year, month, day] = latestPost.date.split('-').map(Number);
const date = new Date(year, month - 1, day);
const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago'
});

// Build post ID and link
const postId = latestPost.id || latestPost.timestamp;
const postLink = postId ? `./blog/${postId}/` : '#';

// Build featured image HTML
const featuredImageHTML = (latestPost.featuredImage && postId) ? `
                        <div class="mb-6">
                            <img src="./blog/${postId}/${latestPost.featuredImage}" alt="Chronicle illustration" class="w-full rounded-lg border-4 border-border-gold shadow-lg" loading="lazy" decoding="async">
                        </div>` : '';

// Build pre-rendered HTML
const preRenderedHTML = `
                    <div class="text-center mb-4">
                        <p class="text-2xl font-bold text-ornament">${formattedDate}</p>
                    </div>
                    ${featuredImageHTML}
                    <div class="text-lg leading-relaxed mb-4">
                        ${latestPost.content}
                    </div>
                    ${postId ? `<div class="text-center"><a href="${postLink}" class="text-xl text-ornament hover:underline font-bold">→ Read Full Chronicle${latestPost.hasAudio ? ' with Voice Narration' : ''}${latestPost.images && latestPost.images.length > 0 ? ' & Illustrations' : ''}</a></div>` : ''}`;

// Read index.html
let html = fs.readFileSync(sourceFile, 'utf8');

// Find and replace the placeholder content
// Look for the latest-post-container div and replace its inner content
const containerRegex = /(<div id="latest-post-container"[^>]*>)([\s\S]*?)(<\/div>\s*<\/section>)/;

if (!containerRegex.test(html)) {
    console.error('❌ Could not find latest-post-container in index.html');
    console.error('   Make sure the container has the correct id and structure');
    process.exit(1);
}

// Replace the content
html = html.replace(containerRegex, (match, opening, oldContent, closing) => {
    return `${opening}
                    <!-- Pre-rendered on ${new Date().toISOString()} - Post: ${latestPost.date} -->${preRenderedHTML}
                ${closing}`;
});

// Write output
fs.writeFileSync(INDEX_OUTPUT, html, 'utf8');

console.log(`\n✅ Pre-rendered content injected into: ${INDEX_OUTPUT}`);
console.log(`   Post date: ${formattedDate}`);
console.log(`   Post ID: ${postId}`);
console.log(`   Has audio: ${latestPost.hasAudio || false}`);
console.log(`   Has images: ${latestPost.images ? latestPost.images.length : 0}`);
console.log('\n🎯 Blog content will now appear instantly on page load!');
console.log('   (JavaScript fetch still runs as fallback for updates)\n');
