# Nameplate Research Notes (Discord)

Date researched: 2026-03-04
Re-verified: 2026-03-05

Sources:
- Discord Blog: Worthy of a Plaque: Nameplates Land in the Shop  
  https://discord.com/blog/nameplates-land-in-the-shop
- Discord support FAQ entry: Nameplates FAQ  
  https://support.discord.com/hc/en-us/articles/30408457944215-Nameplates-FAQ
- Discord support FAQ entry: Shop FAQ  
  https://support.discord.com/hc/en-us/articles/17162747936663-Shop-FAQ

Verification notes:
- Re-checked the Nameplates FAQ URL above on 2026-03-05; this is the correct support article slug.
- The previously referenced blog slug (`/blog/introducing-nameplates`) is not the canonical article path now; use `/blog/nameplates-land-in-the-shop`.

Takeaways used for UI polish:
- Nameplates are visual profile cosmetics layered around/behind identity text.
- Motion and style variety are expected and accepted in the product category.
- Subtle animation should enhance identity without harming readability.
- Reduced Motion should have a fallback behavior that minimizes heavy animation.

Implementation direction applied in this repo:
- Animated SVG SMIL nameplate assets in cosmetics catalog.
- Nameplate application in member list / online sidebar labels (`.member-meta__name.has-nameplate`).
- Keep text readable while showing animated plate underlines.
