# dce-website

The website for [Digital Collections Explorer](https://github.com/L4CCH/digital-collections-explorer),
at https://l4cch.github.io/dce-website/.


## Working on it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # writes dist/
```

Set `GITHUB_TOKEN` to a read-only token when building to fill the wishlist; without it the
wishlist lists no ideas. Everything else works without a token.

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

The paper's live
demo, the Library of Congress maps, stays at https://digital-collections-explorer.com/, the
address the paper gives.

## License

MIT, see [LICENSE](LICENSE).
