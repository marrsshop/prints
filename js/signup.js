// Mailing list signup
// TODO: replace the placeholder handler below with a Mailchimp API call once connected

async function handleSignup(email) {
  // Placeholder — will be replaced with Mailchimp API call
  // Return true to simulate success for now
  console.log('Signup email:', email);
  return true;
}

function setupSignupForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('.signup-input');
    const btn = form.querySelector('.signup-btn');
    const email = input.value.trim();
    if (!email) return;

    btn.textContent = '...';
    btn.disabled = true;

    const ok = await handleSignup(email);

    if (ok) {
      input.value = '';
      btn.textContent = 'Thanks!';
      setTimeout(() => {
        btn.textContent = 'Sign up';
        btn.disabled = false;
      }, 3000);
    } else {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  });
}

setupSignupForm('footer-signup');
setupSignupForm('contact-signup');
setupSignupForm('popup-signup');

const overlay = document.getElementById('signup-overlay');
const closeBtn = document.getElementById('signup-popup-close');

if (overlay && closeBtn) {
  const dismiss = () => {
    overlay.classList.add('hidden');
    sessionStorage.setItem('popupSeen', '1');
  };

  if (sessionStorage.getItem('popupSeen')) {
    overlay.classList.add('hidden');
  }

  closeBtn.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) dismiss();
  });

  const popupForm = document.getElementById('popup-signup');
  if (popupForm) {
    popupForm.addEventListener('submit', () => {
      setTimeout(dismiss, 2000);
    });
  }
}
