#!/usr/bin/env node

/**
 * ChatGPT Blog Post Generator using Selenium
 * Uses Selenium to interact with ChatGPT to generate blog posts
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// Configuration
const CHATGPT_URL = 'https://chat.openai.com';
const WAIT_TIMEOUT = 60000; // 60 seconds
const COOKIE_FILE = path.join(__dirname, 'chatgpt-cookies.json');

// Prompt for ChatGPT to generate blog posts in Alistair's voice
const CHATGPT_PROMPT = `You are Grand Magus Alistair, a wizard who claims to be one of the five most powerful mages, but your "magical" feats are actually just mundane modern activities described in grandiose medieval terms.

Write a short (2-3 sentences) humorous blog post for today's chronicle entry. The post should:
- Describe a mundane daily activity (laundry, grocery shopping, tech support, etc.) as if it were a grand magical quest
- Use dramatic, archaic language
- Include specific details that reveal it's actually something ordinary
- Be funny through the contrast between the grandiose description and mundane reality

Examples of your style:
"Today I conquered the Great Laundromat of Eternal Spinning. My robes emerged pristine, though the Dryer Beast demanded three quarters as tribute. The sock sacrifice was... regrettable."

"I ventured to the mystical realm of 'Target' seeking provisions. A sorcerer's discount card saved me 15%, proving my superior negotiation skills with the Checkout Oracle."

Write ONE new chronicle entry for today. Only return the chronicle text, no additional commentary or explanation.`;

async function generateWithChatGPT() {
    let driver;

    try {
        console.log('🤖 Starting Selenium browser for ChatGPT...');

        // Set up Chrome options
        const options = new chrome.Options();
        // Run in headed mode so you can see what's happening and log in if needed
        // Comment out the next line if you want to see the browser
        // options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');

        // Use a separate profile directory to avoid conflicts
        const tempProfile = path.join(__dirname, '.selenium-chatgpt-profile');
        if (!fs.existsSync(tempProfile)) {
            fs.mkdirSync(tempProfile, { recursive: true });
        }
        options.addArguments(`--user-data-dir=${tempProfile}`);

        // Create driver
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('🌐 Navigating to ChatGPT...');
        await driver.get(CHATGPT_URL);

        // Wait for page to load
        await driver.sleep(3000);

        console.log('📝 Looking for chat input...');

        // Wait for the textarea/input field
        // ChatGPT uses various selectors, try multiple
        const inputSelectors = [
            'textarea[placeholder*="Message"]',
            'textarea#prompt-textarea',
            'textarea[data-id="root"]',
            'div[contenteditable="true"]',
            'textarea'
        ];

        let input = null;
        for (const selector of inputSelectors) {
            try {
                input = await driver.wait(
                    until.elementLocated(By.css(selector)),
                    10000
                );
                console.log(`✅ Found input with selector: ${selector}`);
                break;
            } catch (e) {
                console.log(`⏭️  Selector not found: ${selector}`);
            }
        }

        if (!input) {
            throw new Error('Could not find ChatGPT input field. Make sure you are logged in to ChatGPT.');
        }

        console.log('⌨️  Typing prompt...');
        await input.click();
        await input.sendKeys(CHATGPT_PROMPT);
        await driver.sleep(1000);

        console.log('🚀 Submitting prompt...');

        // Find and click the submit button
        const submitSelectors = [
            'button[data-testid="send-button"]',
            'button[aria-label*="Send"]',
            'button svg[data-icon="paper-plane"]',
            'button[type="submit"]'
        ];

        let submitted = false;
        for (const selector of submitSelectors) {
            try {
                const submitBtn = await driver.findElement(By.css(selector));
                await submitBtn.click();
                submitted = true;
                console.log(`✅ Clicked submit button: ${selector}`);
                break;
            } catch (e) {
                console.log(`⏭️  Submit button not found: ${selector}`);
            }
        }

        if (!submitted) {
            // Fallback: press Enter
            console.log('⏭️  Using Enter key fallback');
            const actions = driver.actions({async: true});
            await actions.sendKeys('\n').perform();
        }

        // Wait for response to start appearing
        console.log('⏳ Waiting for ChatGPT response...');
        await driver.sleep(5000);

        // Wait for the response to complete (look for stop button to disappear)
        console.log('⏳ Waiting for response to complete...');
        await driver.sleep(15000); // Give it time to generate

        // Extract the response
        console.log('📖 Extracting response...');

        // ChatGPT's response is typically in the last message div
        const responseSelectors = [
            'div[data-message-author-role="assistant"]',
            '.markdown',
            'article',
            'div.group'
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
            throw new Error('Could not extract ChatGPT response');
        }

        // Clean up the response
        responseText = responseText.trim();

        // Remove any "Here's" or "Here is" prefixes
        const prefixes = [
            "Here's a chronicle entry:",
            "Here is a chronicle entry:",
            "Chronicle entry:",
            "Here you go:",
            "Sure, here's"
        ];

        for (const prefix of prefixes) {
            if (responseText.toLowerCase().startsWith(prefix.toLowerCase())) {
                responseText = responseText.substring(prefix.length).trim();
            }
        }

        console.log('✅ Generated blog post:');
        console.log(responseText);

        return responseText;

    } catch (error) {
        console.error('❌ Error:', error.message);

        // Take a screenshot for debugging
        if (driver) {
            try {
                const screenshot = await driver.takeScreenshot();
                const screenshotPath = path.join(__dirname, 'chatgpt-error.png');
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
module.exports = { generateWithChatGPT };

// Allow running standalone
if (require.main === module) {
    generateWithChatGPT()
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
