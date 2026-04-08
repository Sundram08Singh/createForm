# CreateForm Pro 🎨

**A powerful, open-source form builder with shareable links and Google Sheets integration.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-compatible-green.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CreateForm Pro is a **no-backend form builder** that lets you:

✅ **Build forms visually** - Drag-and-drop interface with 12+ field types  
✅ **Share with anyone** - Generate shareable links (no signup required)  
✅ **Collect responses** - Auto-save submissions to Google Sheets  
✅ **Upload files** - File submissions saved to Google Drive  
✅ **Customize everything** - Success messages, redirects, custom headers  
✅ **Open source** - MIT licensed, fully auditable code

### Use Cases

- 📝 **Contact Forms** - Collect inquiries and feedback
- 📋 **Surveys** - Gather opinions and data
- 📄 **Applications** - Job applications, event registrations
- 🎯 **Sign-ups** - Newsletter subscriptions, event RSVPs
- 💼 **Business Forms** - Leads, support tickets, proposals

---

## Features

### 🎯 Form Builder

| Feature | Details |
|---------|---------|
| **Field Types** | Text, Email, Phone, URL, Number, Date, Textarea, Select, Radio, Checkbox, Slider, File, Divider |
| **Validation** | Required fields, email format, min/max values, custom patterns |
| **Customization** | Labels, placeholders, hints, default values, custom field names |
| **Organization** | Drag-to-reorder, duplicate fields, section dividers |
| **Data Types** | Support for primitives, files, and complex data |

### 🔗 Published Forms

| Feature | Details |
|---------|---------|
| **URL-based** | Forms encoded in URLs (no server needed) |
| **Shareable** | Copy link and share anywhere |
| **Responsive** | Works on desktop, tablet, mobile |
| **No Auth** | Anyone can submit, no login required |
| **One-click** | "Publish" button generates instant link |

### 📊 Submission Management

| Feature | Details |
|---------|---------|
| **Google Sheets** | Auto-save to spreadsheet |
| **File Uploads** | Send to Google Drive automatically |
| **Timestamps** | Every submission logged with date/time |
| **Metadata** | Form name, description included |
| **Notifications** | Email notifications (optional) |

### ⚙️ Customization

| Feature | Details |
|---------|---------|
| **Success Message** | Custom message after submission |
| **Redirect URL** | Send users to thank-you page |
| **Form Reset** | Auto-clear form after submit |
| **Headers** | Add custom HTTP headers |
| **Method** | POST, PUT, or PATCH |
| **Content Type** | JSON or form-urlencoded |

---

## Quick Start

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/CreateForm-pro.git
cd CreateForm-pro

# (No build needed - just open in a browser!)
open index.html
# or
start index.html  # Windows
```

### Option 2: Deploy Online

1. Upload `index.html`, `app.js`, and `style.css` to:
   - GitHub Pages
   - Netlify
   - Vercel
   - Any static host

2. Access at: `https://yourdomain.com`

### Option 3: Using Docker

```bash
docker build -t CreateForm .
docker run -p 8080:80 CreateForm
```

---

## Architecture

### Project Structure

```
createForm/
├── index.html              # Main HTML shell
├── app.js                  # Core application logic (~1500 lines)
├── style.css               # Styling system (~900 lines)
├── backend/
│   └── code.gs            # Google Apps Script (submissions handler)
├── tests/
│   └── test.js            # Test suite
├── README.md              # This file
├── CONTRIBUTING.md        # Contribution guidelines
├── SETUP.md               # Development setup
├── PUBLISH_GUIDE.md       # Publishing guide
├── CODE_OF_CONDUCT.md     # Community guidelines
├── LICENSE                # MIT License
└── .gitignore             # Git ignore rules
```

### Core Modules

```javascript
// app.js is organized into logical sections:

1. Type System (TYPE_META, TYPE_DEFAULTS)
   └─ Field types and their configurations

2. Bootstrap & Routing
   ├─ Route detection (#/form?s=SCHEMA)
   ├─ Published form rendering
   └─ Builder mode initialization

3. Form Management
   ├─ Create, switch, delete forms
   ├─ State persistence (localStorage)
   └─ Form schema building

4. Field Management
   ├─ Add, remove, duplicate fields
   ├─ Field reordering (drag & drop)
   └─ Field editing dialog

5. Rendering & UI
   ├─ Canvas rendering (builder)
   ├─ Preview rendering
   ├─ Published form HTML generation
   └─ Dynamic HTML injection

6. Data Handling
   ├─ Form data collection
   ├─ File upload processing
   ├─ Validation logic
   └─ Submission serialization

7. Backend Integration
   ├─ Schema encoding/decoding
   ├─ HTTP submission (fetch API)
   ├─ CORS handling
   └─ Error management

8. UI Components
   ├─ Toast notifications
   ├─ Modal dialogs
   ├─ Loading overlays
   └─ Success screens
```

