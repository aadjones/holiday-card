# Holiday Card 2025

An interactive, shareable holiday card featuring scroll-snap sections, cat animations, and background music. Includes a visual builder for creating custom cards.

## Features

- **Scroll-snap sections** - Full-viewport sections with smooth snapping
- **Photo layouts** - Multiple scrapbook layouts (hero, tall, trio, single)
- **Cat animations** - Animated cats that trigger on scroll (walk, peek, sleep, pop-up)
- **Background music** - Optional audio with volume control
- **Visual builder** - Live preview editor for prototyping cards
- **Shareable links** - Save cards to the cloud and share via URL

## Quick Start

```bash
npm install
npm run dev
```

This starts the Vite dev server. Visit:
- `http://localhost:5173` - View the card
- `http://localhost:5173/builder` - Visual card builder

## Project Structure

```
holiday-2025/
├── index.html              # Main card entry point
├── builder.html            # Builder entry point
├── src/
│   ├── main.js             # Card initialization & config loading
│   ├── builder.js          # Builder app logic
│   ├── cardConfig.js       # Default config & presets
│   ├── components/
│   │   └── CardRenderer.js # Renders card HTML from config
│   ├── builder/
│   │   ├── previewManager.js   # Live preview iframe
│   │   ├── formRenderer.js     # Section form HTML
│   │   └── imageUtils.js       # Image compression
│   └── styles/
│       ├── reset.css           # CSS reset
│       ├── theme.css           # CSS variables & theming
│       ├── layout.css          # Card layout & sections
│       ├── cat-animations.css  # Cat animation keyframes
│       └── builder.css         # Builder UI styles
├── public/
│   ├── assets/             # Images, audio, cat sprites
│   └── card-styles.css     # Combined styles for preview iframe
├── api/
│   └── card.js             # Vercel Edge API for card storage
└── docs/
    └── architecture.md     # Architecture documentation
```

## Builder

The visual builder (`/builder`) lets you create custom cards:

- **Intro screen** - Edit year, title, and from line
- **Sections** - Add/remove sections, choose layouts
- **Images** - Upload photos, set rotation and span
- **Cat animations** - Pick animations per section
- **Audio** - Default track, silent, or custom upload
- **Export** - Download JSON or generate shareable links

## Sharing

Cards can be shared in two ways:

1. **Cloud storage** - Click "Share Link" to save to Upstash Redis (90-day expiration)
   - URL format: `https://your-domain/#card=abc12345`

2. **JSON export** - Download config and load it elsewhere

## Configuration

Cards are defined by a config object:

```javascript
{
  intro: { year, title, from, tapPrompt },
  audio: { src, volume },
  sections: [
    {
      id, title, body, layout,
      catAnimation, catImage,
      images: [{ src, alt, rotation, span }]
    }
  ]
}
```

See [docs/architecture.md](docs/architecture.md) for details.

## Deployment

Deployed on Vercel with Edge Functions:

```bash
vercel
```

Required environment variables:
- `KV_REST_API_URL` - Upstash Redis REST URL
- `KV_REST_API_TOKEN` - Upstash Redis token

## Tech Stack

- **Vite** - Build tool and dev server
- **Vanilla JS** - No framework dependencies
- **CSS Custom Properties** - Theming and animation timing
- **Vercel Edge Functions** - Serverless API
- **Upstash Redis** - Card storage
