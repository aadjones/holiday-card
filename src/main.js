/**
 * Holiday Card - Main JavaScript
 * Renders the card from config using CardRenderer
 */

import { defaultConfig } from './cardConfig.js';
import { renderCard } from './components/CardRenderer.js';

/**
 * Load config from URL hash if present, otherwise use default
 */
function getConfig() {
  const hash = window.location.hash;
  if (hash.startsWith('#config=')) {
    try {
      const encoded = hash.slice(8);
      const json = decodeURIComponent(atob(encoded));
      return JSON.parse(json);
    } catch (err) {
      console.error('Failed to load config from URL:', err);
    }
  }
  return defaultConfig;
}

// Render the card
const container = document.getElementById('card-container');
const config = getConfig();
const { html, init } = renderCard(config);

container.innerHTML = html;
init(container);
