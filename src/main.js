/**
 * Holiday Card - Main JavaScript
 * Scroll-triggered cat animations
 *
 * Architecture:
 * - .cat-stage: Absolute overlay layer for cat positioning
 * - .cat-container: Individual cat with animation trigger
 * - .cat-active: Added to section to trigger text animations
 *
 * Text swaps are handled in CSS via synchronized keyframe animations.
 * This JS only handles scroll-triggered visibility toggles.
 */

// Observer options - triggers when section is roughly centered in viewport
const observerOptions = {
  root: null,
  rootMargin: '-10% 0px -10% 0px',
  threshold: 0.5
};

// Single observer instance for all sections
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const section = entry.target;
    const catTrigger = section.querySelector('[data-cat-trigger]');

    if (catTrigger) {
      // Trigger cat animation
      catTrigger.classList.add('is-visible');
      // Trigger text animations on the section
      section.classList.add('cat-active');
    }
  });
}, observerOptions);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.card-section');
  sections.forEach(section => sectionObserver.observe(section));

  console.log(`Holiday card initialized. Observing ${sections.length} sections.`);
});
