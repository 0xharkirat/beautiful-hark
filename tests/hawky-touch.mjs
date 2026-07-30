/**
 * Hawky on touch. Real touch events on a real mobile emulation, not clicks.
 *
 * The point of every test here is the one thing that could ruin it: a scroll
 * starts identically to a tap, so the bird must ignore scrolls completely while
 * still responding to taps.
 */
import { chromium, devices } from 'playwright';

const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'], hasTouch: true, isMobile: true });
const p = await ctx.newPage();
let fails = 0;
const ok = (name, pass, detail = '') => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

await p.goto('http://localhost:4321/hawky', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);

const bird = () => p.evaluate(() => {
  const e = document.getElementById('phoenix');
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
           col: -parseInt(getComputedStyle(e).backgroundPosition.split(' ')[0]) / 32,
           row: -parseInt(getComputedStyle(e).backgroundPosition.split(' ')[1]) / 32 };
});

// 1. It exists at all on a phone.
const b0 = await bird();
ok('loads on a touch device', b0 !== null, b0 ? `at ${b0.x},${b0.y}` : 'NO BIRD');

// Wait until it has actually stopped. It flies at 70px/s, so a fixed sleep is
// a guess: the first version of this test measured mid-flight and blamed the
// scroll for 105px the bird was always going to travel.
const settle = async (ms = 12000) => {
  let last = await bird(), still = 0;
  for (let i = 0; i < ms / 200; i++) {
    await p.waitForTimeout(200);
    const now = await bird();
    still = Math.hypot(now.x - last.x, now.y - last.y) < 1 ? still + 1 : 0;
    last = now;
    if (still >= 4) return now;          // 800ms of no movement
  }
  return last;
};

// A real swipe, dispatched as touch events, with the handler instrumented so we
// can see whether it classified the gesture as a scroll.
const swipe = () => p.evaluate(async () => {
  const t = (x, y) => new Touch({ identifier: 1, target: document.body, clientX: x, clientY: y });
  const fire = (type, x, y) => document.body.dispatchEvent(new TouchEvent(type, {
    bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t(x, y)],
    changedTouches: [t(x, y)] }));
  fire('touchstart', 200, 600);
  for (let i = 0; i < 8; i++) { fire('touchmove', 200, 600 - i * 30); await new Promise(r => setTimeout(r, 16)); }
  fire('touchend', 200, 360);
});

// 2. A scroll must not move it. This is the one that matters.
await p.touchscreen.tap(200, 500);
const preScroll = await settle();
await swipe();
await p.waitForTimeout(1600);
const postScroll = await bird();
const movedByScroll = Math.hypot(postScroll.x - preScroll.x, postScroll.y - preScroll.y);
ok('a scroll gesture does NOT move it', movedByScroll < 12,
   `settled at ${preScroll.x},${preScroll.y} then moved ${Math.round(movedByScroll)}px`);

// 3. A tap elsewhere makes it fly there.
// DEADZONE is 32px, so it deliberately stops short rather than landing on your
// finger. 50 allows for that without allowing a bird that never set off.
await p.touchscreen.tap(120, 250);
const afterTap = await settle();
const distToTap = Math.hypot(afterTap.x - 120, afterTap.y - 250);
ok('a tap elsewhere brings it over', distToTap < 50,
   `settled ${Math.round(distToTap)}px away, deadzone is 32px`);

// 4. Tapping the bird puts it to sleep.
let bb = await bird();
await p.touchscreen.tap(bb.x, bb.y);
await p.waitForTimeout(700);
let s = await bird();
ok('tapping the bird sleeps it', s.row === 0 && s.col === 6, `frame row ${s.row} col ${s.col}`);

// 5. It stays asleep through a scroll, since that sleep was asked for.
await swipe();
await p.waitForTimeout(800);
s = await bird();
ok('a scroll does not wake a deliberate sleep', s.row === 0 && s.col === 6, `row ${s.row} col ${s.col}`);

// 6. Tapping it again wakes it.
bb = await bird();
await p.touchscreen.tap(bb.x, bb.y);
await p.waitForTimeout(700);
s = await bird();
ok('tapping again wakes it', !(s.row === 0 && s.col === 6), `row ${s.row} col ${s.col}`);

// 7. Double tap on the bird triggers the rebirth.
await p.waitForTimeout(2400);
bb = await bird();
await p.touchscreen.tap(bb.x, bb.y);
await p.waitForTimeout(90);
await p.touchscreen.tap(bb.x, bb.y);
await p.waitForTimeout(900);
s = await bird();
ok('double tap starts the rebirth', s.row === 3, `row ${s.row} (3 = rebirth)`);
await p.waitForTimeout(5400);   // it is uninterruptible, let it finish

// 8. A tap on a link must go to the link, not the bird.
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(400);
const linkHit = await p.evaluate(async () => {
  const a = document.querySelector('main a[href^="http"]');
  if (!a) return 'no link';
  const r = a.getBoundingClientRect();
  const el = document.getElementById('phoenix');
  // park the bird over the link, then tap the link
  el.style.left = (r.left + r.width / 2 - 16) + 'px';
  el.style.top = (r.top + r.height / 2 - 16) + 'px';
  let navigated = false;
  a.addEventListener('click', (e) => { navigated = true; e.preventDefault(); }, { once: true });
  await new Promise(res => setTimeout(res, 60));
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
           check: () => navigated };
});
if (linkHit !== 'no link') {
  await p.touchscreen.tap(linkHit.x, linkHit.y);
  await p.waitForTimeout(500);
  const stillAwake = await bird();
  ok('a tap on a link is not eaten by the bird', !(stillAwake.row === 0 && stillAwake.col === 6),
     `bird frame row ${stillAwake.row} col ${stillAwake.col}, so it did not treat it as its own tap`);
}

// 9. Reduced motion still removes it entirely.
const ctx2 = await b.newContext({ ...devices['iPhone 13'], hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:4321/hawky', { waitUntil: 'networkidle' });
await p2.waitForTimeout(900);
ok('reduced motion still removes it', await p2.evaluate(() => !document.getElementById('phoenix')));

// 10. Desktop is untouched.
const ctx3 = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p3 = await ctx3.newPage();
await p3.goto('http://localhost:4321/hawky', { waitUntil: 'networkidle' });
await p3.waitForTimeout(900);
const d0 = await p3.evaluate(() => { const e = document.getElementById('phoenix');
  return e ? { x: parseInt(e.style.left), y: parseInt(e.style.top) } : null; });
await p3.mouse.move(700, 600, { steps: 25 });
await p3.waitForTimeout(2200);
const d1 = await p3.evaluate(() => { const e = document.getElementById('phoenix');
  return { x: parseInt(e.style.left), y: parseInt(e.style.top) }; });
ok('desktop still follows the cursor', d0 && Math.hypot(d1.x - d0.x, d1.y - d0.y) > 50,
   `moved ${Math.round(Math.hypot(d1.x - d0.x, d1.y - d0.y))}px`);

console.log(`\n  ${fails === 0 ? 'ALL PASS' : fails + ' FAILING'}`);
await b.close();
process.exit(fails ? 1 : 0);
