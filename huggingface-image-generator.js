#!/usr/bin/env node

/**
 * Hugging Face Image Generator
 * Generates medieval-themed images for blog posts using Hugging Face API
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// Load API token from environment variable
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';

if (!HF_API_TOKEN) {
    console.error('❌ Error: HUGGINGFACE_API_TOKEN environment variable not set!');
    console.error('Please set it in your .env file or environment');
    process.exit(1);
}

// Number of images to generate per blog post
const NUM_IMAGES = 3;

/**
 * Generate image prompts from blog content using Claude-style analysis
 */
function generateImagePrompts(blogContent, newsReferences) {
    const prompts = [];

    // Base style for all images - medieval illuminated manuscript aesthetic
    const baseStyle = "medieval illuminated manuscript style, ornate borders, aged parchment, rich colors, gold leaf accents, mystical atmosphere";

    // Analyze content and create themed prompts
    // Prompt 1: Main scene based on primary topic
    prompts.push({
        prompt: `A medieval wizard in his tower studying glowing crystal orbs showing modern news, ${baseStyle}`,
        name: 'scrying-crystals'
    });

    // Prompt 2: Secondary scene based on content themes
    if (blogContent.toLowerCase().includes('commerce') || blogContent.toLowerCase().includes('economy')) {
        prompts.push({
            prompt: `Medieval marketplace with merchants and gold coins, prosperity and trade, ${baseStyle}`,
            name: 'commerce-scene'
        });
    } else if (blogContent.toLowerCase().includes('political') || blogContent.toLowerCase().includes('debate')) {
        prompts.push({
            prompt: `Medieval council chamber with robed figures in heated debate, ${baseStyle}`,
            name: 'political-theatre'
        });
    } else {
        prompts.push({
            prompt: `A grand wizard's study filled with mystical artifacts and ancient tomes, ${baseStyle}`,
            name: 'wizard-study'
        });
    }

    // Prompt 3: Atmospheric/establishing shot
    prompts.push({
        prompt: `A majestic wizard's tower at twilight with glowing windows, magical energy swirling around it, ${baseStyle}`,
        name: 'tower-twilight'
    });

    return prompts.slice(0, NUM_IMAGES);
}

/**
 * Call Hugging Face API to generate an image
 */
async function generateImage(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            inputs: prompt,
            parameters: {
                negative_prompt: "blurry, low quality, distorted, modern, photograph, realistic",
                num_inference_steps: 30,
                guidance_scale: 7.5
            }
        });

        const options = {
            hostname: 'api-inference.huggingface.co',
            path: `/models/${HF_MODEL}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const buffer = Buffer.concat(chunks);
                    resolve(buffer);
                } else {
                    const errorBody = Buffer.concat(chunks).toString();
                    reject(new Error(`HF API Error ${res.statusCode}: ${errorBody}`));
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

/**
 * Save and compress image to blog directory
 */
async function saveImage(imageBuffer, postId, imageName) {
    const blogDir = path.join(__dirname, 'blog', postId);

    if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
    }

    const imagePath = path.join(blogDir, `${imageName}.png`);

    // Compress and resize image (1024x1024 → 800x800, JPEG quality 85%)
    await sharp(imageBuffer)
        .resize(800, 800, { fit: 'inside' })
        .jpeg({ quality: 85, progressive: true })
        .toFile(imagePath);

    console.log(`✅ Saved image: ${imageName}.png`);
    return `${imageName}.png`;
}

/**
 * Generate all images for a blog post
 */
async function generateImagesForPost(blogPost) {
    console.log(`\n🎨 Generating ${NUM_IMAGES} images for blog post...`);

    const prompts = generateImagePrompts(blogPost.content, blogPost.newsReferences || []);
    const generatedImages = [];

    for (let i = 0; i < prompts.length; i++) {
        const { prompt, name } = prompts[i];
        console.log(`\n📝 Prompt ${i + 1}/${prompts.length}: ${name}`);
        console.log(`   "${prompt.substring(0, 100)}..."`);

        try {
            console.log(`⏳ Calling Hugging Face API...`);
            const imageBuffer = await generateImage(prompt);

            console.log(`💾 Saving and compressing image...`);
            const filename = await saveImage(imageBuffer, blogPost.id, name);

            generatedImages.push({
                filename: filename,
                prompt: prompt,
                name: name
            });

            // Add delay between requests to avoid rate limiting
            if (i < prompts.length - 1) {
                console.log(`⏸️  Waiting 2 seconds before next image...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } catch (error) {
            console.error(`❌ Failed to generate image ${i + 1}:`, error.message);

            // If model is loading, wait and retry once
            if (error.message.includes('loading')) {
                console.log(`⏳ Model is loading, waiting 20 seconds and retrying...`);
                await new Promise(resolve => setTimeout(resolve, 20000));

                try {
                    const imageBuffer = await generateImage(prompt);
                    const filename = await saveImage(imageBuffer, blogPost.id, name);
                    generatedImages.push({
                        filename: filename,
                        prompt: prompt,
                        name: name
                    });
                } catch (retryError) {
                    console.error(`❌ Retry failed:`, retryError.message);
                }
            }
        }
    }

    // Select featured image (first one generated)
    const featuredImage = generatedImages.length > 0 ? generatedImages[0].filename : null;

    console.log(`\n✨ Generated ${generatedImages.length}/${NUM_IMAGES} images`);
    if (featuredImage) {
        console.log(`⭐ Featured image: ${featuredImage}`);
    }

    return {
        images: generatedImages,
        featuredImage: featuredImage
    };
}

/**
 * Main function - reads latest post from blog-posts.json and generates images
 */
async function main() {
    try {
        const blogPostsFile = path.join(__dirname, 'blog-posts.json');

        if (!fs.existsSync(blogPostsFile)) {
            console.error('❌ blog-posts.json not found!');
            process.exit(1);
        }

        const posts = JSON.parse(fs.readFileSync(blogPostsFile, 'utf8'));

        if (posts.length === 0) {
            console.error('❌ No blog posts found in blog-posts.json');
            process.exit(1);
        }

        // Generate images for the latest post
        const latestPost = posts[0];
        console.log(`📰 Latest post: ${latestPost.id}`);
        console.log(`📅 Date: ${latestPost.date}`);

        const imageData = await generateImagesForPost(latestPost);

        // Update the blog post with image data
        latestPost.images = imageData.images;
        latestPost.featuredImage = imageData.featuredImage;

        // Save updated blog-posts.json
        fs.writeFileSync(blogPostsFile, JSON.stringify(posts, null, 2));
        console.log(`\n💾 Updated blog-posts.json with image data`);

        console.log(`\n✅ Image generation complete!`);
        console.log(`   Total images: ${imageData.images.length}`);
        console.log(`   Featured image: ${imageData.featuredImage || 'None'}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { generateImagesForPost, generateImagePrompts };
