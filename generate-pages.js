#!/usr/bin/env node

/**
 * Generate individual HTML pages for each blog post
 * Creates a directory structure: /blog/{post-id}/index.html
 */

const fs = require('fs');
const path = require('path');

const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');
const BLOG_DIR = path.join(__dirname, 'blog');

// Read posts from blog-posts.json
function loadPosts() {
    if (!fs.existsSync(BLOG_DATA_FILE)) {
        console.error('❌ blog-posts.json not found!');
        process.exit(1);
    }

    const data = fs.readFileSync(BLOG_DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Generate HTML template for a blog post
function generatePostHTML(post) {
    // Parse date as YYYY-MM-DD and format it without timezone conversion
    const [year, month, day] = post.date.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Chicago'
    });

    // Audio player HTML (if audio exists)
    const audioPlayerHTML = post.hasAudio ? `
                <div class="audio-player mb-6">
                    <audio id="chronicle-audio" controls preload="metadata" class="w-full">
                        <source src="./audio.mp3" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                    <p class="text-sm text-gray-600 mt-2 italic">🎙️ Narrated by Grand Magus Alistair himself</p>
                </div>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chronicle: ${formattedDate} - Grand Magus Alistair</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap" rel="stylesheet">
    <style>
        :root {
            --parchment: #f3e9d2;
            --ink: #4a2c2a;
            --ornament: #8c3838;
            --border-gold: #c8a379;
        }

        body {
            font-family: 'MedievalSharp', cursive;
            background-color: var(--parchment);
            background-image: url('https://www.transparenttextures.com/patterns/old-paper.png');
            color: var(--ink);
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .text-ornament { color: var(--ornament); }

        .chronicle-container {
            border: 4px solid var(--border-gold);
            border-radius: 12px;
            padding: 2rem;
            background-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        .back-link {
            display: inline-block;
            color: var(--ornament);
            text-decoration: none;
            padding: 0.5rem 1rem;
            border: 2px solid var(--border-gold);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .back-link:hover {
            background-color: rgba(200, 163, 121, 0.3);
            transform: translateX(-5px);
        }

        .audio-player {
            border: 2px solid var(--border-gold);
            border-radius: 8px;
            padding: 1rem;
            background-color: rgba(255, 255, 255, 0.2);
        }

        audio {
            border-radius: 4px;
            filter: sepia(0.3) hue-rotate(15deg);
        }

        audio::-webkit-media-controls-panel {
            background-color: rgba(243, 233, 210, 0.9);
        }
    </style>
</head>
<body class="antialiased">
    <div class="container mx-auto px-4 sm:px-6 py-12">
        <main class="max-w-4xl mx-auto">

            <a href="../../index.html" class="back-link mb-8">← Return to the Grimoire</a>

            <div class="chronicle-container mt-8">
                <h1 class="text-4xl md:text-5xl font-bold text-ornament mb-4">Chronicle Entry</h1>
                <p class="text-2xl mb-6 text-gray-600">${formattedDate}</p>
                ${audioPlayerHTML}
                <div class="text-lg md:text-xl leading-relaxed">
                    ${post.content}
                </div>
            </div>

            <footer class="mt-16 text-lg text-center border-t-2 border-dashed border-border-gold pt-8">
                <p>Copyright 1337, by order of the Grand Magus Alistair</p>
            </footer>

        </main>
    </div>
</body>
</html>`;
}

// Generate all blog post pages
function generateAllPages() {
    const posts = loadPosts();

    // Create blog directory if it doesn't exist
    if (!fs.existsSync(BLOG_DIR)) {
        fs.mkdirSync(BLOG_DIR);
        console.log('📁 Created /blog directory');
    }

    // Get valid post IDs
    const validPostIds = new Set();

    let created = 0;
    let updated = 0;

    posts.forEach(post => {
        // Use post ID or timestamp for directory name
        const postId = post.id || post.timestamp || Date.now();
        validPostIds.add(postId.toString());
        const postDir = path.join(BLOG_DIR, postId.toString());
        const indexFile = path.join(postDir, 'index.html');

        // Create post directory if it doesn't exist
        const dirExists = fs.existsSync(postDir);
        if (!dirExists) {
            fs.mkdirSync(postDir, { recursive: true });
        }

        // Generate and write HTML
        const html = generatePostHTML(post);
        const fileExists = fs.existsSync(indexFile);
        fs.writeFileSync(indexFile, html, 'utf8');

        if (fileExists) {
            updated++;
        } else {
            created++;
        }
    });

    // Clean up orphaned directories (posts that were deleted)
    let deleted = 0;
    if (fs.existsSync(BLOG_DIR)) {
        const allDirs = fs.readdirSync(BLOG_DIR);
        allDirs.forEach(dirName => {
            if (!validPostIds.has(dirName)) {
                const orphanedDir = path.join(BLOG_DIR, dirName);
                if (fs.statSync(orphanedDir).isDirectory()) {
                    fs.rmSync(orphanedDir, { recursive: true, force: true });
                    deleted++;
                }
            }
        });
    }

    console.log('✅ Page generation complete!');
    console.log(`   📄 Created: ${created} new pages`);
    console.log(`   🔄 Updated: ${updated} existing pages`);
    if (deleted > 0) {
        console.log(`   🗑️  Deleted: ${deleted} orphaned directories`);
    }
    console.log(`   📊 Total pages: ${posts.length}`);
}

// Run the generator
try {
    generateAllPages();
} catch (error) {
    console.error('❌ Error generating pages:', error.message);
    process.exit(1);
}
