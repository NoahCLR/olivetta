# AGENTS.md

Project instructions for agents working on the Casa dei Cigni Olivetta website.

## Project Snapshot

This is a static Dutch website for two holiday stays in Olivetta San Michele, Liguria:

- `Casa dei Cigni`: the larger natural-stone house, for up to 6 people.
- `La Casetta`: the smaller detached apartment, for 2 people.

The site is plain HTML, CSS, and JavaScript. There is no build step and no frontend framework.

Main paths:

- `public/`: public webroot; these files are served by Nginx.
- `public/index.html`: homepage.
- `public/casa-dei-cigni/index.html`: Casa detail page.
- `public/la-casetta/index.html`: La Casetta detail page.
- `public/olivetta-omgeving/index.html`: area and weather page.
- `public/prijzen-beschikbaarheid/index.html`: pricing and availability page.
- `public/bereikbaarheid-contact/index.html`: route, map, and contact page.
- `public/assets/css/styles.css`: all styling.
- `public/assets/js/site.js`: galleries, pricing, availability calendar, weather widget, back-to-top.
- `public/assets/data/photo-alt-texts.json`: gallery alt text and captions.
- `public/sitemap.xml`: canonical URLs and image sitemap entries.
- `public/robots.txt`: crawl policy and sitemap reference.
- `deploy/`: Nginx, Docker, Portainer, and Cloudflare Tunnel deployment notes.
- `docs/google-sheet-import/`: spreadsheet templates and reference images.
- `AGENTS.md`: project instructions for future agents.

## Operating Principles

- Preserve the site as a small static site. Do not introduce a framework, bundler, package manager, CMS, or build pipeline unless explicitly requested.
- Keep edits focused. Avoid broad refactors when a local content, style, or copy change is enough.
- Use existing conventions in the HTML, CSS, JavaScript, image naming, metadata, and copy.
- Prefer simple, readable markup and CSS over clever abstractions.
- Keep all visitor-facing copy in Dutch unless explicitly asked otherwise.
- Use ASCII in code and docs unless the edited file already uses HTML entities or requires real characters for content.
- Do not revert user edits or previous accepted changes.

## Standard Workflow

For most tasks:

1. Inspect the relevant HTML, CSS, JS, metadata, and assets before changing anything.
2. Identify whether the change affects shared components, SEO metadata, galleries, cachebusters, or deployment files.
3. Make the smallest coherent edit.
4. Update related files in the same pass. For example, image changes often also require alt text, gallery config, sitemap entries, and cache versions.
5. Run targeted checks.
6. Preview visual changes locally in a browser.
7. Summarize what changed and what was verified.

Do not stop at analysis when the requested change is clear. Implement it, then verify it.

## Important Client Decisions

These were explicit client preferences. Do not undo them without a new explicit request.

- Pricing fallback rows in `public/prijzen-beschikbaarheid/index.html` should show `---`, not real euro amounts. Live prices may be filled by JavaScript from the Google Sheet.
- The public transport text should keep the station link label as `San Michele`, with the Maps query for `San Michele di Olivetta station, Italy`. Do not change it to `station Olivetta San Michele`.
- Cross-links between Casa and La Casetta should stay friendly, warm, and placed before the gallery sections.
- Green callout areas should be inset rounded panels, not full-width green bands.
- Buttons on green panels should use the warm terracotta/orange color used in the footer.
- The current production domain in metadata is `https://casadeicigni-olivetta.com/`.

## Design System

The visual style should feel quiet, warm, rural, and refined. It should not feel like a SaaS product or a generic travel landing page.

Core colors are defined in `:root` in `public/assets/css/styles.css`:

- `--paper`: warm off-white page background.
- `--paper-strong`: slightly darker warm section background.
- `--cypress`: main green.
- `#172a23`: darker green used for rounded green panels.
- `--terracotta`: warm orange/terracotta action color.
- `--sea`: external/contextual link blue.
- `--ink` and `--muted`: body text.

Typography:

- Serif headings use Georgia.
- Body and UI use Inter/system sans.
- Do not scale font sizes directly with viewport width beyond existing `clamp(...)` patterns.
- Keep letter spacing at `0`, including uppercase eyebrow labels.

Layout and components:

