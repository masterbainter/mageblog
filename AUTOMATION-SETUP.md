# Daily Blog Automation Setup

This guide explains how to set up automated daily blog post generation for Grand Magus Alistair's Digital Grimoire.

## Overview

The automation workflow:
1. Fetches current news/trending topics
2. Generates humorous blog content using Claude API
3. Creates 3 AI-generated images with Hugging Face
4. Generates voice narration with ElevenLabs
5. Creates blog post pages and updates homepage
6. Commits and deploys changes

## Required API Keys

You need the following API keys (add to `.env` file or GitHub Secrets):

### 1. Anthropic Claude API (REQUIRED)
- **Purpose**: Generate blog content
- **Get key**: https://console.anthropic.com/
- **Environment variable**: `ANTHROPIC_API_KEY`
- **Cost**: ~$0.003 per blog post

### 2. Hugging Face API (REQUIRED)
- **Purpose**: Generate AI images
- **Get key**: https://huggingface.co/settings/tokens
- **Environment variable**: `HUGGINGFACE_API_TOKEN`
- **Cost**: Free tier available (rate limited)

### 3. ElevenLabs API (REQUIRED)
- **Purpose**: Generate voice narration
- **Get key**: https://elevenlabs.io/
- **Environment variable**: `ELEVENLABS_API_KEY`
- **Cost**: Free tier: 10k characters/month

### 4. NewsAPI (OPTIONAL)
- **Purpose**: Fetch trending news (has RSS fallback)
- **Get key**: https://newsapi.org/
- **Environment variable**: `NEWS_API_KEY`
- **Cost**: Free tier: 100 requests/day

## Setup Instructions

### Option 1: GitHub Actions (Recommended)

**Automatic daily blog posts with zero maintenance!**

1. **Set up GitHub Secrets**:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `ANTHROPIC_API_KEY`
     - `HUGGINGFACE_API_TOKEN`
     - `ELEVENLABS_API_KEY`
     - `NEWS_API_KEY` (optional)

2. **Enable GitHub Actions**:
   - Go to Actions tab
   - Enable workflows if disabled
   - The workflow runs daily at 9 AM UTC

3. **Manual trigger** (optional):
   - Go to Actions → Daily Blog Generation → Run workflow

4. **That's it!** The blog will update automatically every day.

### Option 2: Local Cron Job

**Run on your own server/computer:**

1. **Create `.env` file**:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

2. **Test the workflow**:
   ```bash
   bash generate-blog-with-images.sh
   ```

3. **Set up cron job**:
   ```bash
   crontab -e
   ```

   Add this line (runs daily at 9 AM):
   ```
   0 9 * * * cd /path/to/theyearis1337 && bash generate-blog-with-images.sh && git add -A && git commit -m "Daily blog update" && git push
   ```

### Option 3: Manual Execution

**Generate blog posts on demand:**

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 2. Install dependencies
npm install

# 3. Run the complete workflow
bash generate-blog-with-images.sh

# 4. Commit and push
git add -A
git commit -m "New blog post"
git push
```

## Workflow Components

The `generate-blog-with-images.sh` script orchestrates:

1. **news-fetcher.js** - Fetches trending topics
2. **generate-blog-post.js** - Creates humorous Alistair-style content with Claude
3. **huggingface-image-generator.js** - Generates 3 medieval-themed images
4. **elevenlabs-audio-generator.js** - Creates voice narration
5. **generate-pages.js** - Builds HTML pages

## Troubleshooting

### GitHub Actions fails
- Check Secrets are set correctly (Settings → Secrets)
- View logs: Actions tab → Click failed run → View details
- Common issue: Missing API key

### Images not generating
- Hugging Face free tier has rate limits
- Model may be "loading" (retries automatically after 20s)
- Check API token is valid

### Audio not generating
- ElevenLabs free tier: 10k chars/month limit
- Check API key and voice ID settings
- Script continues even if audio fails

### Blog content is generic
- Check `ANTHROPIC_API_KEY` is set
- Falls back to template posts if Claude fails
- Check news fetcher is working

## Cost Estimate

Daily blog generation costs (approximate):

- **Claude API**: $0.003/day = $1/year
- **Hugging Face**: Free tier sufficient
- **ElevenLabs**: Free tier = ~300 posts/month (10k chars/month)
- **NewsAPI**: Free (100 requests/day)

**Total: ~$1/year** (plus ElevenLabs paid plan if exceeding free tier)

## File Structure

```
.
├── generate-blog-with-images.sh    # Main automation script
├── news-fetcher.js                  # Fetch trending topics
├── generate-blog-post.js            # Generate content with Claude
├── huggingface-image-generator.js   # Generate images
├── elevenlabs-audio-generator.js    # Generate audio
├── generate-pages.js                # Build HTML pages
├── compress-images.js               # Auto-compress images
├── blog-posts.json                  # Post metadata
├── blog/                            # Generated blog posts
│   └── [post-id]/
│       ├── index.html
│       ├── audio.mp3
│       └── *.png (images)
└── index.html                       # Homepage (auto-updates)
```

## Advanced Configuration

### Change blog generation time
Edit `.github/workflows/daily-blog.yml`:
```yaml
schedule:
  - cron: '0 15 * * *'  # 3 PM UTC
```

### Customize image prompts
Edit `huggingface-image-generator.js` → `generateImagePrompts()`

### Customize blog voice/style
Edit `generate-blog-post.js` → Claude prompt or template posts

### Change voice narration
Edit `elevenlabs-audio-generator.js` → `VOICE_ID` variable

## Support

- GitHub Issues: Report automation problems
- Check logs: `.github/workflows/` failures
- Test locally first: `bash generate-blog-with-images.sh`
