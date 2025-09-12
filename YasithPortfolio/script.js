// Smooth FLIP-style animation: clone hero image, animate it to navbar avatar position.
// Works on scroll crossing hero bottom -> navbar height.

const heroImg = document.getElementById('heroPhoto');
const navAvatar = document.getElementById('navAvatar');
const navbar = document.getElementById('navbar');

let isShrunk = false;         // whether avatar is shown in navbar
let animating = false;        // avoid double animations

// Helper: create a positioned clone of the hero image at its current viewport coords
function createCloneAt(rect) {
  const clone = heroImg.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.borderRadius = '50%';
  clone.style.objectFit = 'cover';
  clone.style.zIndex = 9999;
  clone.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1), opacity 200ms';
  clone.style.willChange = 'transform';
  document.body.appendChild(clone);
  return clone;
}

function animateToNav() {
  if (isShrunk || animating) return;
  const heroRect = heroImg.getBoundingClientRect();
  const navRect = navAvatar.getBoundingClientRect();
  animating = true;

  const clone = createCloneAt(heroRect);
  // Make original invisible while animating
  heroImg.style.visibility = 'hidden';

  // Compute center-based translation (so scale occurs from center)
  const heroCenterX = heroRect.left + heroRect.width / 2;
  const heroCenterY = heroRect.top + heroRect.height / 2;
  const navCenterX = navRect.left + navRect.width / 2;
  const navCenterY = navRect.top + navRect.height / 2;

  const translateX = navCenterX - heroCenterX;
  const translateY = navCenterY - heroCenterY;
  const scale = navRect.width / heroRect.width;

  // Trigger transform on next frame
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    clone.style.opacity = '1';
  });

  clone.addEventListener('transitionend', function onEnd(e) {
    // ensure we respond to the transform transition end
    if (e.propertyName.indexOf('transform') === -1) return;
    clone.removeEventListener('transitionend', onEnd);

    // show navAvatar (small)
    navAvatar.classList.add('visible');

    // cleanup clone
    clone.remove();

    isShrunk = true;
    animating = false;
  });
}

function animateToHero() {
  if (!isShrunk || animating) return;
  const heroRect = heroImg.getBoundingClientRect();
  const navRect = navAvatar.getBoundingClientRect();
  animating = true;

  // Create clone at nav position
  const clone = navAvatar.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${navRect.left}px`;
  clone.style.top = `${navRect.top}px`;
  clone.style.width = `${navRect.width}px`;
  clone.style.height = `${navRect.height}px`;
  clone.style.borderRadius = '50%';
  clone.style.objectFit = 'cover';
  clone.style.zIndex = 9999;
  clone.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1), opacity 200ms';
  document.body.appendChild(clone);

  // hide nav avatar immediately
  navAvatar.classList.remove('visible');

  const navCenterX = navRect.left + navRect.width / 2;
  const navCenterY = navRect.top + navRect.height / 2;
  const heroCenterX = heroRect.left + heroRect.width / 2;
  const heroCenterY = heroRect.top + heroRect.height / 2;

  const translateX = heroCenterX - navCenterX;
  const translateY = heroCenterY - navCenterY;
  const scale = heroRect.width / navRect.width;

  // Trigger transform
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  });

  clone.addEventListener('transitionend', function onEnd(e) {
    if (e.propertyName.indexOf('transform') === -1) return;
    clone.removeEventListener('transitionend', onEnd);

    // reveal original hero again
    heroImg.style.visibility = 'visible';

    clone.remove();
    isShrunk = false;
    animating = false;
  });
}

// Determine threshold: when hero bottom passes navbar bottom
function checkScroll() {
  const heroRect = heroImg.getBoundingClientRect();
  const navbarHeight = navbar.offsetHeight;
  // When hero's bottom <= navbarHeight + small padding => animate to nav
  if (heroRect.bottom <= navbarHeight + 8) {
    animateToNav();
  } else {
    animateToHero();
  }
}

// Init: make sure navAvatar has same src as hero (you can remove if already same)
if (navAvatar && heroImg) {
  navAvatar.src = heroImg.src;
}

// Throttle scroll to animation frames
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      checkScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// Also check on resize (positions change)
window.addEventListener('resize', () => {
  // if animation in progress we skip; otherwise re-evaluate
  if (!animating) checkScroll();
});

// Small demo form submit
document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you! Your message has been sent.');
});



