/* =============================================
   contact.js — EmailJS form submission
   =============================================

   SETUP REQUIRED — see SETUP.md for full instructions:
   1. Replace YOUR_PUBLIC_KEY   with your EmailJS public key
   2. Replace YOUR_SERVICE_ID   with your EmailJS service ID
   3. Replace YOUR_TEMPLATE_ID  with your EmailJS template ID

   EmailJS template variables (used in {{variable}} in your template):
     {{from_name}}        — sender's full name
     {{from_email}}       — sender's email address
     {{from_phone}}       — sender's phone (may be blank)
     {{preferred_contact}}— Email or Phone
     {{message}}          — the enquiry message
     {{reply_to}}         — set to from_email for easy replying
   ============================================= */

(function () {
  'use strict';

  /* ── Configuration ── Replace these three values ── */
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  /* ─────────────────────────────────────────────────── */

  const form        = document.getElementById('contact-form');
  const formWrap    = document.getElementById('form-wrap');
  const formSuccess = document.getElementById('form-success');

  if (!form) return;

  // Initialise EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } else {
    console.warn('EmailJS SDK not loaded. Check your internet connection and the script tag in contact.html.');
  }

  // ── Validation helpers ──────────────────────────────────────
  const rules = {
    name:    v => v.trim().length >= 2,
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: v => v.trim().length >= 10,
  };

  function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-error');
    if (field)  field.classList.add('error');
    if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
    if (field)  field.setAttribute('aria-invalid', 'true');
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-error');
    if (field)  { field.classList.remove('error'); field.removeAttribute('aria-invalid'); }
    if (errEl)  errEl.hidden = true;
  }

  function validateForm() {
    let valid = true;

    const name    = document.getElementById('name').value;
    const email   = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    clearError('name');
    clearError('email');
    clearError('message');

    if (!rules.name(name)) {
      showError('name', 'Please enter your full name (at least 2 characters).');
      valid = false;
    }
    if (!rules.email(email)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!rules.message(message)) {
      showError('message', 'Please enter a message (at least 10 characters).');
      valid = false;
    }

    return valid;
  }

  // ── Inline validation on blur ────────────────────────────────
  ['name', 'email', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      if (!rules[id] || rules[id](el.value)) {
        clearError(id);
      } else {
        const msgs = {
          name:    'Please enter your full name.',
          email:   'Please enter a valid email address.',
          message: 'Please enter a message (at least 10 characters).',
        };
        showError(id, msgs[id]);
      }
    });
    el.addEventListener('input', () => clearError(id));
  });

  // ── Form submit ──────────────────────────────────────────────
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn     = document.getElementById('submit-btn');
    const btnText       = document.getElementById('btn-text');
    const btnSpinner    = document.getElementById('btn-spinner');
    const formFeedback  = document.getElementById('form-feedback');

    // Loading state
    submitBtn.disabled    = true;
    submitBtn.classList.add('loading');
    if (btnText)    btnText.textContent = 'Sending…';
    if (btnSpinner) btnSpinner.hidden   = false;
    if (formFeedback) formFeedback.hidden = true;

    // Collect preferred contact value
    const preferredEl = form.querySelector('input[name="preferred_contact"]:checked');
    const preferred    = preferredEl ? preferredEl.value : 'Email';

    const templateParams = {
      from_name:         document.getElementById('name').value.trim(),
      from_email:        document.getElementById('email').value.trim(),
      from_phone:        document.getElementById('phone').value.trim() || 'Not provided',
      preferred_contact: preferred,
      message:           document.getElementById('message').value.trim(),
      reply_to:          document.getElementById('email').value.trim(),
    };

    try {
      if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      // Success
      if (formWrap)    formWrap.hidden    = true;
      if (formSuccess) formSuccess.hidden = false;
      if (formSuccess) {
        formSuccess.removeAttribute('hidden');
        formSuccess.style.display = 'block';
        formSuccess.setAttribute('tabindex', '-1');
        formSuccess.focus();
      }

    } catch (err) {
      console.error('EmailJS error:', err);

      // Restore button state
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      if (btnText)    btnText.textContent = 'Send Message';
      if (btnSpinner) btnSpinner.hidden   = true;

      // Show inline error
      if (formFeedback) {
        formFeedback.hidden    = false;
        formFeedback.className = 'notice notice--warning';
        formFeedback.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>' +
          '<div class="notice-text"><strong>Something went wrong</strong>Sorry, your message could not be sent at this time. Please try again, or contact us directly by email.</div>';
      }
    }
  });

})();