- The base radius is `--radius: 8px`.
- Large green panels use `border-radius: 22px`, a subtle light border, and the softer shadow currently used by `.quote-band .wrap`, `.related-stay`, and `.weather-panel`.
- Avoid full-width green bands unless explicitly requested. Prefer a normal beige section background with an inset rounded green panel.
- Avoid nested cards and decorative floating blobs/orbs.
- Cards are for repeated items, modals, or framed tools only.
- Text must not overflow buttons, cards, or panels at mobile widths.
- Hero sections should remain image-led and should show the actual place or stay, not abstract illustration.

When changing a shared visual pattern, check all affected pages:

- Homepage green block: `.quote-band`.
- House cross-link panels: `.related-stay`.
- Weather widget: `.weather-panel`.
- Footer CTA: `.footer-cta`.

## Copy And Tone

Write Dutch copy that is warm, factual, and personal. Use simple visitor-facing language.

Preferred tone:

- Friendly and calm.
- Practical rather than salesy.
- Specific about the house, garden, village, coast, river, and travel details.
- Use `je` and `we` where it fits.

Avoid:

- Over-polished marketing claims.
- Vague luxury language.
- Overexplaining the interface.
- English copy in the UI.
- Changing factual names unless verified.

Keep naming consistent:

- `Casa dei Cigni`
- `La Casetta`
- `Olivetta San Michele`
- `San Michele` for the station link text in the route section.
- `Dolceacqua`, not `Dolceaqua`.

## HTML Conventions

- Each public page has its own `index.html` in a directory under `public/`, using clean trailing-slash URLs.
- Keep header and footer navigation consistent across all pages.
- Use `aria-current="page"` on the active nav item.
- External links should use `target="_blank"` and `rel="noopener noreferrer"`.
- Keep canonical URLs, Open Graph URLs, Twitter images, and JSON-LD URLs absolute.
- Keep inline image cachebusters where the site already uses them, for example `?v=20260512-images`.
- Use HTML entities where the surrounding file already does, especially for apostrophes, euro signs, and accented characters.

When adding a new page:

1. Add the page directory and `index.html` under `public/`.
2. Add consistent metadata: title, description, canonical, OG, Twitter.
3. Add JSON-LD if there is a clear entity or breadcrumb.
4. Add it to header/footer navigation if it is a primary page.
5. Add it to `public/sitemap.xml`.
6. Check `public/robots.txt` still points to the correct sitemap.
7. Test on desktop and mobile.

## CSS Conventions

- All CSS lives in `public/assets/css/styles.css`.
- Reuse existing variables and component classes.
- Prefer extending existing sections/components over adding one-off styles.
- Keep media queries aligned with the existing breakpoints, especially `980px`, `620px`, and `380px`.
- Preserve `overflow-x: hidden` safeguards unless you have verified no horizontal overflow.
- Use stable dimensions for galleries, panels, buttons, stat boxes, calendars, and grids.
- Do not add a new color family unless there is a clear design reason.

After every CSS change:

1. Bump the stylesheet query string in every HTML file:
   - Search: `rg -n "styles.css\\?v=" public`
   - Update all instances to the same new version string.
2. Use a meaningful version string, for example `20260513-weather-radius`.
3. Verify no old CSS version remains:
   - `rg -n "styles.css\\?v=" public`
4. Check the changed area in a browser at desktop and mobile widths.

This cachebuster step is required because the site sits behind Cloudflare and old CSS can remain cached.

## JavaScript Conventions

All JavaScript lives in `public/assets/js/site.js`.

Existing responsibilities:

- Mobile navigation toggle.
- Gallery rendering and lightbox.
- Pricing table loading from Google Sheets.
- Availability calendar loading from Google Sheets.
- Weather widget loading from Open-Meteo.
- Back-to-top button.

Do not split this file or add dependencies unless explicitly requested.

If changing JavaScript behavior:

1. Keep the static HTML fallback usable.
2. Fail quietly and helpfully when external APIs are unavailable.
3. Preserve Dutch status/error copy.
4. Bump the script query string in every HTML file:
   - Search: `rg -n "site.js\\?v=" public`
5. Test the relevant feature locally.

Important data behavior:

- Pricing fallback in HTML stays `---`.
- JavaScript may replace pricing rows from the Google Sheet when data is available.
- The availability calendar reads date ranges and statuses from the Google Sheet.
- Weather uses Open-Meteo and should remain non-critical. The page must still read well if weather loading fails.

