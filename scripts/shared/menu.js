/**
 * Menu Navigation Handler
 * Manages active states and navigation
 */

/**
 * Sets the active menu button based on the current page
 */
function setActiveMenuBtnOnLoad() {
  const currentPage = window.location.pathname.split("/").pop();
  const pageToButtonMap = {
    "summary.html": "navSummary",
    "add-task.html": "navAddTask",
    "board.html": "navBoard",
    "contacts.html": "navContacts",
  };
  const buttonId = pageToButtonMap[currentPage];
  if (buttonId) {
    setActiveMenuBtn(buttonId);
  }
  setActiveFooterLink(currentPage);
}

/**
 * Sets the active menu button
 * @param {string} buttonId - The ID of the active button (e.g., 'navSummary', 'navAddTask', etc.)
 */
function setActiveMenuBtn(buttonId) {
  const menuButtonIds = ["navSummary", "navAddTask", "navBoard", "navContacts"];
  menuButtonIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.remove("active-menu-btn");
    }
  });
  const activeButton = document.getElementById(buttonId);
  if (activeButton) {
    activeButton.classList.add("active-menu-btn");
  }
}

/**
 * Sets the active footer link based on the current page
 * @param {string} currentPage - The current filename (e.g., 'privacy-policy.html')
 */
function setActiveFooterLink(currentPage) {
  const mobileLinks = document.querySelectorAll(".menu__mobile__link");
  mobileLinks.forEach((link) => {
    link.classList.remove("menu__mobile__link--active");
    const linkHref = link.getAttribute("href");
    if (linkHref === currentPage) {
      link.classList.add("menu__mobile__link--active");
    }
  });
}

/**
 * Initializes menu navigation - called from init-template.js
 */
function initMenuNavigation() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setActiveMenuBtnOnLoad();
      setupMenuNavigation();
    });
  } else {
    setActiveMenuBtnOnLoad();
    setupMenuNavigation();
  }
}

/**
 * Sets up navigation handlers for menu buttons
 */
function setupMenuNavigation() {
  const menuButtons = {
    navSummary: "../html/summary.html",
    navAddTask: "../html/add-task.html",
    navBoard: "../html/board.html",
    navContacts: "../html/contacts.html",
  };
  Object.entries(menuButtons).forEach(([id, url]) => {
    setupMenuButton(id, url);
  });
}

/**
 * Sets up a single menu button with click handler
 * @param {string} id - The button ID
 * @param {string} url - The navigation URL
 */
function setupMenuButton(id, url) {
  const button = document.getElementById(id);
  if (button) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveMenuBtn(id);
      window.location.href = url;
    });
  }
}

/**
 * Gets sidebar DOM elements
 * @returns {Object} Object with menu, header and loginButton elements
 */
function getSidebarElements() {
  return {
    loginButton: document.getElementById("navLogin"),
    menu: document.querySelector(".menu"),
    header: document.querySelector(".header__content"),
  };
}

/**
 * Hides navigation buttons
 * @param {Array<string>} buttonIds - Array of button IDs to hide
 */
function hideButtons(buttonIds) {
  buttonIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.add("d-none");
  });
}

/**
 * Shows navigation buttons
 * @param {Array<string>} buttonIds - Array of button IDs to show
 */
function showButtons(buttonIds) {
  buttonIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove("d-none");
  });
}

/**
 * Applies external mode styling and button visibility
 * @param {Object} elements - Sidebar elements
 * @param {Array<string>} internalButtons - Internal button IDs
 */
function applyExternalMode(elements, internalButtons) {
  const { menu, header, loginButton } = elements;
  if (menu) menu.classList.add("external");
  if (header) header.classList.add("external");
  hideButtons(internalButtons);
  if (loginButton) loginButton.classList.remove("d-none");
}

/**
 * Applies internal mode styling and button visibility
 * @param {Object} elements - Sidebar elements
 * @param {Array<string>} internalButtons - Internal button IDs
 */
function applyInternalMode(elements, internalButtons) {
  const { menu, header, loginButton } = elements;
  if (menu) menu.classList.remove("external");
  if (header) header.classList.remove("external");
  showButtons(internalButtons);
  if (loginButton) loginButton.classList.add("d-none");
}

/**
 * Sets the sidebar mode (internal vs external)
 * @param {string} mode - "external" or "internal"
 */
function setSidebarMode(mode) {
  const elements = getSidebarElements();
  const internalButtons = [
    "navSummary",
    "navAddTask",
    "navBoard",
    "navContacts",
  ];

  if (mode === "external") {
    applyExternalMode(elements, internalButtons);
  } else {
    applyInternalMode(elements, internalButtons);
  }
}

/**
 * Sets up the login button navigation handler
 */
function setupLoginButton() {
  const loginButton = document.getElementById("navLogin");
  if (loginButton) {
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "../index.html";
    });
  }
}

export {
  setActiveMenuBtnOnLoad,
  setActiveMenuBtn,
  setActiveFooterLink,
  initMenuNavigation,
  setupMenuNavigation,
  setupMenuButton,
  getSidebarElements,
  hideButtons,
  showButtons,
  applyExternalMode,
  applyInternalMode,
  setSidebarMode,
  setupLoginButton,
};
