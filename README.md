# opencolibri.github.io

Organization website of [OpenColibri](https://opencolibri.org/): open source e-commerce plugins and tools
maintained together by the community. Static multi-language landing page built with [Astro](https://astro.build).

The projects have their own websites: [Colibri Starter](https://starter.opencolibri.org/) (repository
`opencolibri/starter`), documentation at [/docs/](https://starter.opencolibri.org/docs/).

## Commands

Node.js 22.12+ is required.

```bash
npm install     # install dependencies
npm run dev     # http://localhost:4321/
npm run build   # output to dist/
npm run preview # serves dist/
```

## Editing content

| What | Where |
|------|--------|
| Copy and locale metadata | `src/i18n/<code>.json` |
| Layout, sections, partner logos, project links | `src/components/Landing.astro` |
| Styles (shared with the Colibri Starter website) | `src/styles/global.css` |
| `<head>`, fonts | `src/layouts/Layout.astro` |

To add a language, create `src/i18n/<code>.json` with its `locale` metadata (`label`, `hreflang`, browser-language
`match` prefixes) and the translated copy: the build generates `/<code>/`. The root `/` page redirects to the visitor's
browser language (English by default).

Every `src/i18n/<code>.json` must have exactly the keys of `en.json` (the `match` list can have any length). The build
fails on a missing or unknown key.

To add a partner, drop its SVG logo in `public/images/logo/` and add it to the `partners` list of `Landing.astro`.

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the site and deploys `dist/` with
`actions/deploy-pages` on every push to `main` (pull requests only build it).

In the repository settings, **Settings → Pages → Build and deployment → Source** must be set to **GitHub Actions**.

The site is served at the root of the `opencolibri.org` custom domain, set in **Settings → Pages → Custom domain**
(with **Enforce HTTPS**); a `public/CNAME` file is ignored by `actions/deploy-pages`. The DNS zone of
`opencolibri.org` points the apex to the GitHub Pages addresses (`A`/`AAAA` records) and `www` (`CNAME`) to
`opencolibri.github.io.`.
