# CreateForm Pro - Publish & Share Guide

## How the Publish Feature Works

When you click **Publish**, your form becomes a shareable link that anyone can use to submit responses. Here's the complete workflow:

### Step 1: Build Your Form
1. Open CreateForm
2. Create your form fields (Name, Email, Message, etc.)
3. Go to **Settings** tab
4. **IMPORTANT:** Paste your Google Apps Script URL in the "Action URL" field
   - This is where submissions will be sent
   - See "Setup Google Apps Script" section below

### Step 2: Publish the Form
1. Click the **Publish** button (top right, next to Export)
2. A modal will appear with your shareable link
3. Click **Copy** to copy the URL
4. Click **Open form** to preview it

### Step 3: Share the Link
- Share the URL with anyone via email, chat, social media, etc.
- They will see a clean form submission page
- No account required - they can just fill it out and submit

### Step 4: Receive Submissions
- Every submission automatically goes to your Google Sheet
- Responses appear in real-time as rows

---

## Setup Google Apps Script for Submissions

You need to set up a Google Apps Script to receive form submissions into Google Sheets.

### Option A: Use the Pre-Built Backend Script

We've provided a complete backend script (`backend/code.gs`) that:
- Receives form submissions
- Saves them to Google Sheets with timestamps
- Handles file uploads (saves to Google Drive)
- Creates separate sheets for each form

### Steps to Deploy:

1. **Open Google Apps Script:**
   - Go to [script.google.com](https://script.google.com)
   - Click "New project"

2. **Copy the Backend Code:**
   - Open the file: `backend/code.gs` from this project
   - Copy the entire content

3. **Paste into Apps Script:**
   - In the Google Apps Script editor, clear the default `Code.gs` file
   - Paste the complete code you copied

4. **Configure (Optional):**
   - At the top of the code, you'll see a `CONFIG` object
   - Modify settings if needed:
     ```javascript
     const CONFIG = {
       defaultSheetName: 'Submissions',
       separateSheetPerForm: true,
       uploadFolderId: '',  // Google Drive folder ID for uploads
       notifyEmail: '',     // Your email for notifications
       timestampFormat: 'yyyy-MM-dd HH:mm:ss',
     };
     ```

5. **Create a Google Sheet:**
   - Create a new Google Sheet in your Drive
   - Note its ID (in the URL)

6. **Link Sheet to Script:**
   - In Apps Script editor, click "Project Settings"
   - Add the Sheet ID to the script if needed
   - Or set it using: `const SHEET_ID = 'YOUR_SHEET_ID';`

7. **Deploy:**
   - Click "Deploy" → "New Deployment"
   - Select type: "Web app"
   - Execute as: "Your account"
   - Who has access: **"Anyone"** (important for form submissions!)
   - Click "Deploy"

8. **Copy the Deployment URL:**
   - A dialog shows your deployment URL
   - It looks like: `https://script.google.com/macros/s/ABC123XYZ/exec`
   - Copy this URL

9. **Add to CreateForm:**
   - In CreateForm, go to **Settings** tab
   - Paste the URL in "Action URL" field
   - Save (auto-saves)

10. **Test:**
    - Click Publish
    - Open the form link
    - Fill out and submit
    - Check your Google Sheet - the response should appear!

---

## Submit Form (User Experience)

When someone opens your published form link:

1. They see a clean form page with your title and description
2. Required fields are marked with *
3. They fill in the fields:
   - Text, email, phone - standard inputs
   - Dropdown - select from options
   - Radio - pick one option
   - Checkbox - multiple selections
   - Slider - drag to choose value
   - File - upload files (optional)
   - Date - pick a date
4. After filling everything, they click **Submit**
5. They see a success message
6. Form can auto-redirect to a thank-you page (optional)

---

## Advanced Settings

In the **Settings** tab, you can configure:

### After Submission:
- **Success message**: Show custom text (default: "Thank you!")
- **Redirect URL**: Send them to a page after submission
- **Reset form**: Auto-clear form for next submission

### Submission Target:
- **Action URL**: Your Google Apps Script endpoint
- **Method**: POST (default fits Google Apps Script)
- **Content type**: JSON (standard)
- **Custom headers**: Add extra headers if needed

---

## Troubleshooting

### "This form is not configured to receive submissions"
- You need to set the Action URL in Settings
- Make sure you deployed the Google Apps Script
- Check the URL is copied correctly

### Submissions not appearing in Google Sheet
- Verify the Google Sheet is linked to the Apps Script
- Check "Who has access" on the Apps Script deployment (must be "Anyone")
- Look for error messages in the browser console
- Check Apps Script execution logs

### "Failed to reach the endpoint"
- Verify the Action URL is correct and copied fully
- Make sure you deployed the Apps Script (not just saved it)
- Check internet connection

### File uploads not working
- Make sure `uploadFolderId` is empty or set to a valid Google Drive folder ID
- Check Google Drive folder exists and is accessible

---

## Security Notes

✓ **Safe to share**: The form link is just a URL with encoded form definition
✓ **No login needed**: Anyone can submit (no authentication required)
✓ **File uploads safe**: Files go to your Google Drive in a controlled folder
✓ **HTTPS**: Always use HTTPS when sharing sensitive forms
⚠ **Don't share secrets**: Never put passwords or API keys in form defaults

---

## Hosting Your CreateForm

To make your published links work from anywhere:

1. **Host on GitHub Pages (Free):**
   - Upload `index.html`, `app.js`, `style.css` to a GitHub repo
   - Enable GitHub Pages in settings
   - Share links like: `https://yourusername.github.io/CreateForm#/form?s=ENCODED`

2. **Host on Netlify (Free):**
   - Upload to Netlify
   - Use the Netlify URL in your shared links

3. **Use Any Host:**
   - Upload files to any web server
   - Links work from that domain

**Important:** Host both `index.html`, `app.js`, and `style.css` in the same folder!

---

## Example Use Cases

### 📝 Contact Form
- Collect name, email, message
- Auto-save to Google Sheet
- Send thank-you email

### 📋 Survey
- Multiple choice questions
- Collect responses anonymously
- Analyze in Google Sheets

### 📄 Application Form
- Text fields for details
- File upload for resume
- Redirect to confirmation page

### 🎯 Event RSVP
- Ask for name, email, number of guests
- Store in organized sheet
- Track attendance

---

## Questions?

Check the main CreateForm documentation or review the `backend/code.gs` file for detailed comments about each feature.

Good luck! 🚀
