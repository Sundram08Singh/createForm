'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   FormCraft Pro — app.js
   Multiple forms · Dialog-based field editing · Google Sheets submission
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Type metadata ──────────────────────────────────────────────────────── */
const TYPE_META = {
  text:     { label:'Text',     icon:'<path d="M3 8h10M8 4v8"/>',                                                                                                              color:'var(--accent)',  bg:'var(--accent-dim)'  },
  number:   { label:'Number',   icon:'<path d="M5 4l-1 8M12 4l-1 8M3 6h10M2 10h11"/>',                                                                                        color:'var(--green)',   bg:'var(--green-bg)'    },
  email:    { label:'Email',    icon:'<rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M2 5.5l6 4 6-4"/>',                                                           color:'var(--sky)',     bg:'var(--sky-bg)'      },
  date:     { label:'Date',     icon:'<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 7h12M5 2v2M11 2v2"/>',                                                    color:'var(--amber)',   bg:'var(--amber-bg)'    },
  tel:      { label:'Phone',    icon:'<path d="M3 3a1 1 0 011-1h2.5l1 3-1.5 1a8 8 0 003 3l1-1.5 3 1V11a1 1 0 01-1 1A10 10 0 013 3z"/>',                                      color:'var(--teal)',    bg:'var(--teal-bg)'     },
  url:      { label:'URL',      icon:'<path d="M7 9a4 4 0 005.66-5.66l-.7-.7M9 7a4 4 0 00-5.66 5.66l.7.7"/><path d="M9.5 6.5l-3 3"/>',                                       color:'var(--accent)',  bg:'var(--accent-dim)'  },
  textarea: { label:'Textarea', icon:'<rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M5 6h6M5 9h4"/>',                                                            color:'var(--teal)',    bg:'var(--teal-bg)'     },
  select:   { label:'Select',   icon:'<rect x="2" y="4" width="12" height="8" rx="1.5"/><path d="M9.5 8l2 2M9.5 8l2-2"/>',                                                    color:'var(--rose)',    bg:'var(--rose-bg)'     },
  radio:    { label:'Radio',    icon:'<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none"/>',                                         color:'var(--orange)',  bg:'var(--orange-bg)'   },
  checkbox: { label:'Checkbox', icon:'<rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5.5 8l2 2 3-3"/>',                                                            color:'var(--violet)',  bg:'var(--violet-bg)'   },
  range:    { label:'Slider',   icon:'<path d="M2 8h12"/><circle cx="7" cy="8" r="2" fill="currentColor" stroke="none"/>',                                                     color:'var(--green)',   bg:'var(--green-bg)'    },
  file:     { label:'File',     icon:'<path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/><path d="M9 2v4h4M8 9v3M6.5 10.5l1.5-1.5 1.5 1.5"/>',              color:'var(--pink)',    bg:'var(--pink-bg)'     },
  divider:  { label:'Divider',  icon:'<path d="M3 8h10M6 5l-3 3 3 3M10 5l3 3-3 3"/>',                                                                                         color:'var(--slate)',   bg:'var(--slate-bg)'    },
};

const TYPE_DEFAULTS = {
  text:     { label:'', name:'', placeholder:'', hint:'', required:false },
  number:   { label:'', name:'', placeholder:'0', hint:'', required:false, min:'', max:'' },
  email:    { label:'', name:'', placeholder:'you@example.com', hint:'', required:false },
  date:     { label:'', name:'', hint:'', required:false },
  tel:      { label:'', name:'', placeholder:'+1 (555) 000-0000', hint:'', required:false },
  url:      { label:'', name:'', placeholder:'https://example.com', hint:'', required:false },
  textarea: { label:'', name:'', placeholder:'Enter your message…', hint:'', required:false, rows:4 },
  select:   { label:'', name:'', hint:'', required:false, optionsRaw:'Option A\nOption B\nOption C' },
  radio:    { label:'', name:'', hint:'', required:false, optionsRaw:'Yes\nNo\nMaybe' },
  checkbox: { label:'', name:'', hint:'', required:false, checkboxLabel:'I agree' },
  range:    { label:'', name:'', hint:'', required:false, min:0, max:100, step:1, defaultVal:50 },
  file:     { label:'', name:'', hint:'', required:false, accept:'', multiple:false },
  divider:  { label:'Section' },
};

const APP_NAME = 'CreateForm';

/* ── Application state ─────────────────────────────────────────────────── */
let state = {
  forms:         [],        // Array of form objects
  activeFormId:  null,
  nextFormId:    1,
  nextFieldId:   1,
  mainTab:       'build',
  dialog: {
    open:        false,
    fieldId:     null,      // field being edited
    draft:       null,      // working copy of the field
    tab:         'basic',
  },
  dragSrcId:     null,
  lastPayload:   null,
};

/* ── Helpers ────────────────────────────────────────────────────────────── */
function uid()     { return state.nextFieldId++; }
function formUid() { return state.nextFormId++;  }

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function labelToName(label) {
  return (label||'').toLowerCase().trim()
    .replace(/[^a-z0-9\s_-]/g,'')
    .replace(/[-\s]+/g,'_')
    .replace(/^_+|_+$/g,'') || 'field';
}

function parseOptions(raw) {
  return (raw||'').split('\n').map(s=>s.trim()).filter(Boolean);
}

function activeForm() {
  return state.forms.find(f=>f.id===state.activeFormId) || null;
}

function svgIcon(paths,size=14) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   BOOTSTRAP & ROUTING
   ══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Check if this is a published form submission link
  const publishedSchema = parsePublishUrl();
  if (publishedSchema) {
    renderPublishedForm(publishedSchema);
    return; // Skip builder initialization
  }

  // Regular builder mode
  buildPalette();

  // Load persisted state or seed with a starter form
  const saved = tryLoadState();
  if (saved) {
    state = saved;
  } else {
    createNewForm('Contact Form');
    seedStarterFields();
  }

  renderAll();
  syncSettingsInputs();
});

/* ── Parse published form URL hash ── */
function parsePublishUrl() {
  const hash = window.location.hash;
  const match = hash.match(/#\/form\?s=([^&]+)/);
  if (!match || !match[1]) return null;

  try {
    return decodeSchema(decodeURIComponent(match[1]));
  } catch (err) {
    console.error('Failed to decode form schema:', err);
    showToast('Invalid form link — the URL may be corrupted.', 'error');
    return null;
  }
}

/* Decode schema from URL-safe base64 string */
function decodeSchema(encoded) {
  try {
    // Reverse the URL-safe encoding
    const b64 = encoded.replace(/[-]/g, '+').replace(/[_]/g, '/');
    // Add padding if needed
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json);
  } catch (err) {
    throw new Error('Decoding failed: ' + err.message);
  }
}

