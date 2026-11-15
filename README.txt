# Refactored website files

## Structure
- `index.html` — page structure and metadata
- `css/style.css` — original inline stylesheet, extracted without redesigning it
- `js/main.js` — original inline JavaScript, extracted and loaded at its original location near the end of the page

## Deploying
Upload the contents of this folder to the root of your GitHub Pages repository, keeping the `css/` and `js/` folders in place.

The original Google Fonts stylesheet link remains in `index.html`. Existing image references such as `assets/images/...` are unchanged, so keep your existing `assets/` folder in the same relative location.

## Notes
This pass separates the original HTML, CSS, and JavaScript without intentionally redesigning or deduplicating the code. Browser-extension-injected markup/styles/scripts from the captured source were excluded. Check the deployed page in a browser after uploading, especially the gallery/lightbox and mobile layout.
