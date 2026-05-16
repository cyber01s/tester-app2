# Quick Start Guide

## Run Tests Immediately (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run tests against your site
npm test

# Or with a custom URL:
node scripts/runTests.js https://newfortech.com
```

Results will appear in the terminal and be saved to `logs/` folder.

## Deploy to Vercel (Free)

### Quick Deploy (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login and deploy
vercel --prod
```

That's it! Vercel will automatically:
- Detect the Node.js project
- Install dependencies
- Deploy your functions
- Give you a URL

### If That Doesn't Work

Try these troubleshooting steps:

**1. Clean install first:**
```bash
rm -r node_modules package-lock.json
npm install
vercel --prod
```

**2. Check Vercel logs:**
```bash
vercel logs --prod
```

**3. Test locally first:**
```bash
vercel dev
# Then visit http://localhost:3000
```

**4. See [DEPLOYMENT_HELP.md](./DEPLOYMENT_HELP.md) for detailed help**

## Using Your Deployed App

### In Browser
Visit your Vercel URL and click "Start Tests"

### From Command Line
```bash
curl -X POST https://your-app.vercel.app/api/test
```

## Understanding Results

### ✅ BYPASSED (Status 200-299)
These request patterns got through your WAF - **you need to block these**.

**Action**: Create Cloudflare rules for these patterns:
- Go to Cloudflare Dashboard → Security → WAF → Create Rule
- Target the specific headers or patterns that bypassed
- Set action to "Challenge" or "Block"

### ⛔ CHALLENGED (Status 403/429)
Your WAF is working correctly for these patterns - good!

### ⚠️ Other
Unexpected responses - check your site isn't returning errors.

## Example Improvements

If "Bot-like (curl)" bypassed:
- Create Cloudflare rule: `User Agent contains "curl"`
- Action: Block

If "No User Agent" bypassed:
- Create rule: `User Agent is empty`
- Action: Block

If "Minimal Headers" bypassed:
- Create rule: `Request headers count < 5`
- Action: Challenge

## Testing Specific Patterns

Edit `scripts/runTests.js` to add custom test patterns before running.

## Need More Help?

- See [README.md](./README.md) for comprehensive documentation
- See [DEPLOYMENT_HELP.md](./DEPLOYMENT_HELP.md) for deployment issues
- See [CURL_TESTING.md](./CURL_TESTING.md) for manual testing with curl
