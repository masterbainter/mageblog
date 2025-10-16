#!/usr/bin/env node

/**
 * ElevenLabs Audio Generator
 * Generates voice narration for blog posts using ElevenLabs API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'N2lVS1w4EtoT3dr4eOWO'; // Callum - deep British, dramatic, theatrical (USED FOR MAIN SITE)
// Alternative voices:
// - 'pNInz6obpgDQGcFmaJgB' - Adam - deep, authoritative
// - 'VR6AewLTigWG4xSOukaG' - Arnold - crisp, grounded
// - 'EXAVITQu4vr4xnSDxMaL' - Bella - soft, pleasant

const API_BASE = 'api.elevenlabs.io';

async function generateAudio(text, outputPath) {
    return new Promise((resolve, reject) => {
        if (!ELEVENLABS_API_KEY) {
            reject(new Error('ELEVENLABS_API_KEY not set in environment'));
            return;
        }

        const postData = JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.5,
                use_speaker_boost: true
            }
        });

        const options = {
            hostname: API_BASE,
            path: `/v1/text-to-speech/${VOICE_ID}`,
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('🎙️  Generating audio with ElevenLabs...');
        console.log(`   Text length: ${text.length} characters`);

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let errorData = '';
                res.on('data', chunk => errorData += chunk);
                res.on('end', () => {
                    reject(new Error(`ElevenLabs API error: ${res.statusCode} - ${errorData}`));
                });
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                const stats = fs.statSync(outputPath);
                console.log(`✅ Audio generated successfully`);
                console.log(`   Output: ${outputPath}`);
                console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
                resolve(outputPath);
            });

            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => {}); // Delete partial file
                reject(err);
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function checkQuota() {
    return new Promise((resolve, reject) => {
        if (!ELEVENLABS_API_KEY) {
            reject(new Error('ELEVENLABS_API_KEY not set'));
            return;
        }

        const options = {
            hostname: API_BASE,
            path: '/v1/user/subscription',
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        };

        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const subscription = JSON.parse(data);
                    resolve(subscription);
                } else {
                    reject(new Error(`API error: ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

async function displayQuotaInfo() {
    try {
        const sub = await checkQuota();
        console.log('\n📊 ELEVENLABS QUOTA STATUS:');
        console.log('─'.repeat(50));
        console.log(`Tier: ${sub.tier || 'Unknown'}`);
        console.log(`Characters used: ${sub.character_count.toLocaleString()} / ${sub.character_limit.toLocaleString()}`);
        console.log(`Remaining: ${(sub.character_limit - sub.character_count).toLocaleString()} characters`);
        const percentUsed = ((sub.character_count / sub.character_limit) * 100).toFixed(1);
        console.log(`Usage: ${percentUsed}%`);

        // Estimate remaining posts
        const avgCharsPerPost = 900; // ~150 words
        const postsRemaining = Math.floor((sub.character_limit - sub.character_count) / avgCharsPerPost);
        console.log(`\nEstimated posts remaining (150 words): ~${postsRemaining}`);
        console.log('─'.repeat(50) + '\n');
    } catch (error) {
        console.error('❌ Could not fetch quota:', error.message);
    }
}

module.exports = {
    generateAudio,
    checkQuota,
    displayQuotaInfo
};

// Allow running standalone for testing
if (require.main === module) {
    const testText = `Behold! The great Tech Guilds have unveiled their latest Artificial Minds,
claiming these enchanted servants can write poetry, solve riddles, and predict the future.
I tested one by asking it to organize my spell components, but it merely generated a
two-thousand-word essay on why I should be organizing them myself. I shall stick with
my mortal apprentice, who doesn't exist, but would still be more helpful.`;

    const outputPath = path.join(__dirname, 'audio', 'test-elevenlabs.mp3');

    console.log('🧙 ELEVENLABS AUDIO GENERATOR TEST\n');

    displayQuotaInfo()
        .then(() => {
            console.log('Generating test audio...\n');
            return generateAudio(testText, outputPath);
        })
        .then(() => {
            console.log('\n✅ Test complete! Check:', outputPath);
        })
        .catch(error => {
            console.error('\n❌ Error:', error.message);
            process.exit(1);
        });
}
