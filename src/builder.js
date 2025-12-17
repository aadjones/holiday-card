/**
 * Card Builder
 *
 * Visual editor for prototyping holiday cards.
 * Generates a config object and renders a live preview.
 */

import { defaultConfig } from './cardConfig.js';
import { compressImage } from './builder/imageUtils.js';
import { renderSectionForms } from './builder/formRenderer.js';
import {
  initPreview,
  updatePreview,
  showIntroInPreview,
  scrollPreviewToSection,
  getActiveSectionIndex,
  setActiveSectionIndex
} from './builder/previewManager.js';

// Clone the default config as our working copy
let currentConfig = JSON.parse(JSON.stringify(defaultConfig));

// DOM elements
const form = document.getElementById('builder-form');
const sectionsContainer = document.getElementById('sections-container');
const previewIframe = document.getElementById('preview-iframe');
const addSectionBtn = document.getElementById('add-section-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file-input');
const shareBtn = document.getElementById('share-btn');

// Store audio control handlers for cleanup
let audioControlHandlers = null;

/**
 * Initialize the builder
 */
function init() {
  initPreview(previewIframe);
  loadConfigFromUrl();
  renderSections();

  addSectionBtn.addEventListener('click', addSection);
  exportBtn.addEventListener('click', exportConfig);
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', importConfig);
  shareBtn.addEventListener('click', generateShareLink);

  form.addEventListener('input', debounce(handleFormInput, 300));

  const introFieldset = document.getElementById('intro-fieldset');
  if (introFieldset) {
    introFieldset.addEventListener('click', () => setActiveSection(-1));
    introFieldset.addEventListener('focusin', () => setActiveSection(-1));
  }

  bindAudioControls();
  bindIntroImageControls();
  updatePreview(currentConfig);
}

/**
 * Render section forms and bind events
 */
function renderSections() {
  sectionsContainer.innerHTML = renderSectionForms(currentConfig.sections);

  sectionsContainer.querySelectorAll('.delete-section-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      deleteSection(index);
    });
  });

  bindSectionFocus();
  bindImageButtons();
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
  updatePreview(currentConfig);
}

/**
 * Set a nested value in an object using dot notation
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
  renderSections();
  updatePreview(currentConfig);
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
  renderSections();
  updatePreview(currentConfig);
}

/**
 * Bind add/delete image buttons and file inputs
 */
function bindImageButtons() {
  document.querySelectorAll('.add-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectionIndex = parseInt(e.target.dataset.section, 10);
      addImageToSection(sectionIndex);
    });
  });

  document.querySelectorAll('.image-file-input').forEach(input => {
    input.addEventListener('change', handleImageUpload);
  });

  document.querySelectorAll('.delete-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectionIndex = parseInt(e.target.dataset.section, 10);
      const imageIndex = parseInt(e.target.dataset.image, 10);
      deleteImage(sectionIndex, imageIndex);
    });
  });
}

/**
 * Handle image file upload
 */
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const sectionIndex = parseInt(e.target.dataset.section, 10);
  const imageIndex = parseInt(e.target.dataset.image, 10);
  const picker = e.target.closest('.image-picker');

  try {
    if (picker) {
      picker.querySelector('.image-picker-label').textContent = '...';
    }

    const dataUrl = await compressImage(file);
    currentConfig.sections[sectionIndex].images[imageIndex].src = dataUrl;

    if (picker) {
      picker.style.backgroundImage = `url('${dataUrl}')`;
      picker.classList.add('has-image');
      picker.querySelector('.image-picker-label').textContent = 'Change';
    }

    updatePreview(currentConfig);
  } catch (err) {
    console.error('Image compression failed:', err);
    alert('Failed to process image. Please try a different file.');
    if (picker) {
      picker.querySelector('.image-picker-label').textContent = '+ Image';
    }
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
  renderSections();
}

/**
 * Delete an image from a section
 */
function deleteImage(sectionIndex, imageIndex) {
  currentConfig.sections[sectionIndex].images.splice(imageIndex, 1);
  renderSections();
  updatePreview(currentConfig);
}

/**
 * Bind audio controls
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

  if (audioControlHandlers) {
    audioSelect.removeEventListener('change', audioControlHandlers.selectChange);
    audioFileInput.removeEventListener('change', audioControlHandlers.fileChange);
    audioVolume.removeEventListener('input', audioControlHandlers.volumeChange);
  }

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

  if (currentConfig.audio?.volume !== undefined) {
    audioVolume.value = currentConfig.audio.volume;
  }

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
    }

    updatePreview(currentConfig);
  };

  const fileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      alert(`Audio file is too large (${fileSizeMB.toFixed(1)}MB).\n\nPlease use an audio file smaller than 5MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      currentConfig.audio = { src: dataUrl, volume: parseFloat(audioVolume.value) };

      audioPicker.classList.add('has-audio');
      audioPickerLabel.textContent = file.name.length > 12 ? file.name.slice(0, 10) + '...' : file.name;

      updatePreview(currentConfig);
    };
    reader.readAsDataURL(file);
  };

  const volumeChange = () => {
    if (currentConfig.audio) {
      currentConfig.audio.volume = parseFloat(audioVolume.value);
    }
    updatePreview(currentConfig);
  };

  audioControlHandlers = { selectChange, fileChange, volumeChange };

  audioSelect.addEventListener('change', selectChange);
  audioFileInput.addEventListener('change', fileChange);
  audioVolume.addEventListener('input', volumeChange);
}

/**
 * Bind intro image controls
 */
