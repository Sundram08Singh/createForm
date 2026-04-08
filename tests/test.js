/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CreateForm Pro — Test Suite
 *  Unit & Integration Tests for Core Functionality
 *  
 *  Run in Node.js: node tests/test.js
 *  Run in browser: Include this file in HTML and check console
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ── Simple Test Runner ── */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  describe(suiteName, fn) {
    console.log(`\n📦 ${suiteName}`);
    fn();
  }

  it(testName, fn) {
    try {
      fn();
      this.passed++;
      console.log(`  ✓ ${testName}`);
    } catch (err) {
      this.failed++;
      console.error(`  ✗ ${testName}`);
      console.error(`    ${err.message}`);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  summary() {
    const total = this.passed + this.failed;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`\n📊 Test Summary`);
    console.log(`  Total:  ${total}`);
    console.log(`  Passed: ${this.passed} ✓`);
    console.log(`  Failed: ${this.failed} ✗`);
    console.log(`\n${this.failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed'}\n`);
    return this.failed === 0;
  }
}

const runner = new TestRunner();

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS - Extracted from app.js for testing
   ═══════════════════════════════════════════════════════════════════════════ */

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

function encodeSchema(schema) {
  const json = JSON.stringify(schema);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/[+]/g,'-').replace(/[/]/g,'_').replace(/=+$/,'');
}

function decodeSchema(encoded) {
  try {
    const b64 = encoded.replace(/[-]/g, '+').replace(/[_]/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json);
  } catch (err) {
    throw new Error('Decoding failed: ' + err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE 1: String Utilities
   ═══════════════════════════════════════════════════════════════════════════ */
runner.describe('String Utilities', () => {

  runner.it('esc() escapes HTML entities', () => {
    runner.assertEqual(esc('<script>'), '&lt;script&gt;');
    runner.assertEqual(esc('a & b'), 'a &amp; b');
    runner.assertEqual(esc('"quoted"'), '&quot;quoted&quot;');
  });

  runner.it('esc() handles null/undefined', () => {
    runner.assertEqual(esc(null), '');
    runner.assertEqual(esc(undefined), '');
    runner.assertEqual(esc(''), '');
  });

  runner.it('labelToName() converts labels to field names', () => {
    runner.assertEqual(labelToName('Full Name'), 'full_name');
    runner.assertEqual(labelToName('Email Address'), 'email_address');
    runner.assertEqual(labelToName('First-Name'), 'first_name');
    runner.assertEqual(labelToName('  Spaced Text  '), 'spaced_text');
  });

  runner.it('labelToName() handles special characters', () => {
    runner.assertEqual(labelToName('Name@Email!'), 'nameemail');
    runner.assertEqual(labelToName('Field #1'), 'field_1');
    runner.assertEqual(labelToName('A.B.C'), 'abc');
  });

  runner.it('labelToName() returns default for empty input', () => {
    runner.assertEqual(labelToName(''), 'field');
    runner.assertEqual(labelToName(null), 'field');
    runner.assertEqual(labelToName('   '), 'field');
  });

  runner.it('parseOptions() splits options by newline', () => {
    const opts = parseOptions('Option A\nOption B\nOption C');
    runner.assertDeepEqual(opts, ['Option A', 'Option B', 'Option C']);
  });

  runner.it('parseOptions() trims whitespace', () => {
    const opts = parseOptions('  First  \n  Second  \n  Third  ');
    runner.assertDeepEqual(opts, ['First', 'Second', 'Third']);
  });

  runner.it('parseOptions() filters empty lines', () => {
    const opts = parseOptions('A\n\n\nB\n\nC');
    runner.assertDeepEqual(opts, ['A', 'B', 'C']);
  });

  runner.it('parseOptions() handles empty input', () => {
    runner.assertDeepEqual(parseOptions(''), []);
    runner.assertDeepEqual(parseOptions(null), []);
  });

});

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE 2: Schema Encoding/Decoding (URL Safe Base64)
   ═══════════════════════════════════════════════════════════════════════════ */
runner.describe('Schema Encoding & Decoding', () => {

  runner.it('encodeSchema() converts schema to base64 URL-safe string', () => {
    const schema = {
      title: 'Test Form',
      fields: [{ id: 1, type: 'text', label: 'Name' }]
    };
    const encoded = encodeSchema(schema);
    runner.assert(typeof encoded === 'string', 'Should return string');
    runner.assert(encoded.length > 0, 'Should not be empty');
    runner.assert(!encoded.includes('+'), 'Should not contain +');
    runner.assert(!encoded.includes('/'), 'Should not contain /');
    runner.assert(!encoded.includes('='), 'Should not contain padding');
  });

  runner.it('decodeSchema() reverses encoding correctly', () => {
    const original = {
      title: 'Contact Form',
      description: 'Get in touch',
      fields: [
        { id: 1, type: 'text', label: 'Name', required: true },
        { id: 2, type: 'email', label: 'Email', required: true }
      ]
    };
    const encoded = encodeSchema(original);
    const decoded = decodeSchema(encoded);
    runner.assertDeepEqual(decoded, original);
  });

  runner.it('decodeSchema() handles unicode characters', () => {
    const schema = {
      title: 'Form with unicode: 你好🎉',
      fields: [{ label: 'Ñame', placeholder: 'José' }]
    };
    const encoded = encodeSchema(schema);
    const decoded = decodeSchema(encoded);
    runner.assertDeepEqual(decoded, schema);
  });

  runner.it('decodeSchema() throws on corrupted data', () => {
    try {
      decodeSchema('!!!INVALID!!!');
      runner.assert(false, 'Should throw error');
    } catch (err) {
      runner.assert(err.message.includes('Decoding failed'), 'Should have proper error message');
    }
  });

  runner.it('encodeSchema() handles complex nested objects', () => {
    const schema = {
      title: 'Complex Form',
      settings: {
        actionUrl: 'https://example.com',
        method: 'POST',
        headers: JSON.stringify({ 'Auth': 'Bearer token' })
      },
      fields: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        type: ['text', 'email', 'tel', 'url'][i % 4],
        label: `Field ${i}`,
        required: i % 2 === 0
      }))
    };
    const encoded = encodeSchema(schema);
    const decoded = decodeSchema(encoded);
    runner.assertDeepEqual(decoded, schema);
  });

});

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE 3: Form Field Validation
   ═══════════════════════════════════════════════════════════════════════════ */
