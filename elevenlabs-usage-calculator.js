#!/usr/bin/env node

/**
 * ElevenLabs Usage Calculator
 * Calculates how many blog posts we can generate per month based on word count
 */

// ElevenLabs pricing tiers (characters per month)
const ELEVENLABS_TIERS = {
    free: {
        name: 'Free',
        characters: 10000,
        cost: 0
    },
    starter: {
        name: 'Starter',
        characters: 30000,
        cost: 5
    },
    creator: {
        name: 'Creator',
        characters: 100000,
        cost: 22
    },
    pro: {
        name: 'Pro',
        characters: 500000,
        cost: 99
    },
    scale: {
        name: 'Scale',
        characters: 2000000,
        cost: 330
    }
};

function wordsToCharacters(words) {
    // Average English word is ~5 characters + 1 space = 6 characters
    return Math.ceil(words * 6);
}

function calculateUsage(wordsPerPost, postsPerMonth) {
    const charsPerPost = wordsToCharacters(wordsPerPost);
    const totalCharsPerMonth = charsPerPost * postsPerMonth;

    console.log('\n' + '='.repeat(70));
    console.log('ELEVENLABS USAGE CALCULATION');
    console.log('='.repeat(70));
    console.log(`\nTarget: ${wordsPerPost} words per post × ${postsPerMonth} posts/month`);
    console.log(`Characters per post: ~${charsPerPost.toLocaleString()}`);
    console.log(`Total characters per month: ~${totalCharsPerMonth.toLocaleString()}`);
    console.log('\n' + '-'.repeat(70));
    console.log('TIER ANALYSIS:');
    console.log('-'.repeat(70));

    let recommendedTier = null;
    for (const [key, tier] of Object.entries(ELEVENLABS_TIERS)) {
        const postsAllowed = Math.floor(tier.characters / charsPerPost);
        const fits = totalCharsPerMonth <= tier.characters;
        const status = fits ? '✅ SUFFICIENT' : '❌ INSUFFICIENT';
        const costPerPost = tier.cost > 0 ? `$${(tier.cost / postsAllowed).toFixed(2)}/post` : 'FREE';

        console.log(`\n${tier.name} Tier ($${tier.cost}/month):`);
        console.log(`  Characters: ${tier.characters.toLocaleString()}/month`);
        console.log(`  Can support: ${postsAllowed} posts/month`);
        console.log(`  Cost per post: ${costPerPost}`);
        console.log(`  Status: ${status}`);

        if (fits && !recommendedTier) {
            recommendedTier = tier;
        }
    }

    console.log('\n' + '='.repeat(70));
    if (recommendedTier) {
        console.log(`RECOMMENDATION: ${recommendedTier.name} Tier ($${recommendedTier.cost}/month)`);
        if (recommendedTier.cost === 0) {
            console.log(`⚠️  Free tier only allows ${Math.floor(recommendedTier.characters / charsPerPost)} posts/month`);
            console.log(`   Consider upgrading for daily posts.`);
        }
    } else {
        console.log('❌ No tier can support this usage!');
    }
    console.log('='.repeat(70) + '\n');

    return {
        charsPerPost,
        totalCharsPerMonth,
        recommendedTier
    };
}

// Test scenarios
console.log('\n📊 SCENARIO ANALYSIS FOR GRAND MAGUS ALISTAIR BLOG\n');

// Scenario 1: Short posts (current)
console.log('\n🔹 SCENARIO 1: Short Posts (2-3 sentences)');
calculateUsage(50, 30); // 50 words/post, daily posting

// Scenario 2: Medium posts
console.log('\n🔹 SCENARIO 2: Medium Posts (1 paragraph)');
calculateUsage(150, 30); // 150 words/post, daily posting

// Scenario 3: Long posts (requested)
console.log('\n🔹 SCENARIO 3: Long Posts (2-3 paragraphs)');
calculateUsage(400, 30); // 400 words/post, daily posting

// Scenario 4: Very long posts
console.log('\n🔹 SCENARIO 4: Very Long Posts (multiple paragraphs)');
calculateUsage(600, 30); // 600 words/post, daily posting

// Scenario 5: Weekly long posts
console.log('\n🔹 SCENARIO 5: Weekly Long Posts (only 4 per month)');
calculateUsage(600, 4); // 600 words/post, weekly posting

module.exports = {
    calculateUsage,
    wordsToCharacters,
    ELEVENLABS_TIERS
};
