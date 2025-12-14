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

// Track active section for preview sync
let activeSectionIndex = -1;

// DOM elements
const form = document.getElementById('builder-form');
const sectionsContainer = document.getElementById('sections-container');
const previewIframe = document.getElementById('preview-iframe');
const addSectionBtn = document.getElementById('add-section-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file-input');
const shareBtn = document.getElementById('share-btn');

/**
 * Initialize the builder
 */
function init() {
  // Check for config in URL hash first
  loadConfigFromUrl();

  // Render initial sections
  renderSectionForms();

  // Bind events
  addSectionBtn.addEventListener('click', addSection);
  exportBtn.addEventListener('click', exportConfig);
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', importConfig);
  shareBtn.addEventListener('click', generateShareLink);

  // Auto-update on input changes (debounced)
  form.addEventListener('input', debounce(handleFormInput, 300));

  // Bind intro fieldset clicks
  const introFieldset = document.getElementById('intro-fieldset');
  if (introFieldset) {
    introFieldset.addEventListener('click', () => setActiveSection(-1));
    introFieldset.addEventListener('focusin', () => setActiveSection(-1));
  }

  // Bind audio controls
  bindAudioControls();

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

  // Bind section focus for preview sync
  bindSectionFocus();
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

  // Show thumbnail if we have a src
  const thumbnailStyle = image.src ? `background-image: url('${escapeAttr(image.src)}')` : '';
  const hasImage = image.src ? 'has-image' : '';

  return `
    <div class="image-row" data-section="${sectionIndex}" data-image="${imageIndex}">
      <div class="image-picker ${hasImage}" style="${thumbnailStyle}">
        <input
          type="file"
          accept="image/*"
          class="image-file-input"
          data-section="${sectionIndex}"
          data-image="${imageIndex}"
        />
        <span class="image-picker-label">${image.src ? 'Change' : '+ Image'}</span>
      </div>
      <div class="image-options">
        <label class="select-label">
          Tilt
          <select name="sections.${sectionIndex}.images.${imageIndex}.rotation">
            ${rotationOptions}
          </select>
        </label>
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
          Wide
        </label>
        <button type="button" class="btn-icon delete-image-btn" data-section="${sectionIndex}" data-image="${imageIndex}" title="Remove image">&times;</button>
      </div>
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
 * Bind add image buttons and file inputs
 */
function bindImageButtons() {
  // Add image buttons
  document.querySelectorAll('.add-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectionIndex = parseInt(e.target.dataset.section, 10);
      addImageToSection(sectionIndex);
    });
  });

  // File inputs for image picking
  document.querySelectorAll('.image-file-input').forEach(input => {
    input.addEventListener('change', handleImageUpload);
  });

  // Delete image buttons
  document.querySelectorAll('.delete-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectionIndex = parseInt(e.target.dataset.section, 10);
      const imageIndex = parseInt(e.target.dataset.image, 10);
      deleteImage(sectionIndex, imageIndex);
    });
  });
}

/**
 * Handle image file upload - convert to data URL for preview
 */
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const sectionIndex = parseInt(e.target.dataset.section, 10);
  const imageIndex = parseInt(e.target.dataset.image, 10);

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;

    // Update config
    currentConfig.sections[sectionIndex].images[imageIndex].src = dataUrl;

    // Update the picker thumbnail
    const picker = e.target.closest('.image-picker');
    if (picker) {
      picker.style.backgroundImage = `url('${dataUrl}')`;
      picker.classList.add('has-image');
      picker.querySelector('.image-picker-label').textContent = 'Change';
    }

    updatePreview();
  };
  reader.readAsDataURL(file);
}

/**
 * Delete an image from a section
 */
function deleteImage(sectionIndex, imageIndex) {
  currentConfig.sections[sectionIndex].images.splice(imageIndex, 1);
  renderSectionForms();
  bindImageButtons();
  updatePreview();
}

// Store audio control handlers for cleanup
let audioControlHandlers = null;

/**
 * Bind audio controls (dropdown, file picker, volume)
 */
function bindAudioControls() {
  const audioSelect = document.getElementById('audio-select');
  const audioCustom = document.getElementById('audio-custom');
  const audioPicker = document.getElementById('audio-picker');
  const audioFileInput = document.getElementById('audio-file-input');
  const audioPickerLabel = document.getElementById('audio-picker-label');
  const volumeLabel = document.getElementById('volume-label');
  const audioVolume = document.getElementById('audio-volume');

  if (!audioSelect) return;

  // Remove existing handlers if present
  if (audioControlHandlers) {
    audioSelect.removeEventListener('change', audioControlHandlers.selectChange);
    audioFileInput.removeEventListener('change', audioControlHandlers.fileChange);
    audioVolume.removeEventListener('input', audioControlHandlers.volumeChange);
  }

  // Determine initial state from config
  const audioSrc = currentConfig.audio?.src;
  if (!audioSrc) {
    audioSelect.value = 'silent';
    volumeLabel.style.display = 'none';
    audioCustom.style.display = 'none';
  } else if (audioSrc === '/assets/audio/lullaby.mp3') {
    audioSelect.value = 'default';
    audioCustom.style.display = 'none';
    volumeLabel.style.display = '';
  } else {
    audioSelect.value = 'custom';
    audioCustom.style.display = 'flex';
    audioPicker.classList.add('has-audio');
    audioPickerLabel.textContent = 'Audio';
    volumeLabel.style.display = '';
  }

  // Set volume slider
  if (currentConfig.audio?.volume !== undefined) {
    audioVolume.value = currentConfig.audio.volume;
  }

  // Define handlers
  const selectChange = () => {
    const value = audioSelect.value;

    if (value === 'default') {
      currentConfig.audio = { src: '/assets/audio/lullaby.mp3', volume: parseFloat(audioVolume.value) };
      audioCustom.style.display = 'none';
      volumeLabel.style.display = '';
    } else if (value === 'silent') {
      currentConfig.audio = { src: null, volume: 0 };
      audioCustom.style.display = 'none';
      volumeLabel.style.display = 'none';
    } else if (value === 'custom') {
      audioCustom.style.display = 'flex';
      volumeLabel.style.display = '';
      // Keep existing custom audio if we have one, otherwise wait for upload
      if (!currentConfig.audio?.src || currentConfig.audio.src === '/assets/audio/lullaby.mp3') {
        // Don't change src yet - wait for file upload
      }
    }

    updatePreview();
  };

  const fileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      currentConfig.audio = { src: dataUrl, volume: parseFloat(audioVolume.value) };

      audioPicker.classList.add('has-audio');
      audioPickerLabel.textContent = file.name.length > 12 ? file.name.slice(0, 10) + '...' : file.name;

      updatePreview();
    };
    reader.readAsDataURL(file);
  };

  const volumeChange = () => {
    if (currentConfig.audio) {
      currentConfig.audio.volume = parseFloat(audioVolume.value);
    }
    updatePreview();
  };

  // Store handlers for cleanup
  audioControlHandlers = { selectChange, fileChange, volumeChange };

  // Add listeners
  audioSelect.addEventListener('change', selectChange);
  audioFileInput.addEventListener('change', fileChange);
  audioVolume.addEventListener('input', volumeChange);
}

/**
 * Bind section fieldsets to track focus and sync with preview
 * Uses event delegation to avoid duplicate listeners on re-renders
 */
function bindSectionFocus() {
  // Remove existing listener if present
  sectionsContainer.removeEventListener('focusin', handleSectionFocusIn);
  sectionsContainer.removeEventListener('click', handleSectionClick);

  // Add single delegated listeners
  sectionsContainer.addEventListener('focusin', handleSectionFocusIn);
  sectionsContainer.addEventListener('click', handleSectionClick);
}

/**
 * Handle focusin events via delegation
 */
function handleSectionFocusIn(e) {
  const fieldset = e.target.closest('.section-fieldset');
  if (fieldset) {
    const index = parseInt(fieldset.dataset.sectionIndex, 10);
    setActiveSection(index);
  }
}

/**
 * Handle click events via delegation
 */
function handleSectionClick(e) {
  const fieldset = e.target.closest('.section-fieldset');
  if (fieldset) {
    const index = parseInt(fieldset.dataset.sectionIndex, 10);
    setActiveSection(index);
  }
}

/**
 * Set the active section and sync preview
 * index -1 = intro screen, 0+ = sections
 */
function setActiveSection(index) {
  const previousIndex = activeSectionIndex;
  activeSectionIndex = index;

  // Only update DOM if the section actually changed
  if (previousIndex !== index) {
    // Update form UI - remove all active states
    document.querySelectorAll('.section-fieldset').forEach(fs => {
      fs.classList.remove('active');
    });
    const introFieldset = document.getElementById('intro-fieldset');
    if (introFieldset) {
      introFieldset.classList.remove('active');
    }

    // Add active state to the appropriate fieldset
    if (index === -1) {
      // Intro screen
      if (introFieldset) {
        introFieldset.classList.add('active');
      }
      showIntroInPreview();
    } else {
      // Section
      const activeFieldset = document.querySelector(`[data-section-index="${index}"]`);
      if (activeFieldset) {
        activeFieldset.classList.add('active');
      }
      scrollPreviewToSection(index);
    }
  }
}

/**
 * Show the intro overlay in the preview
 */
function showIntroInPreview() {
  const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  if (!iframeDoc) return;

  // Show intro overlay
  const overlay = iframeDoc.getElementById('intro-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }

  // Remove section highlights
  iframeDoc.querySelectorAll('.card-section').forEach(s => {
    s.classList.remove('builder-active');
  });

  // Scroll to top
  iframeDoc.documentElement.scrollTop = 0;
}

/**
 * Scroll the preview iframe to show the active section
 */
function scrollPreviewToSection(index) {
  const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  if (!iframeDoc) return;

  // Hide intro overlay when viewing sections
  const overlay = iframeDoc.getElementById('intro-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  iframeDoc.body?.classList.remove('intro-active');

  // Remove previous highlight
  iframeDoc.querySelectorAll('.card-section').forEach(s => {
    s.classList.remove('builder-active');
  });

  // Find and highlight the active section
  const sectionNum = index + 1;
  const section = iframeDoc.querySelector(`[data-section="${sectionNum}"]`);
  if (section) {
    section.classList.add('builder-active');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Add an image to a section
 */
function addImageToSection(sectionIndex) {
  if (!currentConfig.sections[sectionIndex].images) {
    currentConfig.sections[sectionIndex].images = [];
  }
  currentConfig.sections[sectionIndex].images.push({
    src: '',
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

          /* Active section highlight for builder */
          .card-section.builder-active {
            outline: 3px solid var(--color-accent-primary);
            outline-offset: -3px;
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Show intro overlay by default (will be hidden when navigating to sections)
          // Don't auto-hide it anymore

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

  // After preview reloads, restore the active section view if one is selected
  if (activeSectionIndex >= 0) {
    // Small delay to ensure iframe content is ready
    setTimeout(() => {
      scrollPreviewToSection(activeSectionIndex);
    }, 50);
  }
}

/**
 * Export the current config as JSON file download
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
 * Import config from a JSON file
 */
function importConfig(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      loadConfig(imported);
    } catch (err) {
      alert('Invalid JSON file. Please check the format.');
      console.error('Import error:', err);
    }
  };
  reader.readAsText(file);

  // Reset input so same file can be re-imported
  e.target.value = '';
}

/**
 * Load a config object into the builder
 */
function loadConfig(config) {
  // Validate basic structure
  if (!config.intro || !Array.isArray(config.sections)) {
    alert('Invalid config format. Missing intro or sections.');
    return;
  }

  currentConfig = JSON.parse(JSON.stringify(config));
  activeSectionIndex = -1;

  // Update intro form fields
  const introFields = ['year', 'title', 'from'];
  introFields.forEach(field => {
    const input = form.querySelector(`[name="intro.${field}"]`);
    if (input && config.intro[field] !== undefined) {
      input.value = config.intro[field] || '';
    }
  });

  // Re-render sections and update preview
  renderSectionForms();
  bindImageButtons();
  bindAudioControls(); // Re-bind to update audio UI from imported config
  updatePreview();
}

/**
 * Generate a shareable URL to the card (not the builder)
 */
function generateShareLink() {
  try {
    // Check for large data URLs (custom audio/images) that won't work in URL
    const hasCustomAudio = currentConfig.audio?.src?.startsWith('data:');
    const hasCustomImages = currentConfig.sections.some(s =>
      s.images?.some(img => img.src?.startsWith('data:'))
    );

    if (hasCustomAudio || hasCustomImages) {
      const issues = [];
      if (hasCustomAudio) issues.push('custom audio');
      if (hasCustomImages) issues.push('uploaded images');

      alert(`Share links don't support ${issues.join(' or ')} (too large for URLs).\n\nUse "Export JSON" instead to save your full config, or switch to the default audio track.`);
      return;
    }

    const json = JSON.stringify(currentConfig);
    const encoded = btoa(encodeURIComponent(json));
    // Share link points to the card viewer (index.html), not the builder
    const shareUrl = `${window.location.origin}/#config=${encoded}`;

    // Check URL length (browsers have limits ~2000-8000 chars)
    if (shareUrl.length > 6000) {
      alert('Config is too large for a share link. Use "Export JSON" instead.');
      return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Share link copied to clipboard!');
    }).catch(() => {
      // Fallback: show in prompt
      prompt('Copy this share link:', shareUrl);
    });
  } catch (err) {
    alert('Failed to generate share link. Config may be too large.');
    console.error('Share error:', err);
  }
}

/**
 * Load config from URL hash if present
 */
function loadConfigFromUrl() {
  const hash = window.location.hash;
  if (!hash.startsWith('#config=')) return;

  try {
    const encoded = hash.slice(8); // Remove '#config='
    const json = decodeURIComponent(atob(encoded));
    const config = JSON.parse(json);
    currentConfig = config;

    // Clear hash to avoid issues with editing
    history.replaceState(null, '', window.location.pathname);
  } catch (err) {
    console.error('Failed to load config from URL:', err);
  }
}

/**
 * Show a temporary toast notification
 */
function showToast(message) {
  const existing = document.querySelector('.builder-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'builder-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
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
 * Initialize the resizable panel divider
 */
function initResizableDivider() {
  const divider = document.getElementById('builder-divider');
  const layout = document.querySelector('.builder-layout');

  let isDragging = false;

  divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const newWidth = Math.max(300, Math.min(e.clientX, window.innerWidth - 300));
    layout.style.setProperty('--panel-width', `${newWidth}px`);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      divider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
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
  initResizableDivider();
});
