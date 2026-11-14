import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.SITE_URL || "http://127.0.0.1:4321";
const OUT = "/opt/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function log(step, ok, detail = "") {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${step}${detail ? " — " + detail : ""}`);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function signUp(page, email, password) {
  await page.goto(`${BASE}/auth/`, { waitUntil: "networkidle" });
  // Switch to sign up if needed
  const switchBtn = page.getByRole("button", { name: /Need an account/i });
  if (await switchBtn.count()) {
    await switchBtn.click();
  }
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /^Sign up$/i }).click();
  await page.waitForTimeout(2000);
}

async function signOut(page) {
  const btn = page.getByRole("button", { name: /Sign out/i }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(1000);
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

try {
  // A1 homepage 375
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".introduction h1", { timeout: 15000 });
  const h1 = await page.locator(".introduction h1").textContent();
  log("home-375-load", !!h1?.includes("Santosh"), h1?.trim());
  await page.locator(".nav-toggle").click();
  await page.waitForTimeout(400);
  const menuVisible = await page.locator("#site-nav").isVisible();
  log("home-375-mobile-menu", menuVisible);
  await shot(page, "home-mobile-375");

  // A2 768
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".introduction h1");
  await shot(page, "home-tablet-768");
  log("home-768", true);

  // A3 1280
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".introduction h1");
  const blogs = await page.locator(".blogs a").count();
  log("home-1280-blogs", blogs >= 3, `blog links=${blogs}`);
  await shot(page, "home-desktop-1280");

  // Blog list
  await page.goto(`${BASE}/blog/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".blog-list", { timeout: 15000 });
  const postLinks = await page.locator(".blog-list a").count();
  log("blog-list", postLinks >= 3, `posts=${postLinks}`);
  await shot(page, "blog-list-desktop");

  // Blog post
  await page.goto(`${BASE}/blog/design-thinking/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".blog-body", { timeout: 15000 });
  const bodyText = await page.locator(".blog-body").textContent();
  log("blog-post", (bodyText || "").includes("design thinking"), "content loaded");
  await shot(page, "blog-post-design-thinking");

  // FAQ + RSS + auth page
  await page.goto(`${BASE}/about/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".faq h1", { timeout: 15000 });
  log("faq", true);
  const rss = await page.goto(`${BASE}/rss.xml`, { waitUntil: "networkidle" });
  const rssOk = rss?.ok() && (await rss.text()).includes("<rss");
  log("rss", !!rssOk);
  await page.goto(`${BASE}/auth/`, { waitUntil: "networkidle" });
  log("auth-page", await page.locator(".auth-panel, .auth-signed-in").count() > 0);

  // Public user signup
  await signOut(page);
  await signUp(page, "public.user@example.com", "TestPass123!");
  const signedInPublic = await page.locator(".auth-signed-in").count();
  log("public-signup", signedInPublic > 0, await page.locator(".auth-signed-in").textContent().catch(() => ""));
  await shot(page, "public-signed-in");

  // Denial
  await page.goto(`${BASE}/personal-stuff/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const denial = await page.locator(".admin-gate").textContent().catch(() => "");
  const hasCms = await page.locator(".admin-app").count();
  const denied = (denial || "").includes("404") || (denial || "").toLowerCase().includes("private");
  log("non-admin-denied", denied && hasCms === 0, denial?.trim());
  await shot(page, "personal-stuff-denied");

  // Like + comment
  await page.goto(`${BASE}/blog/design-thinking/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".engagement", { timeout: 15000 });
  await page.getByRole("button", { name: /Like/i }).click();
  await page.waitForTimeout(1000);
  await page.locator(".comment-form textarea").fill("Nice post from public user!");
  await page.getByRole("button", { name: /Post comment/i }).click();
  await page.waitForTimeout(1500);
  const commentOk = (await page.locator(".comment-list").textContent())?.includes("Nice post");
  log("like-comment", !!commentOk);
  await shot(page, "blog-liked-commented");

  // Sign out
  await page.goto(`${BASE}/auth/`, { waitUntil: "networkidle" });
  await signOut(page);
  log("public-signout", await page.locator(".auth-panel").count() > 0);

  // Admin signup
  await signUp(page, "santosh@example.com", "TestPass123!");
  await page.waitForTimeout(1500);
  const adminBadge = (await page.locator(".auth-signed-in").textContent().catch(() => "")) || "";
  log("admin-signup", adminBadge.includes("santosh@example.com"), adminBadge.trim());
  await shot(page, "admin-signed-in");

  await page.goto(`${BASE}/personal-stuff/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".admin-app", { timeout: 15000 });
  log("admin-access", true);
  await shot(page, "admin-dashboard");

  // Private file upload
  await page.getByRole("button", { name: /Private files/i }).click();
  await page.waitForTimeout(500);
  const tmpFile = "/tmp/hello-private.txt";
  fs.writeFileSync(tmpFile, "secret notes for admin only\n");
  await page.locator('input[type="file"]').first().setInputFiles(tmpFile);
  await page.waitForTimeout(2500);
  const fileListed = (await page.locator(".file-list").textContent())?.includes("hello-private.txt");
  log("private-file-upload", !!fileListed);
  await shot(page, "admin-private-file-uploaded");

  // Preview
  const previewBtn = page.getByRole("button", { name: /^Preview$/i }).first();
  if (await previewBtn.count()) {
    await previewBtn.click();
    await page.waitForTimeout(1500);
    log("private-file-preview", await page.locator(".preview-box").count() > 0);
  } else {
    log("private-file-preview", false, "no preview button");
  }

  // Delete
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /^Delete$/i }).first().click();
  await page.waitForTimeout(1500);
  const gone = !(await page.locator(".file-list").textContent())?.includes("hello-private.txt");
  log("private-file-delete", !!gone);
  await shot(page, "admin-private-file-deleted");

  // Create published post
  await page.getByRole("button", { name: /Blog CMS/i }).click();
  await page.waitForTimeout(400);
  await page.locator('.admin-form input').nth(0).fill("Cloud Agent Verification Post");
  await page.locator('.admin-form input').nth(1).fill("cloud-agent-verification-post");
  await page.locator(".admin-form textarea").nth(0).fill("Published during E2E verification");
  await page.locator(".admin-form textarea").nth(1).fill("## Hello\n\nThis post was created by the cloud agent.");
  await page.locator('.admin-form input[type="checkbox"]').check();
  await page.getByRole("button", { name: /Create post/i }).click();
  await page.waitForTimeout(2000);
  const created = (await page.locator(".file-list").textContent())?.includes("Cloud Agent Verification Post");
  log("cms-create-publish", !!created);
  await shot(page, "admin-post-created");

  // Public appearance
  await page.goto(`${BASE}/blog/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".blog-list", { timeout: 15000 });
  const appears = (await page.locator(".blog-list").textContent())?.includes("Cloud Agent Verification Post");
  log("public-sees-new-post", !!appears);
  await page.goto(`${BASE}/blog/cloud-agent-verification-post/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".blog-body", { timeout: 15000 });
  const pubBody = (await page.locator(".blog-body").textContent()) || "";
  log("public-new-post-body", pubBody.includes("cloud agent"));
  await shot(page, "public-new-post");

  // Mobile menu on blog 375
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/blog/`, { waitUntil: "networkidle" });
  await page.locator(".nav-toggle").click();
  await page.waitForTimeout(400);
  log("blog-375-menu", await page.locator("#site-nav").isVisible());
  await shot(page, "blog-mobile-menu-375");

  // Overflow check: scrollWidth
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  log("no-horizontal-overflow-375", !overflow, overflow ? "overflow detected" : "ok");
} catch (err) {
  console.error("E2E crashed:", err);
  await shot(page, "e2e-crash");
  log("e2e-crash", false, String(err));
} finally {
  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log("\n=== SUMMARY ===");
  console.log(`passed=${results.filter((r) => r.ok).length} failed=${failed.length}`);
  if (failed.length) console.log(failed);
  fs.writeFileSync(path.join(OUT, "e2e-results.json"), JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
}
