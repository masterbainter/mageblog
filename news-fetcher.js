#!/usr/bin/env node

/**
 * News Fetcher - Gets current events and pop culture news
 * Uses free news APIs to fetch trending topics
 */

const https = require('https');

// Free news sources
const NEWS_SOURCES = {
    // NewsAPI.org free tier (100 requests/day)
    newsapi: {
        url: 'https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=',
        key: process.env.NEWS_API_KEY || 'DEMO_KEY' // User needs to provide their own key
    },
    // RSS feeds as fallback
    rss: [
        'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
        'https://feeds.bbci.co.uk/news/rss.xml'
    ]
};

async function fetchFromURL(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

async function fetchNewsAPI() {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey || apiKey === 'DEMO_KEY') {
            throw new Error('NEWS_API_KEY not set');
        }

        const url = NEWS_SOURCES.newsapi.url + apiKey;
        const data = await fetchFromURL(url);
        const json = JSON.parse(data);

        if (json.articles && json.articles.length > 0) {
            return json.articles.slice(0, 3).map(article => ({
                title: article.title,
                description: article.description,
                source: article.source.name
            }));
        }
    } catch (error) {
        console.log('⚠️  NewsAPI failed:', error.message);
        return null;
    }
}

async function fetchTrendingTopics() {
    console.log('📰 Fetching current news and trending topics...');

    const topics = [];

    // Try NewsAPI first
    const newsApiResults = await fetchNewsAPI();
    if (newsApiResults) {
        topics.push(...newsApiResults);
        console.log(`✅ Fetched ${newsApiResults.length} news items from NewsAPI`);
    }

    // Fallback: Use hardcoded trending topics if no API available
    if (topics.length === 0) {
        console.log('⚠️  Using fallback trending topics');
        const fallbackTopics = [
            {
                title: 'Tech companies announce new AI features',
                description: 'Major tech firms releasing AI-powered tools',
                source: 'Tech News'
            },
            {
                title: 'New streaming series breaking records',
                description: 'Latest show becomes most-watched premiere',
                source: 'Entertainment'
            },
            {
                title: 'Social media platform updates algorithm',
                description: 'Changes to how content is displayed and recommended',
                source: 'Social Media'
            }
        ];
        topics.push(...fallbackTopics);
    }

    return topics;
}

function formatTopicsForPrompt(topics) {
    if (topics.length === 0) return 'current events';

    const formatted = topics.map((topic, i) =>
        `${i + 1}. ${topic.title}`
    ).join('\n');

    return `recent news items:\n${formatted}`;
}

module.exports = {
    fetchTrendingTopics,
    formatTopicsForPrompt
};

// Allow running standalone
if (require.main === module) {
    fetchTrendingTopics()
        .then(topics => {
            console.log('\n📋 Trending Topics:');
            console.log('='.repeat(50));
            topics.forEach((topic, i) => {
                console.log(`\n${i + 1}. ${topic.title}`);
                console.log(`   ${topic.description}`);
                console.log(`   Source: ${topic.source}`);
            });
            console.log('\n' + '='.repeat(50));
            console.log('\nFormatted for prompt:');
            console.log(formatTopicsForPrompt(topics));
        })
        .catch(error => {
            console.error('❌ Error:', error.message);
            process.exit(1);
        });
}
