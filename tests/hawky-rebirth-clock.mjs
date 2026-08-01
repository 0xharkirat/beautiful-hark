/**
 * The rebirth fires on the hour, or not at all.
 *
 * The bug this guards: leave the page at 09:55, come back at 10:03, and the
 * missed 10:00 rebirth used to play right then. A burn three minutes past the
 * hour reads as broken, because the whole conceit is that it happens on the
 * hour and the hover bubble counts down to exactly that.
 *
 * Uses Playwright's clock emulation rather than waiting for a real hour, so
 * each case runs in milliseconds and the awkward ones (laptop sleep, a tab
 * hidden across the turn) are reachable at all.
 */
import { chromium } from 'playwright';

const b = await chromium.launch();
let fails = 0;
const ok = (name, pass, detail = '') => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

const REBIRTH_ROW = 3;

/** Fresh page with the clock parked at a chosen wall time. */
const openAt = async (iso) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date(iso) });
  await p.goto('http://localhost:4321/hawky', { waitUntil: 'networkidle' });
  await p.clock.runFor(1500);      // let it settle and claim the arrival hour
  return { ctx, p };
};

const row = (p) => p.evaluate(() => {
  const e = document.getElementById('phoenix');
  if (!e) return null;
  return -parseInt(getComputedStyle(e).backgroundPosition.split(' ')[1]) / 32;
});

/** True if the bird burns at any point over the next `ms` of emulated time. */
const burnsWithin = async (p, ms) => {
  for (let t = 0; t < ms; t += 2000) {
    await p.clock.runFor(2000);
    if (await row(p) === REBIRTH_ROW) return true;
  }
  return false;
};

// 1. The normal case still works: watching when the hour turns.
{
  const { ctx, p } = await openAt('2026-07-31T09:59:40');
  ok('burns when the hour turns while you are watching', await burnsWithin(p, 60000));
  await ctx.close();
}

// 2. THE BUG. Away across the turn, back well after it. Must not burn.
{
  const { ctx, p } = await openAt('2026-07-31T09:55:00');
  await p.evaluate(() => {
    Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await p.clock.runFor(8 * 60 * 1000);        // 09:55 -> 10:03, hidden throughout
  await p.evaluate(() => {
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const burned = await burnsWithin(p, 20000);
  ok('does NOT replay a rebirth missed 3 minutes ago', !burned,
     burned ? 'it burned on return, which is the bug' : 'stayed put, as it should');
  await ctx.close();
}

// 3. The near miss still pays out. Away for seconds, not minutes.
{
  const { ctx, p } = await openAt('2026-07-31T09:59:50');
  await p.evaluate(() => {
    Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await p.clock.runFor(25000);                // 09:59:50 -> 10:00:15, hidden
  await p.evaluate(() => {
    Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  ok('still burns if you glanced away for seconds', await burnsWithin(p, 20000),
     'within the 60s grace, so the moment has not passed');
  await ctx.close();
}

// 4. Laptop sleep. The tab was never hidden, the clock simply jumped.
//    This is the half that a visibility check alone would miss.
{
  const { ctx, p } = await openAt('2026-07-31T09:55:00');
  await p.clock.setFixedTime(new Date('2026-07-31T10:03:00'));
  await p.clock.install({ time: new Date('2026-07-31T10:03:00') });
  const burned = await burnsWithin(p, 20000);
  ok('does NOT burn late after the clock jumps forward', !burned,
     burned ? 'fired at 10:03, which is the same staleness by another route' : 'skipped it');
  await ctx.close();
}

// 5. Having skipped 10:00, it must still burn at 11:00.
{
  const { ctx, p } = await openAt('2026-07-31T10:03:00');
  await p.clock.runFor(57 * 60 * 1000);       // 10:03 -> 11:00, visible throughout
  ok('the next hour still burns after a skipped one', await burnsWithin(p, 60000));
  await ctx.close();
}

console.log(`\n  ${fails === 0 ? 'ALL PASS' : fails + ' FAILING'}`);
await b.close();
process.exit(fails ? 1 : 0);