/* Render published form submission view */
function renderPublishedForm(schema) {
  // Hide the builder UI and show form submission interface
  const app = document.getElementById('app');
  if (app) app.style.display = 'none';

  // Create dedicated submission page
  const container = document.createElement('div');
  container.id = 'published-form-container';
  container.className = 'published-form-page';
  
  const title = schema.title || 'Untitled Form';
  const desc = schema.description || '';
  document.title = title + ' | ' + APP_NAME;
  
  container.innerHTML = `
    <div class="pub-form-wrapper">
      <div class="pub-form-card">
        <div class="pub-form-header">
          <div class="pub-form-brand">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/>
              <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity=".5"/>
              <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity=".25"/>
            </svg>
            <span>${esc(APP_NAME)}</span>
          </div>
          <h1 class="pub-form-title">${esc(title)}</h1>
          ${desc ? `<p class="pub-form-desc">${esc(desc)}</p>` : ''}
        </div>
        <form id="published-form" class="pub-form-body">
          ${schema.fields.map(buildPublishedField).join('')}
          <div class="pub-form-footer">
            <button type="submit" class="btn btn-primary btn-lg">Submit</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Wire form submission
  document.getElementById('published-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handlePublishedFormSubmit(schema);
  });
  
  // Wire sliders
  container.querySelectorAll('.pub-slider').forEach(inp => {
    const valEl = document.getElementById(inp.dataset.valId);
    inp.addEventListener('input', () => { if(valEl) valEl.textContent = inp.value; });
  });
}

/* Build a single published form field */
function buildPublishedField(field) {
  if (field.type === 'divider') {
    return `<div class="pub-divider"><div class="pub-divider-line"></div><span class="pub-divider-label">${esc(field.label)}</span><div class="pub-divider-line"></div></div>`;
  }

  const label = field.label || `Untitled ${TYPE_META[field.type]?.label || 'Field'}`;
  const req = field.required ? '<span class="pub-req">*</span>' : '';
  const hint = field.hint ? `<p class="pub-hint">${esc(field.hint)}</p>` : '';
  const fname = field.name || labelToName(field.label);

  let control = '';

  if (field.type === 'textarea') {
    control = `<textarea rows="${field.rows || 4}" placeholder="${esc(field.placeholder || '')}" name="${fname}" ${field.required ? 'required' : ''}></textarea>`;

  } else if (field.type === 'select') {
    const opts = field.options || [];
    control = `<select name="${fname}" ${field.required ? 'required' : ''}><option value="">— Choose an option —</option>${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;

  } else if (field.type === 'checkbox') {
    return `<div class="pub-field"><label class="pub-label">${esc(label)}${req}</label>${hint}<label class="pub-option-row"><input type="checkbox" name="${fname}" ${field.required ? 'required' : ''}/><span class="pub-option-label">${esc(field.checkboxLabel || 'Check this box')}</span></label></div>`;

  } else if (field.type === 'radio') {
    const opts = field.options || [];
    const rname = fname + '_' + field.id;
    return `<div class="pub-field"><label class="pub-label">${esc(label)}${req}</label>${hint}<div class="pub-radio-group">${opts.map(o => `<label class="pub-option-row"><input type="radio" name="${rname}" value="${esc(o)}" ${field.required ? 'required' : ''}/><span class="pub-option-label">${esc(o)}</span></label>`).join('')}</div></div>`;

  } else if (field.type === 'range') {
    const vid = 'rv_' + field.id;
    const def = field.defaultVal !== undefined ? field.defaultVal : field.min || 0;
    return `<div class="pub-field"><div class="pub-slider-header"><label class="pub-label">${esc(label)}${req}</label><span class="pub-slider-val" id="${vid}">${def}</span></div>${hint}<input type="range" class="pub-slider" data-val-id="${vid}" name="${fname}" min="${field.min || 0}" max="${field.max || 100}" step="${field.step || 1}" value="${def}"/><div class="pub-slider-limits"><span>${field.min || 0}</span><span>${field.max || 100}</span></div></div>`;

  } else if (field.type === 'file') {
    const acc = field.accept ? `accept="${esc(field.accept)}"` : '';
    const mul = field.multiple ? 'multiple' : '';
    return `<div class="pub-field"><label class="pub-label">${esc(label)}${req}</label>${hint}<input type="file" name="${fname}" ${acc} ${mul} ${field.required ? 'required' : ''}/><p class="pub-file-note">Files are uploaded to Google Drive on submit.</p></div>`;

  } else if (field.type === 'email') {
    control = `<input type="email" name="${fname}" placeholder="${esc(field.placeholder || 'you@example.com')}" ${field.required ? 'required' : ''}/>`;

  } else if (field.type === 'tel') {
    control = `<input type="tel" name="${fname}" placeholder="${esc(field.placeholder || '+1 (555) 000-0000')}" ${field.required ? 'required' : ''}/>`;

  } else if (field.type === 'url') {
    control = `<input type="url" name="${fname}" placeholder="${esc(field.placeholder || 'https://example.com')}" ${field.required ? 'required' : ''}/>`;

  } else if (field.type === 'number') {
    let attrs = `type="number" name="${fname}" placeholder="${esc(field.placeholder || '0')}"`;
    if (field.min !== '' && field.min !== undefined) attrs += ` min="${field.min}"`;
    if (field.max !== '' && field.max !== undefined) attrs += ` max="${field.max}"`;
    if (field.required) attrs += ' required';
    control = `<input ${attrs}/>`;

  } else if (field.type === 'date') {
    control = `<input type="date" name="${fname}" ${field.required ? 'required' : ''}/>`;

  } else {
    // Generic text input
    control = `<input type="text" name="${fname}" placeholder="${esc(field.placeholder || '')}" ${field.required ? 'required' : ''}/>`;
  }

  return `<div class="pub-field"><label class="pub-label">${esc(label)}${req}</label>${hint}${control}</div>`;
}

