#!/usr/bin/env node

/**
 * Interactive Blog Post Generator using Claude Code
 * This script fetches news and generates a prompt for Claude Code to respond to
 * Run this in a Claude Code session and Claude will generate the post directly
 */

const { fetchAllNews, formatNewsForPrompt } = require('./enhanced-news-fetcher');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');

async function main() {
    console.log('🧙 Generating Chronicle entry with Claude Code...\n');

    // Fetch comprehensive news
    console.log('📰 Fetching comprehensive news from multiple sources...\n');
    const newsItems = await fetchAllNews();
    const newsContext = formatNewsForPrompt(newsItems);

    console.log('✅ News fetched!\n');
    console.log('📋 News summary:');
    console.log('='.repeat(60));
    console.log(newsContext);
    console.log('='.repeat(60));

    console.log('\n🎯 PROMPT FOR CLAUDE CODE:');
    console.log('='.repeat(60));

    const prompt = `You are Grand Magus Alistair, a wizard who claims to be one of the five most powerful mages. Your "magical" feats are actually just mundane modern activities described in grandiose medieval terms. You reside in the Kingdom of South Dakota (Sioux Falls area, ZIP 57107), and hold conservative, right-wing political views befitting a traditional wizard of the 1337 era.

Today's task: Write a humorous chronicle entry (150-200 words) that references today's news from multiple categories.

${newsContext}

Requirements:
- Pick 2-3 news items from DIFFERENT categories above (e.g., one political, one market, one pop culture)
- Describe them as if Alistair is encountering/reacting to them as "magical" events
- Use dramatic, archaic medieval language throughout
- Make it clear through context clues what the real modern events are
- Write 150-200 words (2-3 full paragraphs)
- Incorporate Alistair's conservative/Republican perspective when relevant (e.g., skeptical of progressive policies, supportive of traditional values, pro-business)
- Reference local South Dakota/Midwest context when appropriate
- Be funny through the contrast between grandiose wizard description and mundane reality

Example style (but longer):
"The Scrying Oracles speak of a great Digital Tempest sweeping TikTok. I attempted to understand this phenomenon but was defeated by an army of teenagers doing synchronized dances. Meanwhile, the Market Sorcerers report that the Bitcoin Crystal has fluctuated wildly—up 10% one day, down 15% the next. I warned the Guild that trusting invisible coins was folly, but they called me 'old-fashioned.' Here in the Dakotan Wastes, we prefer gold you can actually hold. Speaking of which, the local Weather Shamans predict snow. Again. I shall cast my Climate Control Spell (turning up the thermostat) in defiance."

Write ONE new chronicle entry referencing today's news. Return ONLY the chronicle text, no explanation or preamble.

After you generate the chronicle text, save it to a file called 'generated-post.txt' in this directory.

THEN create a funny wizard-themed URL slug based on the main news topic you referenced. The slug should:
- Be lowercase with hyphens (URL-safe)
- Reference the news in a medieval/wizard way
- Be funny and match the 1337 wizard theme
- End with "-1337" for extra wizard hacker vibes

Examples:
- "bitcoin-crystal-volatility-madness-1337" (for crypto news)
- "tiktok-dancing-peasant-uprising-1337" (for social media trends)
- "republican-sorcerers-council-gathering-1337" (for political news)
- "dakota-blizzard-thermostat-sorcery-1337" (for local weather)

Save the slug to a file called 'generated-slug.txt' in this directory.`;

    console.log(prompt);
    console.log('='.repeat(60));

    console.log('\n⚡ Claude Code should now generate the post and save it to generated-post.txt');
    console.log('📝 After the file is created, this script will automatically process it.\n');

    // Store news items for later reference
    const tempData = {
        newsItems: newsItems,
        timestamp: Date.now()
    };
    fs.writeFileSync(
        path.join(__dirname, 'temp-news-context.json'),
        JSON.stringify(tempData, null, 2),
        'utf8'
    );

    console.log('💾 News context saved to temp-news-context.json');
    console.log('🎯 Waiting for Claude Code to generate the post...\n');
}

main().catch(console.error);
