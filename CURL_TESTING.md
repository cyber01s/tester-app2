# Manual Testing with curl

Use these curl commands to manually test specific traffic patterns:

## Normal Desktop Browser

```bash
curl -i -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -e "https://www.google.com/" \
  -H "Accept-Language: en-US,en;q=0.9" \
  https://newfortech.com
```

## Mobile Browser

```bash
curl -i -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" \
  -e "https://www.bing.com/" \
  https://newfortech.com
```

## Direct Access (No Referrer)

```bash
curl -i -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  -e "" \
  https://newfortech.com
```

## Minimal Headers

```bash
curl -i -A "Mozilla/5.0" \
  https://newfortech.com
```

## No User Agent

```bash
curl -i -H "User-Agent:" \
  -e "https://www.google.com/" \
  https://newfortech.com
```

## Bot-like (curl)

```bash
curl -i https://newfortech.com
```

## Suspicious - Multiple IP Headers

```bash
curl -i -A "curl/7.64.1" \
  -H "X-Forwarded-For: 192.168.1.1" \
  -H "X-Real-IP: 10.0.0.1" \
  -H "X-Originating-IP: [192.168.1.1]" \
  https://newfortech.com
```

## Custom Pattern

```bash
curl -i \
  -A "YourCustomAgent" \
  -e "https://custom-referrer.com/" \
  -H "Custom-Header: value" \
  https://newfortech.com
```

## Reading Results

Look for:

- **200-299**: Request got through ✅ (Bypassed WAF)
- **403/429**: Cloudflare challenge ⛔ (WAF blocked)
- **Other**: Check status for other responses

The `-i` flag shows response headers including:
- `cf-ray`: Cloudflare ray ID (confirms Cloudflare is handling it)
- `cf-mitigated`: If this shows a value, a rule triggered

## Batch Testing

```bash
# Test all patterns and see results
for pattern in "normal" "mobile" "direct" "minimal" "no-ua" "bot" "suspicious"; do
  echo "Testing: $pattern"
  curl -s -o /dev/null -w "Status: %{http_code}\n" https://newfortech.com
  sleep 1
done
```

## Logging Results

```bash
# Save full response including headers
curl -i https://newfortech.com > response_log.txt

# Save only status code
curl -s -o /dev/null -w "%{http_code}\n" https://newfortech.com
```

## One-Liner to Test Multiple Patterns

```bash
echo "Normal|Bot|Direct" | tr '|' '\n' | while read p; do echo "=== $p ===" && curl -s -o /dev/null -w "Status: %{http_code}\n" https://newfortech.com && sleep 1; done
```
