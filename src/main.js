/**
 * Holiday Card - Main JavaScript
 * Renders the card from config using CardRenderer
 */

import { defaultConfig } from './cardConfig.js';
import { renderCard } from './components/CardRenderer.js';

/**
 * Load config from URL hash if present, otherwise use default
 * Supports both #config=base64 (legacy) and #card=id (new)
 */
async function getConfig() {
  const hash = window.location.hash;

  // New format: #card=id - fetch from server
  if (hash.startsWith('#card=')) {
    try {
      const id = hash.slice(6);
      const response = await fetch(`/api/card?id=${id}`);

      if (!response.ok) {
        console.error('Card not found');
        return defaultConfig;
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to load card from server:', err);
      return defaultConfig;
    }
  }

  // Legacy format: #config=base64
  if (hash.startsWith('#config=')) {
    try {
      const encoded = hash.slice(8);
      const json = decodeURIComponent(atob(encoded));
      return JSON.parse(json);
    } catch (err) {
      console.error('Failed to load config from URL:', err);
    }
  }

  // Try loading from card-config.json (saved from builder)
  try {
    const response = await fetch('/data/card-config.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.log('No card-config.json found, using default');
  }

  return defaultConfig;
}

// Initialize the card
async function init() {
  const container = document.getElementById('card-container');
  const config = await getConfig();
  const { html, init: initCard } = renderCard(config);

  container.innerHTML = html;
  initCard(container);
}

init();
