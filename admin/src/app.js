// App shell: persistent top bar + sidebar, client-side routing, mobile drawer.
import { I, svg } from './icons.js';
import { renderDashboard } from './dashboard.js';
import { renderPartners } from './partners.js';
import { renderCars } from './cars.js';
import { renderDrivers } from './drivers.js';
import { renderCarBookings } from './carbookings.js';
import { renderTravelBookings } from './travelbookings.js';
import { renderPayments } from './payments.js';
import { renderExpenses } from './expenses.js';
import { renderSettlements } from './settlements.js';

export const SHELL_HTML = `<div class="tt">
  <div class="tt-top">
    <div class="tt-brand">
      <button class="tt-burger" id="tt-burger" aria-label="Open menu">${svg(I.menu)}</button>
      <span class="tt-logo"></span><span class="tt-word">TRIPPIN'&nbsp;TRAVELS</span>
    </div>
    <span class="tt-admin">ADMIN</span>
  </div>
  <div class="tt-shell">
    <div class="tt-scrim" id="tt-scrim"></div>
    <aside class="tt-side" id="tt-side"></aside>
    <main class="tt-main" id="tt-main" style="position:relative;"></main>
  </div>
</div>`;

const NAV = [
  { sec:'Overview',       items:[{k:'dashboard', ic:'dash', label:'Dashboard'}] },
  { sec:'Operations',     items:[{k:'travel', ic:'travel', label:'Travel bookings'},{k:'carb', ic:'car', label:'Car bookings'},{k:'payments', ic:'pay', label:'Payments'}] },
  { sec:'Fleet & people', items:[{k:'cars', ic:'fleet', label:'Cars'},{k:'drivers', ic:'driver', label:'Drivers'},{k:'partners', ic:'partners', label:'Partners'}] },
  { sec:'Finance',        items:[{k:'expenses', ic:'expense', label:'Expenses'},{k:'settlements', ic:'settle', label:'Settlements'}] },
];

const SCREENS = { dashboard: renderDashboard, partners: renderPartners, cars: renderCars, drivers: renderDrivers, carb: renderCarBookings, travel: renderTravelBookings, payments: renderPayments, expenses: renderExpenses, settlements: renderSettlements };
let current = 'dashboard';

function buildSidebar(){
  const side = document.getElementById('tt-side'); if (!side) return;
  let h = '<div class="tt-acct"><div class="av">A</div><div><div class="nm">Administrator</div><div class="sub">signed in (dev)</div></div></div>';
  NAV.forEach(g => {
    h += '<div class="tt-navsec">' + g.sec + '</div>';
    g.items.forEach(it => {
      h += '<div class="tt-nav' + (it.k === current ? ' on' : '') + '" data-screen="' + it.k + '">' + svg(I[it.ic]) + '<span>' + it.label + '</span></div>';
    });
  });
  side.innerHTML = h;
  side.querySelectorAll('[data-screen]').forEach(el =>
    el.addEventListener('click', () => { navigate(el.getAttribute('data-screen')); closeMenu(); }));
}

function labelOf(k){ for (const g of NAV) for (const it of g.items) if (it.k === k) return it.label; return k; }

function placeholder(main, label){
  main.innerHTML =
    '<div class="tt-head"><div><h1 class="tt-h1">' + label + '</h1><div class="tt-lede">Coming next.</div></div></div>' +
    '<div class="tt-card"><div class="tt-empty">This screen is on the way.</div></div>';
}

function navigate(k){
  current = k;
  buildSidebar();
  const main = document.getElementById('tt-main'); if (!main) return;
  main.style.position = 'relative';
  const fn = SCREENS[k];
  if (fn) fn(main); else placeholder(main, labelOf(k));
  main.scrollTop = 0;
}

function openMenu(){ const r = document.getElementById('dash-root'); if (r) r.classList.add('nav-open'); }
function closeMenu(){ const r = document.getElementById('dash-root'); if (r) r.classList.remove('nav-open'); }

export function initApp(){
  buildSidebar();
  const b = document.getElementById('tt-burger'); if (b) b.addEventListener('click', openMenu);
  const sc = document.getElementById('tt-scrim'); if (sc) sc.addEventListener('click', closeMenu);
  // screens (e.g. dashboard action links) request navigation via a tt-nav event
  document.addEventListener('tt-nav', (e) => { const k = e.detail; if (k && NAV.some(g => g.items.some(it => it.k === k))) { navigate(k); closeMenu(); } });
  navigate('dashboard');
}
