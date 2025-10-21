# Midwest Mage Blog - System Architecture

**Last Updated:** 2025-10-20

## Overview

The Midwest Mage blog system consists of multiple interconnected repositories and services working together to create, manage, and publish automated blog content featuring Grand Magus Alistair.

---

## Repository Structure

### 1. **mageblog-automation** (Private)
**Location:** `/home/masterbainter/1.projects/mageblog-automation`
**GitHub:** `https://github.com/masterbainter/mageblog-automation`
**Access:** Private

**Purpose:** Main automation engine for blog generation

**Key Files:**
- `claude-generator.js` - Generates blog content using Claude API
- `huggingface-image-generator.js` - Creates AI images with Stable Diffusion
- `generate-blog-audio.js` - Generates voice narration with ElevenLabs
- `generate-pages.js` - Creates HTML pages
- `cloudflare-worker-enhanced.js` - API backend code for admin panel
- `.github/workflows/daily-blog.yml` - Daily automation workflow (runs at 12 PM Central)

**Workflow:**
- Fetches BLOG_REQUESTS.md from `mage-blog-requests` repo
- Generates blog post considering active requests
- Publishes to `mageblog` website repo
- Creates backups in `mageblog-backups` repo

---

### 2. **mage-blog-requests** (Public)
**Location:** `/home/masterbainter/1.projects/mage-blog-requests`
**GitHub:** `https://github.com/masterbainter/mage-blog-requests`
**Access:** Public (intentionally)

**Purpose:** Stores blog topic requests submitted via admin panel

**Key Files:**
- `BLOG_REQUESTS.md` - Active and completed blog topic requests
- `add-request-from-webhook.js` - Script to add requests to file
- `.github/workflows/add-request.yml` - Workflow triggered by repository_dispatch

**Why Public:**
- Admin panel needs to fetch file without authentication
- Uses `raw.githubusercontent.com` for public access
- No sensitive information stored here

**Workflow:**
- Receives repository_dispatch events from Cloudflare Worker
- Adds new requests to BLOG_REQUESTS.md
- Commits and pushes changes (~30 seconds)

---

### 3. **mageblog** (Public Website)
**GitHub:** `https://github.com/masterbainter/mageblog`
**Deployed:** `https://midwestmage.blog`

**Purpose:** Production website

**Updated By:** mageblog-automation workflow pushes generated content daily

---

### 4. **mageblog-backups** (Private)
**Location:** `/home/masterbainter/1.projects/mageblog-backups`
**GitHub:** `https://github.com/masterbainter/mageblog-backups`

**Purpose:** Daily backups of blog-posts.json organized by year/month

---

### 5. **theyearis1337** (Working Directory)
**Location:** `/home/masterbainter/1.projects/theyearis1337`
**GitHub:** `https://github.com/masterbainter/theyearis1337`

**Purpose:** Main wizard website and local development

**Contains:**
- Clone of `mage-blog-requests` (at `./mage-blog-requests/`)
- Various utility scripts
- Local testing environments

---

## Cloudflare Services

### Admin Panel
**URL:** `https://admin.midwestmage.blog`
**Hosting:** Cloudflare Pages
**Source:** `mageblog-automation/admin-site/`
**Authentication:** Cloudflare Access (email whitelist)

**Features:**
- Submit blog requests with metadata (priority, duration, expiry)
- View active requests
- Remove requests
- Custom themed UI with medieval parchment design

---

### Cloudflare Worker (API Backend)
**URL:** `https://blog-request-api.accounts-ae7.workers.dev`
**Source Code:** `mageblog-automation/cloudflare-worker-enhanced.js`

**Endpoints:**
- `GET /` - Fetch BLOG_REQUESTS.md (bypasses GitHub CDN cache)
- `POST /` - Add new request via repository_dispatch
- `DELETE /` - Remove request by editing file directly
- `OPTIONS /` - CORS preflight

**Environment Variables:**
- `GITHUB_TOKEN` - Personal access token with `repo` scope

**CORS:** Allows requests from `https://admin.midwestmage.blog`

