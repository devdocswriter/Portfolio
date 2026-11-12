# Shailesh Jha — Portfolio

A technical writer's portfolio, laid out as a documentation site drawn on paper. Plain HTML, CSS and JS, with no build step, ready for GitHub Pages.

## What's inside
| Section | What it is |
|---|---|
| Overview | Ruled notebook page. A red-pen edit (~~jargon~~ → *context*), marker highlights and **Fig. 1**, a scrubbable illustration of how code becomes docs |
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
Fig. 1 shows how code becomes docs, in four stages driven by one progress value (cursor position, a drag on touch screens, or the intro autoplay):

1. **Read:** a scan line moves down a real source file (`src/messages.ts`).
2. **Mark:** rough-notation highlights, circles and underlines mark the endpoint, auth, parameters, error and success cases, with margin notes. The internal `queue.push` line is struck through and marked "internal, cut".
3. **Structure:** the doc skeleton gets its headings, then each marked token flies into its slot (`sendMessage` → "Send a message", `401` → "401 token expired").
4. **Publish:** the doc flips from draft to published and gets a REVIEWED stamp.

It's plain HTML text, not images, so it stays sharp and is easy to edit. Change the code in the `.jcode` block and the doc in `.jdoc` in `index.html`. Each `data-k` token in the code flies to the `.slot` with the matching `data-t`. Timings live in the `MARKS` and `FLIGHTS` arrays in `assets/js/main.js`. With reduced motion, the finished state shows without animation.

## Preview locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.
