#!/usr/bin/env node

/**
 * Process Generated Post
 * This script takes the generated-post.txt file and processes it into the blog system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generateAudio, displayQuotaInfo } = require('./elevenlabs-audio-generator');
const { getCurrentTime } = require('./get-current-time');

const GENERATED_POST_FILE = path.join(__dirname, 'generated-post.txt');
const GENERATED_SLUG_FILE = path.join(__dirname, 'generated-slug.txt');
const TEMP_NEWS_FILE = path.join(__dirname, 'temp-news-context.json');
const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');

function loadBlogPosts() {
    if (!fs.existsSync(BLOG_DATA_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(BLOG_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        return [];
    }
}

function saveBlogPosts(posts) {
    fs.writeFileSync(BLOG_DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

async function main() {
    console.log('📝 Processing generated blog post...\n');

    // Check if generated post exists
    if (!fs.existsSync(GENERATED_POST_FILE)) {
        console.error('❌ Error: generated-post.txt not found!');
        console.error('Please make sure Claude Code has generated the post first.');
        process.exit(1);
    }

    // Read the generated content
    const content = fs.readFileSync(GENERATED_POST_FILE, 'utf8').trim();
    console.log('✅ Generated content loaded:');
    console.log('='.repeat(60));
    console.log(content);
    console.log('='.repeat(60));

    // Read the generated slug
    let slug = Date.now().toString(); // fallback to timestamp
    if (fs.existsSync(GENERATED_SLUG_FILE)) {
        slug = fs.readFileSync(GENERATED_SLUG_FILE, 'utf8').trim();
        console.log('\n🎯 Generated slug:', slug);
    } else {
        console.log('\n⚠️  No slug file found, using timestamp as fallback');
    }

    // Load news context if available
    let newsItems = [];
    if (fs.existsSync(TEMP_NEWS_FILE)) {
        const tempData = JSON.parse(fs.readFileSync(TEMP_NEWS_FILE, 'utf8'));
        newsItems = tempData.newsItems || [];
        console.log('\n📰 News references:');
        const categories = {};
        newsItems.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item.title);
        });
        Object.entries(categories).forEach(([category, titles]) => {
            console.log(`  ${category}: ${titles.length} items`);
        });
    }

    // Get current time from NTP
    console.log('\n🕐 Getting current time from NTP server...');
    let currentTime;
    try {
        currentTime = await getCurrentTime();
        console.log(`   Date: ${currentTime.date}`);
    } catch (error) {
        console.log('⚠️  NTP fetch failed, using system time');
        currentTime = {
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };
    }

    // Create new blog post
    const newPost = {
        id: slug,
        date: currentTime.date,
        timestamp: currentTime.timestamp,
        content: content,
        newsReferences: newsItems.map(item => item.title),
        hasAudio: false
    };

    // Load existing posts and add new one
    let posts = loadBlogPosts();
    posts.unshift(newPost);

    // Save updated posts
    saveBlogPosts(posts);
    console.log(`\n📝 Saved to ${BLOG_DATA_FILE}`);
    console.log(`📊 Total posts: ${posts.length}`);

    // Display ElevenLabs quota before generating audio
    console.log('\n🎙️  Preparing to generate voice narration...');
    await displayQuotaInfo();

    // Generate audio narration for the blog post
    try {
        // Create blog directory structure
        const BLOG_DIR = path.join(__dirname, 'blog');
        const postDir = path.join(BLOG_DIR, slug);
        if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir, { recursive: true });
        }

        const audioPath = path.join(postDir, 'audio.mp3');

        console.log('\n🎙️  Generating ElevenLabs audio narration...');
        console.log(`   Word count: ~${content.split(/\s+/).length} words`);

        await generateAudio(content, audioPath);

        // Update post with audio flag
        newPost.hasAudio = true;
        posts[0] = newPost;
        saveBlogPosts(posts);

        console.log('✅ Audio narration generated successfully!');
        console.log(`   Saved to: /blog/${slug}/audio.mp3`);

    } catch (error) {
        console.error('\n❌ Failed to generate audio:', error.message);
        console.log('⚠️  Continuing without audio narration...');
        // Don't fail the entire process if audio generation fails
    }

    // Generate individual HTML pages
    console.log('\n🔄 Generating individual blog post pages...');
    execSync('node generate-pages.js', { cwd: __dirname, stdio: 'inherit' });

    // Clean up temporary files
    console.log('\n🧹 Cleaning up temporary files...');
    if (fs.existsSync(GENERATED_POST_FILE)) {
        fs.unlinkSync(GENERATED_POST_FILE);
    }
    if (fs.existsSync(GENERATED_SLUG_FILE)) {
        fs.unlinkSync(GENERATED_SLUG_FILE);
    }
    if (fs.existsSync(TEMP_NEWS_FILE)) {
        fs.unlinkSync(TEMP_NEWS_FILE);
    }

    console.log('\n✅ Blog post successfully processed and published!');
    console.log(`🔗 View at: /blog/${newPost.id}/index.html`);
    console.log('🏠 Homepage updated with new post link\n');
}

main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
