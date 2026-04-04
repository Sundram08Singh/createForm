/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FormCraft → Google Sheets receiver
 *  Paste this entire file into Extensions → Apps Script, then deploy as a
 *  Web App (Execute as: Me  |  Who has access: Anyone).
 *
 *  Features
 *  ────────
 *  • Handles every FormCraft field type:
 *      text, number, email, date, tel, url, textarea,
 *      select, radio, checkbox, range/slider, divider (skipped)
 *  • File uploads  → saved to Google Drive, Drive link stored in sheet
 *  • Auto-creates column headers from the first submission
 *  • One sheet tab per form name  (e.g. "Contact Form", "Survey")
 *  • Always writes: Submission Date, Form Name, Form Description
 *  • Duplicate-submission guard via LockService
 *  • Email notification on every new submission (optional — see CONFIG)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ── CONFIG — edit these values ──────────────────────────────────────────── */

const CONFIG = {

  // Name of the spreadsheet tab to use when the form has no title.
  defaultSheetName: 'Submissions',

  // Set to true to create a separate tab for each distinct form name.
  // Set to false to write everything into defaultSheetName.
  separateSheetPerForm: true,

  // Google Drive folder ID where uploaded files are saved.
  // Find it in the Drive URL: drive.google.com/drive/folders/THIS_PART
  // Leave empty ('') to save files to the root of My Drive.
  uploadFolderId: '',

  // Set to your email address to receive a notification for every submission.
  // Leave empty ('') to disable email notifications.
  notifyEmail: '',

  // Timestamp format written to the "Submission Date" column.
  // Uses Utilities.formatDate — see Apps Script docs for tokens.
  timestampFormat: 'yyyy-MM-dd HH:mm:ss',

  // Timezone for the timestamp.
  timezone: Session.getScriptTimeZone(),

};

/* ── Fixed column headers always written first ───────────────────────────── */
const FIXED_HEADERS = [
  'Submission Date',   // human-readable local timestamp
  'Form Name',         // value of the <title> field in FormCraft
  'Form Description',  // value of the <description> textarea in FormCraft
];

/* ═══════════════════════════════════════════════════════════════════════════
   doPost — entry point called by every FormCraft submission
   ═══════════════════════════════════════════════════════════════════════════ */

function doPost(e) {
  /* ── Guard: e is undefined when doPost is run directly from the editor.
     In production the Apps Script runtime always passes the event object.
     To test manually, always run testDoPost() — not doPost() directly.  ── */
  if (!e || !e.postData) {
    return jsonResponse({
      result:  'error',
      message: 'No POST data received. Run testDoPost() from the editor to test, ' +
               'not doPost() directly. In production FormCraft calls this automatically.',
    });
  }

  // Serialise concurrent submissions — prevents duplicate or corrupt rows
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    /* ── Parse the incoming JSON body ──────────────────────────────────────
       FormCraft sends:
       {
         "_meta": { "form": "...", "description": "...", "submittedAt": "..." },
         "field_name": value,
         ...
       }
    ── */
    const raw  = e.postData.contents || '{}';
    const body = JSON.parse(raw);

    const meta        = body._meta        || {};
    const formName    = (meta.form        || CONFIG.defaultSheetName).trim();
    const formDesc    = (meta.description || '').trim();
    const submittedAt = meta.submittedAt  || new Date().toISOString();

    // Remove _meta so only real field data remains
    const fieldData = Object.assign({}, body);
    delete fieldData._meta;

    /* ── Resolve (or create) the destination sheet tab ─────────────────── */
    const tabName = CONFIG.separateSheetPerForm ? formName : CONFIG.defaultSheetName;
    const sheet   = getOrCreateSheet(tabName);

    /* ── Handle file uploads embedded as base64 ────────────────────────── */
    // FormCraft encodes files as: { name, type, data (base64), size }
    // We save each one to Drive and replace the object with a public URL.
    Object.keys(fieldData).forEach(key => {
      const val = fieldData[key];
      if (isFileObject(val)) {
        fieldData[key] = saveFileToDrive(val, formName);
      }
    });

    /* ── Build the row ─────────────────────────────────────────────────── */
    const localTimestamp = Utilities.formatDate(
      new Date(submittedAt),
      CONFIG.timezone,
      CONFIG.timestampFormat
    );

    // Ensure headers exist; add any new field columns discovered in this submission
    ensureHeaders(sheet, Object.keys(fieldData));

    // Map every header to its value
    const headers = getHeaders(sheet);
    const row     = headers.map(header => {
      if (header === 'Submission Date')   return localTimestamp;
      if (header === 'Form Name')         return formName;
      if (header === 'Form Description')  return formDesc;
      return formatValue(fieldData[header]);
    });

    sheet.appendRow(row);
    formatLastRow(sheet, row.length);

    /* ── Optional email notification ──────────────────────────────────── */
    if (CONFIG.notifyEmail) {
      sendNotification(formName, formDesc, headers, row, localTimestamp);
    }

    return jsonResponse({ result: 'success', sheet: tabName });

  } catch (err) {
    Logger.log('FormCraft error: ' + err.message + '\n' + err.stack);
    return jsonResponse({ result: 'error', message: err.message });

  } finally {
    lock.releaseLock();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHEET HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Returns an existing sheet by name, or creates a new one with styled headers.
 */
function getOrCreateSheet(name) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Write the fixed headers immediately so the sheet isn't empty
    writeHeaderRow(sheet, FIXED_HEADERS);
  }

  return sheet;
}

