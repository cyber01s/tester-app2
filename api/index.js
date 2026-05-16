module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WAF Testing Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 30px;
            margin-bottom: 30px;
        }
        
        .controls {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        input, button, select {
            padding: 12px 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1em;
            font-family: inherit;
        }
        
        input {
            flex: 1;
            min-width: 250px;
        }
        
        button {
            background: #667eea;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s;
        }
        
        button:hover:not(:disabled) {
            background: #5568d3;
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            text-align: center;
        }
        
        .summary-card h3 {
            font-size: 2em;
            color: #667eea;
            margin: 10px 0;
        }
        
        .bypassed { border-left-color: #28a745; }
        .bypassed h3 { color: #28a745; }
        
        .challenged { border-left-color: #dc3545; }
        .challenged h3 { color: #dc3545; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        thead {
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        th {
            font-weight: 600;
            color: #333;
        }
        
        .status {
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .status.bypass {
            background: #d4edda;
            color: #155724;
        }
        
        .status.challenge {
            background: #f8d7da;
            color: #721c24;
        }
        
        .code {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            overflow-x: auto;
        }
        
        .message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .message.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔍 WAF Testing Dashboard</h1>
            <p>Test which traffic patterns bypass your Cloudflare WAF</p>
        </header>
        
        <div class="card">
            <h2>Configuration</h2>
            <div class="controls">
                <input type="url" id="targetUrl" placeholder="https://newfortech.com" value="https://newfortech.com">
                <button onclick="runTests()">Start Tests</button>
            </div>
            <div id="message" class="message info" style="margin-top: 15px; display: none;"></div>
        </div>
        
        <div class="card" id="resultsCard" style="display: none;">
            <h2>Test Results</h2>
            <div class="summary" id="summary"></div>
            <table id="resultsTable">
                <thead>
                    <tr>
                        <th>Pattern</th>
                        <th>Status Code</th>
                        <th>Result</th>
                        <th>Response Time</th>
                    </tr>
                </thead>
                <tbody id="resultsBody"></tbody>
            </table>
        </div>
    </div>
    
    <script>
        async function runTests() {
            const targetUrl = document.getElementById('targetUrl').value.trim();
            const btn = event.target;
            
            if (!targetUrl) {
                alert('Please enter a target URL');
                return;
            }
            
            btn.disabled = true;
            btn.textContent = '⏳ Testing...';
            
            try {
                const response = await fetch('/api/test', { method: 'POST' });
                const data = await response.json();
                
                const resultsCard = document.getElementById('resultsCard');
                const summary = document.getElementById('summary');
                const tbody = document.getElementById('resultsBody');
                
                resultsCard.style.display = 'block';
                
                summary.innerHTML = \`
                    <div class="summary-card"><h3>\${data.totalTests}</h3><p>Total Tests</p></div>
                    <div class="summary-card bypassed"><h3>\${data.successful}</h3><p>Bypassed</p></div>
                    <div class="summary-card challenged"><h3>\${data.challenged}</h3><p>Challenged</p></div>
                \`;
                
                tbody.innerHTML = data.results.map(result => \`
                    <tr>
                        <td><strong>\${result.pattern}</strong></td>
                        <td><code>\${result.statusCode || 'ERROR'}</code></td>
                        <td>
                            <span class="status \${result.bypassedWAF ? 'bypass' : 'challenge'}">
                                \${result.bypassedWAF ? '✅ Bypassed' : result.challenged ? '⛔ Challenged' : '⚠️ Other'}
                            </span>
                        </td>
                        <td>\${result.responseTime || 'N/A'}ms</td>
                    </tr>
                \`).join('');
                
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Start Tests';
            }
        }
    </script>
</body>
</html>
  `);
}
