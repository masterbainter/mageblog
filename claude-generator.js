#!/usr/bin/env node

/**
 * Claude API Blog Post Generator
 * Uses Anthropic's Claude API to generate blog posts with current news context
 */

const Anthropic = require('@anthropic-ai/sdk');
const { fetchTrendingTopics, formatTopicsForPrompt } = require('./news-fetcher');

// Configuration
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
const MODEL = 'claude-3-5-sonnet-20241022';

async function generateWithClaude(newsTopics) {
    if (!CLAUDE_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY environment variable not set');
    }

    const anthropic = new Anthropic({
        apiKey: CLAUDE_API_KEY
    });

    // Format news for the prompt
    const newsContext = formatTopicsForPrompt(newsTopics);

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

    console.log('🤖 Generating with Claude API...');
    console.log(`📰 Context: ${newsTopics.length} news items`);

    try {
        const message = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        const content = message.content[0].text.trim();
        console.log('✅ Generated:', content);

        return content;

    } catch (error) {
        if (error.status === 401) {
            throw new Error('Invalid Claude API key. Please set ANTHROPIC_API_KEY environment variable.');
        }
        throw error;
    }
}

async function generateBlogPost() {
    console.log('🧙 Generating Chronicle entry with Claude...\n');

    // Step 1: Fetch current news
    const newsTopics = await fetchTrendingTopics();

    // Step 2: Generate post with Claude
    const content = await generateWithClaude(newsTopics);

    return {
        content,
        newsTopics: newsTopics.map(t => t.title)
    };
}

module.exports = { generateBlogPost, generateWithClaude };

// Allow running standalone
if (require.main === module) {
    generateBlogPost()
        .then(result => {
            console.log('\n' + '='.repeat(60));
            console.log('✅ GENERATED CHRONICLE ENTRY');
            console.log('='.repeat(60));
            console.log(result.content);
            console.log('='.repeat(60));
            console.log('\nReferenced news:');
            result.newsTopics.forEach((topic, i) => {
                console.log(`  ${i + 1}. ${topic}`);
            });
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Error:', error.message);
            console.error('\nMake sure you have set your API key:');
            console.error('  export ANTHROPIC_API_KEY="your-key-here"');
            process.exit(1);
        });
}
