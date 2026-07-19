import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const read = (file) => fs.readFileSync(path.join(projectRoot, file), "utf8");

const requiredFiles = [
  "index.html",
  "style.css",
  "script.js",
  "favicon.svg",
  ".nojekyll",
  ".gitignore",
  "README.md",
  "AGENTS.md",
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(path.join(projectRoot, file)), `Missing required file: ${file}`);
}

const html = read("index.html");
const css = read("style.css");
const javascript = read("script.js");
const gitignore = read(".gitignore");
const runtimeSources = `${html}\n${css}\n${javascript}`;

assert.match(html, /<!doctype html>/i, "Missing HTML5 doctype");
assert.match(html, /<html lang="en">/i, "Missing page language");
assert.match(html, /http-equiv="Content-Security-Policy"/i, "Missing Content Security Policy");
assert.match(html, /connect-src 'none'/, "Content Security Policy permits network connections");
assert.match(html, /name="referrer" content="no-referrer"/, "Missing referrer policy");
assert.match(html, /<svg[\s>]/i, "Missing house SVG");
assert.match(html, /id="doorbell-button"/, "Missing doorbell control");
assert.match(html, /id="sound-toggle"/, "Missing sound control");
assert.match(html, /id="reset-button"/, "Missing reset control");
assert.match(html, /href="\.\.\/TinyChaos\/"/, "Missing TinyChaos gallery navigation");
assert.match(html, /role="status"/, "Missing live status region");
assert.match(html, /href="favicon\.svg"/, "Missing favicon link");
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/, "Missing reduced-motion styles");
assert.match(css, /@media \(max-width: 700px\)/, "Missing responsive breakpoint");
assert.match(javascript, /AudioContext/, "Missing generated audio implementation");
assert.match(javascript, /localStorage/, "Missing attempt persistence");
assert.match(javascript, /state\.attempts === RARE_THRESHOLD/, "Tenth-attempt unlock is not guaranteed");
assert.doesNotMatch(runtimeSources, /https?:\/\//i, "Runtime contains an external URL");
assert.doesNotMatch(runtimeSources, /<img\b/i, "Runtime uses an image element");
assert.doesNotMatch(css, /@import\b/i, "Stylesheet imports an external resource");
assert.doesNotMatch(javascript, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|eval|Function)\b/, "Potential unsafe JavaScript sink found");

for (const ignoredPattern of [".env.*", "*.pem", "*.key", "*.jks", "node_modules/", "dist/"]) {
  assert.ok(gitignore.includes(ignoredPattern), `.gitignore is missing ${ignoredPattern}`);
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicate HTML or SVG id found");

const localResources = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((resource) => !resource.startsWith("#") && resource !== "../TinyChaos/");

for (const resource of localResources) {
  assert.ok(fs.existsSync(path.join(projectRoot, resource)), `Broken local resource: ${resource}`);
}

const expectedReactions = [
  "window",
  "eye",
  "sign",
  "lights-out",
  "ring-back",
  "open-close",
  "cardboard",
  "hand",
  "rare",
];

for (const reaction of expectedReactions) {
  assert.ok(javascript.includes(`case "${reaction}"`), `Missing reaction branch: ${reaction}`);
}

let cssBraceDepth = 0;
for (const character of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
  if (character === "{") cssBraceDepth += 1;
  if (character === "}") cssBraceDepth -= 1;
  assert.ok(cssBraceDepth >= 0, "CSS has an unexpected closing brace");
}
assert.equal(cssBraceDepth, 0, "CSS braces are unbalanced");

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }

  toggle(name, force) {
    const next = force === undefined ? !this.values.has(name) : Boolean(force);
    next ? this.values.add(name) : this.values.delete(name);
    return next;
  }
}

class FakeElement {
  constructor() {
    this.classList = new FakeClassList();
    this.handlers = {};
    this.attributes = {};
    this.disabled = false;
    this.value = "";
    this.title = "";
    this.textContent = "";
    this.icon = null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener(name, handler) {
    this.handlers[name] = handler;
  }

  querySelector() {
    return this.icon;
  }
}

const selectors = [
  "#house-stage",
  "#doorbell-button",
  "#sound-toggle",
  "#sound-label",
  "#reset-button",
  "#attempt-count",
  "#rare-status",
  "#scene-status",
  "#reaction-bubble",
];
const elements = Object.fromEntries(selectors.map((selector) => [selector, new FakeElement()]));
elements["#sound-toggle"].icon = new FakeElement();

const storage = new Map([["shyDoorbell.sound", "off"]]);
const testWindow = {
  matchMedia: () => ({ matches: true }),
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  setTimeout: (callback) => {
    callback();
    return 1;
  },
};
const testDocument = {
  querySelector: (selector) => elements[selector] ?? null,
};

vm.runInNewContext(javascript, {
  window: testWindow,
  document: testDocument,
  console,
});

for (let attempt = 0; attempt < 10; attempt += 1) {
  await elements["#doorbell-button"].handlers.click();
}

assert.equal(elements["#attempt-count"].textContent, "10", "Attempt count did not reach ten");
assert.equal(elements["#rare-status"].textContent, "Mystery unlocked", "Rare reaction did not unlock");
assert.equal(elements["#doorbell-button"].disabled, false, "Doorbell remained disabled");
assert.equal(elements["#house-stage"].classList.values.size, 0, "Scene state did not clean up");

elements["#sound-toggle"].handlers.click();
assert.equal(elements["#sound-label"].textContent, "Sound on", "Sound did not turn on");
elements["#sound-toggle"].handlers.click();
assert.equal(elements["#sound-label"].textContent, "Sound off", "Sound did not turn off");

elements["#reset-button"].handlers.click();
assert.equal(elements["#attempt-count"].textContent, "0", "Reset did not clear attempts");
assert.equal(storage.has("shyDoorbell.attempts"), false, "Reset did not clear stored attempts");

console.log(
  `Verification passed: ${requiredFiles.length} required files, ${ids.length} unique ids, ${expectedReactions.length} reaction branches, and the ten-ring interaction flow.`,
);
