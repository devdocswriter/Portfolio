# Shailesh Jha — Portfolio

A single-page, Apple-inspired portfolio with scroll-driven 3D effects. Plain HTML/CSS/JS, so there's no build step and it's ready for GitHub Pages.

## What's inside
| Section | Effect |
|---|---|
| Hero | **Code → Clarity**: a cursor-scrubbed image sequence. Scattered code characters assemble into a finished API doc page as the cursor moves from left to right (drag on touch screens) |
| Manifesto | Apple-style word-by-word text reveal tied to scroll |
| Docutanix | Pinned 4-step walkthrough with a 3D device mock, live pipeline and terminal |
| Impact | Bento grid with count-up stats, pointer-tracked 3D tilt and spotlight |
| Journey | Horizontal scroll timeline; cards rotate in 3D as they pass the center |
| Zero-to-one | Sticky stacking cards that scale back and dim as the next arrives |
| Toolkit | Infinite marquees + capability cards |
| Contact | Magnetic buttons, résumé download |

Also included: Lenis smooth scrolling, a native CSS `animation-timeline: scroll()` progress bar, a glass nav that hides on scroll, a cursor glow, film grain, and full `prefers-reduced-motion` and no-JS fallbacks.

## Deploy to GitHub Pages
1. Create a repo named **`<your-username>.github.io`** (gives you `https://<your-username>.github.io`), or any repo name (gives `https://<your-username>.github.io/<repo>`).
2. Push the contents of this folder to the `main` branch:
   ```bash
   git init && git add . && git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`** → Save.
4. Wait about a minute, then open the URL shown on that page.

## Editing content
- All text lives in `index.html`. Each section is marked with an `<!-- ===== -->` comment.
- Stat numbers use `data-count="…"` (with `data-decimals` for decimals).
- Replace `assets/Shailesh_Jha_Resume.pdf` to update the downloadable résumé.
- Colors and fonts are CSS variables at the top of `assets/css/style.css`.

## How the hero works
The hero isn't real-time 3D. It's 60 pre-rendered WebP frames in `assets/hero/`, drawn to a `<canvas>`. The cursor's horizontal position picks the frame, the same way you'd scrub a video. Frames load ends-first, then coarse-to-fine, so the effect works before every frame has arrived.

To regenerate the frames (for example, to change the doc text on the page):
```bash
cd tools/hero-render
npm i three@0.169.0 playwright
python3 -m http.server 8777 &
node run.js ../../assets/hero 60
```
Edit the `LINES` array in `tools/hero-render/render.html` to change what the page says.

To use your own AI-generated video instead, export it as frames named `000.webp` to `059.webp`:
```bash
ffmpeg -i hero.mp4 -vf "fps=60/DURATION,scale=800:-1" -c:v libwebp -quality 70 -start_number 0 assets/hero/%03d.webp
```
Replace `DURATION` with the clip length in seconds.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.
