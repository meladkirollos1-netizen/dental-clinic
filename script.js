/* ===== 0. Settings: edit only this line =====
   WhatsApp number in international format, digits only.
   Egypt: 20 + the number without its leading 0.
   Example: 01012345678  ->  "201012345678"                      */
const WHATSAPP_NUMBER = "201206617687";

/* ===== 1. Apply the number to every WhatsApp / phone link ===== */
document.querySelectorAll('[data-wa]').forEach((a) => {
  a.href = `https://wa.me/${WHATSAPP_NUMBER}`;
});
document.querySelectorAll('[data-tel]').forEach((a) => {
  a.href = `tel:+${WHATSAPP_NUMBER}`;
  if (/^20\d{10}$/.test(WHATSAPP_NUMBER)) {
    const local = '0' + WHATSAPP_NUMBER.slice(2);
    a.textContent = `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
});

/* ===== 2. Mobile menu toggle ===== */
const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');

function closeMenu() {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
// Close the menu after tapping a link (mobile)
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') closeMenu();
});
// Close the menu with the Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('open')) {
    closeMenu();
    menuBtn.focus();
  }
});

/* ===== 3. FAQ accordion (one item open at a time) ===== */
document.querySelectorAll('.faq-q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    btn.setAttribute('aria-expanded', String(!wasOpen));
  });
});

/* ===== 4. Booking form: validate, then send the request through WhatsApp ===== */
const form = document.getElementById('bookingForm');
const formMsg = document.getElementById('formMsg');

// Convert Arabic-Indic digits (٠١٢…) to normal digits and drop spaces/dashes
const toEnglishDigits = (s) =>
  s.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s|-/g, '');

// Accept 01012345678, +201012345678, 00201012345678 and 201012345678
const normalizePhone = (s) =>
  toEnglishDigits(s).replace(/^(\+20|0020|20)(?=1[0125]\d{8}$)/, '0');

// Show or clear an error under a field
function setError(field, message) {
  field.classList.toggle('invalid', Boolean(message));
  field.parentElement.querySelector('.err').textContent = message;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  let valid = true;

  const { name, phone, service, day } = form.elements;
  const phoneValue = normalizePhone(phone.value);

  // Name: at least 3 characters
  if (name.value.trim().length < 3) { setError(name, 'من فضلك اكتب اسمك (٣ أحرف على الأقل).'); valid = false; }
  else setError(name, '');

  // Phone: Egyptian mobile, e.g. 01012345678
  if (!/^01[0125][0-9]{8}$/.test(phoneValue)) { setError(phone, 'اكتب رقم موبايل مصري صحيح من ١١ رقم.'); valid = false; }
  else setError(phone, '');

  // Service and day must be chosen
  if (!service.value) { setError(service, 'اختر الخدمة المطلوبة.'); valid = false; } else setError(service, '');
  if (!day.value) { setError(day, 'اختر اليوم المفضل.'); valid = false; } else setError(day, '');

  if (!valid) return;

  // Build a ready-made WhatsApp message with the booking details
  const text = [
    'السلام عليكم، أريد حجز موعد.',
    `الاسم: ${name.value.trim()}`,
    `الموبايل: ${phoneValue}`,
    `الخدمة: ${service.value}`,
    `اليوم المفضل: ${day.value}`,
  ].join('\n');
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  // Open WhatsApp from a real link click (more reliable than window.open on phones)
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();

  formMsg.textContent = `شكرًا ${name.value.trim()}! جاري فتح واتساب لإرسال طلب الحجز. إن لم يفتح، اضغط زر واتساب الأخضر.`;
  form.reset();
});

// Clear a field's error as soon as the user edits it
form.addEventListener('input', (e) => setError(e.target, ''));

/* ===== 5. Hide broken images so a missing photo never looks broken ===== */
document.querySelectorAll('img').forEach((img) => {
  img.addEventListener('error', () => { img.style.visibility = 'hidden'; });
});
