# WhatColor

> A color identification tool built for the colorblind — point your camera at anything and instantly know what color it is.

**Live:** [what-color.com](https://what-color.com)

I built WhatColor because color-naming should be a phone-camera-and-a-second moment, not a 4-step app workflow. Open the site, point, hear the name. That's it.

## How it works

- **Real-time camera sampling** at 60fps through the browser's MediaStream API
- **Crosshair-targeted color detection** — the small center region is what gets sampled
- **Adaptive EMA smoothing** (α=0.85) so the color name doesn't flicker between shades
- **Median sampling over the crosshair region** to reject single-pixel noise
- **Luminance-aware naming** — suppresses hue-based names at extreme dark/light values where they'd be wrong
- **SVG crosshair overlay** for sharp rendering at any resolution

No app install. No login. Just open it.

## Built with

- React + Vite
- Browser MediaStream API
- Tailwind CSS
- Deployed on Vercel

## Run locally

```bash
git clone https://github.com/Hixly/whatcolor.git
cd whatcolor
npm install
npm run dev
```

Then open the dev URL on your phone (same Wi-Fi network) to test with a real camera.
