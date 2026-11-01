import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/');
  const cards = page.locator('.work-card');
  assert.equal(await cards.count(), 48);
  assert.equal(await page.locator('.work-preview').count(), 0);
  await cards.first().hover();
  await page.waitForSelector('.preview-playing video');
  const video = page.locator('.work-preview');
  const t = await video.evaluate(video => video.currentTime);
  await page.waitForTimeout(450);
  assert.ok(await video.evaluate(video => video.muted && video.loop && !video.paused && video.currentTime > 0));
  assert.notEqual(await video.evaluate(video => video.currentTime), t);
  await page.mouse.move(0, 0);
  assert.equal(await page.locator('.work-preview').count(), 0);
  console.log('PASS: video plays muted, advances, loops and releases on leave.');

  await cards.nth(1).hover();
  await page.waitForSelector('.preview-playing iframe');
  assert.equal(await page.locator('.work-preview').count(), 1);
  await page.screenshot({ path: 'previews/hover-demo-desktop.png' });
  await cards.nth(2).hover();
  await page.waitForSelector('.preview-playing iframe');
  assert.equal(await page.locator('.work-preview').count(), 1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.work-preview').count(), 0);
  await page.mouse.move(0, 0);
  await cards.nth(2).hover();
  await page.waitForSelector('.preview-playing');
  await page.locator('[data-filter="cycling"]').click();
  assert.equal(await page.locator('.work-preview').count(), 0);
  await cards.first().hover();
  await page.waitForSelector('.preview-playing iframe');
  await page.evaluate(() => document.querySelector('#about').scrollIntoView());
  await page.waitForFunction(() => !document.querySelector('.work-preview'));
  console.log('PASS: live scenes, single active preview, Escape, filters and offscreen cleanup.');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await cards.first().hover();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.work-preview').count(), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await cards.first().locator('.work-image').focus();
  await page.waitForSelector('.preview-playing iframe');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.work-preview').count(), 0);
  console.log('PASS: reduced motion and keyboard preview.');

  // Exercise every card through the same user interaction, including module-based works.
  await page.locator('[data-filter="all"]').click();
  const works = JSON.parse(await fs.readFile('assets/works.json', 'utf8'));
  for (const work of works) {
    await page.mouse.move(0, 0);
    const link = page.locator(`.work-image[href="${work.url}"]`);
    await link.hover();
    await page.waitForFunction(url => document.querySelector(`.preview-playing .work-image[href="${url}"]`), work.url, { timeout: 25000 });
    assert.equal(await page.locator('.work-preview').count(), 1);
    console.log('PREVIEW', work.id);
  }
  await page.mouse.move(0, 0);
  assert.deepEqual(errors, []);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto('http://127.0.0.1:4173/');
  await mobile.locator('#works').scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator('.work-preview').count(), 0);
  const popup = mobile.waitForEvent('popup');
  await mobile.locator('.work-image').first().tap();
  await (await popup).close();
  assert.equal(await mobile.locator('.work-preview').count(), 0);
  for (const viewport of [{ width: 375, height: 844 }, { width: 844, height: 375 }]) {
    await mobile.setViewportSize(viewport);
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  console.log('PASS: all 48 previews, no runtime errors, touch navigation and mobile layout.');
} finally {
  await browser.close();
}
