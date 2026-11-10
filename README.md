# dce-website

The website for [Digital Collections Explorer](https://github.com/L4CCH/digital-collections-explorer),
at https://l4cch.github.io/dce-website/: what it is, who it is for, how it works, the collections
searched with it, three ways to start, the wishlist, and how to cite it.
Developer documentation lives under `/docs/`. It also serves `llms.txt` and a sitemap.

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build) for the
documentation. Everything the landing page says about the project lives in `src/site.ts` and the
components; documentation pages live in `src/content/docs/docs/`. The star count, wishlist and
good-first issues are read from GitHub when the site is built, so a daily rebuild keeps them current.

## Working on it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # writes dist/
```

Set `GITHUB_TOKEN` to a read-only token when building to fill the wishlist; without it the
wishlist shows an invitation to post the first idea. Everything else works without a token.

## Social preview

`public/og.png` is what a shared link shows. It is rendered from `scripts/og.html` at 1200x630:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot=public/og.png scripts/og.html
```

## Publishing

GitHub Pages serves the site under `/dce-website/`. The Build workflow publishes `main` on every
push and once a day, so the star count and the wishlist stay current. In the repository's
Settings, under Pages, the source must be GitHub Actions. Links inside the site go through
`path()` in `src/site.ts`, or are relative in the documentation, so that they keep the prefix.

## Showcases

Each showcase is a Digital Collections Explorer site of its own, listed in `showcases` in
`src/site.ts` with a 16:10 screenshot in `public/showcases/`, such as 1600 by 1000 pixels. The paper's live
demo, the Library of Congress maps, stays at https://digital-collections-explorer.com/, the
address the paper gives.

## License

MIT, see [LICENSE](LICENSE).
