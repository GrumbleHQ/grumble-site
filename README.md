# grumble-site — the public landing page for gogrumble.app

A single self-contained HTML page. No build step, no framework, no JavaScript.
It exists to do the one job the brief gives it: acquisition is grumble's own
job now, so cold visitors need to learn that DMing a reel to grumble is even a
thing they can do.

**This repo must be public.** GitHub Pages won't serve a private repo on a free
plan, and there is nothing sensitive in here. Keep it that way — no keys, no
fixtures, no pipeline code. `grumble-pipeline` stays private; `grumble-demo`
stays off the public internet.

```
public/
  index.html            the landing page
  demo/index.html       /demo — the interactive sample basket
  how-it-works/         /how-it-works — the pipeline in plain English
  privacy/              /privacy — what happens to a video you send
  for-creators/         /for-creators — credit, rewriting, opt-out
  404.html              served by GitHub Pages on a bad URL
  robots.txt            points at the sitemap
  sitemap.xml           the five real pages
  CNAME                 gogrumble.app — do not delete, it is the custom domain
  .nojekyll             stop GitHub from running Jekyll over it
  assets/
    grumble.css         the whole design system, shared by every page
    demo.js             the sample basket's behaviour — enhancement only
    favicon.svg
tools/
  og.html               share-image template
  make-og.py            renders it to public/assets/og.png (run with internet)
.github/workflows/deploy.yml
```

Directory-per-page, so the URLs are `/demo/` rather than `/demo.html`. There is
still **no build step**: the pages are ordinary HTML files you can open and edit.
The cost of that is real — the top bar and footer are duplicated in six files,
so a change to either is six edits. That was chosen over a generator on purpose:
a build step is one more thing that can be broken an hour before it matters.

## What's on the site

**`/`** — hero, a picture of the output, the three steps, the four things
grumble won't do, and the notify panel.

**`/demo/`** — the showpiece. A real basket you can drive: change how many
you're feeding and the pack counts recompute, toggle items off, open the staples
group, copy the list. Feeding 1 and feeding 2 cost the same, because you still
buy whole packs — that is the single most useful thing this page teaches.

**`/how-it-works/`**, **`/privacy/`**, **`/for-creators/`** — the honesty
pages. They exist because the promises on the landing page are worth more if
there is somewhere to go and read the long version.

Nothing on the public site links to `grumble-demo` or `grumble-pipeline`. Both
repos are private, a link to a private repo is a 404 to everyone else, and the
partner demo is deliberately a laptop-only thing. `/demo/` is a **separate,
self-contained illustration** living in this repo — it does not import the
pipeline and it cannot break the meeting demo.

### The numbers on /demo/ are made up, and say so

The recipe, the products and the prices are hand-written examples. The page
carries a warning callout above the basket and a caption below it. If you ever
swap them for real captured prices, say so in that callout — and if you don't,
leave it exactly where it is.

Design notes worth knowing before you edit the `<style>` block:

- **Dark mode is real**, via `prefers-color-scheme` — tokens are redefined, not
  filtered. Tomato is lifted to `#FF7A54` there because the brand tomato goes
  muddy on a dark ground.
- **Tomato is not a body-text colour.** It is ~3.5:1 on paper, which is fine for
  large display text, borders and the status dot, and fails for anything you
  expect someone to read. Small secondary text uses `--muted`, a solid hex
  picked to clear 4.5:1 rather than ink at 60% alpha (which landed at 4.2:1).
- **JavaScript is enhancement, never a requirement.** `/demo/` ships its
  serves-2 state fully rendered in HTML; `assets/demo.js` recomputes it when the
  stepper moves. With JS blocked you still get a complete, correct basket — the
  controls are simply absent (`.js-only` stays hidden because the `no-js` class
  never gets removed). Every other page has no script at all.
- **Reveal-on-scroll is CSS**, `animation-timeline: view()` behind an
  `@supports`, so browsers without it just show the content; everything
  motion-related is inside `prefers-reduced-motion: no-preference`.
- **Design tokens come from `design-system/grumble/MASTER.md`** in the workspace
  root — spacing scale, three motion durations, the 24px-floor/44px-target touch
  rule, mobile-first `min-width` queries. Read it before changing a token.
