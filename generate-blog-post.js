#!/usr/bin/env node

/**
 * Automated Blog Post Generator for Grand Magus Alistair's Digital Grimoire
 * Uses Claude API to generate daily wizard humor content
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');
const MAX_POSTS = 10; // Keep only the 10 most recent posts

// Claude API configuration
const CLAUDE_API_URL = 'api.anthropic.com';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// System prompt for generating blog posts
const SYSTEM_PROMPT = `You are Grand Magus Alistair the Astute, a pompous medieval wizard who writes humorous blog entries about mundane modern activities disguised as grand magical feats.

Your writing style:
- Grandiose and self-important
- Medieval/fantasy language mixed with modern references
- Everything mundane is described as epic magic
- You mock your rival wizards
- Short entries (2-3 sentences)

Examples of your voice:
- "I commanded the Great Box of Cold to yield its frozen treasures"
- "The mystical Oracle (my smartphone) predicted rain with 87% accuracy"
- "I vanquished the dreaded Laundry Beast using the ancient Tide Pods"

Generate a single new Chronicle entry for today. Make it funny, keep it short, and maintain the character.`;

function callClaudeAPI(userPrompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ]
        });

        const options = {
            hostname: CLAUDE_API_URL,
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(body);
                        resolve(response.content[0].text);
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                } else {
                    reject(new Error(`API request failed with status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function generateBlogPost() {
    console.log('🧙 Generating new Chronicle entry for Grand Magus Alistair...');

    if (!ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY environment variable not set');
    }

    // Generate random topic prompt
    const topics = [
        'grocery shopping',
        'doing laundry',
        'paying bills online',
        'ordering pizza',
        'fixing WiFi',
        'assembling IKEA furniture',
        'dealing with customer service',
        'parallel parking',
        'updating software',
        'charging your phone',
        'cleaning the bathroom',
        'taking out the trash',
        'renewing your driver\'s license',
        'going to the dentist',
        'dealing with a printer',
        'cooking instant ramen',
        'Netflix buffering',
        'losing your keys',
        'Amazon delivery',
        'changing a lightbulb'
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const userPrompt = `Write a new Chronicle entry about ${randomTopic}. Keep it to 2-3 sentences. Be humorous and stay in character as the pompous wizard.`;

    try {
        const blogContent = await callClaudeAPI(userPrompt);
        return {
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            content: blogContent.trim()
        };
    } catch (error) {
        throw new Error(`Failed to generate blog post: ${error.message}`);
    }
}

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
    try {
        // Generate new post
        const newPost = await generateBlogPost();
        console.log('✅ Generated:', newPost.content);

        // Load existing posts
        let posts = loadBlogPosts();

        // Add new post at the beginning
        posts.unshift(newPost);

        // Keep only the most recent MAX_POSTS
        if (posts.length > MAX_POSTS) {
            posts = posts.slice(0, MAX_POSTS);
        }

        // Save updated posts
        saveBlogPosts(posts);
        console.log(`📝 Saved to ${BLOG_DATA_FILE}`);
        console.log(`📊 Total posts: ${posts.length}/${MAX_POSTS}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