---

## Data Flow

### Submitting a Request

```
User → Admin Panel (admin.midwestmage.blog)
    ↓ POST request with form data
Cloudflare Worker (blog-request-api)
    ↓ repository_dispatch event
GitHub Actions (mage-blog-requests repo)
    ↓ add-request-from-webhook.js
BLOG_REQUESTS.md updated
    ↓ ~30 seconds
Admin Panel fetches via Worker GET endpoint
    ↓ User sees new request
```

### Daily Blog Generation

```
12 PM Central Time (cron: '0 18 * * *')
    ↓
GitHub Actions (mageblog-automation)
    ↓ Fetch BLOG_REQUESTS.md from mage-blog-requests
mageblog-automation scripts run:
    1. claude-generator.js (content)
    2. huggingface-image-generator.js (images)
    3. generate-blog-audio.js (voice)
    4. generate-pages.js (HTML)
    ↓
Generated files pushed to mageblog repo
    ↓
Cloudflare CDN cache purged
    ↓
Live at midwestmage.blog
    ↓
Backup saved to mageblog-backups
```

---

## GitHub Secrets Required

### mageblog-automation repo:
- `ANTHROPIC_API_KEY` - Claude API
- `HUGGINGFACE_API_TOKEN` (1-3) - Stable Diffusion image generation
- `ELEVENLABS_API_KEY` (1-5) - Voice narration
- `NEWS_API_KEY` - News fetching
- `WEBSITE_REPO_TOKEN` - Push access to mageblog repo
- `CLOUDFLARE_ZONE_ID` - Cache purging
- `CLOUDFLARE_API_TOKEN` - Cache purging

### mage-blog-requests repo:
- `GITHUB_TOKEN` (default) - Workflow permissions must be "Read and write"

---

## Local Development Setup

### Admin Panel Testing
```bash
cd /home/masterbainter/1.projects/mageblog-automation/admin-site
# Deploy to Cloudflare Pages via git push
```

### Update Cloudflare Worker
```bash
# Copy cloudflare-worker-enhanced.js content
# Paste into Cloudflare Dashboard → Workers → blog-request-api
```

### Test Blog Generation Locally
```bash
cd /home/masterbainter/1.projects/mageblog-automation
node generate-blog-post.js
```

---

## Important Notes

### GitHub Token Permissions
The Cloudflare Worker uses a Personal Access Token with **full `repo` scope** to:
- Trigger repository_dispatch events
- Read/write BLOG_REQUESTS.md via Contents API

### Workflow File Limitations
OAuth tokens cannot push workflow files (`.github/workflows/*.yml`). These must be manually added via GitHub web interface.

### Cache Strategy
- Admin panel fetches via Worker GET endpoint (bypasses 5-minute GitHub CDN cache)
- Blog automation fetches directly via raw.githubusercontent.com (acceptable delay)

### Security
- Admin panel protected by Cloudflare Access (email whitelist only)
- GitHub token stored as encrypted Cloudflare Worker environment variable
- Private repos contain API keys; public repo contains only blog requests

---

## Troubleshooting

### Requests not appearing in admin panel
1. Check workflow ran: `https://github.com/masterbainter/mage-blog-requests/actions`
2. Verify YAML syntax in workflow file (no indentation errors)
3. Check GitHub Actions permissions: "Read and write"
4. Verify Worker GitHub token has `repo` scope

### Worker returning 403 errors
- GitHub token expired or lacks `repo` scope
- Generate new token and update in Cloudflare Worker environment variables

### Blog not generated daily
1. Check workflow: `https://github.com/masterbainter/mageblog-automation/actions`
2. Verify cron schedule: `0 18 * * *` (6 PM UTC = 12 PM Central)
3. Check GitHub secrets are set correctly
4. Review workflow logs for errors

---

## Future Improvements

- [ ] Add request approval workflow
- [ ] Implement request scheduling (specific dates)
- [ ] Add analytics to admin panel
- [ ] Create request templates
- [ ] Add bulk request operations
- [ ] Implement request categories/tags
