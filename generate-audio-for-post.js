#!/usr/bin/env node

/**
 * Generate audio for a specific blog post
 */

const fs = require('fs');
const path = require('path');
const { generateAudio } = require('./elevenlabs-audio-generator');

const postId = process.argv[2];

if (!postId) {
    console.error('Usage: node generate-audio-for-post.js <post-id>');
    process.exit(1);
}

const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');

async function main() {
    // Load blog posts
    const posts = JSON.parse(fs.readFileSync(BLOG_DATA_FILE, 'utf8'));

    // Find the post
    const post = posts.find(p => p.id === postId);

    if (!post) {
        console.error(`❌ Post not found: ${postId}`);
        process.exit(1);
    }

    console.log(`🎙️  Generating audio for: ${postId}`);
    console.log(`   Content: ${post.content.substring(0, 100)}...`);
    console.log(`   Word count: ~${post.content.split(/\s+/).length} words\n`);

    // Create audio directory if needed
    const postDir = path.join(__dirname, 'blog', postId);
    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
    }

    const audioPath = path.join(postDir, 'audio.mp3');

    try {
        await generateAudio(post.content, audioPath);

        // Update post metadata
        post.hasAudio = true;
        fs.writeFileSync(BLOG_DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');

        console.log('\n✅ Audio generated successfully!');
        console.log(`   Saved to: ${audioPath}`);
        console.log(`   Post metadata updated`);

        // Regenerate HTML pages
        console.log('\n🔄 Regenerating blog pages...');
        require('./generate-pages.js');

    } catch (error) {
        console.error('\n❌ Error generating audio:', error.message);
        process.exit(1);
    }
}

main();
