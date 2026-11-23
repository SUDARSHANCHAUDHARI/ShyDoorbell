# ShyDoorbell

ShyDoorbell is a standalone interactive cartoon about a resident who would rather not answer the door. Ring the bell, watch the resident panic, and discover an increasingly elaborate collection of avoidance tactics.

The complete experience runs in the browser using semantic HTML, CSS, inline SVG, and vanilla JavaScript. It has no external images, audio files, fonts, frameworks, runtime dependencies, analytics, build system, or backend service.

## Table of Contents

- [Project status](#project-status)
- [Experience](#experience)
- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Controls](#controls)
- [Verify](#verify)
- [Accessibility](#accessibility)
- [Privacy and security](#privacy-and-security)
- [Project structure](#project-structure)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Release checklist](#release-checklist)
- [License and ownership](#license-and-ownership)
- [About](#about)

## Project status

- **Application:** Production-ready
- **Repository:** Public
- **Default branch:** `main`
- **Deployment:** Live on GitHub Pages at <https://sudarshanchaudhari.github.io/ShyDoorbell/>
- **Build step:** None
- **Primary quality gate:** `node scripts/verify.mjs`

The repository is published and GitHub Pages serves it from `main` at the root.

## Experience

Pressing the doorbell starts a complete animated visit:

1. A generated doorbell chime plays.
2. The porch light turns on.
3. The door opens slightly.
4. The shy resident peeks outside.
5. The resident notices the visitor.
6. The door closes quickly.
7. One randomized avoidance reaction follows.

The normal reaction pool contains:

- Looking through the window
- Showing only one eye
- Hanging a “Not Home” sign
- Turning off the porch light
- Pressing the doorbell back
- Opening and immediately closing the door
- Sending out a cardboard assistant
- Showing only a hand

The tenth attempt guarantees a secret full greeting. Later attempts retain a small chance of showing that rare reaction again, and normal reactions do not repeat consecutively.

## Features

- Responsive, original SVG house illustration with a door, window, porch light, doorbell, and hidden character
- Smooth CSS and SVG state transitions with a reduced-motion alternative
- Generated doorbell, gasp, switch, slam, ring-back, and secret-reaction sounds using the Web Audio API
- Sound toggle that immediately stops active generated audio
- Persistent attempt count and sound preference using browser local storage
- Reset control that cancels the current sequence and clears attempt history
- Native keyboard-accessible buttons and a skip link
- Live status announcements and descriptive SVG text for assistive technology
- Visible keyboard focus and increased-contrast support
- Restrictive Content Security Policy with no runtime network access
- Relative asset paths and `.nojekyll` support for project-site GitHub Pages hosting

## Technology

| Area | Implementation |
| --- | --- |
| Structure | Semantic HTML5 |
| Illustration | Original inline SVG and local SVG favicon |
| Presentation | CSS custom properties, responsive layout, transitions, and media queries |
| Interaction | Vanilla JavaScript |
| Audio | Generated Web Audio oscillators and noise buffers |
| Persistence | Web Storage API (`localStorage`) |
| Hosting | Static files served from the repository root |
| Verification | Dependency-free Node.js contract and interaction harness |

## Requirements

### Runtime

- A current evergreen browser
- JavaScript enabled
- Web Audio support for sound effects; the visual experience remains functional without it

### Development and verification

- A current Node.js release for `scripts/verify.mjs`
- Any static file server for local HTTP testing

No package manager or dependency installation is required.

## Run locally

Clone the repository and enter the project directory:

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/ShyDoorbell.git
cd ShyDoorbell
```

The repository is public, so cloning requires no authentication.

You can open `index.html` directly or serve the directory locally:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Modern browsers allow audio only after user interaction, so generated sounds begin after the first control press. When local storage is blocked or unavailable, the interaction still works but preferences and attempts do not persist across reloads.

## Controls

- Activate the red doorbell with a pointer, <kbd>Enter</kbd>, or <kbd>Space</kbd> to start a visit.
- Use **Sound on/off** to control all generated sound effects.
- Use **Reset** to cancel the current interaction, return the attempt counter to zero, and lock the secret reaction again.

## Verify

Run the complete dependency-free production gate:

```sh
node scripts/verify.mjs
```

The verification command checks:

- Required production and repository files
- JavaScript execution and scene cleanup
- Every normal reaction and the secret reaction branch
- The complete ten-ring flow and guaranteed unlock
- Sound toggle and Reset behavior
- Duplicate HTML and SVG identifiers
- Local resource integrity and absence of remote runtime URLs
- Content Security Policy and referrer policy
- Unsafe DOM-injection primitives
- Responsive and reduced-motion contracts
- `.gitignore` coverage for secrets, keys, dependencies, and generated output

Visual polish still requires a brief manual review in current phone and desktop browsers. Browser automation, screenshots, recordings, and traces are intentionally not part of this repository's verification process.

## Accessibility

ShyDoorbell uses native buttons for all controls, provides a skip link and visible focus indicators, announces scene changes through an ARIA live region, and labels the main SVG illustration with a title and description. The design also supports:

- `prefers-reduced-motion`
- `prefers-contrast: more`
- Responsive layouts down to narrow mobile viewports
- Keyboard operation without pointer-only actions

## Privacy and security

ShyDoorbell does not collect, transmit, or process personal information. It contains no analytics, advertising, cookies, accounts, forms, remote APIs, or backend connections.

The browser stores only two local values:

- `shyDoorbell.attempts` — the number of doorbell attempts
- `shyDoorbell.sound` — the sound preference

Reset removes the stored attempt count. Browser settings can clear both values at any time.

The page includes a restrictive Content Security Policy that blocks network connections, plugins, frames, workers, media downloads, form submission, and inline or third-party scripts. All runtime resources are local to the repository.

## Project structure

```text
ShyDoorbell/
├── .gitignore      # Local, secret, dependency, and generated-file exclusions
├── .nojekyll       # Direct static-file handling on GitHub Pages
├── AGENTS.md       # Repository constraints and verification instructions
├── README.md       # Project documentation
├── favicon.svg     # Original local SVG favicon
├── index.html      # Semantic interface and original SVG illustration
├── script.js       # Sequence controller, reactions, persistence, and audio synthesis
├── style.css       # Layout, scene states, animation, and accessibility preferences
└── scripts/
    └── verify.mjs  # Dependency-free production quality gate
```

## Deploy to GitHub Pages

GitHub Pages is already enabled and serves this project from the repository root at <https://sudarshanchaudhari.github.io/ShyDoorbell/>. No compiled output or workflow is required. The steps below record how it was set up, for reference and for restoring the setting:

1. Complete a manual visual review.
2. Confirm the intended repository and site visibility.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and the `/ (root)` folder, then save.
6. Verify keyboard controls, audio, storage, and phone/desktop layouts on the published URL.

All asset paths are relative, so the site works from a GitHub project-page subdirectory. No GitHub Actions workflow is configured; Pages deploys from the branch directly.

## Release checklist

1. Confirm `git status` is clean and `main` matches `origin/main`.
2. Run `node scripts/verify.mjs`.
3. Run the secret and high-risk-file checks required by repository policy.
4. Manually review keyboard controls, sound, motion preferences, contrast, and responsive layouts.
5. Confirm the repository is still public and Pages still serves `main` at the root.
6. Verify the published URL once the change reaches `main`.

## License and ownership

Copyright © 2026 Sudarshan Chaudhari / SudarshanTechLabs.

Released under the MIT License — see [LICENSE](LICENSE) for the full text.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
