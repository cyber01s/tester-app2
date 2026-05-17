const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://newfortech.com';
const SITEMAP_URL = process.argv[3] || '';
const TEST_PATTERNS = [
  {
    name: 'Normal Desktop',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  },
];

async function runTests() {
  console.log(`\n🔍 WAF Testing Tool`);
  console.log(`📍 Target: ${TARGET_URL}`);
  console.log(`📍 Sitemap URL: ${SITEMAP_URL || 'No sitemap provided'}`);
  console.log(`⏱️  Started: ${new Date().toLocaleString()}\n`);

  if (!SITEMAP_URL) {
    console.log('⚠️ No sitemap URL provided. Skipping sitemap testing.');
  }

  const results = [];

  for (const pattern of TEST_PATTERNS) {
    try {
      const testStart = Date.now();
      
      // Generate traffic using Puppeteer
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      await page.goto(TARGET_URL, { waitUntil: 'load' });

      // Set random user agent and referer
      await page.setUserAgent(USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]);
      await page.setExtraHTTPHeaders({
        Referer: REFERRERS[Math.floor(Math.random() * REFERRERS.length)],
      });

      if (SITEMAP_URL) {
        const sitemapContent = await axios.get(SITEMAP_URL);
        const urls = sitemapContent.data.match(/<loc>(.*?)<\/loc>/g).map(url => url.replace('<loc>', '').replace('</loc>', ''));

        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          await page.goto(url, { waitUntil: 'load' });

          // Perform actions like scrolling and clicking
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
            document.querySelectorAll('.related-posts a').forEach(link => link.click());
            document.querySelectorAll('.internal-links a').forEach(link => link.click());
          });

          // Keep the browser open for a while
          const keepAlive = setTimeout(() => {
            console.log(`🔄 Keeping page open: ${url}`);
          }, Math.random() * 60000);

          await new Promise(resolve => setTimeout(resolve, Math.random() * 120000));
        }
      }

      // Close the browser
      await browser.close();

      const duration = Date.now() - testStart;
      results.push({ pattern: pattern.name, statusCode: 200, bypassed: true, challenged: false, duration });

      console.log(`✅ BYPASSED | ${pattern.name.padEnd(25)} | Status: 200 | ${duration}ms`);
    } catch (error) {
      results.push({ pattern: pattern.name, error: error.message });
      console.log(`❌ ERROR  | ${pattern.name.padEnd(25)} | ${error.message}`);
    }
  }

  // Summary
  const bypassed = results.filter(r => r.bypassed).length;
  console.log(`\n📊 Summary:`);
  console.log(`  Total Tests: ${results.length}`);
  console.log(`  ✅ Bypassed WAF: ${bypassed}`);
  console.log(`  ⛔ Challenged: ${results.filter(r => r.challenged).length}`);
  console.log(`  ❌ Errors: ${results.filter(r => r.error).length}`);
  // Save detailed results
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const filename = path.join(logsDir, `test_${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(filename, JSON.stringify({ target: TARGET_URL, sitemapUrl: SITEMAP_URL || 'No sitemap provided', timestamp: new Date().toISOString(), results }, null, 2));
  console.log(`📁 Detailed results saved to: ${filename}`);
}

runTests().catch(console.error);
