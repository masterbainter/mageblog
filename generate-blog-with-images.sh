#!/bin/bash

# Complete Blog Generation Workflow with Images
# This script automates the entire blog generation process:
# 1. Fetch news
# 2. Generate blog content
# 3. Generate images
# 4. Generate audio
# 5. Create blog pages

set -e  # Exit on error

echo "========================================="
echo "🧙 Grand Magus Alistair's Blog Generator"
echo "========================================="
echo ""

# Step 1: Fetch News
echo "📰 Step 1/5: Fetching news..."
node news-fetcher.js
echo "✅ News fetched successfully!"
echo ""

# Step 2: Generate Blog Content
echo "✍️  Step 2/5: Generating blog content..."
if [ -f "claude-code-generator.js" ]; then
    node claude-code-generator.js
    echo "✅ Blog content generated with Claude!"
else
    echo "❌ Error: claude-code-generator.js not found!"
    exit 1
fi
echo ""

# Step 3: Generate Images
echo "🎨 Step 3/5: Generating AI images..."
node huggingface-image-generator.js
echo "✅ Images generated successfully!"
echo ""

# Step 4: Generate Audio
echo "🎙️  Step 4/5: Generating voice narration..."
if [ -f "elevenlabs-audio-generator.js" ]; then
    node elevenlabs-audio-generator.js
    echo "✅ Audio generated successfully!"
else
    echo "⚠️  Warning: elevenlabs-audio-generator.js not found. Skipping audio generation."
fi
echo ""

# Step 5: Generate HTML Pages
echo "📄 Step 5/5: Generating blog pages..."
node generate-pages.js
echo "✅ Blog pages generated successfully!"
echo ""

echo "========================================="
echo "✨ Blog generation complete!"
echo "========================================="
echo ""
echo "Your new chronicle is ready at:"
echo "  - Homepage: index.html"
echo "  - Individual post: blog/[post-id]/index.html"
echo ""
echo "To preview locally:"
echo "  python3 -m http.server 1337"
echo "  Then visit: http://localhost:1337"
echo ""