/* Handle published form submission */
async function handlePublishedFormSubmit(schema) {
  const form = document.getElementById('published-form');
  if (!form) return;

  // Validate required fields
  const errors = [];
  schema.fields.forEach(field => {
    if (field.type === 'divider' || !field.required) return;
    const fname = field.name || labelToName(field.label);
    const inputs = form.querySelectorAll(`[name="${fname}"]`);
    
    if (field.type === 'checkbox') {
      if (!form.querySelector(`input[name="${fname}"]:checked`)) {
        errors.push(`${field.label || 'Field'} is required.`);
      }
    } else if (field.type === 'radio') {
      if (!form.querySelector(`input[name="${fname}_${field.id}"]:checked`)) {
        errors.push(`${field.label || 'Field'} is required.`);
      }
    } else {
      const input = form.querySelector(`[name="${fname}"]`);
      if (!input || !input.value.trim()) {
        errors.push(`${field.label || 'Field'} is required.`);
      }
    }
  });

  if (errors.length) {
    showToast(errors[0], 'error');
    return;
  }

  // Collect form data
  const data = await collectPublishedData(schema);
  
  // Check for action URL
  const actionUrl = (schema.settings && schema.settings.actionUrl) || '';
  if (!actionUrl.trim()) {
    showToast('This form is not configured to receive submissions.', 'error');
    return;
  }

  showSubmitOverlay('loading', 'Submitting…', 'Sending your response…');

  try {
    const payload = {
      _meta: { form: schema.title, description: schema.description, submittedAt: new Date().toISOString() },
      ...data,
    };

    const isGoogle = actionUrl.includes('script.google.com');
    let body, headers = {};
    
    if (schema.settings?.contentType === 'application/x-www-form-urlencoded' && !isGoogle) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(data).toString();
    } else {
      if (!isGoogle) headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    }

    let extraHeaders = {};
    try {
      const raw = (schema.settings?.headers || '').trim();
      if (raw) extraHeaders = JSON.parse(raw);
    } catch { }
    headers = { ...headers, ...extraHeaders };

    const opts = { method: schema.settings?.method || 'POST', body };
    if (isGoogle) opts.mode = 'no-cors'; else opts.headers = headers;

    const res = await fetch(actionUrl, opts);

    if (isGoogle || res.type === 'opaque') {
      showSubmitOverlay('success', schema.settings?.successMsg || 'Thank you!', 'Your response has been submitted.');
      setTimeout(() => {
        if (schema.settings?.redirectUrl) {
          window.location.href = schema.settings.redirectUrl;
        } else {
          document.getElementById('published-form').reset();
          showToast('Form reset', 'success');
        }
      }, 1800);
      return;
    }

    if (res.ok) {
      showSubmitOverlay('success', schema.settings?.successMsg || 'Thank you!', 'Your response has been submitted.');
      setTimeout(() => {
        if (schema.settings?.redirectUrl) {
          window.location.href = schema.settings.redirectUrl;
        } else {
          document.getElementById('published-form').reset();
          showToast('Form reset', 'success');
        }
      }, 1800);
    } else {
      showSubmitOverlay('error', 'Submission failed', `HTTP ${res.status} ${res.statusText}`, null, true);
    }
  } catch (err) {
    showSubmitOverlay('error', 'Network error', err.message || 'Could not reach the submission endpoint.', null, true);
  }
}

/* Collect published form data including file uploads */
async function collectPublishedData(schema) {
  const form = document.getElementById('published-form');
  const data = {};

  const promises = schema.fields.map(field => {
    if (field.type === 'divider') return Promise.resolve();
    const fname = field.name || labelToName(field.label);

    if (field.type === 'checkbox') {
      const el = form.querySelector(`input[name="${fname}"]`);
      data[fname] = el ? el.checked : false;
    } else if (field.type === 'radio') {
      const el = form.querySelector(`input[name="${fname}_${field.id}"]:checked`);
      data[fname] = el ? el.value : '';
    } else if (field.type === 'textarea') {
      const el = form.querySelector(`textarea[name="${fname}"]`);
      data[fname] = el ? el.value : '';
    } else if (field.type === 'select') {
      const el = form.querySelector(`select[name="${fname}"]`);
      data[fname] = el ? el.value : '';
    } else if (field.type === 'file') {
      const el = form.querySelector(`input[name="${fname}"]`);
      const file = el?.files?.[0];
      if (!file) { data[fname] = ''; return Promise.resolve(); }
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => { data[fname] = { name: file.name, type: file.type, size: file.size, data: reader.result }; resolve(); };
        reader.onerror = () => { data[fname] = '[read error]'; resolve(); };
        reader.readAsDataURL(file);
      });
    } else {
      const el = form.querySelector(`input[name="${fname}"]`);
      data[fname] = el ? el.value : '';
    }
    return Promise.resolve();
  });

  await Promise.all(promises);
  return data;
}

function tryLoadState() {
  try {
    const raw = localStorage.getItem('formcraft_pro_v1');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!Array.isArray(s.forms)) return null;
    return s;
  } catch { return null; }
}

function persist() {
  try {
    const s = { ...state, dialog:{ open:false, fieldId:null, draft:null, tab:'basic' }, dragSrcId:null, lastPayload:null };
    localStorage.setItem('formcraft_pro_v1', JSON.stringify(s));
  } catch { /* quota exceeded or private mode */ }
}

