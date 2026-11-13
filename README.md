# commamusic.com

The Comma Music website: one static page, hosted on GitHub Pages. There is no server, database, plugin or login, so there is nothing to patch or update for security.

## What's where

| Path | What it is |
|---|---|
| `index.html` | The page itself: header, hero, section headings, contact panel and footer |
| `css/site.css` | All styles. Brand colors and fonts are the variables at the top |
| `js/site.js` | Builds the album grid, placements, brand wall and partner map from the data files |
| `data/settings.json` | Catalog link, album link pattern, contact email, 411 brief link, submissions link |
| `data/albums.json` | The "Latest releases" and "Featured" album lists |
| `data/placements.json` | Recent placements |
| `data/brands.json` | The brand logo wall |
| `data/partners.json` | Sub-publishers and the countries each one covers on the map |
| `data/world.json` | Map shapes (don't edit by hand) |
| `img/` | Logo, favicons, social share image, album covers, placement stills, brand logos |
| `video/` | Hero background loop, its poster frame, and the full reel |
| `CNAME` | Tells GitHub Pages the site's domain |
| `404.html` | Shown for any address that doesn't exist |
| `audio-logos/`, `press/`, etc. | Redirects from old WordPress pages to the new page |

## Everyday updates

Every change is an edit to a small file, committed to the `main` branch. GitHub Pages republishes automatically within a minute or two.

**Add a placement.** Put a 16:9 still in `img/placements/` (WebP or JPG, about 960×540). Add an entry to `data/placements.json`. The order in the file is the order on the page.

```json
{
  "brand": "Olive Garden",
  "title": "“More for Less”",
  "category": "library",
  "label": "Library",
  "image": "img/placements/olive-garden-more-for-less.webp"
}
```

`category` decides which filter button shows it: `library`, `original` or `sync`. `label` is the text shown under the title.

**Add an album.** Put a square cover in `img/albums/` (about 480×480). Add it to the `latest` or `featured` list in `data/albums.json` with its catalog ID:

```json
{ "title": "Nu Disco", "id": 11733506, "cover": "img/albums/nu-disco.webp" }
```

**Add a brand logo.** Use a single-color dark logo on a transparent background. Add `{ "name": "...", "logo": "img/brands/...", "w": 360, "h": 150 }` to `data/brands.json`. `w` and `h` are the image's pixel size.

**Change a sub-publisher.** Edit `data/partners.json`. The `countries` list uses the country names in `data/world.json`; very small territories (Bahrain, Singapore, Hong Kong, Monaco and so on) aren't drawn on the map, so list them only in `territories`. A partner with different sites per country can use `links` instead of `url`.

## Switching the catalog to 411

Edit `data/settings.json`:

- `catalogUrl`: where every "Browse catalog" button goes.
- `albumUrlPattern`: how album links are built. `{id}` is replaced with each album's `id` from `albums.json`.

If 411 uses different album IDs, update the `id` values in `albums.json` too.

## Putting the site on GitHub Pages

1. Create a repository (for example `comma-website`) in your GitHub organization and push these files to the `main` branch.
2. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. The site appears at `https://<your-org>.github.io/comma-website/` within a few minutes. Check it there before changing DNS.
4. Recommended: verify `commamusic.com` for your organization (**Organization settings → Pages → Add a domain**) before pointing DNS at GitHub. This prevents anyone else from claiming your domain on GitHub Pages.

## Moving the domain

Do this only once the preview looks right. Keep WordPress running until the new site is confirmed working.

1. In **Settings → Pages → Custom domain**, enter `www.commamusic.com` and save. (The `CNAME` file in this repo already says this.)
2. At your DNS provider:
   - `www` → **CNAME** → `<your-org>.github.io`
   - `@` (the bare domain) → four **A** records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Optional IPv6 for `@` → **AAAA** records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - Remove any old A/AAAA/CNAME records for `@` and `www` that point to the WordPress host.
   - **Don't touch** the `catalog` record (SourceAudio), email records (MX, SPF, DKIM, DMARC), or any verification TXT records.
3. DNS can take up to 24 hours. When GitHub shows the domain as verified, tick **Enforce HTTPS**.
4. `commamusic.com` will redirect to `www.commamusic.com` automatically.

## After launch

- Turn off the old WordPress hosting once you're happy. Download a final backup first.
- In Google Search Console, submit `https://www.commamusic.com/sitemap.xml`.
