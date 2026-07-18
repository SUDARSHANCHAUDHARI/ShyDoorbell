# ShyDoorbell Repository Instructions

ShyDoorbell is a dependency-free static site for GitHub Pages.

## Project constraints

- Keep the runtime limited to semantic HTML, CSS, inline/local SVG, and vanilla JavaScript.
- Do not add remote images, fonts, analytics, frameworks, build systems, or backend services without explicit approval.
- Preserve keyboard access, live status announcements, responsive layout, visible focus, and reduced-motion support.
- Keep all deployment paths relative so project-site GitHub Pages URLs continue to work.
- Never commit secrets, environment files, local browser state, private keys, or signing material.
- Do not create or modify GitHub Actions workflows without explicit approval.

## Verification

Run the complete local quality gate before committing or publishing:

```sh
node scripts/verify.mjs
```

Visual judgment still requires manual review in a current browser. Do not use browser automation, screenshots, recordings, or traces unless the current user request explicitly permits the exact browser action; session capture remains prohibited.

## Deployment

GitHub Pages serves the repository root directly. There is no build output to commit.
