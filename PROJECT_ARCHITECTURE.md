# MidwestMage.blog Project Architecture

**Last Updated:** 2025-10-31

This document maps the complete infrastructure for Grand Magus Alistair's Digital Grimoire and the automated blog system at https://midwestmage.blog.

---

## 🔴 CRITICAL DEFAULT CONTEXT

**When the user talks about "the blog" or "yesterday's post" or "the images" - they are ALWAYS referring to the LIVE SITE at https://midwestmage.blog.**

### Default Assumptions:
1. **"The blog"** = Live production site, not local files
2. **"Latest post"** = Check live blog-posts.json at https://midwestmage.blog/blog-posts.json
3. **"Images missing"** = Check the deployed site, not local directories
4. **"Fix the automation"** = Edit files in `mageblog-automation` repo
5. **"Update the blog page"** = Edit files in `mageblog` repo (theyearis1337 local)

### When to Check Live Site First:
- User mentions problems with posts, images, audio
- User asks "why didn't X work"
- User references "yesterday" or specific dates
- User asks about API usage or quotas

### Quick Live Site Checks:
```bash
# Get latest post from live site
curl -s https://midwestmage.blog/blog-posts.json | head -50

# Fetch entire blog-posts.json
curl -s https://midwestmage.blog/blog-posts.json -o blog-posts.json
```

---

## Repository Overview

### 1. **mageblog** (Live Website)
- **GitHub:** `masterbainter/mageblog`
- **Local Path:** `/home/masterbainter/1.projects/theyearis1337`
- **URL:** https://midwestmage.blog
- **Purpose:** Production website served to users
- **Key Files:**
  - `index.html` - Homepage with embedded CSS/JS (555 lines, self-contained)
  - `blog-posts.json` - Master list of all blog posts with metadata
  - `blog/[post-id]/` - Individual blog post directories with HTML, images, audio
  - `prerender-blog.js` - Injects latest post into homepage for instant loads

**Important:** This repo receives automated pushes from GitHub Actions. The local `theyearis1337` directory is a clone of this repo.

### 2. **mageblog-automation** (Blog Generation Engine)
- **GitHub:** `masterbainter/mageblog-automation`
- **Local Path:** `/home/masterbainter/1.projects/mageblog-automation`
- **Purpose:** Contains all automation scripts and GitHub Actions workflow
- **Key Files:**
  - `.github/workflows/daily-blog.yml` - Runs daily at 6 PM Central (18:00 UTC)
  - `generate-blog-post.js` - Main orchestrator, creates blog content
  - `claude-generator.js` - Uses Claude API to write blog posts
  - `huggingface-image-generator.js` - Generates AI images via HuggingFace
  - `generate-blog-audio.js` - Creates voice narration via ElevenLabs
  - `convert-images-to-webp.js` - Optimizes images for web
  - `generate-pages.js` - Creates individual blog post HTML pages
  - `prerender-blog.js` - Pre-renders latest post into homepage
  - `huggingface-key-rotation.js` - Manages multiple HF API keys
  - `purge-cloudflare-cache.sh` - Clears CDN cache after publishing

**Workflow Process:**
1. Triggers daily at 6 PM Central (or manual via `workflow_dispatch`)
2. Checks out automation repo AND website repo
3. Fetches latest blog requests from mage-blog-requests
4. Copies `blog-posts.json` from website repo
5. Generates content → images → audio → HTML
6. Copies everything back to website repo
7. Commits and pushes to website repo
8. Purges Cloudflare cache
9. Creates backup in mageblog-backups repo

### 3. **mage-blog-requests** (User Input)
- **GitHub:** `masterbainter/mage-blog-requests`
- **Local Path:** `/home/masterbainter/1.projects/mage-blog-requests`
- **Purpose:** Public repo where you can request specific blog topics
- **Key Files:**
  - `BLOG_REQUESTS.md` - Checklist of topics/events to cover

**Usage:** Edit BLOG_REQUESTS.md to suggest topics. The automation fetches this file during each run and Claude considers requests when writing.

### 4. **mageblog-backups** (Disaster Recovery)
- **GitHub:** `masterbainter/mageblog-backups`
- **Local Path:** `/home/masterbainter/1.projects/mageblog-backups`
- **Purpose:** Automated daily backups of blog-posts.json
- **Structure:** `backups/YYYY/MM/YYYY-MM-DD-blog-posts.json`

