# Vercel Deployment Troubleshooting

## If deployment fails, try these steps:

### 1. Clean Install & Deploy

```bash
# Delete node_modules and lock file
rm -r node_modules package-lock.json

# Fresh install
npm install

# Deploy again
vercel --prod
```

### 2. Check Deployment Logs

After deploying, check for errors:
```bash
vercel logs
```

### 3. Verify Files

Make sure all files are correctly formatted:
```bash
# Test locally first
vercel dev
```

Then visit `http://localhost:3000` in your browser.

### 4. Environment Variables

In Vercel Dashboard:
1. Go to project → Settings → Environment Variables
2. Add: `TARGET_URL` = `https://newfortech.com`
3. Redeploy

### 5. Common Issues

**Error: Module not found**
- Make sure all `import` statements are converted to `require`
- Check that all files use CommonJS exports

**Error: Cannot find module 'axios'**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`
- Re-run `npm install`

**Error: res.json is not a function**
- Use `res.end(JSON.stringify())` instead of `res.json()`
- This is already fixed in the current version

**404 Not Found**
- Check vercel.json routes
- Make sure api/index.js and api/test.js exist

### 6. Manual Testing

Once deployed, test with:

```bash
# Get API info
curl https://your-vercel-app.vercel.app/api/test

# Run tests
curl -X POST https://your-vercel-app.vercel.app/api/test
```

### 7. Reset Everything

If nothing works:

```bash
# Delete from Vercel first
vercel remove --prod

# Remove local vercel config
rm -rf .vercel

# Fresh deploy
vercel --prod
```

## Files to Check

- [package.json](../package.json) - Should NOT have `"type": "module"`
- [api/index.js](../api/index.js) - Should use `module.exports`
- [api/test.js](../api/test.js) - Should use `module.exports` and `require`
- [vercel.json](../vercel.json) - Routes should be properly configured

## Still Having Issues?

Check the exact error message from `vercel logs` and:
1. Make sure your Node.js version is 18.x or higher
2. Check that dependencies in package.json are available
3. Verify all file syntax is correct (no ES6 imports)
