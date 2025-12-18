/**
 * CardRenderer
 *
 * Takes a card config object and renders the complete card HTML.
 * Used by both the main site and the builder preview.
 *
 * Returns an object with:
 *   - html: The rendered HTML string
 *   - init: Function to call after inserting HTML (sets up audio, observers)
 *   - cleanup: Function to call before removing (stops audio, disconnects observers)
 */

/**
 * Render the complete card from config
 * @param {Object} config - The card configuration object
 * @returns {Object} { html, init, cleanup }
 */
export function renderCard(config) {
  const html = `
    ${renderIntroOverlay(config.intro)}
    ${config.sections.map((section, index) => renderSection(section, index)).join('\n')}
  `;

  let audio = null;
  let sectionObserver = null;
  let hasEntered = false;

  function init(container) {
    // Set up audio
    if (config.audio?.src) {
      audio = new Audio(config.audio.src);
      audio.loop = true;
      audio.volume = config.audio.volume ?? 0.4;
      audio.preload = 'auto';
    }

    // Set up intro overlay interaction
    const overlay = container.querySelector('#intro-overlay');
    if (overlay) {
      const body = document.body;
      body.classList.add('intro-active');

      const enterSite = (e) => {
        if (hasEntered) return;
        hasEntered = true;
        e.preventDefault();

        if (audio) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => console.log('Audio play failed:', err));
          }
        }

        overlay.classList.add('hidden');
        body.classList.remove('intro-active');
      };

      overlay.addEventListener('touchend', enterSite);
      overlay.addEventListener('click', enterSite);
    }

    // Set up cat animation observers
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.5
    };

    sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const section = entry.target;
        const catTrigger = section.querySelector('[data-cat-trigger]');
        if (catTrigger) {
          catTrigger.classList.add('is-visible');
          section.classList.add('cat-active');
        }
      });
    }, observerOptions);

    const sections = container.querySelectorAll('.card-section');
    sections.forEach(section => sectionObserver.observe(section));
  }

  function cleanup() {
    if (audio) {
      audio.pause();
      audio.src = '';
      audio = null;
    }
    if (sectionObserver) {
      sectionObserver.disconnect();
      sectionObserver = null;
    }
    hasEntered = false;
  }

  return { html, init, cleanup };
}

/**
 * Render the intro overlay
 */
function renderIntroOverlay(intro) {
  const imageHtml = intro.image
    ? `<img src="${escapeHtml(intro.image)}" alt="" class="intro-image" />`
    : '';

  return `
    <div id="intro-overlay">
      <div class="intro-content">
        ${imageHtml}
        <p class="intro-year">${escapeHtml(intro.year)}</p>
        <h1 class="intro-title">${escapeHtml(intro.title)}</h1>
        <p class="intro-from">${escapeHtml(intro.from)}</p>
        <p class="intro-tap">${escapeHtml(intro.tapPrompt || 'tap to enter')}</p>
      </div>
    </div>
  `;
}

/**
 * Render a single section
 */
function renderSection(section, index) {
  const sectionNum = index + 1;
  const catAnimation = section.catAnimation || 'none';

  return `
    <section
      class="card-section"
      data-section="${sectionNum}"
      data-cat-animation="${catAnimation}"
    >
      ${renderCatStage(section)}
      <div class="section-content">
        <h${sectionNum === 1 ? '1' : '2'} class="section-title">${escapeHtml(section.title)}</h${sectionNum === 1 ? '1' : '2'}>
        ${renderImages(section)}
        ${section.body ? `<div class="section-body"><p>${escapeHtml(section.body)}</p></div>` : ''}
      </div>
      ${sectionNum === 1 ? renderScrollHint() : ''}
    </section>
  `;
}

/**
 * Render the cat stage for a section
 */
function renderCatStage(section) {
  if (!section.catImage || section.catAnimation === 'none') {
    return '';
  }

  return `
    <div class="cat-stage">
      <div class="cat-container" data-cat-trigger>
        <img src="${escapeHtml(section.catImage)}" alt="" class="cat" />
      </div>
    </div>
  `;
}

/**
 * Render images for a section
 */
function renderImages(section) {
  if (!section.images || section.images.length === 0) {
    return '';
  }

  // Single image layout
  if (section.layout === 'single' || section.images.length === 1) {
    const img = section.images[0];
    return `
      <img
        src="${escapeHtml(img.src)}"
        alt="${escapeHtml(img.alt || '')}"
        class="section-image"
      />
    `;
  }

  // Scrapbook layout
  const layoutClass = section.layout ? `layout-${section.layout}` : '';

  const photos = section.images.map((img, index) => {
    const wrapperClasses = ['photo-wrapper'];
    const imgClasses = ['scrapbook-photo'];

    // Auto-apply span classes based on layout and position
    const autoSpan = getAutoSpan(section.layout, index);
    if (autoSpan) wrapperClasses.push(autoSpan);

    // Manual span override from config
    if (img.span) wrapperClasses.push(img.span);
    if (img.rotation) imgClasses.push(`rotate-${img.rotation}`);

    return `
      <div class="${wrapperClasses.join(' ')}">
        <img
          src="${escapeHtml(img.src)}"
          alt="${escapeHtml(img.alt || '')}"
          class="${imgClasses.join(' ')}"
        />
      </div>
    `;
  }).join('\n');

  return `
    <div class="scrapbook ${layoutClass}">
      ${photos}
    </div>
  `;
}

/**
 * Render the scroll hint
 */
function renderScrollHint() {
  return `
    <div class="scroll-hint" id="scroll-hint">
      <span class="scroll-hint-arrow">&#8595;</span>
    </div>
  `;
}

/**
 * Get auto-applied span class based on layout and image position
 * @param {string} layout - The layout type
 * @param {number} index - The image index (0-based)
 * @returns {string|null} - The span class to apply, or null
 */
function getAutoSpan(layout, index) {
  switch (layout) {
    case 'hero-top':
      // First image spans both columns (hero on top)
      return index === 0 ? 'hero' : null;
    case 'hero-bottom':
      // Third image spans both columns (hero on bottom)
      return index === 2 ? 'hero' : null;
    case 'tall-left':
      // First image spans both rows (tall on left)
      return index === 0 ? 'tall' : null;
    case 'tall-right':
      // Third image spans both rows (tall on right)
      return index === 2 ? 'tall' : null;
    default:
      return null;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}