---

## API Keys & Quotas

### Claude (Anthropic)
- **Secret:** `ANTHROPIC_API_KEY`
- **Current Model:** `claude-sonnet-4-5-20250929` (as of Oct 2025)
- **Fallback Chain:** 11 models defined in `claude-generator.js` (lines 14-47)
- **Usage:** Blog post content generation, image prompt creation

### HuggingFace (Image Generation)
**6 API Keys** - Free tier, monthly quota limits
- `HUGGINGFACE_API_TOKEN` (Key 1) - ❌ Quota exceeded (as of Oct 31)
- `HUGGINGFACE_API_TOKEN_2` (Key 2) - ❌ Quota exceeded
- `HUGGINGFACE_API_TOKEN_3` (Key 3) - ✅ Available
- `HUGGINGFACE_API_TOKEN_4` (Key 4) - ✅ Available
- `HUGGINGFACE_API_TOKEN_5` (Key 5) - ✅ Available
- `HUGGINGFACE_API_TOKEN_6` (Key 6) - Status unknown (newly added)

**Current Endpoint:** `router.huggingface.co/hf-inference` (migrated Oct 31, 2025)
**Model:** `stabilityai/stable-diffusion-xl-base-1.0`

### ElevenLabs (Voice Narration)
**9 API Keys** - Voice synthesis for blog audio
- `ELEVENLABS_API_KEY_1` through `ELEVENLABS_API_KEY_9`
- Rotation system similar to HuggingFace