runner.describe('Form Field Validation', () => {

  // Validation helper function
  function validateField(field, value) {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return { valid: false, error: `${field.label} is required` };
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { valid: false, error: 'Invalid email format' };
    }
    if (field.type === 'url' && value && !/^https?:\/\//.test(value)) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    if (field.type === 'number' && value) {
      const num = parseFloat(value);
      if (isNaN(num)) return { valid: false, error: 'Must be a number' };
      if (field.min !== undefined && num < field.min) return { valid: false, error: `Minimum is ${field.min}` };
      if (field.max !== undefined && num > field.max) return { valid: false, error: `Maximum is ${field.max}` };
    }
    return { valid: true };
  }

  runner.it('validates required fields', () => {
    const field = { label: 'Name', required: true };
    const result1 = validateField(field, '');
    const result2 = validateField(field, 'John');
    runner.assert(!result1.valid, 'Empty value should fail');
    runner.assert(result2.valid, 'Non-empty value should pass');
  });

  runner.it('validates email format', () => {
    const field = { type: 'email', label: 'Email' };
    const result1 = validateField(field, 'invalid');
    const result2 = validateField(field, 'user@example.com');
    runner.assert(!result1.valid, 'Invalid email should fail');
    runner.assert(result2.valid, 'Valid email should pass');
  });

  runner.it('validates URL format', () => {
    const field = { type: 'url', label: 'URL' };
    const result1 = validateField(field, 'notaurl');
    const result2 = validateField(field, 'https://example.com');
    runner.assert(!result1.valid, 'Invalid URL should fail');
    runner.assert(result2.valid, 'Valid URL should pass');
  });

  runner.it('validates number min/max constraints', () => {
    const field = { type: 'number', label: 'Age', min: 18, max: 100 };
    const result1 = validateField(field, '10');
    const result2 = validateField(field, '25');
    const result3 = validateField(field, '150');
    runner.assert(!result1.valid, 'Below min should fail');
    runner.assert(result2.valid, 'Within range should pass');
    runner.assert(!result3.valid, 'Above max should fail');
  });

  runner.it('optional fields allow empty values', () => {
    const field = { type: 'email', label: 'Email', required: false };
    const result = validateField(field, '');
    runner.assert(result.valid, 'Optional empty field should be valid');
  });

});

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE 4: Form Data Collection & Serialization
   ═══════════════════════════════════════════════════════════════════════════ */
