# MyUS animated email signature

| File | Use |
|---|---|
| myus-email-signature.gif | The animated logo (400x132 px, shown at 180x59). Plays once and stops on the logo. |
| myus-email-signature-still.png / .gif | Static logo for tools that do not accept GIFs. |
| myus-signature-template.html | Signature layout: name, title, phone, myus.com link, logo. |

## Specs
- Display size: **180 x 59 px** (always set width="180" height="59"; the file is ~2x for sharp retina screens).
- Plays once (no loop). First frame = finished logo, so classic Outlook for Windows (which shows only the first frame) still shows the full logo.
- White logo tile: email clients do not invert images in dark mode, so the logo sits on its own white tile (rounded corners where supported).
- Logo links to https://www.myus.com, alt text "MyUS.com – unbox the possibilities".

## Hosting (important)
The image must be loaded from a URL, not attached to each email. The temporary URL in the template points to the
MyUS design-system site. Before rolling it out company-wide, upload myus-email-signature.gif to a MyUS-owned
location (website CDN or asset server), e.g. https://www.myus.com/email/myus-email-signature.gif, and replace the src
in the template (or in your signature-management tool) with that URL.
