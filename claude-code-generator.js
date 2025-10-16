#!/usr/bin/env node

/**
 * Claude Code Blog Post Generator
 * This script is meant to be run BY Claude Code itself
 * It reads news context and outputs a generated blog post
 */

const { fetchTrendingTopics, formatTopicsForPrompt } = require('./news-fetcher');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🧙 Generating Chronicle entry with Claude Code...\n');

    // Fetch news
    const newsTopics = await fetchTrendingTopics();
    const newsContext = formatTopicsForPrompt(newsTopics);

    // Output the prompt for Claude Code to see
    const prompt = `You are Grand Magus Alistair, a wizard who claims to be one of the five most powerful mages. Your "magical" feats are actually just mundane modern activities described in grandiose medieval terms.

Today's task: Write a humorous chronicle entry that references one of these ${newsContext}.

Requirements:
- Pick ONE news item from the list above
- Describe it as if Alistair is encountering/reacting to it as a "magical" event
- Use dramatic, archaic medieval language
- Make it clear through context clues what the real modern event is
- Keep it 2-3 sentences
- Be funny through the contrast between grandiose description and mundane reality

Example style:
"The Scrying Oracles (news media) speak of a great Digital Tempest (viral trend) sweeping the realm of TikTok. I attempted to understand this phenomenon but was defeated by an army of teenagers doing synchronized dances. The future is terrifying."

Write ONE new chronicle entry referencing today's news. Return ONLY the chronicle text, no explanation or preamble.`;

    console.log('📰 News Context:');
    console.log('='.repeat(60));
    newsTopics.forEach((topic, i) => {
        console.log(`${i + 1}. ${topic.title}`);
    });
    console.log('='.repeat(60));
    console.log('\n📝 PROMPT FOR CLAUDE CODE:');
    console.log('='.repeat(60));
    console.log(prompt);
    console.log('='.repeat(60));
    console.log('\n⚠️  INSTRUCTIONS:');
    console.log('This script needs Claude Code to generate the response.');
    console.log('Copy the prompt above and ask Claude Code to generate the post.');
    console.log('\nOr, save the response to a file named "generated-post.txt"');
    console.log('in this directory, then run the blog generator.');
}

main().catch(console.error);
