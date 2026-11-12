# Shailesh Jha — Portfolio

A technical writer's portfolio, laid out as a documentation site. Plain HTML, CSS and JS, with no build step, ready for GitHub Pages.

## Design intent
- **Message:** this person makes complicated products clear, and catches the errors before users do.
- **Muse:** an editor's marked-up galley proof. Clean paper, ink type, red-pen corrections and margin queries.
- **Colour roles** (scarce on purpose): ink for text and the one solid action per view; **red pen only for edits** (strikes, insertions, queries, "latest"); highlighter only for "you are here" in the contents; blue for links; green only for HTTP `GET` / `200`.
- **Type:** Shantell Sans for display. Its informal axis (`INFM`) is the "pen" for hand-written marks. IBM Plex Sans is the body face and IBM Plex Mono is for code and labels; they're one superfamily.
- **Paper:** ruled paper only for hand-written things (the overview and the letter); every other page is plain.

## Sections
| Section | What it is |
|---|---|
| Overview | Name, positioning line with a live red-pen edit (~~jargon~~ → *context*), one action, and **Fig. 1**: scattered code assembles into a reviewed doc page as you move the cursor |
| Case study: Docutanix | Problem and build, three headline numbers, a hand-drawn pipeline ending in human review, and an evaluation note |
| Changelog | Career history in *Keep a Changelog* format, one version per role |
| Editing, shown | A real before/after paragraph with proofreading marks and numbered queries (31 → 20 words) |
| API: /skills | Skills as an API reference. **Try it** calls the real `api/skills.json` |
| Writing samples | Links to published Gupshup docs |
| Contact | A short letter, one "Email me" action, and other contact details |

Docs chrome: contents sidebar with scrollspy, breadcrumbs, `#` heading anchors, search (press `/` or Ctrl/⌘+K), copy buttons, and "Edit this page on GitHub". Hand-drawn outlines and strikes use [rough.js](https://roughjs.com) and [rough-notation](https://roughnotation.com). Everything respects `prefers-reduced-motion`, and the page is fully readable without JavaScript.

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
