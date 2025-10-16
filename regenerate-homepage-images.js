#!/usr/bin/env node

/**
 * Regenerate homepage images using Hugging Face Stable Diffusion API
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';
const IMAGES_DIR = path.join(__dirname, 'images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Define images to generate
const imagesToGenerate = [
    {
        filename: 'grimoire-book.jpg',
        prompt: 'An ancient leather-bound grimoire spellbook lying open with glowing magical runes and symbols, candlelight illuminating the pages, medieval illuminated manuscript style, ornate gold leaf, rich browns and golds, mystical atmosphere, high detail',
        name: 'grimoire-book'
    },
    {
        filename: 'wizard-artifacts.jpg',
        prompt: 'A collection of mystical wizard artifacts on an old wooden table - crystal orbs, ancient scrolls, potion bottles, wand, magical implements, candles, medieval illuminated manuscript style, ornate borders, rich colors, gold accents, mystical atmosphere',
        name: 'wizard-artifacts'
    },
    {
        filename: 'wizard-1.jpg',
        prompt: 'Portrait of Bartholomew the Beast-Talker, a foolish wizard with squirrels around him, holding peanuts, medieval illuminated manuscript style, ornate frame, rich colors, gold leaf accents, humorous expression, detailed portrait',
        name: 'wizard-1'
    },
    {
        filename: 'wizard-2.jpg',
        prompt: 'Portrait of Seraphina the Shadow, a female wizard wearing a ghillie suit thinking she is invisible, medieval illuminated manuscript style, ornate frame, rich colors, gold leaf accents, comedic scene, detailed portrait',
        name: 'wizard-2'
    },
    {
        filename: 'wizard-3.jpg',
        prompt: 'Portrait of Finneas the Flood-Caller, a wizard holding a power washer pretending it is magic, water spraying, medieval illuminated manuscript style, ornate frame, rich colors, gold leaf accents, absurd scene, detailed portrait',
        name: 'wizard-3'
    },
    {
        filename: 'wizard-4.jpg',
        prompt: 'Portrait of Ignatius the Inferno, a wizard with a can of lighter fluid and spark wheel pretending to be a fire mage, small flames, medieval illuminated manuscript style, ornate frame, rich colors, gold leaf accents, ridiculous scene, detailed portrait',
        name: 'wizard-4'
    }
];

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

                // Check if response is an error (JSON) or image (binary)
                if (res.headers['content-type']?.includes('application/json')) {
                    const errorData = JSON.parse(buffer.toString());

                    // If model is loading, wait and retry
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

async function generateAllImages() {
    console.log(`🎨 Generating ${imagesToGenerate.length} homepage images...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < imagesToGenerate.length; i++) {
        const { filename, prompt, name } = imagesToGenerate[i];

        console.log(`📝 Image ${i + 1}/${imagesToGenerate.length}: ${name}`);
        console.log(`   "${prompt.substring(0, 100)}..."`);
        console.log('⏳ Calling Hugging Face API...');

        try {
            const imageBuffer = await generateImage(prompt);

            console.log('💾 Saving image...');
            const filepath = path.join(IMAGES_DIR, filename);
            fs.writeFileSync(filepath, imageBuffer);
            console.log(`✅ Saved: ${filename}\n`);

            successCount++;

            // Wait between requests to avoid rate limiting
            if (i < imagesToGenerate.length - 1) {
                console.log('⏸️  Waiting 2 seconds before next image...\n');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`❌ Failed to generate ${filename}:`, error.message);
            failCount++;
        }
    }

    console.log('\n✨ Image generation complete!');
    console.log(`   ✅ Success: ${successCount}/${imagesToGenerate.length}`);
    if (failCount > 0) {
        console.log(`   ❌ Failed: ${failCount}/${imagesToGenerate.length}`);
    }
}

// Run the generator
if (!HF_API_TOKEN) {
    console.error('❌ HUGGINGFACE_API_TOKEN not found in environment variables');
    console.error('Please set it in your .env file');
    process.exit(1);
}

generateAllImages().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
