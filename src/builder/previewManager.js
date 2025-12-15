/**
 * Preview iframe management for the card builder
 */

import { renderCard } from '../components/CardRenderer.js';
import { presets } from '../cardConfig.js';

let previewIframe = null;
let activeSectionIndex = -1;

/**
 * Initialize the preview manager with the iframe element
 * @param {HTMLIFrameElement} iframe
 */
export function initPreview(iframe) {
  previewIframe = iframe;
}

/**
 * Get the current active section index
 * @returns {number}
 */
export function getActiveSectionIndex() {
  return activeSectionIndex;
}

/**
 * Set the active section index
 * @param {number} index
 */
export function setActiveSectionIndex(index) {
  activeSectionIndex = index;
}

/**
 * Update the preview iframe with current config
 * @param {Object} config - Card configuration
 */
export function updatePreview(config) {
  if (!previewIframe) return;

  // Update cat images based on selected animation
  config.sections.forEach(section => {
    const animation = presets.catAnimations.find(c => c.id === section.catAnimation);
    if (animation) {
      section.catImage = animation.catImage;
    }
  });

  const { html } = renderCard(config);

  const previewHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/card-styles.css" />
        <style>
          body { overflow: auto; }
          .card-section.builder-active {
            outline: 3px solid var(--color-accent-primary);
            outline-offset: -3px;
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          document.querySelectorAll('[data-cat-trigger]').forEach(el => {
            el.classList.add('is-visible');
          });
        </script>
      </body>
    </html>
  `;

  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  doc.open();
  doc.write(previewHtml);
  doc.close();

  // Restore active section view after reload
  if (activeSectionIndex >= 0) {
    setTimeout(() => {
      scrollPreviewToSection(activeSectionIndex);
    }, 50);
  }
}

/**
 * Show the intro overlay in the preview
 */
export function showIntroInPreview() {
  if (!previewIframe) return;

  const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  if (!iframeDoc) return;

  const overlay = iframeDoc.getElementById('intro-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }

  iframeDoc.querySelectorAll('.card-section').forEach(s => {
    s.classList.remove('builder-active');
  });

  iframeDoc.documentElement.scrollTop = 0;
}

/**
 * Scroll the preview iframe to show a specific section
 * @param {number} index - Section index to scroll to
 */
export function scrollPreviewToSection(index) {
  if (!previewIframe) return;

  const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  if (!iframeDoc) return;

  const overlay = iframeDoc.getElementById('intro-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  iframeDoc.body?.classList.remove('intro-active');

  iframeDoc.querySelectorAll('.card-section').forEach(s => {
    s.classList.remove('builder-active');
  });

  const sectionNum = index + 1;
  const section = iframeDoc.querySelector(`[data-section="${sectionNum}"]`);
  if (section) {
    section.classList.add('builder-active');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
