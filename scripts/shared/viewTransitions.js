/**
 * View Transitions API Support for MPA
 * Enables smooth page transitions between different pages
 */

/**
 * Marks body as loaded (fallback)
 */
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");
});

/**
 * Checks if View Transitions API is supported
 * @returns {boolean} True if supported, false otherwise
 */
function supportsViewTransitions() {
  return "startViewTransition" in document;
}

/**
 * Checks if a link should use view transitions
 * @param {HTMLElement} link - The link element
 * @param {Event} e - The click event
 * @returns {boolean} True if transition should be used
 */
function shouldUseTransition(link, e) {
  if (!link || link.target === "_blank" || link.origin !== location.origin) {
    return false;
  }
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return false;
  }
  if (link.classList.contains("menu__mobile__link")) {
    return false;
  }
  return true;
}

/**
 * Navigates to a URL with view transition
 * @param {string} url - The URL to navigate to
 */
function navigateWithTransition(url) {
  if (document.startViewTransition) {
    try {
      document.startViewTransition(() => {
        window.location.href = url;
      });
    } catch (error) {
      console.warn("View Transition failed, using normal navigation:", error);
      window.location.href = url;
    }
  } else {
    window.location.href = url;
  }
}

/**
 * Enables view transitions for links
 */
function setupViewTransitions() {
  if (!supportsViewTransitions()) {
    return;
  }
  setupLinkInterception();
  setupHistoryTransitions();
}

/**
 * Sets up click interception for internal links
 */
function setupLinkInterception() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!shouldUseTransition(link, e)) {
      return;
    }
    e.preventDefault();
    navigateWithTransition(link.href);
  });
}

/**
 * Sets up view transitions for programmatic navigation
 */
function setupHistoryTransitions() {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  history.pushState = function (...args) {
    wrapHistoryMethod(originalPushState, args);
  };
  history.replaceState = function (...args) {
    wrapHistoryMethod(originalReplaceState, args);
  };
}

/**
 * Wraps a history method with view transition
 * @param {Function} method - The original history method
 * @param {Array} args - The method arguments
 */
function wrapHistoryMethod(method, args) {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      method.apply(history, args);
    });
  } else {
    method.apply(history, args);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupViewTransitions);
} else {
  setupViewTransitions();
}

export {
  supportsViewTransitions,
  shouldUseTransition,
  navigateWithTransition,
  setupViewTransitions,
  setupLinkInterception,
  setupHistoryTransitions,
};
