const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.querySelector('.sr-only').textContent = open ? 'Open navigation' : 'Close navigation';
  nav?.classList.toggle('is-open', !open);
});

nav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.querySelector('.sr-only').replaceChildren('Open navigation');
    nav.classList.remove('is-open');
  }
});

const filters = [...document.querySelectorAll('[data-filter]')];
const menuItems = [...document.querySelectorAll('[data-category]')];

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    menuItems.forEach((item) => {
      item.hidden = filter !== 'all' && item.dataset.category !== filter;
    });
  });
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const todayHours = document.querySelector('[data-today-hours]');
if (todayHours) {
  const weekday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    timeZone: 'Europe/London',
  }).format(new Date());
  const hoursByDay = {
    Monday: 'Closed',
    Tuesday: '5:00–10:30pm',
    Wednesday: '5:00–10:30pm',
    Thursday: '5:00–10:30pm',
    Friday: '12:00–11:00pm',
    Saturday: '12:00–11:00pm',
    Sunday: '12:00–8:00pm',
  };
  todayHours.textContent = hoursByDay[weekday] || 'See opening hours';
}
