import { protectPage } from './utilities.js';
import { initDataStore } from './dataStore.js';
import { templateAddTaskForm, templateAddSubtask } from './addTaskTemplate.js';
import { initDropdown, loadContactsFromSession, filterContacts, validateAllTasks, resetSelectedContacts, createTask } from './addTaskUtilities.js';
import { closeAddTaskOverlay } from './addTaskOverlay.js';

let task = [];

/**
 * Main initialization for the Add Task page.
 * Checks authentication first, then renders the form.
 */
async function initAddTask() {
  const currentUser = protectPage();
  if (!currentUser) return;

  await initDataStore();

  if (document.getElementById('mainContent')) {
    renderAddTask('mainContent');
  }
}

/**
 * Renders the task form into a specified container and initializes all related scripts.
 *
 * @param {string} containerId - The ID of the container element.
 */
function renderAddTask(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = templateAddTaskForm();
  initializeAllScripts();
}

/**
 * Initializes all interactive scripts and event listeners for the task form:
 * * - Date input
 * - Subtask input
 * - Dropdown (if available)
 * - Dropdown event listeners
 * - Priority and category interactions
 * - Subtask event listeners
 * - Form action buttons
 */
function initializeAllScripts() {
  initDateInput();
  initSubtaskInput();
  initDropdown();
  initDropdownListeners();
  initPriorityAndCategory();
  initSubtaskListeners();
  initFormButtons();
}


/**
 * Initializes the due date input field by setting the minimum selectable date
 * to today and formatting the selected date for display.
 */
function initDateInput() {
  const dateInput = document.getElementById("taskDueDate");
  if (!dateInput) return;
  dateInput.min = new Date().toISOString().split("T")[0];

  dateInput.addEventListener("change", () => {
    if (dateInput.value) {
      const [y, m, d] = dateInput.value.split("-");
      dateInput.setAttribute("data-date", `${d}/${m}/${y}`);
    }
  });
}

/**
 * Opens the native date picker of the due date input field, if available.
 */
function openDatePicker() {
  const dateInput = document.getElementById("taskDueDate");
  if (dateInput) dateInput.showPicker();
}

/**
 * Selects a priority button, applies the active state and updates its icon accordingly.
 *
 * @param {HTMLButtonElement} button - The clicked priority button element.
 */
function selectPriority(button) {
  deselectPriority();
  const priority = button.value;
  button.classList.add(priority, "active");
  button.querySelector("img").src = `../assets/img/addtask/${priority}selected.svg`;
}

/**
 * Resets all priority buttons by removing state classes and restoring their default icon.
 */
function deselectPriority() {
  document.querySelectorAll(".priority__button").forEach((btn) => {
    btn.classList.remove("urgent", "medium", "low", "active");
    btn.querySelector("img").src = `../assets/img/addtask/${btn.value}.svg`;
  });
}

/**
 * Rotates the category arrow icon based on the open/closed state.
 *
 * @param {boolean} isOpened - True if the category is opened, false if closed.
 */
function rotateCategoryArrow(isOpened) {
  const arrow = document.querySelector('.category-arrow');
  arrow?.classList.toggle('rotated', isOpened);
}

/**
 * Resets the task form to its initial state by clearing inputs, dropdowns, subtasks, validation states, selected contacts,
 * and restoring the default priority.
 */
function clearFields() {
  resetInputs();
  resetDropdownState();
  const subtaskContainer = document.getElementById("addedSubtask");
  if (subtaskContainer) subtaskContainer.innerHTML = "";
  deselectPriority();
  resetValidation();
  if (typeof resetSelectedContacts === 'function') resetSelectedContacts();
  const mediumBtn = document.querySelector('.priority__button[value="medium"]');
  if (mediumBtn) selectPriority(mediumBtn);
}

/**
 * Clears all task input fields and removes the custom date attribute
 * from the due date input.
 */
function resetInputs() {
  const ids = ["taskTitle", "taskDescription", "taskDueDate", "taskCategory", "taskSubtasks"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = "";
    if (id === "taskDueDate") el.removeAttribute("data-date");
  });
}

/**
 * Resets the contact dropdown state by clearing the search input,
 * removing selected contact elements, and resetting the selected contacts set.
 */
function resetDropdownState() {
  const searchInput = document.getElementById("contactSearchInput");
  const selectedBox = document.getElementById("selectedContacts");
  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = "Select contacts to assign";
  }
  if (selectedBox) selectedBox.innerHTML = "";
  if (typeof selectedContacts !== 'undefined') selectedContacts.clear();
}

/**
 * Clears all validation error messages and removes error styling from form elements.
 */
function resetValidation() {
  document.querySelectorAll('.error-text').forEach(el => el.style.visibility = 'hidden');
  document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
}


