# Densetsu No Shinobi No Sho

## Test the development site on a phone

Start the development server from this folder:

```text
npm run dev
```

The terminal prints both a Local URL and a Network URL. On the phone or tablet, open the Network URL, for example `http://192.168.1.25:4173/` — do not use `localhost`, because that points to the phone itself.

The PC and phone must be connected to the same Wi-Fi/network. Windows Firewall may ask to allow Node on Private networks; allow it on Private networks if prompted. Do not disable the firewall.

### Mobile test diagnostics

While using the development server, append `?debugMobile=1` to the URL to show a small diagnostics panel and faint touch-zone guides in the reader. For example:

```text
http://192.168.1.25:4173/?debugMobile=1#read
```

Remove `?debugMobile=1` or open the normal Network URL to disable it. The diagnostics and touch guides are development-only and are not enabled by production builds.

## Production deployment

This is a static site with a custom Node build script. For Vercel, use:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: leave the default, or use `npm install`
- Framework preset: `Other`

Connect the GitHub repository to Vercel so pushes to `main` deploy automatically. Add `https://shinobiscrolls.com` as the primary domain and add `www.shinobiscrolls.com` as a redirect domain. Vercel provides HTTPS certificates automatically after DNS verification.
