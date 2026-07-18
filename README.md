# ShyDoorbell

ShyDoorbell is a standalone interactive cartoon about a resident who would rather not answer the door. Ring the bell, watch the resident panic, and discover a collection of increasingly elaborate avoidance tactics.

Everything is drawn and generated in the browser with HTML, CSS, inline SVG, and vanilla JavaScript. There are no external images, audio files, fonts, frameworks, build tools, analytics, or backend services.

## Features

- A responsive, hand-drawn house entrance with a door, window, porch light, doorbell, and hidden resident
- A complete doorbell sequence: chime, porch light, opening door, peeking resident, eye contact, and rapid retreat
- Eight randomized reactions:
  - Looking through the window
  - Showing only one eye
  - Hanging a “Not Home” sign
  - Turning off the porch light
  - Pressing the doorbell back
  - Opening and immediately closing the door
  - Sending out a cardboard assistant
  - Showing only a hand
- A guaranteed secret reaction on the tenth attempt, with a small chance of repeats afterward
- Persistent attempt and sound preferences using local storage
- Generated doorbell, gasp, switch, slam, ring-back, and secret-reaction sounds using the Web Audio API
- Sound toggle and attempt reset controls
- Keyboard-accessible native controls, live status announcements, visible focus states, and a skip link
- Reduced-motion and increased-contrast support

## Run locally

No installation or build step is required.

Open `index.html` directly, or serve the folder with any static file server. For example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Audio begins only after a button press, as required by modern browsers. If local storage is unavailable, the interaction still works; only persistence across reloads is disabled.

## Verify

Run the dependency-free production quality gate with a current Node.js release:

```sh
node scripts/verify.mjs
```

It checks JavaScript execution, local resource links, Content Security Policy, ignore coverage, accessibility contracts, responsive and reduced-motion rules, every reaction branch, the tenth-ring unlock, sound controls, Reset, and stale scene cleanup.

Visual polish still requires a brief manual review in a current browser because this repository intentionally does not use browser automation or session capture.

## Deploy to GitHub Pages

1. Push these files to a GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing the project and the `/ (root)` folder, then save.

No path changes are needed because all project links are relative. No GitHub Actions workflow is required.

The repository can remain private during final review. Publishing the repository or enabling GitHub Pages is a separate release action.

## Project structure

```text
ShyDoorbell/
├── .nojekyll      # Serve the static files directly on GitHub Pages
├── AGENTS.md      # Repository constraints and verification instructions
├── favicon.svg    # Original local SVG favicon
├── index.html     # Semantic UI and original SVG illustration
├── style.css      # Layout, scene states, animation, and accessibility preferences
├── script.js      # Sequence controller, reactions, persistence, and audio synthesis
├── scripts/
│   └── verify.mjs # Dependency-free production quality gate
├── README.md      # Project and deployment guide
└── .gitignore     # Local/editor exclusions
```

## Controls

- Press or keyboard-activate the red doorbell to start a visit.
- Use **Sound on/off** to toggle all generated effects.
- Use **Reset** to return the attempt counter and secret unlock to zero.

## Browser support

ShyDoorbell targets current evergreen browsers. The visual experience works without Web Audio support; in that case the scene simply remains silent.

## Release checklist

1. Run `node scripts/verify.mjs`.
2. Manually review keyboard controls, sound, motion preferences, and phone/desktop layouts in current browsers.
3. Confirm the GitHub repository visibility is appropriate for release.
4. Enable GitHub Pages from the repository root only when the site is ready to publish.

CI is intentionally not configured. Repository policy requires explicit approval before adding GitHub Actions; until then, the local verification command is the release gate.
