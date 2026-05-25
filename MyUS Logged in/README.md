# MyUS — Logged In Rebuild

Static HTML/CSS/JS rebuild of the MyUS signed-in experience, modeled on the live `account.myus.com` app.

## Design system

Tokens were pulled directly from the running production app (Dashboard, signed in as Igor Ginzburg, May 2026).

- **Typeface** — Poppins (300 / 400 / 500 / 600 / 700), self-hosted from `static.nc-myus.com/scripts/css/fonts/poppins/...`
- **Brand**
  - Topbar / header `#266093`
  - Navy text `#10283D`
  - Active sidebar link bg `#EBF4FF`, text `#183A58`
  - Primary blue (links) `#0C71C9`
  - Accent orange `#FF981F`
  - Danger `#D13138`, success `#18873D`
- **Type scale** — body 14 / h1 26 / h3 18 / h4 26 / h5 20 (px), all Poppins, weights 400/600/700
- **Radius** — default `6px` (buttons, links, inputs)
- **Layout** — sidebar `260px`, topbar `~58px`

See `styles/tokens.css` for the full token list and `styles/base.css` for reset + font loading.

## Folders
- `styles/` — `tokens.css` + `base.css`
- `assets/` — logo (white version pulled from the live app)
