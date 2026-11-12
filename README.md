# Shailesh Jha — Portfolio

A technical writer's portfolio, laid out as a documentation site drawn on paper. Plain HTML, CSS and JS, with no build step, ready for GitHub Pages.

## What's inside
| Section | What it is |
|---|---|
| Overview | Ruled notebook page. A red-pen edit (~~jargon~~ → *context*), marker highlights and **Fig. 1**, a cursor-scrubbed figure where scattered code assembles into a reviewed doc page |
| Quickstart | "Working with me" in three steps, on graph paper, with a Tip admonition |
| Docutanix | Case study: hand-drawn pipeline, sticky-note stats, a YAML config and a Warning callout |
| Changelog | Career history in *Keep a Changelog* format (Added / Fixed / Improved / Changed), one taped slip per role |
| API: /skills | Skills as an API reference with a fields table, Response/cURL tabs and a **Try it** button that calls the real `api/skills.json` |
| Style guide | Do / Don't cards with the Don'ts struck through in red |
| By the numbers | Impact metrics itemized on a receipt, plus ticket stubs |
| Writing samples | Index cards linking to published docs |
| Contact | A letter, contact details and a "Was this page helpful?" widget |

Docs chrome: sticky index-card table of contents with scrollspy, breadcrumbs, `#` heading anchors, a search palette (press `/` or Ctrl/⌘+K), copy buttons, and "Edit this page on GitHub".

Hand-drawn lines come from [rough.js](https://roughjs.com) and [rough-notation](https://roughnotation.com). Buttons "boil" (redraw) on hover. The paper style is inspired by [Looseleaf](https://github.com/kevintngo/looseleaf). Everything respects `prefers-reduced-motion`, and the page is fully readable without JavaScript.

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
- Skills shown by **Try it** come from `api/skills.json`.
- Search entries live in the `INDEX` array in `assets/js/main.js`. Add one when you add a section.
- Replace `assets/Shailesh_Jha_Resume.pdf` to update the downloadable résumé.
- Colors and fonts are CSS variables at the top of `assets/css/style.css`.

## How Fig. 1 works
The figure isn't real-time 3D. It's 60 pre-rendered WebP frames in `assets/hero/`, drawn to a `<canvas>`. The cursor's horizontal position picks the frame, the same way you'd scrub a video. Frames load ends-first, then coarse-to-fine, so the effect works before every frame has arrived.

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
