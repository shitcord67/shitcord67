# XMPP Extension Draft: Profile Nameplates and Client Decorators

Status: Draft (client experiment for `shitcord67`)

Goal:
- Share lightweight profile decorations (nameplate image, client platform hints, bot/app flags) across compatible clients.

Namespace:
- `urn:shitcord67:profile:decor:0`

Discovery:
- Advertise support in disco features:
  - `<feature var='urn:shitcord67:profile:decor:0'/>`

Payload model:
- Publish in PEP (`urn:xmpp:pubsub`) node:
  - `urn:shitcord67:profile:decor`
- Item payload:
```xml
<decor xmlns='urn:shitcord67:profile:decor:0' ver='1'>
  <nameplate src='https://cdn.example/nameplates/aurora.svg' />
  <role-color value='#3498db' />
  <client platform='desktop' />
  <flags bot='false' app='false' />
</decor>
```

Field rules:
- `nameplate@src`: HTTPS URL or `data:image/svg+xml,...` (clients may reject oversized payloads).
- `role-color@value`: optional preferred username color hint.
- `client@platform`: one of `desktop`, `mobile`, `web` (repeatable if multiple active sessions).
- `flags@bot` / `flags@app`: optional automation hints.

Privacy and safety:
- Clients should treat all values as untrusted user input.
- Clients should sanitize/size-limit SVG and remote URLs.
- Clients should allow local opt-out for rendering remote nameplate assets.

Fallback:
- If unsupported, clients ignore the payload and continue with normal profile rendering.

Open questions:
- Whether to register a stable XEP namespace or keep vendor namespace.
- Whether role color should be server-scoped instead of account-scoped.
- Whether client platform hints should move to presence payload extensions.
