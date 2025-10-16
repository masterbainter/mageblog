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

    // Voice toggle button (if audio exists)
    const voiceToggleHTML = post.hasAudio ? `
    <!-- Voice Control Button -->
    <button id="voice-toggle" class="audio-control" title="Toggle Voice Narration" aria-label="Toggle voice narration">
        🔊
    </button>` : '';

    // Prepare content with inline images
    let contentHTML = post.content;

    // If images exist, intersperse them with the text
    if (post.images && post.images.length > 0) {
        // Split content into paragraphs
        const paragraphs = post.content.split('\n\n');

        // Build content with images interspersed
        let contentParts = [];

        paragraphs.forEach((para, index) => {
            // Add paragraph
            contentParts.push(`<p class="mb-6">${para}</p>`);

            // Add image after certain paragraphs (distribute evenly)
            const imageIndex = Math.floor((post.images.length * (index + 1)) / paragraphs.length);
            const prevImageIndex = Math.floor((post.images.length * index) / paragraphs.length);

            if (imageIndex > prevImageIndex && imageIndex <= post.images.length) {
                const img = post.images[imageIndex - 1];
                contentParts.push(`
                    <div class="my-8">
                        <img src="./${img.filename}" alt="${img.name}" class="w-full rounded-lg border-4 border-border-gold shadow-lg">
                        <p class="text-sm text-gray-600 mt-2 italic text-center">✨ ${img.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                    </div>
                `);
            }
        });

        contentHTML = contentParts.join('\n');
    }

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

        /* --- Audio Control Button --- */
        .audio-control {
            position: fixed;
            z-index: 150;
            background: var(--border-gold);
            color: var(--ink);
            border: 3px solid var(--ornament);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            touch-action: manipulation;
            bottom: 1rem;
            right: 1rem;
        }
        @media (min-width: 640px) {
            .audio-control {
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
                bottom: 2rem;
                right: 2rem;
            }
        }
        .audio-control:hover, .audio-control:active {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(140, 56, 56, 0.5);
        }
        .audio-control.playing {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
            50% { box-shadow: 0 4px 25px rgba(200, 163, 121, 0.8); }
        }
    </style>
</head>
<body class="antialiased">
    ${voiceToggleHTML}

    <div class="container mx-auto px-4 sm:px-6 py-12">
        <main class="max-w-4xl mx-auto">

            <a href="../../index.html" class="back-link mb-8">← Return to the Grimoire</a>

            <div class="chronicle-container mt-8">
                <h1 class="text-4xl md:text-5xl font-bold text-ornament mb-4">Chronicle Entry</h1>
                <p class="text-2xl mb-6 text-gray-600">${formattedDate}</p>
                <div class="text-lg md:text-xl leading-relaxed">
                    ${contentHTML}
                </div>
            </div>

            <footer class="mt-16 text-lg text-center border-t-2 border-dashed border-border-gold pt-8">
                <p>Copyright 1337, by order of the Grand Magus Alistair</p>
            </footer>

        </main>
    </div>

    <script>
        ${post.hasAudio ? `
        document.addEventListener('DOMContentLoaded', () => {
            // Pre-load the chronicle audio
            const chronicleAudio = new Audio('./audio.mp3');
            chronicleAudio.volume = 0.7;
            chronicleAudio.loop = false;

            let voiceMuted = false;
            const voiceToggle = document.getElementById('voice-toggle');

            // Debug audio loading
            chronicleAudio.addEventListener('loadeddata', () => {
                console.log('Chronicle audio loaded, duration:', chronicleAudio.duration);
            });
            chronicleAudio.addEventListener('error', (e) => {
                console.error('Chronicle audio failed to load:', e);
            });
            chronicleAudio.addEventListener('play', () => {
                console.log('Chronicle audio started playing');
                voiceToggle.classList.add('playing');
            });
            chronicleAudio.addEventListener('pause', () => {
                console.log('Chronicle audio paused');
                voiceToggle.classList.remove('playing');
            });
            chronicleAudio.addEventListener('ended', () => {
                console.log('Chronicle audio ended');
                voiceToggle.classList.remove('playing');
            });

            // Auto-play audio after a short delay (give time for user interaction)
            setTimeout(() => {
                if (!voiceMuted) {
                    chronicleAudio.play()
                        .then(() => console.log('✅ Auto-play started'))
                        .catch(e => {
                            console.log('⚠️ Auto-play prevented by browser. User must interact with page first.');
                            console.log('Audio will play when user clicks the voice button.');
                        });
                }
            }, 500);

            // Voice toggle button
            voiceToggle.addEventListener('click', () => {
                voiceMuted = !voiceMuted;
                console.log('Voice toggle clicked. Muted:', voiceMuted);

                if (voiceMuted) {
                    chronicleAudio.pause();
                    voiceToggle.innerHTML = '🔇';
                    voiceToggle.title = 'Voice Narration: OFF (Click to enable)';
                    console.log('Voice muted');
                } else {
                    // Resume or restart audio
                    if (chronicleAudio.paused) {
                        chronicleAudio.play()
                            .then(() => console.log('Audio resumed/started'))
                            .catch(e => console.log('Audio play prevented:', e));
                    }
                    voiceToggle.innerHTML = '🔊';
                    voiceToggle.title = 'Voice Narration: ON (Click to disable)';
                    console.log('Voice unmuted');
                }
            });
        });
        ` : ''}
    </script>
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
