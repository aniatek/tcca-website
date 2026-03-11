# Tavolo Nature & Tourism — Static Website

This repo contains a lightweight, responsive static site scaffold for "Tavolo Nature & Tourism".

Quick start
1. Add your real logo and photos to the `images/` folder (placeholder SVGs are included).
2. Serve locally:

```bash
# from the `h:/tcca_website` folder
python -m http.server 8000
# open http://localhost:8000/index.html
```

What is included
- `index.html` — Home (hero, features)
- Several content pages: `our-story.html`, `trekking.html`, `reef.html`, `village.html`, `how-to-get-here.html`, `accommodation.html`, `travel-tips.html`, `plan-visit.html`, `contact.html`, plus `terms.html`, `privacy.html`, `resources.html`.
- `css/styles.css` — single stylesheet for layout and theme colors.
- `js/script.js` — small JS for mobile nav and dropdown behaviour.
- `images/` — placeholder images (SVG content saved with `.jpg`/.png extensions to show quickly).
 
Deployment
- GitHub Pages: create a repo, push this folder to `main` (or `gh-pages`) and enable Pages from the repository settings (use `/(root)` as site source for a simple static site).
- Netlify: drag-and-drop the public folder or connect the repo — build step isn't required for this static site.
- Vercel: import the repo and deploy as a static site.

Windows quick-run script
- `serve-windows.bat` included to start a local Python static server on Windows.

WhatsApp and contact
- Configure the WhatsApp floating button in `index.html` and other pages by replacing the `href` with `https://wa.me/<your-number>` (international format, no + or dashes).

Accessibility & testing
- Run Lighthouse in Chrome: open DevTools > Lighthouse and run an audit.
- Use axe or other accessibility tools for deeper checks.
- See `ACCESSIBILITY_CHECKLIST.md` for a quick manual checklist.

Handoff checklist
- Replace placeholder images in `images/` with optimized web formats (WebP/AVIF recommended).
- Update legal pages in `terms.html` and `privacy.html`.
- Replace the logo at `images/logo.png` with your production logo and check dimensions.
- Verify WhatsApp link and contact email in `contact.html`.
- Run a deploy on Netlify/GitHub Pages and test on device sizes.

Support
- I can run Lighthouse audits, optimize images, or generate a small CI/CD deploy config if you want — tell me which.

Accessibility & deployment notes
- This scaffold includes semantic headings and a single nav, but you should run accessibility checks (axe, Lighthouse) before publish.
- Keep hero images sized and optimized for web (WebP/AVIF recommended) to improve page weight.
- For production, host on static hosting (Netlify, GitHub Pages, Vercel) and connect a custom domain.

Customization checklist
- Replace placeholder images in `images/` with real photos; keep filenames or update HTML accordingly.
- Replace placeholder legal text in `terms.html` and `privacy.html` with finalized content.
- Configure WhatsApp link in the footer/`index.html` with your number: `https://wa.me/<number>`.

Shared header/top bar workflow
- Edit shared partials in `partials/`:
  - `partials/top-bar.html`
  - `partials/header-full.html`
  - `partials/header-minimal.html`
- Sync all HTML pages after editing partials:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-layout.ps1
```

- Preview changes without writing files:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\sync-layout.ps1 -DryRun
```
