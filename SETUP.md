# Development Setup Guide

Complete guide to set up CreateForm Pro development environment.

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Detailed Setup](#detailed-setup)
- [Running Locally](#running-locally)
- [Running Tests](#running-tests)
- [IDE Setup](#ide-setup)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component | Version | Note |
|-----------|---------|------|
| **OS** | Any (Windows, Mac, Linux) | No OS restrictions |
| **Browser** | Chrome 90+, Firefox 88+ | Modern browser needed |
| **Disk Space** | 100 MB | Small project, minimal deps |
| **RAM** | 512 MB | Running dev server |

### Optional but Recommended

| Component | Purpose |
|-----------|---------|
| **Node.js 16+** | Running tests, dev tools |
| **Git** | Version control |
| **VS Code** | Code editor (great extensions) |
| **Python 3** | Built-in server alternative |

---

## Quick Start (5 minutes)

### Step 1: Get the Code

```bash
# Using Git
git clone https://github.com/yourusername/CreateForm-pro.git
cd createForm

# Or: Download ZIP and extract
# Or: Fork on GitHub and clone your fork
```

### Step 2: Start Local Server

**Using Python (built-in):**
```bash
# Windows
py -m http.server 8000

# macOS/Linux
python3 -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

**Using VS Code Live Server:**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Step 3: Open in Browser

Visit: **http://localhost:8000**

✅ Done! CreateForm is running.

---

## Detailed Setup

### 1. Install Git

**macOS:**
```bash
# Using Homebrew
brew install git

# Or: Download from
https://git-scm.com/download/mac
```

**Windows:**
```bash
# Download from
https://git-scm.com/download/win

# Or: Using Chocolatey
choco install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install git
```

**Verify:**
```bash
git --version
# Should output: git version 2.x.x
```

### 2. Install Node.js (Optional but Recommended)

**macOS:**
```bash
# Using Homebrew
brew install node

# Or: Download from
https://nodejs.org/
```

**Windows:**
```bash
# Download installer from
https://nodejs.org/

# Or: Using Chocolatey
choco install nodejs
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify:**
```bash
node --version
npm --version
# Should output version numbers
```

### 3. Clone Repository

```bash
# Clone the repo
git clone https://github.com/yourusername/CreateForm-pro.git

# Navigate to project
cd CreateForm-pro/createForm

# Verify files exist
ls -la
# Should see: index.html, app.js, style.css, etc.
```

### 4. Install Development Dependencies

```bash
# Navigate to project root
cd createForm

# Initialize npm (if not already)
npm init -y

# Install dev dependencies
npm install --save-dev http-server
```

### 5. Verify Installation

```bash
# Check file structure
ls -la

# Should show:
# - index.html
# - app.js
# - style.css
# - backend/code.gs
# - tests/test.js
# - package.json
# - node_modules/ (if installed)
```

---

## Running Locally

### Method 1: Python HTTP Server (Recommended for Windows/Mac)

```bash
cd createForm

# Python 3 (recommended)
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Output should show:
# Serving HTTP on 0.0.0.0 port 8000
```

Then visit: **http://localhost:8000**

### Method 2: Node.js HTTP Server

```bash
cd createForm

# Using npx (no install needed)
npx http-server -p 8000

# Or: If installed locally
npm start
```

Then visit: **http://localhost:8000**

### Method 3: VS Code Live Server Extension

1. Install extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Browser opens automatically (usually port 5500)

### Method 4: Docker

```bash
# Build image
docker build -t CreateForm .

# Run container
docker run -p 8080:80 CreateForm

# Visit: http://localhost:8080
```

### Testing Connection

After starting server:

```bash
# Test in browser console
console.log('CreateForm loaded:', typeof renderAll === 'function')
# Should output: CreateForm loaded: true
```

---

## Running Tests

### Run All Tests

```bash
cd createForm

# Using Node.js
node tests/test.js

# Expected output:
# 📦 String Utilities
#   ✓ esc() escapes HTML entities
#   ✓ esc() handles null/undefined
# ...
# 📊 Test Summary
#   Total:  70
#   Passed: 70 ✓
#   Failed: 0 ✗
# ✅ All tests passed!
```

### Run Tests in Browser

1. Open `tests/test.js` in browser console
2. Or: Create `tests/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>CreateForm Tests</title>
</head>
<body>
  <h1>CreateForm Tests - Open Console (F12)</h1>
  <script src="../app.js"></script>
  <script src="test.js"></script>
</body>
</html>
```

3. Visit `http://localhost:8000/tests/` and open console (F12)

### Test Coverage

Current tests cover (~70 tests):

- String utilities
- Form encoding/decoding
- Field validation
- Data serialization
- Field type system
- URL generation
- Edge cases

### Writing New Tests

Add tests to `tests/test.js`:

```javascript
runner.describe('My Feature', () => {
  
  runner.it('should do something', () => {
    const result = myFunction();
    runner.assert(result, 'Failed message');
  });
  
});
```

Run tests: `node tests/test.js`

---

## IDE Setup

### VS Code (Recommended)

**1. Install VS Code**
- Download: https://code.visualstudio.com/

**2. Recommended Extensions**

```
Ctrl+Shift+X (Open Extensions)

Search and install:
- Live Server (ritwickdey.LiveServer)
- Prettier (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Bracket Pair Colorizer (coenraadcoding.bracket-pair-colorizer)
```

**3. Settings (Optional)**

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

**4. Launch Configuration**

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:8000",
      "webRoot": "${workspaceFolder}/createForm"
    }
  ]
}
```

### Other IDEs

**WebStorm:**
- Open project
- Built-in server: Run → Run 'index.html'

**Sublime Text:**
- Install: SimpleHTTPServer (Cmd Palette)
- Press Ctrl+Shift+P → SimpleHTTPServer

**Vim/Neovim:**
```bash
# In terminal:
python3 -m http.server 8000 &
# Then open in browser
```

---

## Deployment

### Deploy to GitHub Pages (Free)

```bash
# 1. Create repo on GitHub
# 2. Clone it locally
git clone https://github.com/yourusername/CreateForm-pages.git
cd CreateForm-pages

# 3. Copy CreateForm files (except backend/code.gs)
cp createForm/index.html .
cp createForm/app.js .
cp createForm/style.css .

# 4. Commit and push
git add .
git commit -m "Add CreateForm"
git push origin main

# 5. Enable GitHub Pages
# Settings → Pages → Source: main branch
```

Visit: `https://yourusername.github.io/CreateForm-pages`

### Deploy to Netlify (Free)

```bash
# 1. Create Netlify account
# https://app.netlify.com

# 2. Connect GitHub repo
# Dashboard → New site from Git → Choose repo

# 3. Configure build
# No build needed - skip build step

# 4. Deploy!
# Netlify auto-deploys on git push
```

### Deploy to Vercel (Free)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Visit your site!
```

### Self-Hosted (VPS)

```bash
# 1. Upload files to server
scp -r createForm/* user@server:/var/www/CreateForm

# 2. Setup web server (nginx example)
sudo apt-get install nginx
sudo systemctl start nginx

# 3. Configure nginx
sudo nano /etc/nginx/sites-available/default
# Point root to /var/www/CreateForm

# 4. Restart
sudo systemctl restart nginx
```

---

## Troubleshooting

### Server won't start

**Problem:** "Address already in use"

```bash
# Find what's using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Try different port
python3 -m http.server 9000
```

### "File not found" error

**Problem:** Getting 404 for files

```bash
# Verify you're in correct directory
pwd  # or 'cd' on Windows

# Should show: /path/to/createForm

# Verify files exist
ls index.html app.js style.css

# If missing, copy them:
cp ../index.html ./
```

### Changes not reflecting in browser

**Problem:** Seeing old version

```bash
# 1. Hard refresh (clear cache)
Ctrl+Shift+R  # or Cmd+Shift+R on Mac

# 2. Open DevTools and:
# More tools → Network → Disable cache (while DevTools open)

# 3. Delete browser cache
# Settings → Clear browsing data → Cached images
```

### Tests failing

**Problem:** Red X's in test output

```bash
# 1. Run tests with details
node tests/test.js 2>&1

# 2. Check specific test file
cat tests/test.js | grep -A 5 "failing test name"

# 3. Review error message carefully
# Usually hints at what's wrong
```

### Git clone failing

**Problem:** "Permission denied" or connection issues

```bash
# Use HTTPS instead of SSH (if SSH fails)
git clone https://github.com/yourusername/CreateForm-pro.git

# Or: Setup SSH keys
ssh-keygen -t ed25519
# Then add to GitHub settings

# For corporate proxies:
git config --global http.proxy [proxy_url]
```

### Port 8000 already in use on Windows

```powershell
# Find process using port
Get-Process | findstr 8000

# Or more reliably:
netstat -ano | findstr :8000

# Kill process (example PID 1234)
taskkill /PID 1234 /F

# Use different port
python -m http.server 8001
```

### Can't find npm after Installing Node.js

```bash
# Close and reopen terminal/command prompt

# Or verify installation
npm -v
node -v

# Windows: May need to add to PATH
# Restart computer after Node.js install
```

---

## Performance Tips

### For Faster Development

1. **Use Live Server** - Auto-refresh on file save
2. **Disable extensions** - Reduce browser overhead
3. **Use Firefox DevTools** - Simpler than Chrome
4. **Minimize console output** - Less rendering
5. **Cache busting**:
   ```bash
   # Add timestamp to force reload
   <script src="app.js?v=1234567890"></script>
   ```

### For Debugging

```javascript
// In browser console (F12):

// Check if app loaded
typeof state !== 'undefined'  // Should be true

// View current state
console.log(state)

// Test a function
labelToName('Full Name')  // Should return 'full_name'

// Check localStorage
localStorage.getItem('CreateForm_pro_v1')
```

---

## What's Next?

After setup:

1. ✅ Explore the code (`app.js`)
2. ✅ Create a test form
3. ✅ Run the test suite (`node tests/test.js`)
4. ✅ Read [CONTRIBUTING.md](CONTRIBUTING.md)
5. ✅ Pick an issue to work on

---

## Getting Help

- 📖 [README.md](README.md) - Project overview
- 🤝 [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- 🐛 [GitHub Issues](https://github.com/yourusername/CreateForm-pro/issues) - Bug reports
- 💬 [Discussions](https://github.com/yourusername/CreateForm-pro/discussions) - Questions

---

**Happy coding! 🚀**
