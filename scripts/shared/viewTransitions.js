/**
 * View Transitions API Support for MPA
 * Page transitions are enabled in CSS via `@view-transition { navigation: auto; }`
 * (see styles/base/transitions.css), so no JS navigation handling is needed.
 */

/**
 * Marks body as loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
});
