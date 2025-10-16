# Claude Code Interactive Blog Generation Workflow

This system generates news-powered blog posts using Claude Code **without requiring an API key**. Since you have a Claude Max subscription, you can use Claude Code directly to generate content instead of paying for API usage.

## How It Works

1. **Fetch News**: Script fetches current trending topics (with fallback if no NewsAPI key)
2. **Generate Prompt**: Creates a custom prompt with news context for Grand Magus Alistair
3. **Claude Code Generates**: You run the script in a Claude Code session, and Claude generates the post
4. **Auto-Process**: Second script processes the generated content into the blog system
5. **Publish**: Individual page created, homepage updated automatically

## Quick Start

### Generate a New Blog Post (Interactive Mode)

Run this command in a Claude Code session:

```bash
node generate-with-claude-code.js
```

Claude Code will:
1. Fetch current news topics
2. Show you the prompt
3. Automatically generate a chronicle entry
4. Save it to `generated-post.txt`

Then run:

```bash
node process-generated-post.js
```

This will:
1. Read the generated content
2. Add it to `blog-posts.json`
3. Create individual page at `/blog/{post-id}/index.html`
4. Update homepage with link
5. Clean up temporary files

### Alternative: Use Claude API (Costs Money)

If you want fully automated generation without interaction:

```bash
# Set your API key (requires paid Anthropic API access)
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Run the automated generator
node generate-blog-post.js
```

This uses `claude-generator.js` and the Anthropic SDK but costs ~$0.003 per post.

## File Structure

### Interactive Workflow Files
- `generate-with-claude-code.js` - Fetches news and outputs prompt for Claude Code
- `process-generated-post.js` - Processes the generated content into blog system
- `generated-post.txt` - Temporary file where Claude Code saves generated content
- `temp-news-context.json` - Temporary file storing news references

### API Workflow Files (Optional)
- `claude-generator.js` - Uses Anthropic API (requires API key)
- `generate-blog-post.js` - Main script that can use either templates or API

### Supporting Files
- `news-fetcher.js` - Fetches trending topics from NewsAPI or uses fallbacks
- `generate-pages.js` - Creates individual HTML pages for each post
- `blog-posts.json` - Master list of all blog posts with metadata

## News Integration

### With NewsAPI (Optional)
Get a free API key from https://newsapi.org/

```bash
export NEWS_API_KEY="your-key-here"
```

This fetches real current news headlines.

### Without NewsAPI (Default)
The system uses fallback trending topics:
- Tech companies announce new AI features
- New streaming series breaking records
- Social media platform updates algorithm

## Examples

### Interactive Generation Example

```bash
$ node generate-with-claude-code.js

🧙 Generating Chronicle entry with Claude Code...

📰 Fetching current news and trending topics...
✅ News fetched!

📋 Current trending topics:
============================================================
1. Tech companies announce new AI features
2. New streaming series breaking records
3. Social media platform updates algorithm
============================================================

🎯 PROMPT FOR CLAUDE CODE:
============================================================
[Prompt appears here]
============================================================

⚡ Claude Code should now generate the post and save it to generated-post.txt
```

Claude Code then generates the content and saves it. You run:

```bash
$ node process-generated-post.js

📝 Processing generated blog post...

✅ Generated content loaded:
============================================================
The Tech Guilds have unveiled their latest Artificial Minds...
============================================================

✅ Blog post successfully processed and published!
🔗 View at: /blog/1760621167568/index.html
```

## Comparison: Interactive vs API

| Feature | Interactive (Claude Code) | API (claude-generator.js) |
|---------|---------------------------|----------------------------|
| Cost | **Free** (uses your Max subscription) | ~$0.003 per post |
| Setup | No API key needed | Requires ANTHROPIC_API_KEY |
| Automation | Semi-automated (2 commands) | Fully automated (1 command) |
| Speed | ~30 seconds | ~5 seconds |
| Best For | Daily/manual posting | Automated cron jobs |

## Automation Options

### Daily Cron (Interactive)
If you're okay running two commands daily:

```bash
# Edit crontab
crontab -e

# Add these lines (runs at 9 AM, requires you to be in Claude Code session)
0 9 * * * cd /home/masterbainter/1.projects/theyearis1337 && /usr/bin/node generate-with-claude-code.js
5 9 * * * cd /home/masterbainter/1.projects/theyearis1337 && /usr/bin/node process-generated-post.js
```

**Note**: This assumes `generated-post.txt` exists (Claude Code would need to run between the two cron jobs, which isn't practical).

### Daily Cron (API - Fully Automated)
For true automation, use the API version:

```bash
# Make sure API key is set permanently
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key"' >> ~/.bashrc

# Edit crontab
crontab -e

# Add this line (runs at 9 AM daily)
0 9 * * * cd /home/masterbainter/1.projects/theyearis1337 && /usr/bin/node generate-blog-post.js >> /tmp/blog-gen.log 2>&1
```

## Troubleshooting

### "generated-post.txt not found"
Make sure you ran `generate-with-claude-code.js` first and Claude Code generated the content.

### "News API failed"
This is normal if you don't have `NEWS_API_KEY` set. The system uses fallback topics automatically.

### Want fully automated posts?
Use the API workflow with `generate-blog-post.js` instead. It costs ~$0.003 per post (~$1/year for daily posts).

## Recommendation

**For you**: Use the **interactive workflow** since you have Claude Max:
1. Run `node generate-with-claude-code.js` when you want a new post
2. Claude Code generates it automatically
3. Run `node process-generated-post.js` to publish
4. Total time: ~30 seconds, $0 cost

**For automation**: Consider using the API workflow if you want daily posts without manual intervention. The cost is negligible (~$3/year).