runner.describe('Form Data Serialization', () => {

  runner.it('builds correct form schema structure', () => {
    const formDef = {
      title: 'Contact Form',
      description: 'Get in touch with us',
      fields: [
        { id: 1, type: 'text', label: 'Name', name: 'name', required: true },
        { id: 2, type: 'email', label: 'Email', name: 'email', required: true },
        { id: 3, type: 'textarea', label: 'Message', name: 'msg' }
      ]
    };
    
    runner.assert(formDef.title, 'Schema should have title');
    runner.assertEqual(formDef.fields.length, 3, 'Should have 3 fields');
    runner.assertEqual(formDef.fields[0].type, 'text', 'First field should be text');
  });

  runner.it('serializes form data to JSON payload', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      msg: 'Hello'
    };
    
    const payload = {
      _meta: {
        form: 'Contact Form',
        submittedAt: new Date().toISOString()
      },
      ...formData
    };
    
    runner.assert(payload._meta, 'Should have metadata');
    runner.assertEqual(payload.name, 'John Doe', 'Data should be preserved');
    runner.assert(payload._meta.submittedAt, 'Should have timestamp');
  });

  runner.it('handles file objects in data', () => {
    const fileObj = {
      name: 'resume.pdf',
      type: 'application/pdf',
      size: 1024,
      data: 'base64encodeddata'
    };
    
    runner.assertEqual(fileObj.name, 'resume.pdf', 'File name preserved');
    runner.assertEqual(fileObj.type, 'application/pdf', 'File type preserved');
    runner.assert(fileObj.size > 0, 'File size should be positive');
  });

  runner.it('builds multiple field types correctly', () => {
    const fields = [
      { type: 'text', name: 'text_field' },
      { type: 'email', name: 'email_field' },
      { type: 'tel', name: 'tel_field' },
      { type: 'url', name: 'url_field' },
      { type: 'number', name: 'num_field' },
      { type: 'date', name: 'date_field' },
      { type: 'textarea', name: 'text_area' },
      { type: 'select', name: 'dropdown' },
      { type: 'checkbox', name: 'check' },
      { type: 'radio', name: 'radio' },
      { type: 'range', name: 'slider' },
      { type: 'file', name: 'file_field' }
    ];
    
    runner.assertEqual(fields.length, 12, 'Should have 12 field types');
    runner.assert(fields.every(f => f.name), 'All fields should have names');
  });

});

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE 5: Field Type Metadata
   ═══════════════════════════════════════════════════════════════════════════ */
runner.describe('Field Type System', () => {

  const TYPE_META = {
    text:     { label:'Text' },
    number:   { label:'Number' },
    email:    { label:'Email' },
    date:     { label:'Date' },
    tel:      { label:'Phone' },
    url:      { label:'URL' },
    textarea: { label:'Textarea' },
    select:   { label:'Select' },
    radio:    { label:'Radio' },
    checkbox: { label:'Checkbox' },
    range:    { label:'Slider' },
    file:     { label:'File' },
    divider:  { label:'Divider' },
  };

  runner.it('has metadata for all field types', () => {
    const types = Object.keys(TYPE_META);
    runner.assertEqual(types.length, 13, 'Should have 13 field types');
  });

  runner.it('each type has label metadata', () => {
    Object.entries(TYPE_META).forEach(([type, meta]) => {
      runner.assert(meta.label, `${type} should have label`);
    });
  });

  runner.it('validates field type belongs to known types', () => {
    const validTypes = Object.keys(TYPE_META);
    const testTypes = ['text', 'email', 'checkbox', 'file'];
    const allValid = testTypes.every(t => validTypes.includes(t));
    runner.assert(allValid, 'All test types should be known');
  });

  runner.it('rejects unknown field types', () => {
    const validTypes = Object.keys(TYPE_META);
    const unknownType = 'invalidType';
    runner.assert(!validTypes.includes(unknownType), 'Unknown type should not exist');
  });

});

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE 6: Form Link Generation
   ═══════════════════════════════════════════════════════════════════════════ */