/**
 * Ensures the sheet has columns for every field key in newKeys.
 * Appends missing headers to the right of the existing ones.
 */
function ensureHeaders(sheet, newKeys) {
  const existing = getHeaders(sheet);

  if (existing.length === 0) {
    // Fresh sheet — write fixed headers + all field keys
    writeHeaderRow(sheet, FIXED_HEADERS.concat(newKeys));
    return;
  }

  // Add any keys not yet present as new columns
  const toAdd = newKeys.filter(k => !existing.includes(k));
  if (toAdd.length === 0) return;

  const lastCol = existing.length + 1;
  toAdd.forEach((key, i) => {
    const cell = sheet.getRange(1, lastCol + i);
    cell.setValue(key);
    styleHeaderCell(cell);
  });
}

/**
 * Returns the current header row values (Row 1) as a flat array.
 */
function getHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

/**
 * Writes a header row with styled cells.
 */
function writeHeaderRow(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  headers.forEach((_, i) => styleHeaderCell(sheet.getRange(1, i + 1)));
  sheet.setFrozenRows(1);
}

/**
 * Applies consistent styling to a single header cell.
 */
function styleHeaderCell(cell) {
  cell
    .setBackground('#1a1e26')
    .setFontColor('#6c8fff')
    .setFontWeight('bold')
    .setFontSize(11)
    .setBorder(true, true, true, true, false, false, '#21262f',
               SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Light zebra-stripe + auto-resize on the row just appended.
 */
function formatLastRow(sheet, colCount) {
  const lastRow = sheet.getLastRow();
  const range   = sheet.getRange(lastRow, 1, 1, colCount);

  // Alternate row background
  const bg = lastRow % 2 === 0 ? '#f7f8fc' : '#ffffff';
  range.setBackground(bg).setFontSize(11).setVerticalAlignment('middle');

  // Auto-resize all columns (capped at 350px to avoid huge file-URL columns)
  for (let c = 1; c <= colCount; c++) {
    sheet.autoResizeColumn(c);
    if (sheet.getColumnWidth(c) > 350) sheet.setColumnWidth(c, 350);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   VALUE FORMATTERS — one per FormCraft field type
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Converts any incoming field value to a clean string for the sheet.
 *
 * Field type   | JS value from FormCraft        | Sheet output
 * ─────────────┼────────────────────────────────┼────────────────────────
 * text         | "hello"                        | "hello"
 * number       | "42" or 42                     | 42  (numeric)
 * email        | "a@b.com"                      | "a@b.com"
 * tel          | "+1 555 000 0000"              | "+1 555 000 0000"
 * url          | "https://..."                  | "https://..."
 * date         | "2025-04-01"                   | "01 Apr 2025"
 * textarea     | "line1\nline2"                 | "line1\nline2"  (wrap)
 * select       | "Option A"                     | "Option A"
 * radio        | "Yes"                          | "Yes"
 * checkbox     | true / false                   | "Yes" / "No"
 * range        | "75"                           | 75  (numeric)
 * file         | { name, type, data, size }     | Google Drive URL  (↑ above)
 * divider      | undefined (skipped in header)  | ""
 */
function formatValue(val) {
  if (val === undefined || val === null) return '';

  // Boolean — from checkbox fields
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (val === 'true')           return 'Yes';
  if (val === 'false')          return 'No';

  // Numeric string — from number / range fields
  if (typeof val === 'number') return val;
  const asNum = Number(val);
  if (val !== '' && !isNaN(asNum) && typeof val === 'string' &&
      /^-?\d+(\.\d+)?$/.test(val.trim())) {
    return asNum;
  }

  // ISO date string — from date fields
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    try {
      const d = new Date(val + 'T00:00:00');
      return Utilities.formatDate(d, CONFIG.timezone, 'dd MMM yyyy');
    } catch (_) { /* fall through */ }
  }

  // Everything else (text, email, tel, url, select, radio, textarea) → string
  return String(val);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILE UPLOAD HANDLER
   ═══════════════════════════════════════════════════════════════════════════
   FormCraft encodes file inputs as a base64 JSON object:
   {
     "name": "photo.jpg",
     "type": "image/jpeg",
     "size": 204800,
     "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
   }
   This function saves the file to Google Drive and returns a shareable URL.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Returns true if the value looks like a FormCraft file object.
 */
function isFileObject(val) {
  return val !== null &&
         typeof val === 'object' &&
         typeof val.name === 'string' &&
         typeof val.data === 'string' &&
         val.data.startsWith('data:');
}

/**
 * Saves a base64-encoded file to Google Drive and returns a shareable link.
 * @param {Object} fileObj  { name, type, data, size }
 * @param {string} formName Used as subfolder name inside the upload folder
 * @returns {string} Google Drive view URL
 */
function saveFileToDrive(fileObj, formName) {
  try {
    // Strip the "data:mime/type;base64," prefix
    const base64 = fileObj.data.split(',')[1];
    if (!base64) return '[file data missing]';

    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      fileObj.type  || 'application/octet-stream',
      fileObj.name  || 'upload'
    );

    // Resolve destination folder
    let folder;
    if (CONFIG.uploadFolderId) {
      try {
        const parent = DriveApp.getFolderById(CONFIG.uploadFolderId);
        // Create a subfolder per form name for organisation
        const subs = parent.getFoldersByName(formName);
        folder = subs.hasNext() ? subs.next() : parent.createFolder(formName);
      } catch (_) {
        folder = DriveApp.getRootFolder();
      }
    } else {
      // No folder configured — use/create a "FormCraft Uploads" folder in root
      const roots = DriveApp.getFoldersByName('FormCraft Uploads');
      const root  = roots.hasNext() ? roots.next() : DriveApp.createFolder('FormCraft Uploads');
      const subs  = root.getFoldersByName(formName);
      folder      = subs.hasNext() ? subs.next() : root.createFolder(formName);
    }

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();

  } catch (err) {
    Logger.log('File upload error: ' + err.message);
    return '[upload failed: ' + err.message + ']';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMAIL NOTIFICATION (optional)
   ═══════════════════════════════════════════════════════════════════════════ */

function sendNotification(formName, formDesc, headers, row, timestamp) {
  try {
    const ss      = SpreadsheetApp.getActiveSpreadsheet();
    const sheetUrl = ss.getUrl();

    const rows = headers.map((h, i) =>
      `<tr>
        <td style="padding:6px 12px;font-weight:600;color:#5f6470;white-space:nowrap;">${h}</td>
        <td style="padding:6px 12px;color:#1a1e26;">${row[i] || '—'}</td>
       </tr>`
    ).join('');

    const html = `
      <div style="font-family:sans-serif;max-width:600px;">
        <h2 style="background:#1a1e26;color:#6c8fff;padding:16px 20px;border-radius:8px 8px 0 0;margin:0;">
          New FormCraft Submission
        </h2>
        <div style="border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;padding:16px 20px;">
          <p style="color:#5f6470;font-size:13px;margin:0 0 16px;">
            <strong style="color:#1a1e26;">${formName}</strong>
            ${formDesc ? ' — ' + formDesc : ''}
            &nbsp;·&nbsp; ${timestamp}
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f7f8fc;">
                <th style="padding:6px 12px;text-align:left;color:#5f6470;">Field</th>
                <th style="padding:6px 12px;text-align:left;color:#5f6470;">Value</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin:16px 0 0;font-size:12px;">
            <a href="${sheetUrl}" style="color:#6c8fff;">Open Google Sheet →</a>
          </p>
        </div>
      </div>`;

    MailApp.sendEmail({
      to:      CONFIG.notifyEmail,
      subject: '[FormCraft] New submission — ' + formName,
      htmlBody: html,
    });

  } catch (err) {
    Logger.log('Email notification error: ' + err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Builds a JSON ContentService response with CORS headers.
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEST FUNCTION — run manually from the Apps Script editor
   ═══════════════════════════════════════════════════════════════════════════
   1. Open Extensions → Apps Script
   2. Select "testDoPost" from the function dropdown
   3. Click Run — check the sheet and the Execution Log
   ═══════════════════════════════════════════════════════════════════════════ */

function testDoPost() {
  /* ─────────────────────────────────────────────────────────────────────────
     HOW TO RUN THIS TEST
     1. Open Extensions → Apps Script
     2. In the function dropdown (top toolbar) select  testDoPost
     3. Click  Run  (▶)
     4. Click  Execution log  at the bottom to see the result
     5. Open your Google Sheet — a new row should appear within a few seconds

     DO NOT run doPost() directly from the editor — it has no event object
     and will return an error. Always use testDoPost() for manual testing.
  ───────────────────────────────────────────────────────────────────────── */
  try {
    const mockPayload = {
      _meta: {
        form:        'Contact Form',
        description: 'Website enquiry form — collects visitor messages',
        submittedAt: new Date().toISOString(),
      },
      // ── text / input types ──
      full_name:          'Jane Doe',
      email_address:      'jane@example.com',
      phone_number:       '+44 7911 123456',
      website_url:        'https://janedoe.com',
      // ── number & slider ──
      age:                '29',
      satisfaction:       '85',
      // ── date ──
      appointment_date:   '2025-06-15',
      // ── textarea ──
      message:            'Hello,\nI would like to enquire about your services.\nThank you.',
      // ── select dropdown ──
      department:         'Support',
      // ── radio group ──
      contact_preference: 'Email',
      // ── checkbox (boolean) ──
      newsletter_opt_in:  true,
      agree_to_terms:     false,
      // ── file upload (tiny 1×1 white PNG encoded as base64) ──
      profile_photo: {
        name: 'test-image.png',
        type: 'image/png',
        size: 95,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
      },
    };

    // Build a proper mock event that looks like a real POST request
    const mockEvent = {
      postData: {
        contents:    JSON.stringify(mockPayload),
        type:        'application/json',
        length:      JSON.stringify(mockPayload).length,
      },
      parameter:    {},
      parameters:   {},
      contextPath:  '',
      queryString:  '',
    };

    Logger.log('--- testDoPost START ---');
    Logger.log('Payload: ' + JSON.stringify(mockPayload, null, 2));

    const result  = doPost(mockEvent);
    const content = result.getContent();
    const parsed  = JSON.parse(content);

    if (parsed.result === 'success') {
      Logger.log('SUCCESS — row written to sheet: ' + parsed.sheet);
    } else {
      Logger.log('ERROR — ' + parsed.message);
    }

    Logger.log('--- testDoPost END ---');

  } catch (err) {
    Logger.log('UNEXPECTED ERROR in testDoPost: ' + err.message);
    Logger.log(err.stack);
  }
}