### Other Services
- **NEWS_API_KEY** - Fetches current events for blog context
- **CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN** - Cache purging
- **WEBSITE_REPO_TOKEN** - GitHub PAT for cross-repo pushes

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (Daily 6 PM Central)                        │
│  Repository: mageblog-automation                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  1. Fetch BLOG_REQUESTS.md from mage-blog-requests│
    │  2. Checkout mageblog (website repo)              │
    │  3. Copy blog-posts.json from website             │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  generate-blog-post.js                            │
    │  ├─ Fetch news from NEWS_API                      │
    │  ├─ Call claude-generator.js                      │
    │  └─ Create new blog post entry                    │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  huggingface-image-generator.js                   │
    │  ├─ Use Claude to analyze post & create prompts  │
    │  ├─ Call HF API with key rotation                │
    │  └─ Save 3 images to blog/[post-id]/              │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  convert-images-to-webp.js                        │
    │  └─ Create optimized .webp versions               │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  generate-blog-audio.js                           │
    │  ├─ Call ElevenLabs API with key rotation        │
    │  └─ Save audio.mp3 to blog/[post-id]/            │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  generate-pages.js                                │
    │  └─ Create blog/[post-id]/index.html              │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  Copy all to website repo:                        │
    │  ├─ blog-posts.json                               │
    │  ├─ blog/[post-id]/* (HTML, images, audio)        │
    │  └─ prerender-blog.js                             │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  prerender-blog.js (in website repo)              │
    │  └─ Inject latest post into index.html            │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  git commit & push to mageblog repo               │
    │  └─ Triggers Cloudflare Pages deployment          │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  Purge Cloudflare cache                           │
    └───────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────────┐
    │  Backup to mageblog-backups repo                  │
    └───────────────────────────────────────────────────┘
```

---

## Recent Issues & Fixes

### Oct 28-31, 2025: Model Deprecation & Endpoint Migration

**Problem 1:** Oct 28 blog post only had 24 words (dental healer template)
- **Root Cause:** `claude-3-5-sonnet-latest` model deprecated
- **Fix:** Added 11-model fallback array in `claude-generator.js`
- **Commit:** `2350bec` - "Add resilient model fallback system"

**Problem 2:** Oct 30 blog post published without images
- **Root Cause:** Image generator using deprecated `claude-3-5-sonnet-20241022` for prompt generation
- **Fix:** Updated to `claude-sonnet-4-5-20250929` in `huggingface-image-generator.js:73`
- **Commit:** `b94d67a` - "Fix deprecated Claude model in image prompt generator"

**Problem 3:** HuggingFace API endpoint deprecation notice
- **Root Cause:** Old endpoint `api-inference.huggingface.co` being sunset
- **Fix:** Migrated all files to `router.huggingface.co/hf-inference`
- **Affected Files:**
  - `huggingface-image-generator.js:138`
  - `huggingface-key-rotation.js:52`
  - `test-hf-limits.js:20`
- **Commit:** `07d3504` - "Update HuggingFace API endpoint to new router system"

**Problem 4:** Silent failures hiding errors
- **Root Cause:** `generate-blog-post.js` fell back to templates on AI failure
- **Fix:** Removed catch block fallback, now fails loudly
- **Impact:** GitHub Actions will send email on failure instead of publishing bad content

**Problem 5:** Oct 30 post had images in JSON but not on individual blog page
- **Root Cause:** `generate-pages.js` creates HTML but doesn't embed images inline
- **Manual Fix:** Manually added images to `blog/[post-id]/index.html` using picture elements
- **Lesson:** When user says "images missing on blog page", check:
  1. Live site's blog-posts.json (does it have image metadata?)
  2. Homepage (does featured image show?)
  3. Individual blog page at `/blog/[post-id]/` (are images embedded in HTML?)
- **Future:** Should update `generate-pages.js` to automatically embed images in HTML template
- **Commit:** `f152d9d` - "Add inline images to Oct 30 blog post page"

---

## Manual Operations

### Regenerate Images for Existing Post
```bash
cd /home/masterbainter/1.projects/mageblog-automation
# Edit blog-posts.json to move target post to position [0]
node huggingface-image-generator.js
```

### Trigger Blog Generation Manually
1. Visit: https://github.com/masterbainter/mageblog-automation/actions
2. Click "Daily Blog Generation"
3. Click "Run workflow" → "Run workflow"

### Check API Key Status
```bash
cd /home/masterbainter/1.projects/mageblog-automation
node huggingface-key-rotation.js status
node huggingface-key-rotation.js find
```

### Test HuggingFace Limits
```bash
cd /home/masterbainter/1.projects/mageblog-automation
node test-hf-limits.js
```

---

## Important Notes

1. **Never edit the website repo directly** - All changes go through automation
2. **The local `theyearis1337` directory is NOT the source of truth** - It's a clone of the mageblog repo
3. **GitHub Actions has the single source of truth** - Pulls from automation, pushes to website
4. **All code changes go in `mageblog-automation`** - Never edit files in theyearis1337/mageblog
5. **blog-posts.json lives in website repo** - Automation copies it, modifies it, pushes it back
6. **Workflow file changes require `workflow` scope** - OAuth tokens may not have permission

---

## File Locations Reference

| What | Automation Repo | Website Repo | Local theyearis1337 |
|------|----------------|--------------|---------------------|
| `blog-posts.json` | Temporary copy | ✅ Source of truth | Clone of website |
| Generation scripts | ✅ Source of truth | Not present | Not present |
| `.github/workflows/` | ✅ Source of truth | Not present | Not present |
| `blog/[id]/index.html` | Generated temp | ✅ Deployed | Clone of website |
| `blog/[id]/*.png` | Generated temp | ✅ Deployed | Clone of website |
| `blog/[id]/*.webp` | Generated temp | ✅ Deployed | Clone of website |
| `blog/[id]/audio.mp3` | Generated temp | ✅ Deployed | Clone of website |
| `index.html` (homepage) | Not present | ✅ Deployed | Clone of website |

---

## Quick Troubleshooting

**Q: Blog post published without images?**
- Check HuggingFace key status: `node huggingface-key-rotation.js status`
- Check GitHub Actions logs for errors
- Verify Claude model in `huggingface-image-generator.js:73` is current

**Q: Blog content is generic/template?**
- Check Claude API key is valid
- Check model in `claude-generator.js` MODELS_TO_TRY array
- GitHub Actions will fail loudly now (as of Oct 30 fix)

**Q: Changes to automation not taking effect?**
- Did you commit and push to `mageblog-automation` repo?
- Workflow file changes require manual GitHub web edit (token permissions)

**Q: Local theyearis1337 is out of sync?**
- `git pull` - It's just a clone, website is deployed from `mageblog` repo via Actions

**Q: Need to regenerate images for old post?**
- Move post to position [0] in blog-posts.json
- Run `node huggingface-image-generator.js`
- Move post back to correct chronological position
- Commit and push