### Data Flow

```
User Input
    ↓
Event Handler (onclick, oninput)
    ↓
State Update (state object)
    ↓
Persist (localStorage)
    ↓
Render (DOM manipulation)
    ↓
UI Display
```

### Published Form Flow

```
User clicks "Publish"
    ↓
Generate Schema (form definition)
    ↓
Encode Schema (URL-safe base64)
    ↓
Create Link (#/form?s=ENCODED)
    ↓
User shares link
    ↓
Visitor browses to link
    ↓
Parse URL hash
    ↓
Decode schema
    ↓
Render clean submission page
    ↓
User fills & submits
    ↓
Validate data
    ↓
HTTP POST to Apps Script
    ↓
Apps Script saves to Google Sheet
    ↓
File uploads go to Drive
    ↓
Show success message
```

---

## Core Concepts

### 1. Form State

The entire application uses a single state object:

```javascript
let state = {
  forms:         [],         // Array of form definitions
  activeFormId:  null,       // Currently editing form
  nextFormId:    1,          // Sequential ID generator
  nextFieldId:   1,          // Sequential field ID
  mainTab:       'build',    // Current view: build|preview|settings
  dialog:        { ... },    // Field edit dialog state
  dragSrcId:     null,       // Drag-and-drop tracking
  lastPayload:   null,       // Last submission attempt
};
```

### 2. Form Schema

Each form has this structure:

```javascript
{
  id:           123,
  title:        'Contact Form',
  description:  'Get in touch',
  fields:       [ /* field array */ ],
  settings:     {
    actionUrl:    'https://script.google.com/...',
    method:       'POST',
    contentType:  'application/json',
    headers:      '{}',
    successMsg:   'Thank you!',
    redirectUrl:  '',
    resetAfter:   true,
  }
}
```

### 3. Field Definition

```javascript
{
  id:            1,
  type:          'text',              // Field type
  label:         'Your Name',         // Display label
  name:          'your_name',         // Data key (in submissions)
  placeholder:   'John Doe',          // Input placeholder
  hint:          'Enter full name',   // Helper text
  required:      true,                // Is required
  
  // Type-specific:
  optionsRaw:    'A\nB\nC',           // For select|radio
  checkboxLabel: 'I agree',           // For checkbox
  rows:          4,                   // For textarea
  min:           0, max: 100,         // For number|range
  step:          1,                   // For range
  accept:        'image/*',           // For file
  multiple:      false,               // For file
}
```

### 4. Encoding System

Forms are published as URL-encoded schemas:

```
Original: {"title":"Contact Form","fields":[...]}
    ↓
JSON: {"title":"Contact Form","fields":[...]}
    ↓
Unicode Escape: \u00XX...
    ↓
Base64: ewoidGl0bGUi...
    ↓
URL-Safe: ewo...  (replace +→-, /→_, remove =)
    ↓
Link: https://example.com/#/form?s=ewo...
```

The schema is **entirely in the URL** - no server storage needed!

### 5. Field Validation

Validation happens in two places:

```javascript
// 1. Client-side (before submission):
- Required fields not empty
- Email format validation
- URL format validation
- Min/max constraints
- Custom patterns

// 2. Server-side (in Google Apps Script):
- Data type checks
- Malicious input filtering
- File validation
- Row creation in sheet
```

---

## Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Drive account (for submissions)
- Google Apps Script (for backend)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/CreateForm-pro.git
   cd createForm
   ```

2. **Open in browser:**
   ```bash
   # macOS
   open index.html
   
   # Linux
   xdg-open index.html
   
   # Windows
   start index.html
   ```

3. **No installation needed** - uses vanilla JavaScript, no dependencies!

### Development Setup

See [SETUP.md](SETUP.md) for complete development environment setup.

---

## Usage Guide

### Creating a Form

1. **Start building:**
   - CreateForm opens with a default "Contact Form"
   - Click field types on the left to add fields

2. **Configure each field:**
   - Double-click a field to edit
   - Set label, placeholder, validation rules
   - Use helper text for user guidance

3. **Organize fields:**
   - Drag fields to reorder
   - Click duplicate to copy a field
   - Use dividers to create sections

4. **Preview:**
   - Click **Preview** tab to see how it looks
   - Fill out and test submission locally

5. **Configure settings:**
   - Go to **Settings** tab
   - Paste your Google Apps Script URL
   - Set success message and redirect (optional)

### Publishing a Form

1. Click **Publish** button (top right)
2. Copy the shareable link
3. Share with anyone
4. Responses automatically go to Google Sheet

### Managing Submissions

1. Check your Google Sheet
2. Each submission = one row
3. Includes timestamp, form name, all responses
4. Files appear as links to Google Drive

---

## API Reference

### Global Functions (for developers)

**State Management:**
```javascript
activeForm()                // Get current form object
persist()                   // Save state to localStorage
tryLoadState()             // Load state from localStorage
state                      // Global state object
```

**Field Operations:**
```javascript
addField(type)             // Add new field to form
removeField(id, e)         // Remove field from form
moveField(id, direction)   // Reorder field
duplicateField(id, e)      // Duplicate a field
openDialog(fieldId)        // Open field edit dialog
saveDialog()               // Save field changes
```

**Form Operations:**
```javascript
createNewForm(name)        // Create new form
switchForm(id)             // Make form active
deleteForm(id, e)          // Delete form
publishForm()              // Generate publish link
exportJSON()               // Export form schema as JSON
```

**Submission:**
```javascript
handlePreviewSubmit()       // Submit from preview
handlePublishedFormSubmit() // Submit from published link
validatePreviewData()       // Validate form data
collectPublishedData()      // Gather all field values
```

**Utilities:**
```javascript
encodeSchema(schema)       // Encode to URL-safe base64
decodeSchema(encoded)      // Decode from URL-safe base64
buildSchema(form)          // Build submission schema
labelToName(label)         // Convert label to field name
parseOptions(raw)          // Parse multi-line options
esc(string)                // HTML escape text
```

**UI:**
```javascript
showToast(msg, type)       // Show notification
switchMainTab(tab)         // Switch view (build/preview/settings)
renderAll()                // Re-render entire UI
renderCanvas()             // Render builder canvas
renderPreview()            // Render preview
```

---

## Testing

### Run Tests

```bash
# In Node.js:
node tests/test.js

# In browser:
# Include in HTML: <script src="tests/test.js"></script>
# Check browser console for output
```

### Test Coverage

Current test suite includes **70+ tests** covering:

- ✅ String utilities (HTML escaping, label conversion)
- ✅ Schema encoding/decoding
- ✅ Form field validation
- ✅ Data serialization
- ✅ Field type system
- ✅ Published form links
- ✅ Edge cases & error handling

### Running Specific Tests

```javascript
// To run only certain tests, modify test suite:
// Comment out describe() blocks or create subset

// View results in console:
// 📦 String Utilities
//   ✓ esc() escapes HTML entities
//   ✓ esc() handles null/undefined
// ... [more tests]
// 
// 📊 Test Summary
//   Total:  70
//   Passed: 70 ✓
//   Failed: 0 ✗
//
// ✅ All tests passed!
```

---

## Configuration

### Google Apps Script Configuration

In `backend/code.gs`, modify the CONFIG object:

```javascript
const CONFIG = {
  // Spreadsheet tab name for forms without title
  defaultSheetName: 'Submissions',
  
  // Create separate tab per form?
  separateSheetPerForm: true,
  
  // Google Drive folder for uploads
  // Leave empty ('') for root Drive
  uploadFolderId: '',
  
  // Email for submission notifications
  // Leave empty ('') to disable
  notifyEmail: '',
  
  // Timestamp format (Google Apps Script tokens)
  timestampFormat: 'yyyy-MM-dd HH:mm:ss',
  
  // Timezone
  timezone: Session.getScriptTimeZone(),
};
```

### Browser Storage Configuration

CreateForm uses localStorage with key: `CreateForm_pro_v1`

**Maximum storage:** ~5-10MB per browser  
**Persistence:** Until user clears browser cache  
**Shared across:** All tabs/windows of same domain

### Form Settings Configuration

In the Settings tab, configure per-form:

| Setting | Purpose |
|---------|---------|
| **Action URL** | Where to send submissions |
| **Method** | HTTP method (POST/PUT/PATCH) |
| **Content Type** | JSON or form-urlencoded |
| **Headers** | Custom HTTP headers (JSON) |
| **Success Message** | Show after submission |
| **Redirect URL** | Go to page after success |
| **Reset After** | Clear form on submit |

---

## Troubleshooting

### "Submissions not appearing in Google Sheet"

**Problem:** Form submits successfully but no data in sheet

**Checklist:**
1. ✓ Google Apps Script deployed as "Web App"
2. ✓ "Who has access" set to "Anyone"
3. ✓ Google Sheet ID linked correctly in script
4. ✓ Action URL copied completely (check length)
5. ✓ Browser console shows success (not error)

**Fix:**
```javascript
// Add logging to Google Apps Script:
function doPost(e) {
  Logger.log('Received: ' + e.postData.contents);
  // ... rest of code
  // Check Executions panel in Apps Script
}
```

### "Network error: Could not reach the endpoint"

**Problem:** Submission fails with network error

**Likely causes:**
- CORS blocking request
- Action URL is incorrect
- Endpoint is down
- Network connectivity issue

**Fix:**
1. Verify URL in Settings (copy-paste again)
2. Try in Incognito mode (no caching)
3. Check browser console for exact error
4. If Google Apps Script: Redeploy with new version

### "Form runs slow with many fields"

**Problem:** Builder becomes sluggish with 50+ fields

**Optimization tips:**
1. Use dividers to group fields (improves rendering)
2. Close the field edit dialog when not in use
3. Clear browser cache (helps with localStorage)
4. Use Firefox/Chrome (most optimized)

### "File uploads fail"

**Problem:** Files don't upload to Google Drive

**Checklist:**
1. ✓ File input marked as required?
2. ✓ File size within limits (25MB+)
3. ✓ MIME type in accept attribute
4. ✓ Drive folder exists (if uploadFolderId set)
5. ✓ Apps Script has Drive permission

**Fix:**
```javascript
// In code.gs, check file upload:
function saveFileToDrive(fileObj, formName) {
  // Add error logging
  try {
    // ... upload code
  } catch(err) {
    Logger.log('File upload failed: ' + err);
    throw err;
  }
}
```

### "Changes not saving"

**Problem:** Form changes disappear on page reload

**Likely causes:**
- localStorage quota exceeded
- Private/Incognito mode (doesn't persist)
- Browser storage disabled
- Storage sync disabled

**Fix:**
```javascript
// Check localStorage:
localStorage.getItem('CreateForm_pro_v1') !== null
// Should return true if saving

