# Nameplate Research Notes (Discord)

Date researched: 2026-03-04

Sources:
- Discord Blog: Introducing Nameplates  
  https://discord.com/blog/introducing-nameplates
- Discord support FAQ entry: Nameplates FAQ  
  https://support.discord.com/hc/en-us/articles/30408457944215-Nameplates-FAQ

Takeaways used for UI polish:
- Nameplates are visual profile cosmetics layered around/behind identity text.
- Motion and style variety are expected and accepted in the product category.
- Subtle animation should enhance identity without harming readability.

Implementation direction applied in this repo:
- Animated SVG SMIL nameplate assets in cosmetics catalog.
- Nameplate application in member list / online sidebar labels (`.member-meta__name.has-nameplate`).
- Keep text readable while showing animated plate underlines.
