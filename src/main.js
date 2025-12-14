/**
 * Holiday Card - Main JavaScript
 * Renders the card from config using CardRenderer
 */

import { defaultConfig } from './cardConfig.js';
import { renderCard } from './components/CardRenderer.js';

// Render the card
const container = document.getElementById('card-container');
const { html, init } = renderCard(defaultConfig);

container.innerHTML = html;
init(container);