function seedStarterFields() {
  const f = activeForm();
  if (!f) return;
  const seed = [
    { type:'text',     label:'Full Name',      placeholder:'John Doe',         required:true  },
    { type:'email',    label:'Email Address',   placeholder:'you@example.com',  required:true  },
    { type:'tel',      label:'Phone Number',    placeholder:'+1 (555) 000-0000',required:false },
    { type:'divider',  label:'Enquiry Details'                                                 },
    { type:'select',   label:'Department',      optionsRaw:'Sales\nSupport\nBilling\nOther', required:true },
    { type:'textarea', label:'Message',         placeholder:'How can we help?', required:true  },
    { type:'checkbox', label:'Consent',         checkboxLabel:'I agree to the privacy policy', required:true },
  ];
  seed.forEach(s => {
    const field = { id:uid(), ...TYPE_DEFAULTS[s.type], ...s };
    if (!field.name) field.name = labelToName(field.label);
    f.fields.push(field);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   PALETTE
   ══════════════════════════════════════════════════════════════════════════ */
function buildPalette() {
  const grid = document.getElementById('palette-grid');
  grid.innerHTML = Object.entries(TYPE_META).map(([type,meta]) => `
    <button class="palette-btn"
      style="--p-color:${meta.color};--p-bg:${meta.bg}"
      onclick="addField('${type}')">
      <div class="palette-icon">
        ${svgIcon(meta.icon)}
      </div>
      <span>${meta.label}</span>
    </button>`
  ).join('');
}

/* ══════════════════════════════════════════════════════════════════════════
   FORM MANAGEMENT
   ══════════════════════════════════════════════════════════════════════════ */
function createNewForm(name) {
  const form = {
    id:          formUid(),
    title:       name || 'Untitled Form',
    description: '',
    fields:      [],
    settings: {
      actionUrl:   '',
      method:      'POST',
      contentType: 'application/json',
      headers:     '',
      successMsg:  'Thank you! Your response has been submitted.',
      redirectUrl: '',
      resetAfter:  true,
    },
  };
  state.forms.push(form);
  state.activeFormId = form.id;
  persist();
  return form;
}

function switchForm(id) {
  state.activeFormId = id;
  persist();
  renderAll();
  syncSettingsInputs();
}

function deleteForm(id, e) {
  e.stopPropagation();
  if (state.forms.length === 1) { showToast('You must have at least one form.','error'); return; }
  if (!confirm('Delete this form? This cannot be undone.')) return;
  state.forms = state.forms.filter(f=>f.id!==id);
  if (state.activeFormId===id) state.activeFormId = state.forms[0].id;
  persist();
  renderAll();
  syncSettingsInputs();
}

function onTitleInput(val) {
  const f = activeForm(); if (!f) return;
  f.title = val;
  document.getElementById('s-form-title').value = val;
  document.getElementById('preview-title').textContent = val || 'Untitled Form';
  renderFormsList();
  persist();
}

function syncSettingsTitle(val) {
  const f = activeForm(); if (!f) return;
  f.title = val;
  document.getElementById('active-form-title').value = val;
  document.getElementById('preview-title').textContent = val || 'Untitled Form';
  renderFormsList();
  persist();
}
function syncSettingsDesc(val) {
  const f = activeForm(); if (!f) return;
  f.description = val;
  const el = document.getElementById('preview-desc');
  if (el) el.textContent = val;
  persist();
}
function syncActionUrl(val)  { const f=activeForm(); if(f){f.settings.actionUrl=val;}  persist(); }

/* ══════════════════════════════════════════════════════════════════════════
   FIELD MANAGEMENT
   ══════════════════════════════════════════════════════════════════════════ */
function addField(type) {
  const f = activeForm(); if (!f) return;
  const field = { id:uid(), type, ...TYPE_DEFAULTS[type] };
  f.fields.push(field);
  persist();
  renderCanvas();
  renderPreview();
  // Open the dialog immediately for the new field
  openDialog(field.id);
}

function removeField(id, e) {
  if (e) e.stopPropagation();
  const f = activeForm(); if (!f) return;
  f.fields = f.fields.filter(fi=>fi.id!==id);
  persist();
  renderCanvas();
  renderPreview();
}

function moveField(id, dir, e) {
  if (e) e.stopPropagation();
  const f = activeForm(); if (!f) return;
  const idx = f.fields.findIndex(fi=>fi.id===id);
  const ni  = idx+dir;
  if (ni<0||ni>=f.fields.length) return;
  [f.fields[idx],f.fields[ni]] = [f.fields[ni],f.fields[idx]];
  persist();
  renderCanvas();
}

function duplicateField(id, e) {
  if (e) e.stopPropagation();
  const f = activeForm(); if (!f) return;
  const idx = f.fields.findIndex(fi=>fi.id===id);
  if (idx<0) return;
  const clone = JSON.parse(JSON.stringify(f.fields[idx]));
  clone.id = uid();
  clone.label = (clone.label||'') + ' (copy)';
  clone.name  = labelToName(clone.label);
  f.fields.splice(idx+1,0,clone);
  persist();
  renderCanvas();
  renderPreview();
}

/* ══════════════════════════════════════════════════════════════════════════
   FIELD EDIT DIALOG
   ══════════════════════════════════════════════════════════════════════════ */
function openDialog(fieldId) {
  const f    = activeForm(); if (!f) return;
  const field= f.fields.find(fi=>fi.id===fieldId); if (!field) return;

  state.dialog.open    = true;
  state.dialog.fieldId = fieldId;
  state.dialog.draft   = JSON.parse(JSON.stringify(field)); // deep clone
  state.dialog.tab     = 'basic';

  populateDialog(state.dialog.draft);
  switchDialogTab('basic');

  document.getElementById('dialog-backdrop').classList.add('open');
  document.getElementById('field-dialog').classList.add('open');

  // Trap focus — auto-focus label input
  setTimeout(() => {
    const inp = document.getElementById(field.type==='divider' ? 'df-divider-label' : 'df-label');
    if (inp) inp.focus();
  }, 80);
}

function closeDialog() {
  state.dialog.open    = false;
  state.dialog.fieldId = null;
  state.dialog.draft   = null;

  document.getElementById('dialog-backdrop').classList.remove('open');
  document.getElementById('field-dialog').classList.remove('open');
}

function saveDialog() {
  const f = activeForm(); if (!f) return;
  const { fieldId, draft } = state.dialog;
  if (!fieldId || !draft) return;

  // Auto-generate name if blank
  if (draft.type!=='divider' && !draft.name) {
    draft.name = labelToName(draft.label);
  }

  const idx = f.fields.findIndex(fi=>fi.id===fieldId);
  if (idx>=0) f.fields[idx] = { ...draft };

  persist();
  closeDialog();
  renderCanvas();
  renderPreview();
  showToast('Field saved','success');
}

function deleteEditingField() {
  const { fieldId } = state.dialog;
  if (!fieldId) return;
  if (!confirm('Delete this field?')) return;
  closeDialog();
  removeField(fieldId);
}

function switchDialogTab(tab) {
  state.dialog.tab = tab;
  document.querySelectorAll('.dtab').forEach(b=>b.classList.toggle('active',b.dataset.dtab===tab));
  document.querySelectorAll('.dtab-pane').forEach(p=>p.classList.toggle('active',p.id==='dpane-'+tab));
}

function populateDialog(field) {
  const meta = TYPE_META[field.type] || TYPE_META.text;

  // Header pill
  const pill = document.getElementById('dialog-type-pill');
  pill.textContent = meta.label;
  pill.style.setProperty('--p-color', meta.color);
  pill.style.setProperty('--p-bg',    meta.bg);

  // Show/hide Options tab
  const hasOpts = field.type==='select'||field.type==='radio';
  document.getElementById('dtab-options').style.display = hasOpts ? '' : 'none';

  // Basic tab
  const isDivider = field.type==='divider';
  document.getElementById('df-label').value         = field.label||'';
  document.getElementById('df-name').value          = field.name||'';
  document.getElementById('df-placeholder').value   = field.placeholder||'';
  document.getElementById('df-hint').value          = field.hint||'';
  document.getElementById('df-checklabel').value    = field.checkboxLabel||'';
  document.getElementById('df-min').value           = field.min!==undefined ? field.min : '';
  document.getElementById('df-max').value           = field.max!==undefined ? field.max : '';
  document.getElementById('df-range-min').value     = field.min!==undefined ? field.min : 0;
  document.getElementById('df-range-max').value     = field.max!==undefined ? field.max : 100;
  document.getElementById('df-range-step').value    = field.step||1;
  document.getElementById('df-range-default').value = field.defaultVal!==undefined ? field.defaultVal : 50;
  document.getElementById('df-rows').value          = field.rows||4;
  document.getElementById('df-accept').value        = field.accept||'';
  document.getElementById('df-divider-label').value = field.label||'';

  // Validation tab
  document.getElementById('df-required').checked   = !!field.required;
  document.getElementById('df-multiple').checked   = !!field.multiple;
  document.getElementById('df-val-min').value       = field.validMin||'';
  document.getElementById('df-val-max').value       = field.validMax||'';
  document.getElementById('df-pattern').value       = field.pattern||'';

  // Options tab
  document.getElementById('df-options').value = field.optionsRaw||'';

  // Show/hide conditional sections
  show('df-placeholder-wrap',  !isDivider && !['checkbox','radio','select','range','date','file'].includes(field.type));
  show('df-checklabel-wrap',    field.type==='checkbox');
  show('df-minmax-wrap',        field.type==='number');
  show('df-range-wrap',         field.type==='range');
  show('df-rows-wrap',          field.type==='textarea');
  show('df-accept-wrap',        field.type==='file');
  show('df-divider-wrap',       isDivider);
  // Hide label/name/hint for dividers
  show('df-label',              !isDivider);
  document.querySelector('label[for="df-label"]') && (document.querySelector('.dfield:nth-child(1)').style.display = isDivider ? 'none':'');

  // Validation tab hints
  show('df-email-val',          field.type==='email');
  show('df-url-val',            field.type==='url');
  show('df-val-minmax',         ['text','number','range','textarea'].includes(field.type));
  show('df-pattern-wrap',       ['text','email','tel','url'].includes(field.type));
  show('df-multiple-wrap',      field.type==='file');
}

function show(id, visible) {
  const el = document.getElementById(id); if(el) el.style.display = visible ? '' : 'none';
}

/* Live update on dialog input changes */
function dialogUpd(key, val) {
  if (!state.dialog.draft) return;
  state.dialog.draft[key] = val;

  // Keep name in sync if label changes and name is empty/auto
  if (key==='label' && state.dialog.draft.type!=='divider') {
    const nameEl = document.getElementById('df-name');
    const currentName = nameEl.value.trim();
    // Auto-update name only if it still matches the previous label's auto-name or is empty
    const prevAuto = labelToName(state.dialog.draft.label);
    if (!currentName || currentName === prevAuto || currentName === labelToName(val.slice(0,-1))) {
      const newName = labelToName(val);
      nameEl.value = newName;
      state.dialog.draft.name = newName;
    }
    // update divider label too
    if (state.dialog.draft.type==='divider') {
      document.getElementById('df-divider-label').value = val;
    }
  }
}

function autoFieldName() {
  const label = state.dialog.draft?.label || '';
  const name  = labelToName(label);
  document.getElementById('df-name').value = name;
  dialogUpd('name', name);
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN TAB SWITCHING
   ══════════════════════════════════════════════════════════════════════════ */
function switchMainTab(tab) {
  state.mainTab = tab;
  document.querySelectorAll('.ts-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.main-tab').forEach(p=>p.classList.toggle('active',p.id==='tab-'+tab));
  if (tab==='preview') renderPreview();
  if (tab==='settings') syncSettingsInputs();
}

/* ══════════════════════════════════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════════════════════════════════ */
function renderAll() {
  renderFormsList();
  syncTitleInput();
  renderCanvas();
  renderPreview();
}

function syncTitleInput() {
  const f = activeForm();
  const el = document.getElementById('active-form-title');
  if (el && f) el.value = f.title || '';
}

function renderFormsList() {
  const container = document.getElementById('forms-list');
  container.innerHTML = state.forms.map(f=>`
    <div class="form-list-item ${f.id===state.activeFormId?'active':''}"
      onclick="switchForm(${f.id})">
      <div class="form-list-dot"></div>
      <span class="form-list-name">${esc(f.title||'Untitled Form')}</span>
      <span class="form-list-count">${f.fields.filter(fi=>fi.type!=='divider').length}</span>
      <button class="form-del-btn" onclick="deleteForm(${f.id},event)" title="Delete form">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l12 12M14 2L2 14"/></svg>
      </button>
    </div>`
  ).join('');
}

function renderCanvas() {
  const f = activeForm();
  const wrap   = document.getElementById('canvas-fields');
  const empty  = document.getElementById('canvas-empty');

  if (!f || !f.fields.length) {
    wrap.innerHTML   = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  wrap.innerHTML = f.fields.map((field,i) => {
    const meta = TYPE_META[field.type] || TYPE_META.text;

    if (field.type==='divider') {
      return `
        <div class="field-card divider-card"
          id="fc-${field.id}" draggable="true"
          ondragstart="dragStart(event,${field.id})"
          ondragover="dragOver(event,${field.id})"
          ondrop="dragDrop(event,${field.id})"
          ondragend="dragEnd()">
          <div class="divider-inner">
            <div class="divider-line"></div>
            <span class="divider-text">${esc(field.label||'Section')}</span>
            <div class="divider-line"></div>
            <div style="display:flex;gap:3px;margin-left:4px">
              <button class="fc-btn edit" title="Edit" onclick="openDialog(${field.id})">
                ${svgIcon('<path d="M11 2l3 3L5 14H2v-3L11 2z"/>')}
              </button>
              <button class="fc-btn danger" title="Delete" onclick="removeField(${field.id},event)">
                ${svgIcon('<path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M10 8v4M6 8v4M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/>')}
              </button>
            </div>
          </div>
        </div>`;
    }

    const labelTxt = field.label || `<em style="font-style:italic;font-weight:400;color:var(--text-3)">Untitled ${meta.label}</em>`;
    const subTxt   = buildFieldSub(field);

    return `
      <div class="field-card"
        id="fc-${field.id}" draggable="true"
        ondragstart="dragStart(event,${field.id})"
        ondragover="dragOver(event,${field.id})"
        ondrop="dragDrop(event,${field.id})"
        ondragend="dragEnd()"
        ondblclick="openDialog(${field.id})">
        <div class="field-card-inner">
          <div class="fc-drag" title="Drag to reorder">
            ${svgIcon('<circle cx="5.5" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="5.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="5.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="11" r="1" fill="currentColor" stroke="none"/>',16)}
          </div>
          <div class="fc-type-badge"
            style="--p-color:${meta.color};--p-bg:${meta.bg}">
            ${meta.label}
          </div>
          <div class="fc-info">
            <div class="fc-label ${field.label?'':' placeholder'}">
              ${field.label ? esc(field.label) : 'Untitled ' + meta.label}
              ${field.required ? '<span class="fc-req-star">*</span>' : ''}
            </div>
            ${subTxt ? `<div class="fc-sub">${esc(subTxt)}</div>` : ''}
          </div>
          <div class="fc-actions">
            <button class="fc-btn" title="Move up"   onclick="moveField(${field.id},-1,event)" ${i===0?'disabled':''}>
              ${svgIcon('<path d="M8 12V4M4 8l4-4 4 4"/>')}
            </button>
            <button class="fc-btn" title="Move down" onclick="moveField(${field.id},1,event)" ${i===f.fields.length-1?'disabled':''}>
              ${svgIcon('<path d="M8 4v8M4 8l4 4 4-4"/>')}
            </button>
            <button class="fc-btn" title="Duplicate" onclick="duplicateField(${field.id},event)">
              ${svgIcon('<rect x="6" y="6" width="8" height="8" rx="1.5"/><path d="M2 10V4a2 2 0 012-2h6"/>')}
            </button>
            <button class="fc-btn edit" title="Edit field" onclick="openDialog(${field.id})">
              ${svgIcon('<path d="M11 2l3 3L5 14H2v-3L11 2z"/>')}
            </button>
            <button class="fc-btn danger" title="Delete" onclick="removeField(${field.id},event)">
              ${svgIcon('<path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M10 8v4M6 8v4M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/>')}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function buildFieldSub(field) {
  if (field.type==='select'||field.type==='radio') {
    const opts = parseOptions(field.optionsRaw);
    return opts.length ? opts.slice(0,3).join(' · ') + (opts.length>3?` +${opts.length-3} more`:'') : 'No options set';
  }
  if (field.type==='range') return `${field.min||0} – ${field.max||100}, step ${field.step||1}`;
  if (field.type==='checkbox') return field.checkboxLabel || '';
  if (field.type==='file')     return field.accept ? `Accept: ${field.accept}` : 'Any file type';
  if (field.placeholder) return field.placeholder;
  return '';
}

/* ── Preview rendering ── */
function renderPreview() {
  const f = activeForm();
  if (!f) return;

  document.getElementById('preview-title').textContent = f.title || 'Untitled Form';
  const descEl = document.getElementById('preview-desc');
  if (descEl) descEl.textContent = f.description || '';

  const body = document.getElementById('preview-body');
  body.innerHTML = f.fields.map(buildPreviewField).join('');

  // Wire sliders
  body.querySelectorAll('.pf-slider').forEach(inp => {
    const valEl = document.getElementById(inp.dataset.valId);
    inp.addEventListener('input', () => { if(valEl) valEl.textContent = inp.value; });
  });
}

function buildPreviewField(field) {
  if (field.type==='divider') {
    return `<div class="pf-divider"><div class="pf-divider-line"></div><span class="pf-divider-label">${esc(field.label)}</span><div class="pf-divider-line"></div></div>`;
  }

  const label  = field.label || `Untitled ${TYPE_META[field.type]?.label||'Field'}`;
  const req    = field.required ? '<span class="pf-req">*</span>' : '';
  const hint   = field.hint    ? `<p class="pf-hint">${esc(field.hint)}</p>` : '';
  const fname  = field.name    || labelToName(field.label);

  let control = '';

  if (field.type==='textarea') {
    control = `<textarea rows="${field.rows||4}" placeholder="${esc(field.placeholder||'')}" name="${fname}"></textarea>`;

  } else if (field.type==='select') {
    const opts = parseOptions(field.optionsRaw);
    control = `<select name="${fname}"><option value="">— Choose an option —</option>${opts.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`;

  } else if (field.type==='checkbox') {
    return `<div class="pf"><label class="pf-label">${esc(label)}${req}</label>${hint}<label class="pf-option-row"><input type="checkbox" name="${fname}"/><span class="pf-option-label">${esc(field.checkboxLabel||'Check this box')}</span></label></div>`;

  } else if (field.type==='radio') {
    const opts  = parseOptions(field.optionsRaw);
    const rname = fname+'_'+field.id;
    return `<div class="pf"><label class="pf-label">${esc(label)}${req}</label>${hint}<div class="pf-radio-group">${opts.map(o=>`<label class="pf-option-row"><input type="radio" name="${rname}" value="${esc(o)}"/><span class="pf-option-label">${esc(o)}</span></label>`).join('')}</div></div>`;

  } else if (field.type==='range') {
    const vid = 'rv_'+field.id;
    const def = field.defaultVal!==undefined ? field.defaultVal : field.min||0;
    return `<div class="pf"><div class="pf-slider-header"><label class="pf-label">${esc(label)}${req}</label><span class="pf-slider-val" id="${vid}">${def}</span></div>${hint}<input type="range" class="pf-slider" data-val-id="${vid}" name="${fname}" min="${field.min||0}" max="${field.max||100}" step="${field.step||1}" value="${def}"/><div class="pf-slider-limits"><span>${field.min||0}</span><span>${field.max||100}</span></div></div>`;

  } else if (field.type==='file') {
    const acc = field.accept ? `accept="${esc(field.accept)}"` : '';
    const mul = field.multiple ? 'multiple' : '';
    return `<div class="pf"><label class="pf-label">${esc(label)}${req}</label>${hint}<input type="file" name="${fname}" ${acc} ${mul} style="cursor:pointer"/><p class="pf-file-note">Files are uploaded to Google Drive on submit.</p></div>`;

  } else {
    const attrs = [`type="${field.type}"`,`name="${fname}"`,
      field.placeholder ? `placeholder="${esc(field.placeholder)}"` : '',
      field.min!=='' && field.min!==undefined ? `min="${field.min}"` : '',
      field.max!=='' && field.max!==undefined ? `max="${field.max}"` : '',
    ].filter(Boolean).join(' ');
    control = `<input ${attrs}/>`;
  }

  return `<div class="pf"><label class="pf-label">${esc(label)}${req}</label>${hint}${control}</div>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   SETTINGS SYNC
   ══════════════════════════════════════════════════════════════════════════ */
function syncSettingsInputs() {
  const f = activeForm(); if (!f) return;
  document.getElementById('s-form-title').value     = f.title||'';
  document.getElementById('s-form-desc').value      = f.description||'';
  document.getElementById('s-action-url').value     = f.settings.actionUrl||'';
  document.getElementById('s-method').value         = f.settings.method||'POST';
  document.getElementById('s-content-type').value   = f.settings.contentType||'application/json';
  document.getElementById('s-headers').value        = f.settings.headers||'';
  document.getElementById('s-success-msg').value    = f.settings.successMsg||'';
  document.getElementById('s-redirect-url').value   = f.settings.redirectUrl||'';
  document.getElementById('s-reset-after').checked  = f.settings.resetAfter!==false;
}

// Wire settings inputs on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  ['s-method','s-content-type','s-headers','s-success-msg','s-redirect-url'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const f = activeForm(); if (!f) return;
      const map = { 's-method':'method','s-content-type':'contentType','s-headers':'headers','s-success-msg':'successMsg','s-redirect-url':'redirectUrl' };
      f.settings[map[id]] = document.getElementById(id).value;
      persist();
    });
  });
  document.getElementById('s-reset-after')?.addEventListener('change', function() {
    const f = activeForm(); if (!f) return;
    f.settings.resetAfter = this.checked;
    persist();
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   DRAG AND DROP
   ══════════════════════════════════════════════════════════════════════════ */
function dragStart(e, id) {
  state.dragSrcId = id;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(()=>{ document.getElementById('fc-'+id)?.classList.add('is-dragging'); },0);
}

function dragOver(e, id) {
  e.preventDefault();
  if (state.dragSrcId===null || state.dragSrcId===id) return;
  const f = activeForm(); if (!f) return;
  const fromIdx = f.fields.findIndex(fi=>fi.id===state.dragSrcId);
  const toIdx   = f.fields.findIndex(fi=>fi.id===id);
  if (fromIdx<0||toIdx<0) return;
  const [item] = f.fields.splice(fromIdx,1);
  f.fields.splice(toIdx,0,item);
  state.dragSrcId = id;
  renderCanvas();
}

function dragDrop(e, id) { e.preventDefault(); dragEnd(); }

function dragEnd() {
  state.dragSrcId = null;
  document.querySelectorAll('.field-card').forEach(c=>c.classList.remove('is-dragging'));
  persist();
  renderPreview();
}

/* ══════════════════════════════════════════════════════════════════════════
   FORM SUBMISSION (preview tab)
   ══════════════════════════════════════════════════════════════════════════ */
async function handlePreviewSubmit() {
  const f = activeForm(); if (!f) return;

  const data    = await collectPreviewData(f);
  const errors  = validatePreviewData(f, data);

  if (errors.length) { showToast(errors[0],'error'); return; }

  const url = f.settings.actionUrl.trim();
  if (!url) {
    showToast('No Action URL set — go to Settings tab to configure submission.','info');
    switchMainTab('settings');
    document.getElementById('s-action-url')?.focus();
    return;
  }

  state.lastPayload = { f, data, url };
  await doSubmit(f, data, url);
}

async function collectPreviewData(f) {
  const data = {};
  const body = document.getElementById('preview-body');
  if (!body) return data;

  const promises = f.fields.map(field => {
    if (field.type==='divider') return Promise.resolve();
    const name = field.name || labelToName(field.label);

    if (field.type==='checkbox') {
      const el = body.querySelector(`input[name="${name}"]`);
      data[name] = el ? el.checked : false;
    } else if (field.type==='radio') {
      const el = body.querySelector(`input[name="${name+'_'+field.id}"]:checked`);
      data[name] = el ? el.value : '';
    } else if (field.type==='textarea') {
      const el = body.querySelector(`textarea[name="${name}"]`);
      data[name] = el ? el.value : '';
    } else if (field.type==='select') {
      const el = body.querySelector(`select[name="${name}"]`);
      data[name] = el ? el.value : '';
    } else if (field.type==='file') {
      const el   = body.querySelector(`input[name="${name}"]`);
      const file = el?.files?.[0];
      if (!file) { data[name] = ''; return Promise.resolve(); }
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload  = () => { data[name] = { name:file.name, type:file.type, size:file.size, data:reader.result }; resolve(); };
        reader.onerror = () => { data[name] = '[read error]'; resolve(); };
        reader.readAsDataURL(file);
      });
    } else {
      const el = body.querySelector(`input[name="${name}"]`);
      data[name] = el ? el.value : '';
    }
    return Promise.resolve();
  });

  await Promise.all(promises);
  return data;
}

function validatePreviewData(f, data) {
  const errors = [];
  f.fields.forEach(field => {
    if (field.type==='divider' || !field.required) return;
    const name  = field.name || labelToName(field.label);
    const val   = data[name];
    const label = field.label || 'Field';
    if (field.type==='checkbox') {
      if (!val) errors.push(`${label} must be checked.`);
    } else if (!val && val!==0) {
      errors.push(`${label} is required.`);
    }
  });
  return errors;
}

async function doSubmit(f, data, url) {
  const settings    = f.settings;
  const isGoogle    = url.includes('script.google.com');
  const payload = {
    _meta: { form:f.title, description:f.description, submittedAt:new Date().toISOString() },
    ...data,
  };

  let body, headers = {};
  if (settings.contentType==='application/x-www-form-urlencoded' && !isGoogle) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(data).toString();
  } else {
    if (!isGoogle) headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  let extraHeaders = {};
  try { const raw=(settings.headers||'').trim(); if(raw) extraHeaders=JSON.parse(raw); } catch { showToast('Custom headers have invalid JSON — ignored.','error'); }
  headers = { ...headers, ...extraHeaders };

  showSubmitOverlay('loading','Submitting…', isGoogle ? 'Sending to Google Sheets…' : 'Sending to: '+url);

  try {
    const opts = { method:settings.method||'POST', body };
    if (isGoogle) opts.mode = 'no-cors'; else opts.headers = headers;

    const res = await fetch(url, opts);

    if (isGoogle || res.type==='opaque') {
      showSubmitOverlay('success', settings.successMsg||'Submitted!',
        'Row sent to Google Sheets.',
        'Response body hidden by browser (CORS opaque). Check your sheet to confirm.');
      if (settings.resetAfter!==false) resetPreviewForm();
      if (settings.redirectUrl) setTimeout(()=>{ window.location.href=settings.redirectUrl; },1800);
      return;
    }

    let text=''; try{text=await res.text();}catch{}
    if (res.ok) {
      showSubmitOverlay('success', settings.successMsg||'Submitted!', `HTTP ${res.status}`, text);
      if (settings.resetAfter!==false) resetPreviewForm();
      if (settings.redirectUrl) setTimeout(()=>{ window.location.href=settings.redirectUrl; },1800);
    } else {
      showSubmitOverlay('error','Submission failed', `HTTP ${res.status} ${res.statusText}`, text, true);
    }
  } catch(err) {
    showSubmitOverlay('error','Network error', err.message||'Could not reach the endpoint.',
      isGoogle ? 'Check the Apps Script URL and "Who has access" → Anyone.' : 'Check CORS settings.', true);
  }
}

function retrySubmit() {
  if (state.lastPayload) {
    // Retry from builder preview mode
    closeSubmitOverlay();
    const {f,data,url} = state.lastPayload;
    doSubmit(f,data,url);
  } else if (window.location.hash.includes('#/form?s=')) {
    // Retry from published form mode - reload to reset form
    closeSubmitOverlay();
    window.location.reload();
  }
}

function resetPreviewForm() {
  const body = document.getElementById('preview-body'); if (!body) return;
  body.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]),select,textarea').forEach(el=>{ el.value=''; });
  body.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach(el=>{ el.checked=false; });
  body.querySelectorAll('.pf-slider').forEach(inp => {
    const f = activeForm()?.fields.find(fi=>'rv_'+fi.id===inp.dataset.valId);
    inp.value = f ? (f.defaultVal!==undefined?f.defaultVal:f.min||0) : 0;
    const out = document.getElementById(inp.dataset.valId);
    if (out) out.textContent = inp.value;
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   OVERLAY HELPERS
   ══════════════════════════════════════════════════════════════════════════ */
function showSubmitOverlay(state, title, sub, details, showRetry) {
  const overlay = document.getElementById('submit-overlay');
  document.getElementById('sub-spinner').style.display = state==='loading' ? 'block' : 'none';
  const icon = document.getElementById('sub-icon');
  if (state==='loading') {
    icon.style.display = 'none';
  } else {
    icon.style.display = 'flex';
    icon.className = 'submit-modal-icon '+state;
    icon.innerHTML = state==='success'
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"><path d="M4 12l5 5 11-11"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" stroke-width="2.5" stroke-linecap="round"><path d="M4 4l16 16M20 4L4 20"/></svg>';
  }
  document.getElementById('sub-title').textContent = title;
  document.getElementById('sub-sub').textContent   = sub||'';
  const detEl = document.getElementById('sub-details');
  if (details) { detEl.style.display='block'; detEl.textContent=details; } else detEl.style.display='none';
  const actions = document.getElementById('sub-actions');
  actions.style.display = state==='loading' ? 'none' : 'flex';
  const retryBtn = document.getElementById('sub-retry');
  retryBtn.style.display = showRetry ? 'inline-flex' : 'none';
  overlay.classList.add('active');
}

function closeSubmitOverlay() {
  document.getElementById('submit-overlay').classList.remove('active');
}

document.getElementById('submit-overlay').addEventListener('click', function(e) {
  if (e.target===this) closeSubmitOverlay();
});

/* ══════════════════════════════════════════════════════════════════════════
   EXPORT & PUBLISH
   ══════════════════════════════════════════════════════════════════════════ */
function exportJSON() {
  const f = activeForm(); if (!f) return;
  const schema = {
    title: f.title,
    description: f.description,
    settings: f.settings,
    fields: f.fields.map(fi => {
      const out = { id:fi.id, type:fi.type, label:fi.label, name:fi.name };
      if (fi.type!=='divider') {
        out.required = !!fi.required;
        if (fi.hint)          out.hint          = fi.hint;
        if (fi.placeholder)   out.placeholder   = fi.placeholder;
        if (fi.checkboxLabel) out.checkboxLabel = fi.checkboxLabel;
        if (fi.optionsRaw)    out.options       = parseOptions(fi.optionsRaw);
        if (fi.type==='range')    { out.min=fi.min; out.max=fi.max; out.step=fi.step; out.default=fi.defaultVal; }
        if (fi.type==='number')   { if(fi.min!=='') out.min=fi.min; if(fi.max!=='') out.max=fi.max; }
        if (fi.type==='textarea') out.rows = fi.rows||4;
        if (fi.type==='file')     { out.accept=fi.accept; out.multiple=!!fi.multiple; }
      }
      return out;
    }),
  };
  const blob = new Blob([JSON.stringify(schema,null,2)],{type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = (f.title||'form').replace(/\s+/g,'-').toLowerCase()+'-schema.json';
  a.click(); URL.revokeObjectURL(url);
  showToast('Schema exported as JSON','success');
}

/* ── Schema serialiser (shared with form.html via URL) ─────────────────── */
function buildSchema(f) {
  return {
    title:       f.title       || 'Untitled Form',
    description: f.description || '',
    settings:    f.settings,
    fields: f.fields.map(fi => {
      const out = { id:fi.id, type:fi.type, label:fi.label, name:fi.name||labelToName(fi.label) };
      if (fi.type!=='divider') {
        out.required = !!fi.required;
        if (fi.hint)          out.hint          = fi.hint;
        if (fi.placeholder)   out.placeholder   = fi.placeholder;
        if (fi.checkboxLabel) out.checkboxLabel = fi.checkboxLabel;
        if (fi.optionsRaw)    out.options       = parseOptions(fi.optionsRaw);
        if (fi.type==='range')    { out.min=fi.min; out.max=fi.max; out.step=fi.step; out.defaultVal=fi.defaultVal; }
        if (fi.type==='number')   { if(fi.min!=='') out.min=fi.min; if(fi.max!=='') out.max=fi.max; }
        if (fi.type==='textarea') out.rows = fi.rows||4;
        if (fi.type==='file')     { out.accept=fi.accept||''; out.multiple=!!fi.multiple; }
      }
      return out;
    }),
  };
}

/* Encode schema → URL-safe base64 string */
function encodeSchema(schema) {
  const json = JSON.stringify(schema);
  /* btoa requires latin1; encodeURIComponent then escape handles unicode safely */
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/[+]/g,'-').replace(/[/]/g,'_').replace(/=+$/,'');
}

function publishForm() {
  const f = activeForm(); if (!f) return;

  if (!f.fields.length) {
    showToast('Add at least one field before publishing.','error');
    return;
  }

  const schema  = buildSchema(f);
  const encoded = encodeSchema(schema);

  const currentUrl = new URL(window.location.href);
  let basePath = currentUrl.pathname;
  basePath = basePath.replace(/index\.html$/, '');
  if (!basePath.endsWith('/')) {
    basePath += '/';
  }

  const base = currentUrl.origin + basePath;
  const pubUrl = base + '#/form?s=' + encodeURIComponent(encoded);

  /* Render the publish modal */
  openPublishModal(pubUrl, f.title);
}

/* ── Publish modal ─────────────────────────────────────────────────────── */
function openPublishModal(url, title) {
  let modal = document.getElementById('publish-modal-wrap');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'publish-modal-wrap';
    modal.innerHTML = `
      <div class="pub-backdrop" onclick="closePublishModal()"></div>
      <div class="pub-modal">
        <div class="pub-modal-header">
          <div class="pub-header-left">
            <div class="pub-icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
              </svg>
            </div>
            <div>
              <h2 class="pub-modal-title">Form published</h2>
              <p class="pub-modal-sub" id="pub-form-name"></p>
            </div>
          </div>
          <button class="pub-close" onclick="closePublishModal()">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l12 12M14 2L2 14"/></svg>
          </button>
        </div>

        <div class="pub-modal-body">
          <div class="pub-url-section">
            <p class="pub-section-label">Shareable link</p>
            <p class="pub-section-hint">Share this URL with anyone to let them fill in your form. No server needed — the form definition is encoded in the URL itself.</p>
            <div class="pub-url-row">
              <input type="text" class="pub-url-input" id="pub-url-input" readonly/>
              <button class="btn btn-primary btn-sm" onclick="copyPubUrl()" id="pub-copy-btn">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 11V4a2 2 0 012-2h6"/></svg>
                Copy
              </button>
            </div>
          </div>

          <div class="pub-actions-row">
            <a class="btn btn-ghost btn-sm" id="pub-open-btn" target="_blank" rel="noopener">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4v4M6 10l8-8M7 4H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V9"/></svg>
              Open form
            </a>
            <button class="btn btn-ghost btn-sm" onclick="closePublishModal()">Done</button>
          </div>

          <div class="pub-note">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10.5h.01"/></svg>
            The form opens from the <strong>same folder</strong> as your <code>index.html</code>. Host both files on any static host (GitHub Pages, Netlify, Vercel) and the link works from anywhere on the web.
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('pub-form-name').textContent = title || 'Untitled Form';
  document.getElementById('pub-url-input').value = url;
  document.getElementById('pub-open-btn').href = url;
  modal.classList.add('open');
}

function closePublishModal() {
  const m = document.getElementById('publish-modal-wrap');
  if (m) m.classList.remove('open');
}

function copyPubUrl() {
  const input = document.getElementById('pub-url-input');
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.getElementById('pub-copy-btn');
    btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8l4 4 7-7"/></svg> Copied!`;
    setTimeout(()=>{
      btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 11V4a2 2 0 012-2h6"/></svg> Copy`;
    },2200);
  }).catch(()=>showToast('Could not copy — try selecting the URL manually.','error'));
}

/* ══════════════════════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════════════════════ */
function showToast(msg, type='info') {
  const icons = {
    success:'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2.5 8l4 4 7-7"/></svg>',
    error:  '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l12 12M14 2L2 14"/></svg>',
    info:   '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 10.5h.01"/></svg>',
  };
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-icon ${type}">${icons[type]||icons.info}</div><span>${msg}</span>`;
  document.getElementById('toast-root').appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

/* ══════════════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key==='Escape' && state.dialog.open) { closeDialog(); return; }
  if ((e.metaKey||e.ctrlKey) && e.key==='Enter' && state.dialog.open) { saveDialog(); return; }
  if ((e.metaKey||e.ctrlKey) && e.key==='s') { e.preventDefault(); showToast('Auto-saved','success'); persist(); }
});
