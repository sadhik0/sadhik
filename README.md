# Sadhik Salim - Portfolio

Static site (plain HTML/CSS/JS). Hosted on GitHub Pages: https://sadhik0.github.io/sadhik/

## Folder map

```
index.html                     main page (all sections)
style.css                      all site styles
script.js                      carousels, chatbot, nav
assets/projects/<project>/     images + videos for each project
projects/<project>/            case study pages (index.html + case-study.css)
```

## Projects section layout

1. **Featured Projects** - two permanent cards (Personal Finance Tracker, ReconPro).
   In `index.html` between `FEATURED PROJECTS` / `END FEATURED PROJECTS` comments.
   Styles: bottom of `style.css`, block "FEATURED PROJECTS".
2. **More Projects** - the existing carousel (`.carousel-wrapper`). Auto-handled by `initCarousel()` in `script.js`.
   Featured projects are NOT duplicated here.

## Add a carousel project
Copy one `<a class="project-card">...</a>` inside `.carousel-track`. Nothing else needed.

## Swap a featured project
Edit the `<article class="featured-card">` in `index.html`.
Put its images in `assets/projects/<name>/`. Card image ratio is about 627x323 (laptop);
phones use a small square thumbnail (see the `<picture>` tag in the Finance Tracker card).

## Add a case study page
Copy `projects/finance-tracker/` to `projects/<name>/`, edit the content, add the URL to `sitemap.xml`.

## Also update when adding a project
- Chatbot answers in `script.js` (`projectsOverview` and a new intent).
- `sitemap.xml` if there is a new page.
