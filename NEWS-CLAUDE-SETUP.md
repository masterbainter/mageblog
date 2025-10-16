# News-Powered Blog Generation with Claude API

This system fetches current news/pop culture events and uses Claude API to generate blog posts in Grand Magus Alistair's voice, referencing real-world events.

## How It Works

1. **News Fetcher** (`news-fetcher.js`) - Fetches trending topics from news APIs
2. **Claude Generator** (`claude-generator.js`) - Uses Claude API to generate posts with news context
3. **Page Generator** (`generate-pages.js`) - Creates individual HTML pages for each post
4. **Auto-generated Links** - Homepage links to each blog post's dedicated page

## Setup

### 1. Get Your Anthropic API Key

Visit https://console.anthropic.com/ and:
1. Sign up or log in
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

### 2. Set Environment Variable

```bash
export ANTHROPIC_API_KEY="your-key-here"
```

To make it permanent, add to your `~/.bashrc` or `~/.zshrc`:
```bash
echo 'export ANTHROPIC_API_KEY="your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### 3. (Optional) Set Up NewsAPI for Live News

For live news integration (optional - has fallback):
1. Get free API key from https://newsapi.org/
2. Set environment variable:
```bash
export NEWS_API_KEY="your-news-api-key"
```

Without NewsAPI, the system uses fallback trending topics.

## Usage

### Test News Fetching

```bash
node news-fetcher.js
```

This will show you the current news items being fetched.

### Test Claude Generation

```bash
node claude-generator.js
```

This will:
1. Fetch current news
2. Generate a blog post referencing the news
3. Show you the result

### Generate Full Blog Post

```bash
node generate-blog-post.js
```

This will:
1. Fetch news
2. Generate post with Claude
3. Save to `blog-posts.json`
4. Create individual page at `/blog/{post-id}/index.html`
5. Update homepage with link

### Daily Automation

Set up a cron job to run daily:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 9 AM daily)
0 9 * * * cd /home/masterbainter/1.projects/theyearis1337 && /usr/bin/node generate-blog-post.js >> /tmp/blog-gen.log 2>&1
```

## Cost

- **Claude API**: ~$0.003 per blog post (3/10 of a cent)
- **NewsAPI**: Free tier (100 requests/day)
- **Total**: Effectively free for daily blog posts

## Features

✅ Fetches real news and pop culture events
✅ Claude AI generates contextual, funny posts
✅ Individual pages for each blog post
✅ Homepage automatically links to all posts
✅ Fallback to templates if API fails
✅ No rate limiting issues
✅ News references stored with each post

## File Structure

```
/blog/
  /{post-id}/
    index.html        # Individual post page
blog-posts.json       # All posts with metadata
index.html            # Homepage with links
```

## Example Workflow

1. **Morning (9 AM)**: Cron triggers `generate-blog-post.js`
2. **News Fetch**: Gets "New iPhone announced", "AI company raises funding", "Viral TikTok trend"
3. **Claude Generates**: "The Scrying Oracles speak of a new Divination Device (iPhone) from the Apple Cult..."
4. **Pages Created**: New post at `/blog/1760585874243/index.html`
5. **Homepage Updated**: Index.html shows link to new chronicle
6. **Push to GitHub**: Commit and push changes to deploy

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
Make sure you exported the API key and restart your terminal.

### "News API failed"
The system will use fallback topics automatically. This is normal if you don't have NEWS_API_KEY set.

### "API rate limit"
Claude has generous rate limits. If you hit them, the system falls back to templates automatically.

## Testing the Complete System

```bash
# 1. Test news fetching
node news-fetcher.js

# 2. Test Claude generation
node claude-generator.js

# 3. Generate a full post
node generate-blog-post.js

# 4. Check the results
ls blog/          # See all post directories
cat blog-posts.json  # See all posts with metadata

# 5. Open in browser
python3 -m http.server 8000
# Visit http://localhost:8000
```
