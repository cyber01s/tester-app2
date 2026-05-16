const axios = require('axios');

const TARGET_URL = process.env.TARGET_URL || 'https://newfortech.com';

// Different user agent patterns to test
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

// Different referrer patterns
const REFERRERS = [
  'https://www.google.com/',
  'https://www.bing.com/',
  'https://www.duckduckgo.com/',
  'https://www.facebook.com/',
  'https://www.reddit.com/',
  'https://www.twitter.com/',
  '',
  'https://newfortech.com/',
];

// Test request patterns
const TEST_PATTERNS = [
  {
    name: 'Normal Desktop',
    headers: {
      'User-Agent': USER_AGENTS[0],
      'Referer': REFERRERS[0],
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
  },
  {
    name: 'Mobile Browser',
    headers: {
      'User-Agent': USER_AGENTS[3],
      'Referer': REFERRERS[1],
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    }
  },
  {
    name: 'Direct Access',
    headers: {
      'User-Agent': USER_AGENTS[0],
      'Referer': '',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
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
      'Accept-Language': 'en-US,en;q=0.9',
    }
  },
  {
    name: 'Bot-like',
    headers: {
      'User-Agent': 'curl/7.64.1',
      'Accept': '*/*',
    }
  },
  {
    name: 'API Request',
    headers: {
      'User-Agent': 'PostmanRuntime/7.32.1',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  },
];

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify({
      message: 'WAF Testing Tool API',
      endpoints: {
        'POST /api/test': 'Run WAF tests',
      },
      targetUrl: TARGET_URL,
    }));
    return;
  }

  if (req.method === 'POST') {
    try {
      const results = [];
      const startTime = new Date();

      console.log(`Starting WAF tests against ${TARGET_URL} at ${startTime}`);

      for (const pattern of TEST_PATTERNS) {
        try {
          const testStart = Date.now();
          
          const response = await axios.get(TARGET_URL, {
            headers: pattern.headers,
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: () => true, // Don't throw on any status
          });

          const testDuration = Date.now() - testStart;
          
          const result = {
            pattern: pattern.name,
            timestamp: new Date().toISOString(),
            statusCode: response.status,
            statusText: response.statusText,
            challenged: response.status === 403 || response.status === 429 || response.data?.includes('challenge'),
            responseTime: testDuration,
            headers: pattern.headers,
            bypassedWAF: response.status >= 200 && response.status < 300,
          };

          results.push(result);
          console.log(`[${pattern.name}] Status: ${response.status}, Duration: ${testDuration}ms`);

        } catch (error) {
          results.push({
            pattern: pattern.name,
            timestamp: new Date().toISOString(),
            error: error.message,
            headers: pattern.headers,
          });
          console.error(`[${pattern.name}] Error: ${error.message}`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const summary = {
        totalTests: results.length,
        successful: results.filter(r => r.bypassedWAF).length,
        challenged: results.filter(r => r.challenged).length,
        errors: results.filter(r => r.error).length,
        duration: new Date() - startTime,
        results,
      };

      res.setHeader('Content-Type', 'application/json');
      res.status(200).end(JSON.stringify(summary));

    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).end(JSON.stringify({
        error: error.message,
        details: error.response?.data || 'Unknown error',
      }));
    }
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
}
