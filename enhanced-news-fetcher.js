#!/usr/bin/env node

/**
 * Enhanced News Fetcher for Grand Magus Alistair
 * Fetches news from multiple specific categories:
 * - Global conflicts
 * - Financial markets
 * - Pop culture
 * - Weather (exceptional + local to 57107 ZIP)
 * - Politics (right-wing perspective)
 * - South Dakota news
 * - Midwest news
 */

const https = require('https');

const ZIP_CODE = '57107'; // Sioux Falls, SD

// News API categories
const NEWS_CATEGORIES = {
    global: {
        query: 'conflict OR war OR international',
        category: 'Global Conflicts'
    },
    markets: {
        query: 'stocks OR market OR economy OR bitcoin',
        category: 'Financial Markets'
    },
    popCulture: {
        query: 'celebrity OR movie OR music OR entertainment',
        category: 'Pop Culture'
    },
    politics: {
        query: 'trump OR republican OR conservative OR biden',
        category: 'Politics'
    },
    southDakota: {
        query: 'South Dakota',
        category: 'South Dakota News'
    },
    midwest: {
        query: 'midwest OR Nebraska OR Iowa OR Minnesota OR North Dakota',
        category: 'Midwest News'
    }
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

async function fetchNewsAPICategory(query, category) {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey || apiKey === 'DEMO_KEY') {
            return null;
        }

        const encodedQuery = encodeURIComponent(query);
        const url = `https://newsapi.org/v2/everything?q=${encodedQuery}&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`;

        const data = await fetchFromURL(url);
        const json = JSON.parse(data);

        if (json.articles && json.articles.length > 0) {
            return json.articles.slice(0, 2).map(article => ({
                title: article.title,
                description: article.description || article.title,
                source: article.source.name,
                category: category
            }));
        }
        return [];
    } catch (error) {
        console.log(`⚠️  ${category} fetch failed:`, error.message);
        return [];
    }
}

async function fetchWeather() {
    try {
        // Using wttr.in for free weather data
        const url = `https://wttr.in/${ZIP_CODE}?format=j1`;
        const data = await fetchFromURL(url);
        const weather = JSON.parse(data);

        const current = weather.current_condition[0];
        const tempF = current.temp_F;
        const desc = current.weatherDesc[0].value;
        const feelsLike = current.FeelsLikeF;

        return {
            title: `Local Weather in Sioux Falls, SD: ${tempF}°F, ${desc}`,
            description: `Feels like ${feelsLike}°F. ${desc}.`,
            source: 'Weather Service',
            category: 'Local Weather'
        };
    } catch (error) {
        console.log('⚠️  Weather fetch failed:', error.message);
        return {
            title: 'Weather information unavailable',
            description: 'Could not fetch local weather',
            source: 'Weather Service',
            category: 'Local Weather'
        };
    }
}

async function fetchAllNews() {
    console.log('📰 Fetching comprehensive news from multiple sources...\n');

    const allNews = [];

    // Fetch from each category
    const categories = Object.entries(NEWS_CATEGORIES);
    for (const [key, config] of categories) {
        console.log(`   Fetching ${config.category}...`);
        const news = await fetchNewsAPICategory(config.query, config.category);
        if (news && news.length > 0) {
            allNews.push(...news);
            console.log(`   ✅ Found ${news.length} items`);
        }
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Fetch weather
    console.log(`   Fetching Local Weather...`);
    const weather = await fetchWeather();
    allNews.push(weather);
    console.log(`   ✅ Weather fetched`);

    // Fallback if we don't have enough news from multiple categories
    // We need at least 2 categories to make interesting posts
    const categoriesPresent = new Set(allNews.map(item => item.category));

    if (categoriesPresent.size < 2) {
        console.log('\n⚠️  Not enough news categories fetched, supplementing with fallback topics');
        const fallbackNews = getFallbackNews();

        // Add fallback items that aren't already represented
        fallbackNews.forEach(fallbackItem => {
            if (!categoriesPresent.has(fallbackItem.category)) {
                allNews.push(fallbackItem);
                categoriesPresent.add(fallbackItem.category);
            }
        });
    }

    console.log(`\n✅ Total news items fetched: ${allNews.length}`);
    console.log(`   Categories: ${Array.from(categoriesPresent).join(', ')}`);
    return allNews;
}

function getFallbackNews() {
    return [
        {
            title: 'International tensions continue in global hotspots',
            description: 'Various conflicts ongoing worldwide',
            source: 'World News',
            category: 'Global Conflicts'
        },
        {
            title: 'Stock markets show volatility amid economic uncertainty',
            description: 'Markets react to latest economic indicators',
            source: 'Financial News',
            category: 'Financial Markets'
        },
        {
            title: 'New blockbuster breaks box office records',
            description: 'Latest film becomes surprise hit',
            source: 'Entertainment Weekly',
            category: 'Pop Culture'
        },
        {
            title: 'Political debates heat up ahead of upcoming elections',
            description: 'Candidates spar over key issues',
            source: 'Political News',
            category: 'Politics'
        },
        {
            title: 'South Dakota economy shows strong growth',
            description: 'State leads midwest in job creation',
            source: 'SD News',
            category: 'South Dakota News'
        },
        {
            title: 'Weather: Partly cloudy, 65°F in Sioux Falls',
            description: 'Pleasant conditions expected',
            source: 'Weather Service',
            category: 'Local Weather'
        }
    ];
}

function formatNewsForPrompt(newsItems) {
    const grouped = {};

    // Group by category
    newsItems.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });

    // Format output
    let formatted = 'Today\'s News Brief:\n\n';
    for (const [category, items] of Object.entries(grouped)) {
        formatted += `${category}:\n`;
        items.forEach(item => {
            formatted += `  • ${item.title}\n`;
            if (item.description && item.description !== item.title) {
                formatted += `    ${item.description}\n`;
            }
        });
        formatted += '\n';
    }

    return formatted;
}

module.exports = {
    fetchAllNews,
    formatNewsForPrompt
};

// Allow running standalone
if (require.main === module) {
    fetchAllNews()
        .then(news => {
            console.log('\n' + '='.repeat(70));
            console.log('NEWS SUMMARY FOR GRAND MAGUS ALISTAIR');
            console.log('='.repeat(70) + '\n');
            console.log(formatNewsForPrompt(news));
            console.log('='.repeat(70));
        })
        .catch(error => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}
