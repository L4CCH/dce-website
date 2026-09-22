# digital-collections-explorer.com

The website for [Digital Collections Explorer](https://github.com/hinxcode/digital-collections-explorer):
what it is, who it is for, how it works, the three interface templates, three ways to start,
the wishlist, and how to cite it. It also serves the domain's `robots.txt`, `llms.txt` and sitemap.

Built with [Astro](https://astro.build). Everything the landing page says about the project lives in `src/site.ts` and the
components. The star count, wishlist and
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

## Layout on the server

The site is served at the root of the domain. The three live demos are separate
Digital Collections Explorer instances under `/photographs/`, `/maps/` and `/documents/`.
When a demo is up, set its `live` flag in `src/site.ts` so the Templates section embeds it.

## License

MIT, see [LICENSE](LICENSE).
