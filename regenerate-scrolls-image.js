#!/usr/bin/env node

/**
 * Regenerate scrolls-and-books.jpg image using Hugging Face Stable Diffusion API
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';
const IMAGES_DIR = path.join(__dirname, 'images');

const imageConfig = {
    filename: 'scrolls-and-books.jpg',
    prompt: 'Ancient scrolls and leather-bound books on an old wooden table, unfurled parchments with mystical writings, medieval illuminated manuscript style, ornate borders, rich browns and golds, candlelight, mystical atmosphere, high detail',
    name: 'scrolls-and-books'
};

async function generateImage(prompt) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ inputs: prompt });

        const options = {
            hostname: 'api-inference.huggingface.co',
            path: `/models/${HF_MODEL}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                const buffer = Buffer.concat(chunks);

                if (res.headers['content-type']?.includes('application/json')) {
                    const errorData = JSON.parse(buffer.toString());

                    if (errorData.error && errorData.error.includes('loading')) {
                        console.log('⏳ Model is loading, waiting 20 seconds...');
                        setTimeout(() => {
                            generateImage(prompt).then(resolve).catch(reject);
                        }, 20000);
                        return;
                    }

                    reject(new Error(`HF API Error ${res.statusCode}: ${JSON.stringify(errorData)}`));
                } else {
                    resolve(buffer);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function regenerateScrollsImage() {
    const { filename, prompt, name } = imageConfig;

    console.log('🎨 Generating scrolls and books image...\n');
    console.log(`📝 Image: ${name}`);
    console.log(`   "${prompt}"`);
    console.log('⏳ Calling Hugging Face API...');

    try {
        const imageBuffer = await generateImage(prompt);

        console.log('💾 Saving image...');
        const filepath = path.join(IMAGES_DIR, filename);
        fs.writeFileSync(filepath, imageBuffer);
        console.log(`✅ Saved: ${filename}`);

        const stats = fs.statSync(filepath);
        console.log(`📊 File size: ${Math.round(stats.size / 1024)} KB`);

        console.log('\n✨ Image generation complete!');
    } catch (error) {
        console.error(`❌ Failed to generate ${filename}:`, error.message);
        process.exit(1);
    }
}

if (!HF_API_TOKEN) {
    console.error('❌ HUGGINGFACE_API_TOKEN not found in environment variables');
    console.error('Please set it in your .env file');
    process.exit(1);
}

regenerateScrollsImage();
