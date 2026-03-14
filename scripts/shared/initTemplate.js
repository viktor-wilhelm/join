import { includeHTML } from './includeHtml.js';
import { getInitials } from './utilities.js';
import { removeCurrentUserContact, resetDataStore } from '../dataStore.js';
import { setSidebarMode, setupLoginButton, setActiveMenuBtnOnLoad, setupMenuNavigation } from './menu.js';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase.config.js';

/**
 * Initializes the shared template (header/menu) after includes are loaded
 */
async function initTemplate() {
  if (typeof includeHTML !== "function") {
    console.error(
      "includeHTML is not available. Make sure include-html.js is loaded first.",
    );
    return;
  }
  await includeHTML();
  setBackButtonMode();
  updateNavigation();
  setUserInitials();
  initializeMenuAndLogout();
  applySidebarMode();
  applyGuestModeClass();
}

/**
 * Initializes menu navigation and logout functionality
 */
function initializeMenuAndLogout() {
  if (typeof initMenuNavigation === "function") {
    initMenuNavigation();
  }
  setupLogoutLink();
  setupUserMenu();
  initializeMenuFeatures();
}

/**
 * Sets up the logout link functionality
 */
function setupLogoutLink() {
  const logoutLink = document.getElementById("logoutLink");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (event) => {
    event.preventDefault();

    removeCurrentUserContact();
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("joinData");
    sessionStorage.removeItem("greetingShown");
    resetDataStore();

    signOut(auth).finally(() => {
      window.location.href = "../index.html";
    });
  });
}

/**
 * Initializes additional menu features if available
 */
function initializeMenuFeatures() {
  if (typeof setActiveMenuBtnOnLoad === "function") {
    setActiveMenuBtnOnLoad();
  }
  if (typeof setupMenuNavigation === "function") {
    setupMenuNavigation();
  }
}

/**
 * Updates navigation state based on current page
 */
function updateNavigation() {
  const path = window.location.pathname.toLowerCase();
  document.querySelectorAll(".menu__btn").forEach((btn) => {
    btn.classList.remove("active");
    const pageName = btn.id.replace("nav", "").toLowerCase();
    if (
      path.includes(pageName) ||
      (path.endsWith("/") && pageName === "summary")
    ) {
      btn.classList.add("active");
    }
  });
}

/**
 * Sets up the user menu with event listeners
 */
function setupUserMenu() {
  const elements = getUserMenuElements();
  if (!elements) return;
  const { avatar, menu } = elements;
  avatar.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleUserMenu(avatar, menu);
  });
  menu.addEventListener("click", () => setUserMenuState(avatar, menu, false));
  document.addEventListener("click", (event) =>
    handleOutsideClick(event, avatar, menu),
  );
  document.addEventListener("keydown", (event) =>
    handleEscape(event, avatar, menu),
  );
}

/**
 * Gets user menu DOM elements
 * @returns {Object|null} - Object with avatar and menu elements, or null if not found
 */
function getUserMenuElements() {
  const avatar = document.getElementById("userAvatar");
  const menu = document.getElementById("userMenu");
  if (!avatar || !menu) return null;
  return { avatar, menu };
}

/**
 * Sets the user menu state (open/closed)
 * @param {HTMLElement} avatar - The avatar element
 * @param {HTMLElement} menu - The menu element
 * @param {boolean} open - Whether the menu should be open
 */
function setUserMenuState(avatar, menu, open) {
  menu.classList.toggle("is-open", open);
  avatar.setAttribute("aria-expanded", String(open));
  if (open) {
    menu.removeAttribute("inert");
  } else {
    menu.setAttribute("inert", "");
  }
}

/**
 * Toggles the user menu between open and closed states
 * @param {HTMLElement} avatar - The avatar element
 * @param {HTMLElement} menu - The menu element
 */
function toggleUserMenu(avatar, menu) {
  const isOpen = menu.classList.contains("is-open");
  setUserMenuState(avatar, menu, !isOpen);
}

/**
 * Handles clicks outside the user menu to close it
 * @param {Event} event - The click event
 * @param {HTMLElement} avatar - The avatar element
 * @param {HTMLElement} menu - The menu element
 */
function handleOutsideClick(event, avatar, menu) {
  if (!menu.contains(event.target) && event.target !== avatar) {
    setUserMenuState(avatar, menu, false);
  }
}

/**
 * Handles escape key press to close the user menu
 * @param {KeyboardEvent} event - The keyboard event
 * @param {HTMLElement} avatar - The avatar element
 * @param {HTMLElement} menu - The menu element
 */
