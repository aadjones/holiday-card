# Architecture

This document describes the technical architecture of the Holiday Card 2025 application.

## Overview

The application consists of two main entry points:
1. **Card Viewer** (`index.html`) - Renders and displays holiday cards
2. **Card Builder** (`builder.html`) - Visual editor for creating cards

Both share a common `CardRenderer` component and configuration schema.

```mermaid
flowchart TB
    subgraph Entry Points
        A[index.html<br/>Card Viewer]
        B[builder.html<br/>Card Builder]
    end

    subgraph Shared
        C[CardRenderer.js]
        D[cardConfig.js]
    end

    subgraph Backend
        E[api/card.js<br/>Edge Function]
        F[(Upstash Redis)]
    end

    A --> C
    B --> C
    A --> D
    B --> D
    A --> E
    B --> E
    E --> F
```

## Data Flow

### Card Viewing

```mermaid
sequenceDiagram
    participant Browser
    participant main.js
    participant API
    participant Redis

    Browser->>main.js: Load page with #card=id
    main.js->>API: GET /api/card?id=xxx
    API->>Redis: GET card:xxx
    Redis-->>API: JSON config
    API-->>main.js: Card config
    main.js->>main.js: CardRenderer.renderCard()
    main.js-->>Browser: Display card
```

### Card Sharing

```mermaid
sequenceDiagram
    participant Builder
    participant API
    participant Redis

    Builder->>Builder: User clicks "Share Link"
    Builder->>API: POST /api/card {config}
    API->>API: Generate 8-char ID
    API->>Redis: SET card:id (90 day TTL)
    Redis-->>API: OK
    API-->>Builder: {id}
    Builder-->>Builder: Copy link to clipboard
```

## Component Architecture

### CardRenderer

The core rendering component that converts config objects into HTML:

```mermaid
flowchart LR
    subgraph Input
        A[Config Object]
    end

    subgraph CardRenderer
        B[renderCard]
        C[renderIntroOverlay]
        D[renderSection]
        E[renderCatStage]
        F[renderImages]
    end

    subgraph Output
        G[HTML String]
        H[init Function]
        I[cleanup Function]
    end

    A --> B
    B --> C
    B --> D
    D --> E
    D --> F
    B --> G
    B --> H
    B --> I
```

**Return value:**
- `html` - Complete card HTML string
- `init(container)` - Sets up audio, observers, and event handlers
- `cleanup()` - Stops audio, disconnects observers

### Builder Architecture

```mermaid
flowchart TB
    subgraph builder.js
        A[Form State Management]
        B[Event Handlers]
        C[Import/Export]
    end

    subgraph builder/
        D[previewManager.js<br/>iframe preview]
        E[formRenderer.js<br/>section forms]
        F[imageUtils.js<br/>compression]
    end

    subgraph Preview
        G[iframe]
        H[card-styles.css]
    end

    A --> D
    A --> E
    B --> F
    D --> G
    H --> G
```

## Configuration Schema

```mermaid
classDiagram
    class CardConfig {
        intro: IntroConfig
        audio: AudioConfig
        sections: Section[]
    }

    class IntroConfig {
        year: string
        title: string
        from: string
        tapPrompt: string
    }

    class AudioConfig {
        src: string|null
        volume: number
    }

    class Section {
        id: string
        title: string
        body: string|null
        layout: LayoutType
        catAnimation: AnimationType
        catImage: string|null
        images: Image[]
    }

    class Image {
        src: string
        alt: string
        rotation: RotationType|null
        span: SpanType|null
    }

    CardConfig --> IntroConfig
    CardConfig --> AudioConfig
    CardConfig --> Section
    Section --> Image
```

**Layout Types:** `tall-left`, `tall-right`, `hero-top`, `hero-bottom`, `trio`, `single`

**Animation Types:** `walk-across`, `peek-corner`, `sleep-corner`, `pop-up`, `both-cats`, `none`

**Rotation Types:** `cw-1`, `cw-2`, `ccw-1`, `ccw-2`, `null`

**Span Types:** `tall`, `hero`, `null`

## CSS Architecture

Styles are organized into focused modules:

```mermaid
flowchart TB
    subgraph Card Styles
        A[reset.css<br/>Box model, defaults]
        B[theme.css<br/>CSS variables]
        C[layout.css<br/>Sections, scrapbook]
        D[cat-animations.css<br/>Keyframes]
    end

    subgraph Builder Styles
        E[builder.css<br/>Form, panels]
    end

    subgraph Combined
        F[public/card-styles.css<br/>For preview iframe]
    end

    A --> F
    B --> F
    C --> F
    D --> F
```

### CSS Custom Properties

Theme variables are defined in `theme.css`:

```css
:root {
  /* Colors */
  --color-background: #FAF7F2;
  --color-text: #2C2C2C;
  --color-accent-primary: #4A6741;

  /* Typography */
  --font-family-base: 'Georgia', serif;
  --font-size-title: clamp(2rem, 5vw, 3.5rem);

  /* Animation */
  --timing-cat-easing: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Layout */
  --section-max-width: 600px;
  --cat-size-medium: 120px;
}
```

## API

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/card?id=xxx` | Load card config by ID |
| `POST` | `/api/card` | Save card config, returns `{id}` |

### Storage

- **Backend:** Upstash Redis (REST API)
- **Key format:** `card:{id}`
- **TTL:** 90 days
- **Max size:** ~10MB (Upstash limit)

### Edge Runtime

The API runs on Vercel Edge Functions for low latency:

```javascript
export const config = {
  runtime: 'edge',
};
```

## Build Pipeline

```mermaid
flowchart LR
    subgraph Source
        A[index.html]
        B[builder.html]
        C[src/**/*.js]
        D[src/**/*.css]
    end

    subgraph Vite Build
        E[Bundle JS]
        F[Bundle CSS]
        G[Hash assets]
    end

    subgraph Output
        H[dist/index.html]
        I[dist/builder.html]
        J[dist/assets/*.js]
        K[dist/assets/*.css]
    end

    A --> E
    B --> E
    C --> E
    D --> F
    E --> G
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
```

**Multi-entry config:**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        builder: 'builder.html'
      }
    }
  }
})
```

## Preview Iframe

The builder's live preview uses an iframe that renders the card in isolation:

```mermaid
flowchart TB
    subgraph Builder
        A[builder.js]
        B[previewManager.js]
    end

    subgraph Preview iframe
        C[Generated HTML]
        D["/card-styles.css"]
    end

    A -->|config| B
    B -->|document.write| C
    D -->|stylesheet| C
```

**Key insight:** The iframe loads `/card-styles.css` from the public folder, which contains all card styles combined. This works in both dev (Vite serves `/public`) and production (copied to `/dist`).

## Scroll Behavior

Cards use CSS scroll-snap for section navigation:

```css
html {
  scroll-snap-type: y mandatory;
}

.card-section {
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

Cat animations trigger via `IntersectionObserver`:

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      section.querySelector('[data-cat-trigger]')
        .classList.add('is-visible');
    }
  });
}, { threshold: 0.5 });
```

## Image Handling

Images are compressed client-side before embedding:

```mermaid
flowchart LR
    A[File Input] --> B[FileReader]
    B --> C[Image Element]
    C --> D[Canvas resize<br/>max 1200x1200]
    D --> E[toDataURL<br/>JPEG 80%]
    E --> F[Config.images.src]
```

This reduces payload size when saving cards to Redis.
