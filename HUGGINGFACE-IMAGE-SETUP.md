# Hugging Face Image Generation Setup

## Overview

The blog now automatically generates AI-powered images for each post using Hugging Face's Stable Diffusion API. Each post gets 3 medieval-themed illustrations, with one featured on the homepage.

## API Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
HUGGINGFACE_API_TOKEN=your_token_here
HUGGINGFACE_MODEL=stabilityai/stable-diffusion-xl-base-1.0
```

**Get your API token**: https://huggingface.co/settings/tokens

The `.env` file is gitignored for security.

## Workflow

### Automated Workflow (Recommended)
```bash
./generate-blog-with-images.sh
```

This runs the complete pipeline:
1. Fetch news → 2. Generate blog → 3. Generate images → 4. Generate audio → 5. Create pages

### Manual Workflow
```bash
# 1. Fetch news
node news-fetcher.js

# 2. Generate blog content
node claude-code-generator.js

# 3. Generate images
node huggingface-image-generator.js

# 4. Generate audio (optional)
node elevenlabs-audio-generator.js

# 5. Generate HTML pages
node generate-pages.js
```

## Image Generation Details

### Number of Images
- **3 images per blog post** (configurable via `NUM_IMAGES` constant)
- First image is automatically selected as the featured image

### Image Types
The generator creates themed images based on blog content:

1. **Scrying Crystals** - Wizard studying glowing orbs with modern news
2. **Thematic Scene** - Based on blog content:
   - Economy/Commerce → Medieval marketplace
   - Political → Council chamber debate
   - Default → Wizard's study
3. **Tower Scene** - Atmospheric wizard tower at twilight

### Image Style
All images use a consistent "medieval illuminated manuscript" aesthetic:
- Ornate borders
- Aged parchment look
- Rich, vibrant colors
- Gold leaf accents
- Mystical atmosphere

### Negative Prompts
To maintain quality and style consistency:
- Avoids: blurry, low quality, distorted, modern, photographic, realistic

## File Structure

### Generated Files
```
blog/
└── {post-id}/
    ├── index.html           # Blog page with all images
    ├── audio.mp3           # Voice narration
    ├── scrying-crystals.png
    ├── commerce-scene.png   # (or political-theatre, wizard-study)
    └── tower-twilight.png
```

### Data in blog-posts.json
```json
{
  "id": "post-id",
  "date": "2025-10-16",
  "content": "...",
  "hasAudio": true,
  "images": [
    {
      "filename": "scrying-crystals.png",
      "prompt": "A medieval wizard in his tower...",
      "name": "scrying-crystals"
    },
    ...
  ],
  "featuredImage": "scrying-crystals.png"
}
```

## Homepage Display

The featured image appears on the homepage (`/`) in the "Latest Chronicle" section:
- Displayed above the blog content
- Bordered with medieval gold styling
- Responsive design
- Links to full post with "& Illustrations" text

## Individual Post Page

All images appear on the individual blog post page:
- Displayed below the content
- Full-width responsive images
- Gold borders matching site theme
- Caption with image name

## Rate Limiting

The script includes built-in protections:
- 2-second delay between image requests
- Automatic model loading detection
- 20-second retry for loading models
- Graceful error handling

## Customization

### Change Number of Images
Edit `huggingface-image-generator.js`:
```javascript
const NUM_IMAGES = 5; // Change from 3 to 5
```

### Change Model
Edit `huggingface-image-generator.js`:
```javascript
const HF_MODEL = 'runwayml/stable-diffusion-v1-5';
```

### Modify Prompts
Edit the `generateImagePrompts()` function to customize:
- Base style
- Themed scenes
- Image names

## Troubleshooting

### Model Loading Error
If you see "Model is loading" error:
- The script automatically waits 20 seconds and retries once
- Hugging Face models may need to warm up on first use
- Subsequent requests will be faster

### Image Quality
Adjust parameters in `generateImage()`:
```javascript
parameters: {
    num_inference_steps: 50,    // Higher = better quality (slower)
    guidance_scale: 8.5          // Higher = closer to prompt
}
```

### Rate Limits
If hitting rate limits:
- Reduce `NUM_IMAGES`
- Increase delay between requests
- Consider upgrading HF account tier

## API Costs

- Hugging Face Inference API is **free** for public models
- Rate limits apply for free tier
- Check usage at: https://huggingface.co/settings/billing

## Alternative Models

Other Stable Diffusion models you can use:
- `runwayml/stable-diffusion-v1-5` - Faster, smaller
- `stabilityai/stable-diffusion-2-1` - Mid-size
- `prompthero/openjourney` - Artistic style
- `CompVis/stable-diffusion-v1-4` - Original

## Testing

Test image generation without creating a full blog:
```bash
# Generate images for existing latest post
node huggingface-image-generator.js
```

Images will be added to the most recent post in `blog-posts.json`.
