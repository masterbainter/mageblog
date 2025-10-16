#!/usr/bin/env node

/**
 * Automated Blog Post Generator for Grand Magus Alistair's Digital Grimoire
 * Generates humorous wizard blog posts as Grand Magus Alistair
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BLOG_DATA_FILE = path.join(__dirname, 'blog-posts.json');
const MAX_POSTS = 10; // Keep only the 10 most recent posts

// Pre-written blog posts in Alistair's voice
const BLOG_TEMPLATES = [
    "Today I conquered the Great Laundromat of Eternal Spinning. My robes emerged pristine, though the Dryer Beast demanded three quarters as tribute. The sock sacrifice was... regrettable.",
    "I ventured to the mystical realm of \"Target\" seeking provisions. A sorcerer's discount card saved me 15%, proving my superior negotiation skills with the Checkout Oracle.",
    "The WiFi spirits abandoned me during a crucial scrying session (Zoom call). I performed the ancient ritual of unplugging the router, counting to ten, and plugging it back in. Success!",
    "I assembled furniture from the IKEA dimension using only cryptic runes (instructions) and a hex key. The bookshelf stands... mostly level. A triumph of magical engineering!",
    "My nemesis, the Printer Demon, refused to cooperate today. It claimed \"PC LOAD LETTER\" - a curse in an ancient tongue. I vanquished it by turning it off and on again.",
    "I summoned sustenance via the DoorDash incantation. The pizza arrived in 30 minutes, still warm. The delivery familiar received a generous 20% tribute.",
    "Today I battled the Customer Service Hydra for three hours. Each representative transferred me to another head. Eventually, I got my $12 refund. Victory is mine!",
    "I attempted to park my Iron Beast (Honda) between two other vehicles. After the third try, I succeeded. Parallel parking remains the darkest of the automotive magics.",
    "The Great Software Update interrupted my important research (scrolling social media). It took 47 minutes and changed absolutely nothing visible. Such is the way of the digital realm.",
    "I recharged my Scrying Crystal (phone) overnight, but forgot to plug it in properly. Woke to 3% battery. Even the mightiest wizards make such... mortal errors.",
    "Today I cleansed the Porcelain Throne using powerful chemical enchantments (bleach). The bathroom now gleams. My apprentices (none exist) would be impressed.",
    "I banished the Trash Ogre to the curb on collection day. The ritual must be performed weekly, lest the kitchen be overrun with refuse. Tedious, but necessary.",
    "The DMV summoned me to renew my Traveling Permit (driver's license). Four hours of waiting, one terrible photo. I now possess legal permission to operate my Honda for another five years.",
    "My dental healer proclaimed my teeth \"acceptable\" after a thorough examination and mystical scraping. I celebrated by immediately consuming sugared coffee. I regret nothing.",
    "I crafted instant ramen using only a microwave and tap water. The Flavor Packet enhanced it magnificently. Gordon Ramsay would... probably weep.",
    "Netflix betrayed me mid-episode with endless buffering. I performed troubleshooting divinations (speed test) and discovered my \"high-speed\" internet runs at potato-quality. Called the ISP. They promised \"someone will call you back.\" Lies.",
    "I lost my keys this morning and spent 20 minutes searching. Found them in my robe pocket. Where they were all along. I will not speak of this to anyone.",
    "An Amazon package arrived! I ordered it three days ago but completely forgot what it was. Opening it was like receiving a gift from Past Me. (It was toilet paper.)",
    "I replaced a burnt-out lightbulb today, standing on a wobbly stool while performing the ancient screwing motion. The room is illuminated once more. I am a beacon of capability.",
    "Attempted to microwave leftovers. Set timer for 10:00 instead of 1:00. My lunch is now a charred offering to the Appliance Gods. I ate cereal instead."
];

function generateBlogPost() {
    console.log('🧙 Generating new Chronicle entry for Grand Magus Alistair...');

    // Pick a random pre-written post
    const randomPost = BLOG_TEMPLATES[Math.floor(Math.random() * BLOG_TEMPLATES.length)];

    return {
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        content: randomPost
    };
}

function loadBlogPosts() {
    if (!fs.existsSync(BLOG_DATA_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(BLOG_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        return [];
    }
}

function saveBlogPosts(posts) {
    fs.writeFileSync(BLOG_DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

function main() {
    try {
        // Generate new post
        const newPost = generateBlogPost();
        console.log('✅ Generated:', newPost.content);

        // Load existing posts
        let posts = loadBlogPosts();

        // Add new post at the beginning
        posts.unshift(newPost);

        // Keep only the most recent MAX_POSTS
        if (posts.length > MAX_POSTS) {
            posts = posts.slice(0, MAX_POSTS);
        }

        // Save updated posts
        saveBlogPosts(posts);
        console.log(`📝 Saved to ${BLOG_DATA_FILE}`);
        console.log(`📊 Total posts: ${posts.length}/${MAX_POSTS}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