function bindIntroImageControls() {
  const picker = document.getElementById('intro-image-picker');
  const input = document.getElementById('intro-image-input');
  const label = document.getElementById('intro-image-label');
  const removeBtn = document.getElementById('intro-image-remove');

  if (!input) return;

  // Set initial state from config
  if (currentConfig.intro?.image) {
    picker.style.backgroundImage = `url('${currentConfig.intro.image}')`;
    picker.classList.add('has-image');
    label.textContent = 'Change';
    removeBtn.style.display = '';
  }

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      label.textContent = '...';
      const dataUrl = await compressImage(file);
      currentConfig.intro.image = dataUrl;

      picker.style.backgroundImage = `url('${dataUrl}')`;
      picker.classList.add('has-image');
      label.textContent = 'Change';
      removeBtn.style.display = '';

      updatePreview(currentConfig);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('Failed to process image. Please try a different file.');
      label.textContent = '+ Image';
    }
  });

  removeBtn.addEventListener('click', () => {
    currentConfig.intro.image = null;
    picker.style.backgroundImage = '';
    picker.classList.remove('has-image');
    label.textContent = '+ Image';
    removeBtn.style.display = 'none';
    input.value = '';
    updatePreview(currentConfig);
  });
}

/**
 * Bind section fieldsets for focus tracking
 */
function bindSectionFocus() {
  sectionsContainer.removeEventListener('focusin', handleSectionFocusIn);
  sectionsContainer.removeEventListener('click', handleSectionClick);

  sectionsContainer.addEventListener('focusin', handleSectionFocusIn);
  sectionsContainer.addEventListener('click', handleSectionClick);
}

function handleSectionFocusIn(e) {
  const fieldset = e.target.closest('.section-fieldset');
  if (fieldset) {
    const index = parseInt(fieldset.dataset.sectionIndex, 10);
    setActiveSection(index);
  }
}

function handleSectionClick(e) {
  const fieldset = e.target.closest('.section-fieldset');
  if (fieldset) {
    const index = parseInt(fieldset.dataset.sectionIndex, 10);
    setActiveSection(index);
  }
}

/**
 * Set the active section and sync preview
 */
function setActiveSection(index) {
  const previousIndex = getActiveSectionIndex();
  setActiveSectionIndex(index);

  if (previousIndex !== index) {
    document.querySelectorAll('.section-fieldset').forEach(fs => {
      fs.classList.remove('active');
    });
    const introFieldset = document.getElementById('intro-fieldset');
    if (introFieldset) {
      introFieldset.classList.remove('active');
    }

    if (index === -1) {
      if (introFieldset) {
        introFieldset.classList.add('active');
      }
      showIntroInPreview();
    } else {
      const activeFieldset = document.querySelector(`[data-section-index="${index}"]`);
      if (activeFieldset) {
        activeFieldset.classList.add('active');
      }
      scrollPreviewToSection(index);
    }
  }
}

/**
 * Export the current config as JSON file
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
  e.target.value = '';
}

/**
 * Load a config object into the builder
 */
function loadConfig(config) {
  if (!config.intro || !Array.isArray(config.sections)) {
    alert('Invalid config format. Missing intro or sections.');
    return;
  }

  currentConfig = JSON.parse(JSON.stringify(config));
  setActiveSectionIndex(-1);

  const introFields = ['year', 'title', 'from'];
  introFields.forEach(field => {
    const input = form.querySelector(`[name="intro.${field}"]`);
    if (input && config.intro[field] !== undefined) {
      input.value = config.intro[field] || '';
    }
  });

  renderSections();
  bindAudioControls();
  bindIntroImageControls();
  updatePreview(currentConfig);
}

/**
 * Generate a shareable URL
 */
async function generateShareLink() {
  try {
    shareBtn.disabled = true;
    shareBtn.textContent = 'Saving...';

    const configJson = JSON.stringify({ config: currentConfig });
    const configSizeMB = new Blob([configJson]).size / (1024 * 1024);

    if (configSizeMB > 9) {
      alert(`Your card is too large to share (${configSizeMB.toFixed(1)}MB).\n\nTry using fewer or smaller images, or use "Export JSON" to save locally.`);
      return;
    }

    const response = await fetch('/api/card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: configJson,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save card');
    }

    const { id } = await response.json();
    const shareUrl = `${window.location.origin}/#card=${id}`;

    await navigator.clipboard.writeText(shareUrl).catch(() => {
      prompt('Copy this share link:', shareUrl);
    });

    showToast('Share link copied to clipboard!');
  } catch (err) {
    alert('Failed to generate share link: ' + err.message);
    console.error('Share error:', err);
  } finally {
    shareBtn.disabled = false;
    shareBtn.textContent = 'Share Link';
  }
}

/**
 * Load config from URL hash if present
 */
function loadConfigFromUrl() {
  const hash = window.location.hash;
  if (!hash.startsWith('#config=')) return;

  try {
    const encoded = hash.slice(8);
    const json = decodeURIComponent(atob(encoded));
    const config = JSON.parse(json);
    currentConfig = config;
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

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * Debounce function calls
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  init();
  initResizableDivider();
});
