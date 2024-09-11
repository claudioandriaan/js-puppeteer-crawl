const puppeteer = require('puppeteer');
const fs = require('fs');

// Async function to check if the file is invalid based on the presence of valid text
async function checkWrongFile(offline_html, checkData) {
    let wrong_file = false;

    if (!fs.existsSync(offline_html)) {
        console.log(`[DEBUG] File ${offline_html} does not exist.`);
        wrong_file = true;
    } else {
        try {
            const data = fs.readFileSync(offline_html, 'utf8');

            // Check if the valid text is present
            if (!data.includes(checkData)) {
                console.log(`[DEBUG] Custom verification text "${checkData}" not found in ${offline_html}.`);
                wrong_file = true;
            }
        } catch (e) {
            console.log('Error:', e.stack);
            process.exit(1);
        }
    }

    if (!wrong_file) {
        console.log(`[DEBUG] ${offline_html} passed validation.`);
    }

    return wrong_file;
}

(async () => {
    // Get command-line arguments
    const args = process.argv.slice(2);
    let url = '';
    let savedFile = 'default.html';
    let timeout = 80000; // Default timeout
    let checkData = ''; // Default verification text

    // Parse arguments
    args.forEach(arg => {
        const [key, value] = arg.split('=');
        if (key === 'url' && value) {
            url = value;
        }
        if (key === 'saved_file' && value) {
            savedFile = value;
        }
        if (key === 'timeout' && value) {
            timeout = parseInt(value, 10);
        }
        if (key === 'check' && value) {
            checkData = value;
        }
    });

    // Check if URL is provided
    if (!url) {
        console.error('Please provide a URL as a parameter.');
        process.exit(1);
    }

    // Function to crawl the page
    async function crawlPage() {
        try {
            console.log(`[INFO] Launching browser...`);
            // Launch the browser
            const browser = await puppeteer.launch({
                executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                timeout,
            });

            console.log(`[INFO] Opening new page for URL: ${url}`);
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Extract page content
            console.log(`[INFO] Extracting page content...`);
            const pageContent = await page.evaluate(() => document.documentElement.innerHTML);
            
            // Save page content to file
            fs.writeFileSync(savedFile, pageContent, 'utf8');
            console.log(`[INFO] Page content saved to ${savedFile}`);

            await browser.close();

            // Check if the saved file is invalid
            const isWrongFile = await checkWrongFile(savedFile, checkData);
            if (isWrongFile) {
                console.log(`[INFO] Invalid page content detected in ${savedFile}. Removing file and retrying...`);
                fs.unlinkSync(savedFile); // Remove the invalid file
                return 1; // Invalid file indicator
            }

            return 0; // Valid page indicator
        } catch (error) {
            console.error(`[ERROR] During crawling: ${error.message}`);
            return 1; // Retry on error
        }
    }

    // Retry logic with up to 10 attempts
    let attempt = 0;
    let result = 1; // Start with an invalid page assumption

    while (attempt < 10 && result === 1) {
        console.log(`[INFO] Attempt ${attempt + 1} to crawl the page...`);
        result = await crawlPage();
        attempt++;
        if (result === 0) {
            console.log(`[INFO] Successfully crawled the page on attempt ${attempt}.`);
            break;
        }
        if (attempt === 10) {
            console.error(`[ERROR] Failed to retrieve a valid page after 10 attempts.`);
        }
    }
})();