## Images And Galleries

Image folders:

- `public/assets/images/casa/`
- `public/assets/images/casetta/`
- `public/assets/images/omgeving/`

Current naming:

- Casa gallery: `casa-00.webp` through `casa-28.webp`, plus `casa-lead.webp`.
- Casetta gallery: `casetta-01.webp` through `casetta-10.webp`, plus `casetta-lead.webp`.
- Omgeving gallery: `omgeving-01.webp` through `omgeving-08.webp`, plus `olivetta-village.webp`.
- Social image: `olivetta-share.jpg`.

Alt text handling:

- Gallery alt text and captions are managed centrally in `public/assets/data/photo-alt-texts.json`.
- `public/assets/js/site.js` loads that JSON and applies it to generated galleries and the lightbox.
- Direct HTML images still need inline `alt` attributes. Treat these as required static fallbacks, not as a replacement for the central gallery text.
- Availability unit images use `imageAlt` in `public/assets/js/site.js`.
- If a direct HTML image also appears in the gallery JSON, keep the text consistent in both places.

When adding or changing images:

1. Put the image in the correct folder with the existing naming pattern.
2. Use `.webp` for site photos unless the existing asset has a specific reason to be `.jpg`.
3. Add or update Dutch alt/caption text in `public/assets/data/photo-alt-texts.json`.
4. If it belongs to a generated gallery, update `galleryConfig` or `homeGalleryItems` in `public/assets/js/site.js`.
5. If it is used directly in HTML, add a descriptive `alt`.
6. If image filenames or visible image sets change, update `imageCacheVersion` in `public/assets/js/site.js` and inline image query strings as needed.
7. Update `public/sitemap.xml` image entries.
8. Keep image URLs in `public/sitemap.xml` clean, without cachebuster query strings.

For image sitemaps:

- Use the `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` namespace.
- Use `image:image` with `image:loc`.
- Keep images attached to the page where they have context.

## SEO And Metadata

Every indexable page should have:

- A unique `<title>`.
- A concise Dutch meta description.
- A canonical URL.
- Open Graph title, description, URL, and image.
- Twitter card metadata.
- Useful JSON-LD where relevant.
- Internal links from the nav, footer, or contextual sections.

When changing the production domain:

1. Update all canonicals.
2. Update all `og:url` values.
3. Update all absolute image URLs in social metadata and JSON-LD.
4. Update all JSON-LD `@id`, `url`, and breadcrumb URLs.
5. Update `public/sitemap.xml`.
6. Update `public/robots.txt`.
7. Search for the old domain:
   - `rg -n "casadeicigni-olivetta\\.com|https://" public`

Sitemap rules:

- Keep `public/sitemap.xml` valid XML.
- Include all canonical HTML pages.
- Include relevant images with image sitemap markup.
- Update `<lastmod>` when content materially changes.
- Validate with `xmllint --noout public/sitemap.xml`.

Robots rules:

- Keep crawling allowed unless explicitly requested otherwise.
- Keep the absolute sitemap URL in `public/robots.txt`.

## Data Integrations

Pricing and availability are connected to Google Sheets using the Google Visualization endpoint.

Pricing:

- Source configured via `data-pricing-sheet-id` and `data-pricing-sheet-name`.
- Recognized unit labels include `casa`, `Casa dei Cigni`, `casetta`, and `La Casetta`.
- Recognized price fields include `price_per_week`, `prijs_per_week`, and `prijs`.
- The static fallback rows in HTML should remain `---`.

Availability:

- Source configured via `data-availability-sheet-id` and `data-availability-sheet-name`.
- Recognized statuses: `available/beschikbaar`, `booked/geboekt/bezet`, `option/optie`, `closed/gesloten/onderhoud`.
- The calendar is Saturday-to-Saturday focused.
- Other arrival/departure days are discussed by email in the page copy; do not make the calendar imply arbitrary dates are directly bookable.

Weather:

- Source: Open-Meteo.
- Location is Olivetta San Michele.
- Weather is enhancement only; the page should remain useful if the API fails.

## Cloudflare And Deployment

Deployment is documented in `deploy/README.md`.

Current intended setup:

