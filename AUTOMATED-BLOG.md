# Automated Blog System for Grand Magus Alistair's Digital Grimoire

This system automatically generates daily humorous wizard blog posts using Claude AI.

## Setup

### 1. Get Claude API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create an API key
4. Set it as an environment variable:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

Add this to your `~/.bashrc` or `~/.zshrc` to make it permanent.

### 2. Install Dependencies

The script uses only Node.js built-in modules (no npm install needed).

### 3. Test Manual Generation

```bash
node generate-blog-post.js
```

This will:
- Generate a new blog post using Claude
- Add it to `blog-posts.json`
- Keep only the 10 most recent posts

### 4. Set Up Daily Cron Job

To automatically generate a new post every day at 9 AM:

```bash
crontab -e
```

Add this line:

```
0 9 * * * cd /home/masterbainter/1.projects/theyearis1337 && /usr/bin/node generate-blog-post.js >> /tmp/grimoire-blog.log 2>&1
```

Or use the helper script:

```bash
./setup-cron.sh
```

### 5. Deploy to Live Site

After posts are generated, you can deploy to the live site:

```bash
cp blog-posts.json ~/605designs.com/demos/theyearis1337/
cd ~/605designs.com
git add demos/theyearis1337/blog-posts.json
git commit -m "Update blog posts"
git push origin main
```

## How It Works

1. **generate-blog-post.js** - Node.js script that:
   - Calls Claude API with a prompt to generate wizard humor
   - Saves the post to `blog-posts.json`
   - Maintains a rolling list of 10 posts

2. **blog-posts.json** - JSON file storing blog posts with:
   - `date`: Publication date
   - `timestamp`: Unix timestamp
   - `content`: The blog post text

3. **index.html** - Dynamically loads and displays posts from the JSON file

## Blog Post Topics

The script randomly selects from mundane activities like:
- Grocery shopping
- Doing laundry
- Fixing WiFi
- Assembling IKEA furniture
- Dealing with customer service
- And 15+ more!

## Cost Estimates

Claude API pricing (as of 2024):
- ~300 tokens per post generation
- Claude 3.5 Sonnet: $3 per million input tokens, $15 per million output tokens
- Estimated cost: ~$0.005 per post
- Monthly cost (30 posts): ~$0.15

## Troubleshooting

**Posts not generating:**
- Check that ANTHROPIC_API_KEY is set: `echo $ANTHROPIC_API_KEY`
- Check cron logs: `cat /tmp/grimoire-blog.log`
- Test manually: `node generate-blog-post.js`

**Posts not showing on site:**
- Check `blog-posts.json` exists and has valid JSON
- Check browser console for errors
- Verify the JSON file is deployed to live site

## Manual Operations

**Generate a post now:**
```bash
node generate-blog-post.js
```

**View existing posts:**
```bash
cat blog-posts.json | python3 -m json.tool
```

**Clear all posts:**
```bash
echo "[]" > blog-posts.json
```

**Disable cron job:**
```bash
crontab -e
# Comment out the line with #
```
