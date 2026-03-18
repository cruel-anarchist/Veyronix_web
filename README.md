# Veyronix Website

Static marketing website for `Veyronix`.

## Structure

- `index.html`
- `styles.css`
- `script.js`
- `assets/`

## Local Preview

Open `index.html` directly or run any static file server in the repository root.

Examples:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

This repository is prepared for deployment through GitHub Pages with GitHub Actions.

Recommended repository settings:

1. Open repository `Settings`.
2. Go to `Pages`.
3. Set `Source` to `GitHub Actions`.

After that, each push to `main` will publish the current static site.

## Notes

- No build step is required.
- The site is plain static HTML/CSS/JS.
- Assets are committed directly for simple deployment.
