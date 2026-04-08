# Contributing to CreateForm Pro 🚀

Thank you for your interest in contributing to CreateForm Pro! We welcome contributions from everyone - whether it's bug fixes, new features, documentation, or translations.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Documentation](#documentation)
- [Testing](#testing)
- [Need Help?](#need-help)

---

## Code of Conduct

Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). We're committed to providing a welcoming and inspiring community for all.

**Summary:**
- Be respectful and inclusive
- Assume good intentions
- Focus on what's best for the community
- Report problems to maintainers

---

## Getting Started

### Prerequisites

Before you start, ensure you have:

- **Git** - [Download](https://git-scm.com/download/)
- **Node.js** (optional, for running tests)
- **A GitHub account** - [Create one](https://github.com/join)
- **A code editor** - VS Code, Sublime, WebStorm, etc.

### Fork & Clone

1. **Fork the repository**
   - Click the "Fork" button on GitHub
   - This creates your own copy

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/CreateForm-pro.git
   cd createForm
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/CreateForm-pro.git
   git remote -v  # Verify you have both origin and upstream
   ```

---

## Development Setup

### 1. Install Dependencies

CreateForm uses **no external dependencies** for the core app!

However, for development:

```bash
# Optional: Node.js tools
npm init -y
npm install --save-dev http-server  # Simple local server
```

### 2. Start Development Server

```bash
# Option 1: Python (built-in)
python -m http.server 8000
# or python3 -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: Live Server (VS Code extension)
# Install "Live Server" extension, right-click index.html → "Open with Live Server"
```

Then visit: **http://localhost:8000**

### 3. Verify Setup

- [ ] Open `http://localhost:8000` in browser
- [ ] CreateForm loads without errors
- [ ] Can create a test form
- [ ] Inspect browser console (F12) - no errors

### 4. Run Tests

```bash
# Run entire test suite
node tests/test.js

# Expected output:
# 📦 String Utilities
#   ✓ esc() escapes HTML entities
#   ...
# 📊 Test Summary
#   Total: 70
#   Passed: 70 ✓
#   Failed: 0 ✗
```

---

## How to Contribute

### 1. Choose What to Work On

**Good first contributions:**
- Fixing bugs labeled "good first issue"
- Documentation improvements
- Test additions
- UI/UX tweaks
- Performance optimizations

**Find issues:**
- Browse [Issues](https://github.com/yourusername/CreateForm-pro/issues)
- Look for labels: `good-first-issue`, `help-wanted`
- Comment to claim the issue

### 2. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git pull upstream main

# Create feature branch
# Use format: feature/short-description or bugfix/issue-number
git checkout -b feature/my-awesome-feature
```

**Branch naming:**
- `feature/` - New feature
- `bugfix/` - Bug fix
- `docs/` - Documentation
- `test/` - Testing
- `refactor/` - Code cleanup

### 3. Make Changes

- **Keep changes focused** - One feature per PR
- **Small commits** - Logical, atomic commits
- **Update tests** - Add tests for new code
- **Test locally** - Run tests before pushing

### 4. Commit & Push

```bash
# Stage changes
git add .

# Commit with clear message (see Commit Guidelines below)
git commit -m "feat: Add field duplicate feature"

# Push to your fork
git push origin feature/my-awesome-feature
```

### 5. Create Pull Request

1. Go to original repository on GitHub
2. Click "Compare & pull request"
3. Fill out PR template (see below)
4. Describe what you changed and why
5. Link any related issues

**PR Title Format:**
- `feat: Add new field type (Signature)`
- `fix: Correct form validation for email`
- `docs: Add API documentation`
- `test: Add tests for schema encoding`

---

## Coding Standards

### JavaScript Style Guide

**File Structure:**
```javascript
/* ═════════════════════════ 
   Section Header
   ═════════════════════════ */

// Single space between sections

function functionName() {
  // Implementation
}
```

**Naming Conventions:**
```javascript
// Variables & functions: camelCase
let formCount = 0;
function renderForm() { }

// Constants: UPPER_SNAKE_CASE
const MAX_FIELD_COUNT = 1000;
const TYPE_META = { };

// Classes: PascalCase
class FormBuilder { }

// Configuration objects: clearly named
const CONFIG = {
  defaultName: 'Untitled Form',
  maxRows: 10000,
};
```

**Comments:**
```javascript
// ── Use for section breaks (40 chars)
// Use for single-line comments

/* Use for multi-line explanations
   over several lines */

/* ── Use for titled sections like above ── */

/**
 * Use for function documentation
 * @param {type} name - description
 * @returns {type} description
 */
function doSomething(param) {
  // implementation
}
```

**Formatting:**
```javascript
// Indentation: 2 spaces (not tabs)
if (condition) {
  doSomething();
}

// Line length: Keep under 100 characters
const longVariable = condition ? valueA : valueB;

// Spacing
let a = 1;        // Space around =
let b = true;     // Space after keywords

function test() { // Space before {
  return true;
}
```

**Best Practices:**
- ✅ Use `const` by default
- ✅ Use `let` for variables
- ✅ Avoid `var`
- ✅ Avoid global scope pollution
- ✅ Keep functions small (<50 lines ideally)
- ✅ Return early from functions
- ✅ Avoid nested callbacks (use promises/async)

### CSS Style Guide

```css
/* ── Section header ── */
.element {
  property: value;
  property: value;
}

/* BEM naming for complex components */
.form-card {
  border: 1px solid #ccc;
}
.form-card__title {
  font-weight: bold;
}
.form-card--active {
  background: #f0f0f0;
}

/* Use CSS variables for colors/sizes */
:root {
  --color-primary: #2563eb;
  --color-text: #1a1a1a;
  --radius-md: 10px;
}

.button {
  background: var(--color-primary);
  border-radius: var(--radius-md);
}
```

### HTML Style Guide

```html
<!-- Use semantic HTML -->
<header> <main> <footer> <section> <article>

<!-- Clear class names -->
<div class="form-builder-canvas">
  <div class="field-card">
    <label class="field-label">Name</label>
  </div>
</div>

<!-- ID for unique elements only -->
<div id="publish-modal">

<!-- Self-closing tags: />
<input type="text" />
<img src="icon.svg" />
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (not CSS)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `perf:` - Performance improvements
- `chore:` - Maintenance

**Examples:**
```bash
git commit -m "feat: Add file upload field type"
git commit -m "fix: Correct email validation regex"
git commit -m "docs: Add API reference"
git commit -m "test: Add schema encoding tests"
git commit -m "refactor: Extract validation logic"
```

**Commit Message Template:**
```
feat: Add field duplication feature

Allow users to duplicate fields to save time when creating
similar fields. Duplicated field gets a (copy) suffix and
new unique ID.

Closes #123
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   git push -f origin feature/my-feature
   ```

2. **Run tests**
   ```bash
   node tests/test.js
   # All tests must pass
   ```

3. **Verify no conflicts**
   - Check GitHub for merge conflicts
   - Resolve locally if needed

### PR Template

```markdown
## Description
Brief explanation of changes

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Performance improvement

## Testing
How to test this change:
1. ...
2. ...

## Checklist
- [ ] Tests pass: `npm test`
- [ ] No console errors
- [ ] Comments added
- [ ] Documentation updated
- [ ] No unrelated changes
```

### After Submission

- **Respond to reviews** - Address feedback promptly
- **Update your branch** - Push changes for review updates
- **Be patient** - Maintainers will review when available
- **Thank reviewers** - Appreciated! 🙏

### Merge!

Once approved, maintainers will merge your PR!

---

## Reporting Bugs

### Before Creating Issue

- [ ] Search existing issues (might already be reported)
- [ ] Try on different browser
- [ ] Check browser console for errors
- [ ] Clear browser cache

### Creating Issue

**Title:** Be specific
- ✅ "Email validation fails with .co.uk domains"
- ❌ "Validation broken"

**Description Template:**

```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 120
- OS: Windows 11
- CreateForm Version: 1.0.0

## Screenshots
[If applicable, add screenshots]

## Additional Context
Any other relevant info
```

---

## Suggesting Features

### Before Suggesting

- [ ] Check existing issues for similar feature
- [ ] Ensure feature aligns with project goals
- [ ] Consider implementation complexity

### Creating Feature Request

**Title:** Clear and concise
- ✅ "Add conditional field visibility"
- ❌ "Better validation"

**Description Template:**

```markdown
## Description
Why do you want this feature?
What problem does it solve?

## Use Case
Example of how it would be used

## Proposed Solution
How you envision it working

## Alternative Solutions
Other approaches to solve this

## Additional Context
Screenshots, references, related issues
```

---

## Documentation

### Writing Docs

- **Clear & concise** - Assume user has basic knowledge
- **Examples** - Show code examples
- **Step-by-step** - Break complex topics into steps
- **Links** - Link to related docs

### Doc Format

```markdown
# Title

Brief intro paragraph.

## Section 1

Explanation here.

### Subsection

More details.

## Examples

\`\`\`javascript
// Code example
const result = doSomething();
\`\`\`

## See Also

- [Related Doc](link)
```

### Update Docs When:

- Adding new features
- Changing existing behavior
- Adding configuration options
- Fixing unclear explanations

---

## Testing

### Adding Tests

Tests go in `tests/test.js`. Follow the pattern:

```javascript
runner.describe('Feature Name', () => {
  
  runner.it('should do something specific', () => {
    const result = functionToTest();
    runner.assertEqual(result, expectedValue);
  });
  
  runner.it('should handle edge case', () => {
    const result = functionToTest(edgeCase);
    runner.assert(result, 'Message if fails');
  });
  
});
```

### Test Guidelines

- ✅ Test behavior, not implementation
- ✅ One assertion per test (ideally)
- ✅ Clear test names (describe what it does)
- ✅ Include edge cases
- ✅ Test error conditions

### Running Tests

```bash
# All tests
node tests/test.js

# With verbose output
node tests/test.js --verbose
```

---

## Code Review

### What We Look For

✅ **Functionality**
- Does it work as intended?
- Are edge cases handled?

✅ **Code Quality**
- Follows style guidelines?
- Clear and maintainable?
- No unnecessary complexity?

✅ **Tests**
- New code has tests?
- All tests passing?

✅ **Documentation**
- Clear comments?
- Docs updated?

✅ **Performance**
- No performance degradation?
- Efficient algorithms?

✅ **Security**
- No security issues?
- Proper input validation?

---

## Need Help?

### Chat Channels

- **GitHub Discussions** - Ask questions
- **Issues** - Report bugs and discuss features
- **Email** - contact@CreateForm.dev

### Resources

- 📖 [README.md](README.md) - Project overview
- 📚 [SETUP.md](SETUP.md) - Development guide
- 🧪 [tests/test.js](tests/test.js) - Test examples
- 🎨 [Code examples](app.js) - Reference implementation

### Getting Unstuck

1. **Search documentation** - Most answers are there
2. **Check existing issues** - Likely been discussed
3. **Ask on GitHub** - Community can help
4. **Comment on PR** - Maintainers can guide

---

## Recognition

Contributors are recognized in:

- 📋 [CONTRIBUTORS.md](CONTRIBUTORS.md) - All contributors
- 🌟 GitHub repository contributors section
- 📢 Release notes for significant contributions

**Thank you for contributing!** 🎉

---

## License

By contributing, you agree your code will be licensed under the MIT License. See [LICENSE](LICENSE).

---

## Questions?

Still have questions?
- 📧 Email: contact@CreateForm.dev
- 💬 Start a discussion on GitHub
- 📖 Check out [README.md](README.md)

**Happy coding! 🚀**
