# WAF Testing Tool

A testing application to identify which traffic patterns bypass your Cloudflare WAF managed challenge rules.

## Purpose

This tool helps you:
- Test different request patterns against your target site
- Identify which traffic types bypass your Cloudflare WAF
- Understand your WAF configuration effectiveness
- Debug and improve your security rules

## What It Tests

The tool generates requests with various characteristics:
- **Normal Desktop browsers** - Standard Chrome/Firefox/Safari patterns
- **Mobile browsers** - iPhone/iPad user agents
- **Direct access** - No referrer
- **Minimal headers** - Stripped-down requests
- **Bot-like traffic** - curl, Postman patterns
- **Suspicious patterns** - Multiple IP headers, etc.

Each test tracks:
- Response status code
- Whether it bypassed the WAF (200-299 status)
- Whether it hit a Cloudflare challenge (403/429)
- Response time
- Request headers used

## Setup

### 1. Local Testing

```bash
# Install dependencies
npm install

# Run tests locally
node scripts/runTests.js https://newfortech.com

# Results are saved to logs/test_*.json
```

### 2. Deploy to Vercel (Free Plan)

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# When asked for project settings, use defaults
# Add environment variable:
# TARGET_URL = https://newfortech.com
```

### 3. Use the Deployed Version

Once deployed, you can trigger tests:

```bash
curl -X POST https://your-vercel-app.vercel.app/api/test
```

## Understanding Results

### Status Codes
- **✅ BYPASSED (200-299)**: Traffic got through WAF - these are the patterns to block
- **⛔ CHALLENGED (403/429)**: Cloudflare challenge triggered - WAF is working
- **⚠️ OTHER**: Unexpected response - may indicate server issues

### Output Example
```
✅ BYPASSED | Normal Desktop           | Status: 200 | 245ms
⛔ CHALLENGED | Bot-like (curl)        | Status: 403 | 122ms
✅ BYPASSED | Direct Access           | Status: 200 | 198ms
```

## Improving Your WAF

Based on test results:

1. **Note which patterns bypass** - e.g., "Direct Access (no referrer)" or "Minimal Headers"
2. **Add Cloudflare rules** for those patterns:
   - Go to Cloudflare Dashboard → Security → WAF
   - Create custom rules targeting the patterns that got through
   - Examples:
     - Block requests without User-Agent
     - Block requests without common headers
     - Block requests from specific patterns

3. **Re-test** to verify your new rules block the bypassing patterns

## Configuration

Edit `scripts/runTests.js` to:
- Add new request patterns
- Modify user agents
- Change referrer patterns
- Adjust timing/delays

## Advanced: Custom Tests

You can manually test specific patterns:

```bash
# Using curl with custom headers
curl -A "CustomBot/1.0" -e "https://example.com" https://newfortech.com -v
```

Capture the response headers and status to understand what's being blocked.

## Environment Variables

- `TARGET_URL` - The site to test (default: https://newfortech.com)

Set in vercel.json or `.env.local` for local testing.

## Logs

Test results are saved to `logs/` directory with detailed information about each request.

## Important Notes

⚠️ **Only test sites you own or have permission to test**
- This tool tests your own infrastructure
- Always verify WAF effectiveness in staging before production changes
- Be aware of rate limits on your actual site

## Troubleshooting

### Tests timing out
- Increase timeout in axios config
- Check if Cloudflare is challenging all requests

### Getting 429 on every test
- Your WAF might be rate-limiting too aggressively
- Add delays between tests in the script
- Consider IP allowlisting for testing

### All tests showing 200 status
- Your WAF might not be active
- Check Cloudflare dashboard for rule status
- Verify the target URL is correct

## Next Steps

1. Run tests locally to baseline your WAF
2. Identify patterns that bypass challenges
3. Create Cloudflare rules to block those patterns
4. Re-run tests to validate
5. Deploy to Vercel for ongoing monitoring
