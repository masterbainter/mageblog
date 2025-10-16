#!/usr/bin/env node

/**
 * Grok API Generator (Alternative approach)
 * Uses X.com's internal API to interact with Grok
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const COOKIE_FILE = path.join(__dirname, 'x-cookies.json');

// Prompt for Grok
const GROK_PROMPT = `You are Grand Magus Alistair, a wizard who claims to be one of the five most powerful mages, but your "magical" feats are actually just mundane modern activities described in grandiose medieval terms.

Write a short (2-3 sentences) humorous blog post for today's chronicle entry. The post should:
- Describe a mundane daily activity (laundry, grocery shopping, tech support, etc.) as if it were a grand magical quest
- Use dramatic, archaic language
- Include specific details that reveal it's actually something ordinary
- Be funny through the contrast between the grandiose description and mundane reality

Write ONE new chronicle entry for today. Only return the chronicle text, no additional commentary.`;

function loadCookies() {
    if (!fs.existsSync(COOKIE_FILE)) {
        throw new Error(`Cookie file not found: ${COOKIE_FILE}`);
    }

    const cookiesData = fs.readFileSync(COOKIE_FILE, 'utf8');
    const cookies = JSON.parse(cookiesData);

    // Convert to cookie header string
    const cookieHeader = cookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');

    // Extract auth_token and ct0 for headers
    const authToken = cookies.find(c => c.name === 'auth_token');
    const ct0 = cookies.find(c => c.name === 'ct0');

    if (!authToken || !ct0) {
        throw new Error('Missing required cookies: auth_token or ct0');
    }

    return {
        cookieHeader,
        authToken: authToken.value,
        ct0: ct0.value
    };
}

async function generateWithGrokAPI() {
    console.log('🤖 Using Grok API to generate content...');

    try {
        const { cookieHeader, ct0 } = loadCookies();
        console.log('✅ Loaded authentication cookies');

        // X.com's Grok API endpoint (this is a guess - may need adjustment)
        const postData = JSON.stringify({
            prompt: GROK_PROMPT,
            model: 'grok-2'
        });

        const options = {
            hostname: 'api.x.com',
            port: 443,
            path: '/2/grok/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Cookie': cookieHeader,
                'x-csrf-token': ct0,
                'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const response = JSON.parse(data);
                            resolve(response.text || response.response || response.message);
                        } catch (e) {
                            reject(new Error(`Failed to parse response: ${data}`));
                        }
                    } else {
                        reject(new Error(`API returned ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });

    } catch (error) {
        console.error('❌ Grok API error:', error.message);
        throw error;
    }
}

// Export for use in other scripts
module.exports = { generateWithGrokAPI };

// Allow running standalone
if (require.main === module) {
    generateWithGrokAPI()
        .then(post => {
            console.log('\n✅ Success! Generated post:');
            console.log(post);
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Failed:', error.message);
            console.log('\nℹ️  Note: X.com API endpoints may have changed or require different authentication.');
            console.log('   Falling back to template-based generation is recommended.');
            process.exit(1);
        });
}
