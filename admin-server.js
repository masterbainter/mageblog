#!/usr/bin/env node

/**
 * Simple CRUD API server for managing blog posts
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 5001;
const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');

function loadPosts() {
    if (!fs.existsSync(BLOG_DATA_FILE)) {
        return [];
    }
    return JSON.parse(fs.readFileSync(BLOG_DATA_FILE, 'utf8'));
}

function savePosts(posts) {
    fs.writeFileSync(BLOG_DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
    regeneratePages();
}

function regeneratePages() {
    try {
        console.log('🔄 Regenerating blog post pages...');
        execSync('node generate-pages.js', { cwd: __dirname, stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Error regenerating pages:', error.message);
    }
}

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // Serve admin interface
    if (pathname === '/admin' || pathname === '/admin/') {
        serveFile(res, path.join(__dirname, 'admin.html'), 'text/html');
        return;
    }

    // API Routes
    if (pathname === '/api/posts') {
        if (req.method === 'GET') {
            // Read all posts
            const posts = loadPosts();
            sendJSON(res, 200, posts);

        } else if (req.method === 'POST') {
            // Create new post
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const newPost = JSON.parse(body);
                    newPost.id = Date.now().toString();
                    newPost.timestamp = Date.now();
                    if (!newPost.date) {
                        newPost.date = new Date().toISOString().split('T')[0];
                    }

                    const posts = loadPosts();
                    posts.unshift(newPost);
                    savePosts(posts);

                    sendJSON(res, 201, newPost);
                } catch (error) {
                    sendJSON(res, 400, { error: error.message });
                }
            });
        }

    } else if (pathname.match(/^\/api\/posts\/\d+$/)) {
        const id = pathname.split('/').pop();

        if (req.method === 'PUT') {
            // Update post
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const updatedPost = JSON.parse(body);
                    let posts = loadPosts();
                    const index = posts.findIndex(p => p.id === id);

                    if (index === -1) {
                        sendJSON(res, 404, { error: 'Post not found' });
                        return;
                    }

                    posts[index] = { ...posts[index], ...updatedPost, id };
                    savePosts(posts);

                    sendJSON(res, 200, posts[index]);
                } catch (error) {
                    sendJSON(res, 400, { error: error.message });
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete post
            let posts = loadPosts();
            const filteredPosts = posts.filter(p => p.id !== id);

            if (posts.length === filteredPosts.length) {
                sendJSON(res, 404, { error: 'Post not found' });
                return;
            }

            savePosts(filteredPosts);
            sendJSON(res, 200, { message: 'Post deleted' });
        }

    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`🧙 Admin server running at http://localhost:${PORT}/admin`);
    console.log(`📝 API available at http://localhost:${PORT}/api/posts`);
});
