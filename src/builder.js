/**
 * Card Builder
 *
 * Visual editor for prototyping holiday cards.
 * Generates a config object and renders a live preview.
 */

import { defaultConfig, presets } from './cardConfig.js';
import { renderCard } from './components/CardRenderer.js';

// Clone the default config as our working copy
let currentConfig = JSON.parse(JSON.stringify(defaultConfig));

// DOM elements
const form = document.getElementById('builder-form');
const sectionsContainer = document.getElementById('sections-container');
const previewIframe = document.getElementById('preview-iframe');
const addSectionBtn = document.getElementById('add-section-btn');
const previewBtn = document.getElementById('preview-btn');
const exportBtn = document.getElementById('export-btn');

/**
 * Initialize the builder
 */
function init() {
  // Render initial sections
  renderSectionForms();

  // Bind events
  addSectionBtn.addEventListener('click', addSection);
  previewBtn.addEventListener('click', updatePreview);
  exportBtn.addEventListener('click', exportConfig);

  // Auto-update on input changes (debounced)
  form.addEventListener('input', debounce(handleFormInput, 300));

  // Initial preview
  updatePreview();
}

/**
 * Render section form controls
 */
function renderSectionForms() {
  sectionsContainer.innerHTML = currentConfig.sections
    .map((section, index) => renderSectionForm(section, index))
    .join('');

  // Bind delete buttons
  sectionsContainer.querySelectorAll('.delete-section-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      deleteSection(index);
    });
  });
}

/**
 * Render a single section's form
 */
function renderSectionForm(section, index) {
  const layoutOptions = presets.layouts
    .map(l => `<option value="${l.id}" ${section.layout === l.id ? 'selected' : ''}>${l.label}</option>`)
    .join('');

  const catOptions = presets.catAnimations
    .map(c => `<option value="${c.id}" ${section.catAnimation === c.id ? 'selected' : ''}>${c.label}</option>`)
    .join('');

  const imagesHtml = (section.images || [])
    .map((img, imgIndex) => renderImageForm(index, img, imgIndex))
    .join('');

  return `
    <fieldset class="builder-fieldset section-fieldset" data-section-index="${index}">
      <legend>
        Section ${index + 1}
        <button type="button" class="delete-section-btn" data-index="${index}" title="Delete section">&times;</button>
      </legend>

      <label>
        Title
        <input type="text" name="sections.${index}.title" value="${escapeAttr(section.title || '')}" />
      </label>

      <label>
        Body Text
        <textarea name="sections.${index}.body" rows="2">${escapeHtml(section.body || '')}</textarea>
      </label>

      <label>
        Layout
        <select name="sections.${index}.layout">
          ${layoutOptions}
        </select>
      </label>

      <label>
        Cat Animation
        <select name="sections.${index}.catAnimation">
          ${catOptions}
        </select>
      </label>

      <div class="images-group">
        <strong>Images</strong>
        ${imagesHtml}
        <button type="button" class="btn btn-small add-image-btn" data-section="${index}">
          + Add Image
        </button>
      </div>
    </fieldset>
  `;
}

/**
 * Render an image input row
 */
function renderImageForm(sectionIndex, image, imageIndex) {
  const rotationOptions = presets.rotations
    .map(r => `<option value="${r.id || ''}" ${image.rotation === r.id ? 'selected' : ''}>${r.label}</option>`)
    .join('');

  return `
    <div class="image-row">
      <input
        type="text"
        name="sections.${sectionIndex}.images.${imageIndex}.src"
        value="${escapeAttr(image.src || '')}"
        placeholder="Image path or URL"
      />
      <select name="sections.${sectionIndex}.images.${imageIndex}.rotation">
        ${rotationOptions}
      </select>
      <label class="checkbox-label">
        <input
          type="checkbox"
          name="sections.${sectionIndex}.images.${imageIndex}.span"
          value="tall"
          ${image.span === 'tall' ? 'checked' : ''}
        />
        Tall
      </label>
      <label class="checkbox-label">
        <input
          type="checkbox"
          name="sections.${sectionIndex}.images.${imageIndex}.span"
          value="hero"
          ${image.span === 'hero' ? 'checked' : ''}
        />
        Hero
      </label>
    </div>
  `;
}