function handleEscape(event, avatar, menu) {
  if (event.key === "Escape") {
    setUserMenuState(avatar, menu, false);
  }
}

/**
 * Sets user initials in the header avatar
 */
function setUserInitials() {
  const avatar = document.getElementById("userAvatar");
  if (!avatar) return;
  const initials = getUserInitials();
  setInitialsToAvatar(avatar, initials);
}

/**
 * Retrieves user initials from session storage
 * @returns {string} - User initials or default "MS"
 */
function getUserInitials() {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  let initials = "MS";
  if (loggedInUserString) {
    try {
      const user = JSON.parse(loggedInUserString);
      if (user && user.name) {
        initials = getInitials(user.name, "SM");
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  return initials;
}

/**
 * Sets the initials to the avatar element
 * @param {HTMLElement} avatar - The avatar element
 * @param {string} initials - The initials to display
 */
function setInitialsToAvatar(avatar, initials) {
  const initialsElement = avatar.querySelector(".header__user-initials");
  if (initialsElement) {
    initialsElement.textContent = initials;
  } else {
    avatar.textContent = initials;
  }
}

/**
 * Checks if a user is currently logged in
 * @returns {boolean} - True if user is logged in
 */
function isUserLoggedIn() {
  const loggedInUser = sessionStorage.getItem("loggedInUser");
  return loggedInUser !== null && loggedInUser !== "";
}

/**
 * Determines if external mode should be used
 * External mode is only used when:
 * - User is NOT logged in AND
 * - Page is privacy-policy or legal-notice
 * @returns {boolean} - True if external mode should be used
 */
function shouldUseExternalMode() {
  const path = window.location.pathname.toLowerCase();
  const isPublicPage =
    path.includes("privacy-policy.html") || path.includes("legal-notice.html");

  // External mode only when NOT logged in AND on public page
  return isPublicPage && !isUserLoggedIn();
}

/**
 * Sets the back button visibility mode based on the current page
 * Uses body classes as Single Source of Truth
 * - help.html => body.has-back-btn (always visible)
 * - privacy-policy.html/legal-notice.html => body.back-btn-mobile-only (mobile only)
 * - all other pages => no class (never visible)
 */
function setBackButtonMode() {
  const path = window.location.pathname.toLowerCase();
  const body = document.body;

  // Remove previous back button classes
  body.classList.remove("has-back-btn", "back-btn-mobile-only");

  if (path.includes("help.html")) {
    body.classList.add("has-back-btn");
  } else if (
    path.includes("privacy-policy.html") ||
    path.includes("legal-notice.html")
  ) {
    body.classList.add("back-btn-mobile-only");
  }

  // Setup click handler for back button
  setupBackButtonNavigation();
}

/**
 * Replaces the back button to remove previous event listeners
 * @param {HTMLElement} backButton - The back button element
 * @returns {HTMLElement} - The new back button element
 */
function replaceBackButton(backButton) {
  const newBackButton = backButton.cloneNode(true);
  backButton.parentNode.replaceChild(newBackButton, backButton);
  return newBackButton;
}

/**
 * Handles back button click event
 * @param {Event} e - The click event
 */
function handleBackButtonClick(e) {
  e.preventDefault();
  if (isUserLoggedIn()) {
    navigateBackOrToSummary();
  } else {
    window.location.href = "../index.html";
  }
}

/**
 * Navigates back to previous page or to summary
 */
function navigateBackOrToSummary() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "../html/summary.html";
  }
}

/**
 * Sets up the back button click handler
 */
function setupBackButtonNavigation() {
  const backButton = document.querySelector(".back-btn");
  if (backButton) {
    const newBackButton = replaceBackButton(backButton);
    newBackButton.addEventListener("click", handleBackButtonClick);
  }
}

/**
 * Applies the appropriate sidebar mode based on login status and current page
 * Rule: privacy-policy/legal-notice + NOT logged in => external, otherwise => internal
 */
function applySidebarMode() {
  if (typeof setSidebarMode === "function") {
    const mode = shouldUseExternalMode() ? "external" : "internal";
    setSidebarMode(mode);

    if (mode === "external") {
      if (typeof setupLoginButton === "function") {
        setupLoginButton();
      }
    }
  }
}

/**
 * Applies guest mode class to body when user is not logged in
 * on privacy-policy or legal-notice pages
 */
function applyGuestModeClass() {
  if (shouldUseExternalMode()) {
    document.body.classList.add("is-guest");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTemplate();
});

export {
  initTemplate,
};
