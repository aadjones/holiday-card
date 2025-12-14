/**
 * Form HTML rendering for the card builder
 */

import { presets } from '../cardConfig.js';

/**
 * Render all section forms
 * @param {Array} sections - Array of section configs
 * @returns {string} HTML string
 */
export function renderSectionForms(sections) {
  return sections
    .map((section, index) => renderSectionForm(section, index))
    .join('');
}

/**
 * Render a single section's form
 * @param {Object} section - Section config
 * @param {number} index - Section index
 * @returns {string} HTML string
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
 * @param {number} sectionIndex - Parent section index
 * @param {Object} image - Image config
 * @param {number} imageIndex - Image index within section
 * @returns {string} HTML string
 */
function renderImageForm(sectionIndex, image, imageIndex) {
  const rotationOptions = presets.rotations
    .map(r => `<option value="${r.id || ''}" ${image.rotation === r.id ? 'selected' : ''}>${r.label}</option>`)
    .join('');

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
 * Escape HTML special characters
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Escape attribute value
 * @param {string} text
 * @returns {string}
 */
function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, '&quot;');
}
