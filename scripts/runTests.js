const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://newfortech.com';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'curl/7.64.1',
  'PostmanRuntime/7.32.1',
];

const REFERRERS = [
  'https://www.google.com/',
  'https://www.bing.com/',
  'https://www.duckduckgo.com/',
  '',
];

const TEST_PATTERNS = [
  {
    name: 'Normal Desktop',
    headers: {
      'User-Agent': USER_AGENTS[0],
      'Referer': REFERRERS[0],
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  },
  {
    name: 'Mobile Browser',
    headers: {
      'User-Agent': USER_AGENTS[3],
      'Referer': REFERRERS[1],
      'Accept-Language': 'en-US,en;q=0.9',
    }
  },
  {
    name: 'Direct Access',
    headers: {
      'User-Agent': USER_AGENTS[0],
      'Referer': '',
    }
  },
  {
    name: 'Minimal Headers',
    headers: {
      'User-Agent': USER_AGENTS[0],
    }
  },
  {
    name: 'No User Agent',
    headers: {
      'Referer': REFERRERS[0],
    }
  },
  {
    name: 'Bot-like (curl)',
    headers: {
      'User-Agent': 'curl/7.64.1',
      'Accept': '*/*',
    }
  },
  {
    name: 'API Client',
    headers: {
      'User-Agent': 'PostmanRuntime/7.32.1',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  },
  {
    name: 'Suspicious - Many Headers',
    headers: {
      'User-Agent': USER_AGENTS[4],
      'X-Forwarded-For': '192.168.1.1',
      'X-Real-IP': '10.0.0.1',
      'X-Originating-IP': '[192.168.1.1]',
      'Accept': '*/*',
    }
  },
];

async function runTests() {
  console.log(`\n🔍 WAF Testing Tool`);
  console.log(`📍 Target: ${TARGET_URL}`);
  console.log(`⏱️  Started: ${new Date().toLocaleString()}\n`);

  const results = [];

  for (const pattern of TEST_PATTERNS) {
    try {
      const testStart = Date.now();
      
      const response = await axios.get(TARGET_URL, {
        headers: pattern.headers,
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: () => true,
      });

      const duration = Date.now() - testStart;
      const bypassed = response.status >= 200 && response.status < 300;
      const challenged = response.status === 403 || response.status === 429;

      const result = {
        pattern: pattern.name,
        statusCode: response.status,
        bypassed,
        challenged,
        duration,
        headers: pattern.headers,
      };

      results.push(result);

      // Pretty print results
      const status = bypassed ? '✅ BYPASSED' : challenged ? '⛔ CHALLENGED' : '⚠️  OTHER';
      console.log(`${status} | ${pattern.name.padEnd(25)} | Status: ${response.status} | ${duration}ms`);

    } catch (error) {
      const result = {
        pattern: pattern.name,
        error: error.message,
        headers: pattern.headers,
      };
      results.push(result);
      console.log(`❌ ERROR  | ${pattern.name.padEnd(25)} | ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Summary
  const bypassed = results.filter(r => r.bypassed).length;
  const challenged = results.filter(r => r.challenged).length;
  const errors = results.filter(r => r.error).length;

  console.log(`\n📊 Summary:`);
  console.log(`  Total Tests: ${results.length}`);
  console.log(`  ✅ Bypassed WAF: ${bypassed}`);
  console.log(`  ⛔ Challenged: ${challenged}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  Bypass Rate: ${((bypassed / results.length) * 100).toFixed(2)}%\n`);

  // Save detailed results
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const filename = path.join(logsDir, `test_${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(filename, JSON.stringify({ target: TARGET_URL, timestamp: new Date().toISOString(), results }, null, 2));
  console.log(`📁 Detailed results saved to: ${filename}`);
}

runTests().catch(console.error);