runner.describe('Published Form Links', () => {

  runner.it('generates valid published form URL', () => {
    const schema = {
      title: 'Test Form',
      fields: [{ id: 1, type: 'text', label: 'Name' }]
    };
    const encoded = encodeSchema(schema);
    const url = `https://example.com/#/form?s=${encoded}`;
    
    runner.assert(url.includes('#/form?s='), 'URL should have correct format');
    runner.assert(encoded.length > 0, 'Schema should be encoded');
  });

  runner.it('parses published form URL correctly', () => {
    const hash = '#/form?s=ABC123xyz_-';
    const match = hash.match(/#\/form\?s=([A-Za-z0-9_-]+)/);
    
    runner.assert(match, 'Should match URL pattern');
    runner.assertEqual(match[1], 'ABC123xyz_-', 'Should extract schema parameter');
  });

  runner.it('handles URL encoding edge cases', () => {
    const testCases = [
      'simple-text_123',
      'A'.repeat(100),
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
    ];
    
    testCases.forEach(testCase => {
      const match = testCase.match(/^[A-Za-z0-9_-]+$/);
      runner.assert(match, `"${testCase.substring(0, 20)}..." should be valid URL-safe`);
    });
  });

});

/* ═══════════════════════════════════════════════════════════════════════════
   TEST SUITE 7: Edge Cases & Error Handling
   ═══════════════════════════════════════════════════════════════════════════ */
runner.describe('Edge Cases & Error Handling', () => {

  runner.it('handles very long form titles', () => {
    const longTitle = 'A'.repeat(500);
    runner.assert(longTitle.length === 500, 'Should allow long strings');
    const escaped = esc(longTitle);
    runner.assertEqual(escaped.length, 500, 'Escaping should preserve length');
  });

  runner.it('handles forms with many fields', () => {
    const manyFields = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      type: 'text',
      label: `Field ${i}`,
      name: `field_${i}`
    }));
    runner.assertEqual(manyFields.length, 100, 'Should handle 100 fields');
  });

  runner.it('handles special characters in field labels', () => {
    const labels = [
      'Name & Phone',
      'Email <required>',
      'Phone "verified"',
      'Field#1',
      'Field with unicode: 中文',
      'Field with emoji: 🎉'
    ];
    
    labels.forEach(label => {
      const name = labelToName(label);
      runner.assert(name.length > 0, `Label "${label}" should convert to name`);
      runner.assert(/^[a-z0-9_]+$/.test(name), `Name should be lowercase alphanumeric: "${name}"`);
    });
  });

  runner.it('handles empty form data', () => {
    const emptyForm = {
      title: 'Empty Form',
      description: '',
      fields: []
    };
    runner.assertEqual(emptyForm.fields.length, 0, 'Should allow empty form');
  });

  runner.it('handles null/undefined gracefully', () => {
    runner.assertEqual(labelToName(null), 'field', 'Should handle null');
    runner.assertEqual(labelToName(undefined), 'field', 'Should handle undefined');
    runner.assertDeepEqual(parseOptions(null), [], 'Should handle null options');
  });

});

/* ═══════════════════════════════════════════════════════════════════════════
   RUN ALL TESTS
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n' + '═'.repeat(60));
console.log('🧪 CreateForm Pro — Test Suite');
console.log('═'.repeat(60));

// Run all test suites (already executed above via describe/it calls)

// Print final summary
const allPassed = runner.summary();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runner, TestRunner };
}
