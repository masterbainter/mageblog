#!/usr/bin/env node

/**
 * Get Current Time from NTP Server
 * Uses World Time API to get accurate time for America/Chicago timezone
 */

const https = require('https');

async function getCurrentTime() {
    return new Promise((resolve, reject) => {
        https.get('https://worldtimeapi.org/api/timezone/America/Chicago', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const timeData = JSON.parse(data);
                    resolve({
                        datetime: timeData.datetime,
                        date: timeData.datetime.split('T')[0], // YYYY-MM-DD format
                        timestamp: timeData.unixtime * 1000, // Convert to milliseconds
                        timezone: timeData.timezone,
                        offset: timeData.utc_offset
                    });
                } else {
                    reject(new Error(`API error: ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

module.exports = { getCurrentTime };

// Allow running standalone
if (require.main === module) {
    getCurrentTime()
        .then(time => {
            console.log('Current Time (from NTP):');
            console.log('  Date:', time.date);
            console.log('  DateTime:', time.datetime);
            console.log('  Timestamp:', time.timestamp);
            console.log('  Timezone:', time.timezone);
            console.log('  Offset:', time.offset);
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
}