- The rumble line is one `<symbol>` and four `<use>`s, not the same path pasted
  four times.

## Before it goes live

The deploy workflow **fails on purpose** until these are done.

1. ~~**Fill in the placeholders.**~~ **Done.** The contact email is
   `grumbleteam@gmail.com` and the handle is `@go_grumble`, in
   `public/index.html` and `public/for-creators/index.html`. The CI guard is
   still there and still greps `public/` for `REPLACE_ME`, so if you add a new
   page with a placeholder in it the deploy will refuse again — which is the
   point. Two things worth doing when you get to them:

   - **`grumbleteam@gmail.com` is a Gmail address on a public page.** Moving to
     `hello@gogrumble.app` needs mail routing on the domain (Cloudflare Email
     Routing does it free) and then a one-line change in both files.
   - **Check `@go_grumble` is actually yours.** A handle you don't own sends
     everyone who reads the page to a stranger.
2. **Make the share image** (optional but worth it — the page will be shared as
   a link before it's ever visited): run `python3 tools/make-og.py` on a machine
   with internet, then uncomment the `og:image` and `twitter:card` lines in
   `index.html`. It has to be online because the wordmark needs the real
   Bricolage Grotesque; the script deletes its own output rather than shipping
   the wrong typeface.

## Publishing it

```bash
cd grumble-site
git init -q && git add -A && git commit -q -m "Initial commit: gogrumble.app landing page"
git branch -M main
gh repo create GrumbleHQ/grumble-site --public --source=. --remote=origin --push
```

Then in the repo on github.com: **Settings → Pages → Source → GitHub Actions**.
(Not "Deploy from a branch" — the workflow does the placeholder check.)

Once the first deploy succeeds, **Settings → Pages → Custom domain** →
`gogrumble.app` → Save, and tick **Enforce HTTPS** as soon as it stops being
greyed out.

## DNS on Cloudflare

Four `A` records on the apex, plus a `CNAME` for `www`. The four IPs are
GitHub's published Pages addresses.

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only** |
| A | `@` | `185.199.109.153` | **DNS only** |
| A | `@` | `185.199.110.153` | **DNS only** |
| A | `@` | `185.199.111.153` | **DNS only** |
| CNAME | `www` | `grumblehq.github.io` | **DNS only** |

Optional IPv6 (`AAAA` on `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

The `www` CNAME points at `grumblehq.github.io` — the **org**, with no repo name
on the end. That's the bit people usually get wrong.

### The Cloudflare trap — read this one

**Set every record above to "DNS only" (grey cloud), not "Proxied" (orange
cloud).** With the proxy on, a DNS lookup returns Cloudflare's IP instead of
GitHub's, so GitHub can't validate the domain and its Let's Encrypt certificate
never issues — and later, never renews. You get a site that works for a while
and then dies quietly.

This matters more than usual here because **`.app` is an HSTS-preloaded TLD**:
browsers refuse to load it over plain `http` at all. No certificate means no
site, not just a warning. If you ever do want Cloudflare's proxy and caching in
front, switch SSL/TLS mode to **Full (strict)** first and let Cloudflare handle
the certificate — but the simple path is to leave the proxy off.

DNS propagation is usually minutes; certificate issuance can take up to an hour
after that. Check with:

```bash
dig +short gogrumble.app
curl -sI https://gogrumble.app | head -1
```

## Reserve this now: api.gogrumble.app

The landing page is static, and a static host can't run the webhook, the
extraction, or the matching — that's decision 6 in the brief. When Track 2 gets
deployed (Railway, Render, Fly.io), point `api.gogrumble.app` at it with a
`CNAME` to whatever hostname the platform gives you. That's also where hosted
basket pages should live, since they're generated per order rather than built
ahead of time.

Don't point any subdomain at `grumble-demo`. The demo is meant to be run
locally in a meeting, where wifi and DNS can't lose it for you.

## One thing to decide

The page deliberately says "check out in your supermarket's own app" rather than
naming Woolworths. Naming a retailer on a public page you have no agreement with
edges toward implying a partnership, and the brief puts retailer-partnership and
public-claim wording in the founder's hands, not engineering's. Change it if you
want it named — just make it a decision rather than a default.
