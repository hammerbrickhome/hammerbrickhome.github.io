# Hammer Brick & Home — GitHub + Cloudflare Gallery Admin

This package is designed for the current Hammer Brick & Home static website structure:

- `gallery.json` at the repository root
- project photos inside `/images`
- homepage loading `gallery.json` in browser JavaScript
- GitHub as the source repository
- Cloudflare Pages as the deploy host

## What this adds

A real content-management workflow without PHP, a database, Supabase, Firebase, or a server you maintain.

1. You sign in to Pages CMS with GitHub.
2. You open **Project Gallery Manager**.
3. Upload Before / After photos from phone or computer.
4. Enter a project title and tags.
5. Reorder projects if desired.
6. Save.
7. Pages CMS commits `gallery.json` and uploaded photos to GitHub.
8. Cloudflare Pages sees the GitHub commit and republishes the website.

## Files to upload to the GitHub repository

### Required

- `.pages.yml` → put at the repository root
- `index.html` → use this as the replacement for the current homepage file (it has the gallery path compatibility patch)

### Optional but useful

- `admin/index.html` → creates `https://www.hammerbrickhome.com/admin/` as a branded launch page for the secure CMS
- `gallery-path-helper.js` → reusable path helper for any separate gallery page that also reads `gallery.json`

Do **not** replace your current `gallery.json` with the backup in `/reference`. The existing live JSON can stay exactly as it is.

## First-time Pages CMS connection

1. Go to https://app.pagescms.org/
2. Sign in with the GitHub account that owns the Hammer Brick & Home website repository.
3. Install/authorize the Pages CMS GitHub App for that repository.
4. Open the repository and the branch Cloudflare Pages deploys from (usually `main`).
5. Pages CMS reads `.pages.yml` and shows **Project Gallery Manager**.

## Important image-path compatibility

Your older JSON stores image values as bare filenames:

`Livingroom-before33.jpeg`

Pages CMS normally stores uploaded image paths as:

`/images/livingroom-before33.jpeg`

The replacement `index.html` in this package accepts **both forms**, so old projects and new CMS uploads can coexist.

If you have a separate `gallery.html` or similar page that does this:

```js
img.src = "/images/" + item.before;
```

change it to:

```js
img.src = galleryImageUrl(item.before);
```

and include this before that page's gallery code:

```html
<script src="/gallery-path-helper.js"></script>
```

The same applies to `item.after` and `item.name`.

## What the CMS manages right now

It matches the existing `gallery.json` exactly:

- `homePairs` — homepage Before & After
- `galleryPairs` — full gallery Before & After
- `galleryGrid` — individual gallery images

Every project retains your existing fields:

- `before`
- `after`
- `label`
- `tags`

## Security

The `/admin/` page itself contains no password and no secret data. It is only a launcher. Actual editing happens through Pages CMS and requires authorization to your GitHub repository.

Do not put a GitHub Personal Access Token, password, API secret, or Cloudflare API token in HTML or JavaScript files in the public repository.

## Cloudflare Pages

If Cloudflare Pages is already connected to this GitHub repository, no special Cloudflare code is needed. A CMS save creates a GitHub commit, which should trigger your normal Cloudflare deployment.

## Next expansion ideas

After the gallery is working, the same admin can be expanded to manage:

- homepage hero text
- service specials and prices
- Google review cards
- service descriptions
- FAQs
- service areas
- company phone/email/license details
- homepage featured project order
- project locations and longer project descriptions

Those features require moving the currently hard-coded homepage content into JSON data, then rendering it from JavaScript. The gallery portion in this package is already wired to your existing data structure.