/**
 * Initializes the subtask input field by adding a keypress listener
 * that creates a new subtask when the Enter key is pressed.
 */
function initSubtaskInput() {
  const subInput = document.getElementById("taskSubtasks");
  subInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSubtask(); }
  });
}

/**
 * Adds a new subtask to the subtask list if the input is not empty,
 * then clears the input field and updates the subtask action state.
 */
function addSubtask() {
  const subtaskInput = document.getElementById("taskSubtasks");
  const text = subtaskInput.value.trim();
  if (!text) return;

  const container = document.getElementById("addedSubtask");
  container.insertAdjacentHTML('beforeend', templateAddSubtask(text));

  subtaskInput.value = "";
  toggleSubtaskActions();
  container.scrollTop = container.scrollHeight;
}

/**
 * Toggles the visibility of subtask action buttons
 * based on whether the subtask input field contains text.
 */
function toggleSubtaskActions() {
  const input = document.getElementById("taskSubtasks");
  const actions = document.querySelector(".subtask-actions");
  if (input && actions) {
    actions.classList.toggle("visible", input.value.trim() !== "");
  }
}

/**
 * Cancels the current subtask input by clearing the input field
 * and updating the subtask action buttons.
 */
function cancelSubtask() {
  const input = document.getElementById("taskSubtasks");
  if (input) input.value = "";
  toggleSubtaskActions();
}

/**
 * Enables editing of a subtask by replacing its text with an input field,
 * focusing it, and attaching listeners to save changes on Enter or blur.
 *
 * @param {HTMLElement} trigger - The element that triggered the edit action.
 */
function editSubtask(trigger) {
  const item = trigger.closest(".subtask-item");
  const textSpan = item.querySelector(".subtask-text");
  const subtaskInput = document.getElementById("taskSubtasks");

  if (subtaskInput && textSpan) {
    subtaskInput.value = textSpan.textContent;
    subtaskInput.focus();
    item.remove();
    toggleSubtaskActions();
  }
}

/**
 * Deletes the subtask element related to the given trigger.
 *
 * @param {HTMLElement} trigger - The element that triggered the delete action.
 */
function deleteSubtask(trigger) {
  trigger.closest(".subtask-item")?.remove();
}

/**
 * Displays a success message and handles navigation or overlay closing.
 */
function handleAddTaskSuccess() {
  const modal = document.getElementById('taskAddedModal');
  const isOverlay = document.getElementById('addtaskPanelContentId') !== null;
  modal?.classList.add('show');

  setTimeout(() => {
    modal?.classList.remove('show');

    if (isOverlay) {
        closeAddTaskOverlay();
      if (typeof initBoard === 'function') {
        initBoard();
      }
    } else {
      window.location.href = "board.html";
    }
  }, 1500);
}

/**
 * Initializes event listeners for the contact dropdown.
 */
function initDropdownListeners() {
  const input = document.getElementById('contactSearchInput');
  const arrow = document.getElementById('dropdownArrow');
  input?.addEventListener('keyup', filterContacts);
  input?.addEventListener('click', (e) => { e.stopPropagation(); openDropdown(e); });
  arrow?.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(e); });
}

/**
 * Initializes event listeners for priority buttons and the task category dropdown.
 */
function initPriorityAndCategory() {
  document.getElementById('prioritySelection')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.priority__button');
    if (btn) selectPriority(btn);
  });
  const cat = document.getElementById('taskCategory');
  cat?.addEventListener('focus', () => rotateCategoryArrow(true));
  cat?.addEventListener('blur', () => rotateCategoryArrow(false));
  cat?.addEventListener('change', () => rotateCategoryArrow(false));
}

/**
 * Initializes event listeners for subtask input and actions.
 */
function initSubtaskListeners() {
  document.getElementById('taskSubtasks')?.addEventListener('input', toggleSubtaskActions);
  document.getElementById('subtaskCancel')?.addEventListener('click', cancelSubtask);
  document.getElementById('subtaskConfirm')?.addEventListener('click', addSubtask);
  document.getElementById('addedSubtask')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    if (editBtn) editSubtask(editBtn);
    if (deleteBtn) deleteSubtask(deleteBtn);
  });
}

/**
 * Initializes event listeners for form action buttons.
 */
function initFormButtons() {
  document.getElementById('calendarIcon')?.addEventListener('click', openDatePicker);
  document.getElementById('clearButton')?.addEventListener('click', clearFields);
  document.getElementById('createTaskButton')?.addEventListener('click', createTask);
}

document.addEventListener("DOMContentLoaded", initAddTask);

export {
  initAddTask,
  renderAddTask,
  clearFields,
  handleAddTaskSuccess,
};
