import { toastInfo } from './api.js';

const menuBtn = document.getElementById('home-menu-btn');
const navLinks = document.getElementById('home-nav-links');
const dropdownItems = document.querySelectorAll('.home-nav-item.has-dropdown');

menuBtn?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});

dropdownItems.forEach((item) => {
  const trigger = item.querySelector('.home-nav-trigger');
  trigger?.addEventListener('click', (e) => {
    if (window.innerWidth > 900) return;
    e.preventDefault();
    item.classList.toggle('open');
  });
});

document.addEventListener('click', (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  if (!target.closest('.home-nav')) {
    dropdownItems.forEach((item) => item.classList.remove('open'));
  }
});

document.getElementById('booking-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  toastInfo('Booking started. Connect this form to your booking endpoint when ready.');
});