/**
 * Handle form input changes
 */
function handleFormInput(e) {
  const name = e.target.name;
  if (!name) return;

  const value = e.target.type === 'checkbox'
    ? (e.target.checked ? e.target.value : null)
    : e.target.value;

  setNestedValue(currentConfig, name, value);
  updatePreview();
}

/**
 * Set a nested value in an object using dot notation
 * e.g., "sections.0.title" -> config.sections[0].title
 */
function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = isNaN(parts[i]) ? parts[i] : parseInt(parts[i], 10);
    if (current[key] === undefined) {
      current[key] = isNaN(parts[i + 1]) ? {} : [];
    }
    current = current[key];
  }

  const lastKey = isNaN(parts[parts.length - 1])
    ? parts[parts.length - 1]
    : parseInt(parts[parts.length - 1], 10);

  current[lastKey] = value === '' ? null : value;
}

/**
 * Add a new section
 */
function addSection() {
  currentConfig.sections.push({
    id: `section-${Date.now()}`,
    title: 'New Section',
    body: null,
    layout: 'tall-left',
    catAnimation: 'none',
    catImage: null,
    images: []
  });
  renderSectionForms();
  bindImageButtons();
  updatePreview();
}

/**
 * Delete a section
 */
function deleteSection(index) {
  if (currentConfig.sections.length <= 1) {
    alert('You need at least one section');
    return;
  }
  currentConfig.sections.splice(index, 1);
  renderSectionForms();
  bindImageButtons();
  updatePreview();
}

/**
 * Bind add image buttons
 */
function bindImageButtons() {
  document.querySelectorAll('.add-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectionIndex = parseInt(e.target.dataset.section, 10);
      addImageToSection(sectionIndex);
    });
  });
}

/**
 * Add an image to a section
 */
function addImageToSection(sectionIndex) {
  if (!currentConfig.sections[sectionIndex].images) {
    currentConfig.sections[sectionIndex].images = [];
  }
  currentConfig.sections[sectionIndex].images.push({
    src: '/assets/images/images_00.jpg',
    alt: '',
    rotation: null,
    span: null
  });
  renderSectionForms();
  bindImageButtons();
}

/**
 * Update the preview iframe
 */
function updatePreview() {
  // Update cat images based on selected animation
  currentConfig.sections.forEach(section => {
    const animation = presets.catAnimations.find(c => c.id === section.catAnimation);
    if (animation) {
      section.catImage = animation.catImage;
    }
  });

  const { html } = renderCard(currentConfig);

  // Build the preview HTML document
  const previewHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/src/styles/reset.css" />
        <link rel="stylesheet" href="/src/styles/theme.css" />
        <link rel="stylesheet" href="/src/styles/layout.css" />
        <link rel="stylesheet" href="/src/styles/cat-animations.css" />
        <style>
          /* Disable audio autoplay in preview */
          body { overflow: auto; }
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Auto-enter (skip intro overlay)
          const overlay = document.getElementById('intro-overlay');
          if (overlay) overlay.classList.add('hidden');
          document.body.classList.remove('intro-active');

          // Trigger all cat animations for preview
          document.querySelectorAll('[data-cat-trigger]').forEach(el => {
            el.classList.add('is-visible');
          });
        </script>
      </body>
    </html>
  `;

  // Write to iframe
  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  doc.open();
  doc.write(previewHtml);
  doc.close();
}

/**
 * Export the current config as JSON
 */
function exportConfig() {
  const json = JSON.stringify(currentConfig, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'card-config.json';
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Utility: Debounce function calls
 */
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Utility: Escape attribute value
 */
function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, '&quot;');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  init();
  bindImageButtons();
});