// Clear and restart:
localStorage.removeItem('CreateForm_pro_v1')
// Then refresh page - starts fresh
```

### "Published link shows invalid form"

**Problem:** Clicking published link shows error

**Checklist:**
1. ✓ URL copied completely (no truncation)
2. ✓ No extra spaces in URL
3. ✓ `index.html` and `app.js` are in same folder
4. ✓ Browser JavaScript enabled

**Fix:**
```javascript
// Test decoding in console:
const encoded = 'ABC123...'  // from URL
try {
  const schema = decodeSchema(encoded)
  console.log(schema)
} catch(e) {
  console.error('Decode failed:', e)
}
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- How to set up development environment
- Coding standards and conventions
- How to submit pull requests
- Reporting bugs
- Requesting features

### Quick Contribution Steps

1. Fork the repository
2. Create feature branch: `git checkout -b feature/something`
3. Make changes and test: `node tests/test.js`
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature/something`
6. Open Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

This means you can use CreateForm:
- ✅ In commercial projects
- ✅ For private use
- ✅ Modify it as you like
- ✅ Distribute it

Just include the license and credit the original authors.

---

## Support

### Getting Help

- 📖 [SETUP.md](SETUP.md) - Development setup
- 📚 [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md) - Publishing guide
- 🐛 [GitHub Issues](https://github.com/yourusername/CreateForm-pro/issues) - Bug reports
- 💬 [Discussions](https://github.com/yourusername/CreateForm-pro/discussions) - Questions

### FAQ

**Q: Can I use CreateForm for production?**  
A: Yes! It's tested and production-ready. See SETUP.md for deployment guide.

**Q: Does CreateForm require a backend server?**  
A: No! Forms are encoded in URLs. You only need Google Apps Script for submission handling.

**Q: Can I self-host submissions?**  
A: Yes! Modify the `actionUrl` setting in form Settings to point to your endpoint.

**Q: Is my data secure?**  
A: Yes! All communication is HTTPS. Forms stored in browser (localStorage). Submissions go directly to your Google Apps Script.

**Q: Can I import/export forms?**  
A: Yes! Click "Export" to download form as JSON. Share JSON files with teammates.

---

## Roadmap

Future improvements being developed:

- [ ] Form templates library
- [ ] Analytics & response charts
- [ ] Conditional fields (show/hide based on answers)
- [ ] Multi-page forms
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications to user
- [ ] Database integrations (Airtable, Firebase)
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)
- [ ] Team collaboration features

---

## Credits

Created with ❤️ by [Your Team Name]

**Contributors:** Thanks to all who have contributed to CreateForm Pro!

---

## Version History

**v1.0.0** - Initial Release
- Form builder with 12+ field types
- Published form sharing
- Google Sheets integration
- File upload support
- Full test suite

---

**Made with ❤️ for builders and creators everywhere**

⭐ If you find CreateForm useful, please give it a star on GitHub!
