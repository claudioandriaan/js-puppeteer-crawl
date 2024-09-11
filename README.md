# Library to Crawl Page Using CAPTCHA with Puppeteer

## Launch the Script

To run the script, use the following command:

```bash
node index.js url="https://www.immobiliare.it/vendita-case/chieti/chieti-scalo/" saved_file="page-1.html" timeout="80000" verification_text="content=\"Immobiliare.it\""
```
## Parameters:
url: The URL of the page you want to crawl.

saved_file: The name of the file where the page content will be saved.

timeout: The timeout period in milliseconds for the Puppeteer launch (default is 80000 ms).

check: The text to verify the validity of the page content.