- Static Nginx container.
- Portainer Git stack.
- Existing external Docker network: `olivetta-net`.
- Dedicated Cloudflare Tunnel container: `cloudflared-olivetta-net`.
- Cloudflare Tunnel points to `http://casa-dei-cigni-site:80`.
- `deploy/Dockerfile` copies `public/` into the Nginx webroot.
- Root-level project files such as `AGENTS.md`, `deploy/`, and docs should not be served publicly.
- If a new file should be public, put it under `public/`.

Nginx behavior in `deploy/nginx.conf`:

- Clean directory URLs are served with `try_files $uri $uri/ =404`.
- Old `.html` URLs redirect to trailing-slash directory URLs.
- HTML files use `expires -1`.
- `/assets/` uses `expires 30d`.
- Dotfiles are denied.

Important Cloudflare behavior:

- Assume CSS, JS, and images may be cached.
- Always bump query-string versions after CSS, JS, and image-set changes.
- Do not rely only on Cloudflare purge for normal edits.
- If a deployed change is not visible, first confirm the HTML references the new asset version.
- Then, if needed, purge the specific affected Cloudflare cache entries or wait for cache expiry.
- Because assets have a 30-day browser/proxy cache header, changing only `styles.css` or `site.js` without updating the HTML query string is not enough.

Before deployment:

1. Confirm all changed assets have updated query strings where relevant.
2. Confirm `public/sitemap.xml` and `public/robots.txt` are present.
3. Validate XML:
   - `xmllint --noout public/sitemap.xml`
4. Run local browser checks.
5. Commit and push.
6. In Portainer, use Pull and redeploy, or trigger the configured Git/webhook redeploy.

After deployment:

1. Check the live page in a private/incognito window.
2. View source or inspect network requests to confirm the new CSS/JS query string is used.
3. Check `https://casadeicigni-olivetta.com/sitemap.xml`.
4. Check `https://casadeicigni-olivetta.com/robots.txt`.

## Local Development And Verification

There is no build command.

Run a local server from the `public/` directory:

```sh
cd public
python3 -m http.server 4188
```

Then open:

```text
http://127.0.0.1:4188/
```

If port `4188` is busy, use another port.

Browser verification:

- In Codex, use the Codex in-app Browser/browser-use tool for local previews whenever it is available.
- Do not rely only on reading HTML/CSS for visual changes.
- After meaningful frontend changes, open the affected local URL in the Codex Browser, reload after edits, and inspect the changed section.
- For layout work, check at least one desktop viewport and one mobile viewport around `390px` wide.
- Use screenshots when visual confirmation matters, especially for green panels, hero sections, galleries, calendars, maps, and mobile navigation.

Recommended checks after frontend changes:

- Homepage at desktop width.
- Homepage at mobile width around 390px.
- Casa page around the changed section.
- La Casetta page around the changed section.
- Prices/availability page if touching pricing, availability, shared JS, or shared CSS.
- Omgeving page if touching weather, route/area copy, or shared green panels.
- Contact page if touching route, map, footer, or shared layout.

Useful commands:

```sh
rg -n "styles.css\\?v=|site.js\\?v=" public
rg -n "canonical|og:url|https://casadeicigni-olivetta.com" public/*.html public/*/index.html
xmllint --noout public/sitemap.xml
```

## Accessibility And UX

- Keep semantic headings in logical order.
- Buttons must be real `<button>` elements when they perform UI actions.
- Links must be real `<a>` elements when they navigate.
- Keep useful `aria-label`, `aria-current`, and `aria-live` attributes.
- Gallery images need meaningful alt text.
- Lightbox controls must remain keyboard and screen-reader understandable.
- Do not hide essential information behind hover-only interactions.
- Ensure mobile navigation can open and close reliably.
- Avoid text overlap and horizontal scrolling.

## Review Checklist Before Final Response

Before saying the work is done, check the items relevant to the change:

- HTML, CSS, JS, metadata, sitemap, and robots updated consistently.
- CSS or JS cachebusters bumped across all pages when needed.
- Image cache version and sitemap image entries updated when needed.
- Price fallback still shows `---`.
- Station copy still says `San Michele`.
- Canonicals and JSON-LD still use the correct production domain.
- XML validates if `public/sitemap.xml` changed.
- Local browser preview completed for visual changes.
- No unrelated user changes were reverted.
- Final response mentions any tests/checks that could not be run.
