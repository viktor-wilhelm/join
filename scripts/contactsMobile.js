import { showContactDetails, loadedContacts, renderContactList, loadContactsFromStore } from './contacts.js';

/**
 * Checks whether the application is running on a mobile device.
 * If the viewport width is below 768px, mobile-specific UI behavior is applied:
 * - Activates the contact detail view
 * - Adjusts the floating action button (FAB)
 * - Sets mobile navigation handlers
 *
 * @param {number} index - Index of the selected contact.
 */
function checkMobile(index) {
  if (window.innerWidth < 768) {
    document
      .querySelector(".contacts-detail-container")
      .classList.add("active");
    let fab = document.getElementById("actionFab");
    fab.style.zIndex = 9;
    fab.setAttribute("onclick", `showMoreAction(${index})`);
    document
      .getElementById("contactsDetailBack")
      .setAttribute("onclick", `contactsBackMobile(${index})`);
  }
}

/**
 * Displays the "show more" action buttons inside the floating action button (FAB).
 *
 * @param {number} index - Index of the selected contact.
 */
function showMoreAction(index) {
  let more = document.getElementById("actionFab");
  more.innerHTML = "";
  more.innerHTML += templateShowMoreAction(index);
}

/**
 * Resets the floating action button (FAB) to its default state.
 * Replaces the action buttons with the default FAB icon.
 */
function closeActionFab() {
  let more = document.getElementById("actionFab");
  more.innerHTML = "";
  more.innerHTML += templateActionFab();
}

/**
 * Handles navigation back from the contact detail view on mobile devices.
 * - Clears contact details
 * - Resets UI states and event handlers
 * - Removes active contact highlighting
 *
 * @param {number} index - Index of the contact to be deactivated.
 */
function contactsBackMobile(index) {
  let detailsContainer = document.getElementById("contactsDetail");
  detailsContainer.innerHTML = "";
  document
    .querySelector(".contacts-detail-container")
    .classList.remove("active");
  let fab = document.getElementById("actionFab");
  fab.style.zIndex = 6;
  fab.removeAttribute("onclick", `showMoreAction(${index})`);
  document
    .getElementById("contactsDetailBack")
    .removeAttribute("onclick", `contactsBackMobile(${index})`);
  removeActiveContact(index);
}

/**
 * Removes the active highlight from a contact in the contact list.
 *
 * @param {number} index - Index of the contact whose active state should be removed.
 */
function removeActiveContact(index) {
  document.getElementById(loadedContacts[index].name).classList.remove("active-contact");
}

/**
 * Closes the mobile action button menu when clicking outside.
 */
document.addEventListener("click", (event) => {
  const actionButton = document.querySelector(".action__button-mobile");
  const fab = document.getElementById("actionFab");

  if (!actionButton || !fab) return;

  if (!fab.contains(event.target)) {
    closeActionFab();
  }
});
// Expose onclick handlers for HTML template strings
window.closeActionFab = closeActionFab;
window.contactsBackMobile = contactsBackMobile;
window.showMoreAction = showMoreAction;

export {
  checkMobile,
  showMoreAction,
  closeActionFab,
  contactsBackMobile,
  removeActiveContact,
};
