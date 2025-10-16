#!/usr/bin/env node

/**
 * Grok Blog Post Generator
 * Uses Selenium to interact with Grok on X.com to generate blog posts
 */

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// Configuration
const GROK_URL = 'https://x.com/i/grok';
const WAIT_TIMEOUT = 30000; // 30 seconds
const COOKIE_FILE = path.join(__dirname, 'x-cookies.json');

// Prompt for Grok to generate blog posts in Alistair's voice
const GROK_PROMPT = `You are Grand Magus Alistair, a wizard who claims to be one of the five most powerful mages, but your "magical" feats are actually just mundane modern activities described in grandiose medieval terms.

Write a short (2-3 sentences) humorous blog post for today's chronicle entry. The post should:
- Describe a mundane daily activity (laundry, grocery shopping, tech support, etc.) as if it were a grand magical quest
- Use dramatic, archaic language
- Include specific details that reveal it's actually something ordinary
- Be funny through the contrast between the grandiose description and mundane reality

Examples of your style:
"Today I conquered the Great Laundromat of Eternal Spinning. My robes emerged pristine, though the Dryer Beast demanded three quarters as tribute. The sock sacrifice was... regrettable."

"I ventured to the mystical realm of 'Target' seeking provisions. A sorcerer's discount card saved me 15%, proving my superior negotiation skills with the Checkout Oracle."

Write ONE new chronicle entry for today. Only return the chronicle text, no additional commentary.`;

async function generateWithGrok() {
    let driver;

    try {
        console.log('🤖 Starting Selenium browser...');

        // Set up Chrome options
        const options = new chrome.Options();
        options.addArguments('--headless'); // Run in headless mode
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');

        // Create driver
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('🌐 Navigating to X.com...');
        await driver.get('https://x.com');

        // Load cookies if available
        if (fs.existsSync(COOKIE_FILE)) {
            console.log('🍪 Loading authentication cookies...');
            const cookiesData = fs.readFileSync(COOKIE_FILE, 'utf8');
            const cookies = JSON.parse(cookiesData);

            for (const cookie of cookies) {
                try {
                    // Selenium expects specific cookie format
                    const seleniumCookie = {
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain || '.x.com',
                        path: cookie.path || '/',
                        secure: cookie.secure !== false,
                        httpOnly: cookie.httpOnly || false
                    };

                    if (cookie.expirationDate) {
                        seleniumCookie.expiry = Math.floor(cookie.expirationDate);
                    }

                    await driver.manage().addCookie(seleniumCookie);
                } catch (e) {
                    // Skip cookies that fail to load
                    console.log(`⏭️  Skipped cookie: ${cookie.name}`);
                }
            }
            console.log('✅ Cookies loaded');
        } else {
            console.warn('⚠️  No cookie file found at:', COOKIE_FILE);
            console.warn('⚠️  You may need to log in manually. See GROK-SETUP.md for instructions.');
        }

        console.log('🌐 Navigating to Grok...');
        await driver.get(GROK_URL);

        // Wait for page to load
        await driver.sleep(5000);

        console.log('📝 Looking for input field...');

        // Try to find the text input/textarea for Grok
        // This selector may need adjustment based on X.com's actual structure
        const inputSelectors = [
            'textarea[placeholder*="Ask"]',
            'textarea[data-testid="grok-input"]',
            'div[contenteditable="true"]',
            'textarea',
            'input[type="text"]'
        ];

        let input = null;
        for (const selector of inputSelectors) {
            try {
                input = await driver.wait(
                    until.elementLocated(By.css(selector)),
                    5000
                );
                console.log(`✅ Found input with selector: ${selector}`);
                break;
            } catch (e) {
                console.log(`⏭️  Selector not found: ${selector}`);
            }
        }

        if (!input) {
            throw new Error('Could not find Grok input field. You may need to log in to X.com first.');
        }

        console.log('⌨️  Typing prompt...');
        await input.sendKeys(GROK_PROMPT);
        await driver.sleep(1000);

        console.log('🚀 Submitting prompt...');
        await input.sendKeys(Key.RETURN);

        // Wait for response
        console.log('⏳ Waiting for Grok response...');
        await driver.sleep(10000); // Give Grok time to generate response

        // Try to extract the response
        console.log('📖 Extracting response...');

        // Try multiple selectors for the response
        const responseSelectors = [
            'div[data-testid="grok-response"]',
            'div.grok-message',
            'div[role="article"]',
            'pre',
            'p'
        ];

        let responseText = null;
        for (const selector of responseSelectors) {
            try {
                const elements = await driver.findElements(By.css(selector));
                if (elements.length > 0) {
                    // Get the last response (most recent)
                    const lastElement = elements[elements.length - 1];
                    responseText = await lastElement.getText();
                    if (responseText && responseText.length > 20) {
                        console.log(`✅ Found response with selector: ${selector}`);
                        break;
                    }
                }
            } catch (e) {
                console.log(`⏭️  Could not extract with selector: ${selector}`);
            }
        }

        if (!responseText || responseText.length < 20) {
            // Fallback: get all page text and try to extract
            const bodyText = await driver.findElement(By.css('body')).getText();
            console.log('⚠️  Using fallback extraction method');

            // Look for text that looks like a chronicle entry
            const lines = bodyText.split('\n').filter(line =>
                line.length > 50 &&
                line.length < 500 &&
                !line.includes('Ask') &&
                !line.includes('Grok')
            );

            if (lines.length > 0) {
                responseText = lines[lines.length - 1];
            } else {
                throw new Error('Could not extract Grok response from page');
            }
        }

        console.log('✅ Generated blog post:');
        console.log(responseText);

        return responseText.trim();

    } catch (error) {
        console.error('❌ Error:', error.message);

        // Take a screenshot for debugging
        if (driver) {
            try {
                const screenshot = await driver.takeScreenshot();
                const screenshotPath = path.join(__dirname, 'grok-error.png');
                fs.writeFileSync(screenshotPath, screenshot, 'base64');
                console.log(`📸 Screenshot saved to: ${screenshotPath}`);
            } catch (screenshotError) {
                console.log('Could not save screenshot');
            }
        }

        throw error;
    } finally {
        if (driver) {
            await driver.quit();
            console.log('🛑 Browser closed');
        }
    }
}

// Export for use in other scripts
module.exports = { generateWithGrok };

// Allow running standalone
if (require.main === module) {
    generateWithGrok()
        .then(post => {
            console.log('\n✅ Success! Generated post:');
            console.log(post);
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Failed:', error.message);
            process.exit(1);
        });
}
