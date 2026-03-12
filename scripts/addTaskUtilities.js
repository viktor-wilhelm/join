import { assignContactColors } from './utilities.js';
import { handleAddTaskSuccess, clearFields } from './addTask.js';
import { templateContact } from './addTaskTemplate.js';

const selectedContacts = new Map();
const mandatoryFields = [
  { inputId: 'taskTitle', errorId: 'titleErrorMessage' },
  { inputId: 'taskDueDate', errorId: 'dateErrorMessage' },
  { inputId: 'taskCategory', errorId: 'categoryErrorMessage' }
];

/**
 * Initializes the contact dropdown by loading contacts from session storage,
 * rendering each contact as a list item, and updating the search input placeholder.
 */
function initDropdown() {
  const contacts = loadContactsFromSession();
  const list = document.getElementById('dropdownList');
  if (!list) return;
  list.innerHTML = '';
  contacts.forEach(contact => list.appendChild(createContactItem(contact)));
  updateSearchPlaceholder();
}

/**
 * Loads contacts from session storage, converts them to an array,
 * and applies badge colors if the `assignContactColors` function exists.
 *
 * @returns {Array<Object>} Array of contact objects with ID and color applied.
 */
function loadContactsFromSession() {
  const rawData = sessionStorage.getItem('joinData');
  const data = rawData ? JSON.parse(rawData) : { contacts: {} };
  const contactsArray = Object.entries(data.contacts).map(([id, c]) => ({ id, ...c }));
  return assignContactColors(contactsArray);
}

/**
 * Creates a dropdown list item element for a contact, sets its badge color and initials,
 * and attaches a click listener to handle selection.
 *
 * @param {Object} contact - The contact object containing at least `name` and optional `color`.
 * @returns {HTMLLIElement} The generated list item element for the contact.
 */
function createContactItem(contact) {
  const li = document.createElement('li');
  const initial = getInitial(contact.name);
  const color = contact.color || "#D1D1D1";
  li.innerHTML = templateContact(initial, contact.name, color);
  li.addEventListener('click', (e) => handleContactClick(e, li, contact));
  return li;
}

/**
 * Toggles the visibility of the contact dropdown list and rotates the arrow icon.
 *
 * @param {Event} [e] - The event that triggered the toggle (optional). Stops propagation if provided.
 */
function toggleDropdown(e) {
  if (e) e.stopPropagation();

  const dropdownContainer = e.target.closest('.dropdown');
  if (!dropdownContainer) return;

  const list = dropdownContainer.querySelector('.dropdown-list');
  const arrow = dropdownContainer.querySelector('.dropdown-arrow');

  const isVisible = list?.style.display === 'block';

  if (list) list.style.display = isVisible ? 'none' : 'block';
  if (arrow) arrow.classList.toggle('rotated', !isVisible);
}

/**
 * Opens the contact dropdown list and rotates the arrow icon to indicate the open state.
 *
 * @param {Event} [e] - The event that triggered the dropdown (optional). Stops propagation if provided.
 */
function openDropdown(e) {
  if (e) e.stopPropagation();

  const dropdownContainer = e.target.closest('.dropdown');
  if (!dropdownContainer) return;

  const list = dropdownContainer.querySelector('.dropdown-list');
  const arrow = dropdownContainer.querySelector('.dropdown-arrow');

  if (list) list.style.display = 'block';
  if (arrow) arrow.classList.add('rotated');
}

/**
 * Closes the contact dropdown if a click occurs outside of the dropdown container
 * and resets the arrow icon to its default state.
 *
 * @param {MouseEvent} e - The click event used to determine if it occurred outside the dropdown.
 */
function closeDropdownExternal(e) {
  const container = document.getElementById('dropdownContainer');
  if (container && !container.contains(e.target)) {
    const list = document.getElementById('dropdownList');
    if (list) list.style.display = 'none';
    document.getElementById('dropdownArrow')?.classList.remove('rotated');
  }
}

/**
 * Filters the contact dropdown list based on the search input value
 * and ensures the dropdown list is visible.
 */
function filterContacts() {
  const filter = document.getElementById('contactSearchInput')?.value.toLowerCase();
  const listItems = document.querySelectorAll('#dropdownList li');
  listItems.forEach(li => {
    const name = li.querySelector('.contact-info span')?.textContent.toLowerCase();
    li.style.display = name?.includes(filter) ? "" : "none";
  });
  document.getElementById('dropdownList').style.display = 'block';
}

/**
 * Handles selecting or deselecting a contact from the dropdown.
 * Updates the selected contacts map and toggles the visual state of the list item.
 *
 * @param {MouseEvent} e - The click event triggered on the contact item.
 * @param {HTMLLIElement} li - The list item element representing the contact.
 * @param {Object} contact - The contact object being clicked.
 */
function handleContactClick(e, li, contact) {
  e.stopPropagation();
  const isSelected = selectedContacts.has(contact.id);
  isSelected ? selectedContacts.delete(contact.id) : selectedContacts.set(contact.id, contact);
  li.classList.toggle('selected', !isSelected);
  renderSelectedContacts();
}

/**
 * Renders visual badges for selected contacts.
 * Limits visibility to 4 and shows a "+X" badge for the rest.
 */
function renderSelectedContacts() {
  const box = document.getElementById('selectedContacts');
  if (!box) return;
  box.innerHTML = '';

  const contacts = Array.from(selectedContacts.values());
  const maxVisible = 4;

  contacts.forEach((contact, i) => {
    if (i < maxVisible) {
      box.appendChild(createBadge(getInitial(contact.name), contact.color));
    } else if (i === maxVisible) {
      box.appendChild(createBadge(`+${contacts.length - maxVisible}`, "#ffa800"));
    }
  });

  updateSearchPlaceholder();
}

/**
 * Helper to create a badge element.
 */
function createBadge(text, color) {
  const tag = document.createElement('span');
  tag.className = 'assign-to-initial';
  tag.textContent = text;
  tag.style.backgroundColor = color || "#D1D1D1";
  return tag;
}

/**
 * Updates the placeholder text of the contact search input
 * based on the number of currently selected contacts.
 */
function updateSearchPlaceholder() {
  const input = document.getElementById('contactSearchInput');
  if (!input) return;
  input.placeholder = selectedContacts.size > 0
    ? `${selectedContacts.size} contact(s) selected`
    : 'Select contacts to assign';
}

/**
 * Clears all selected contacts, updates the dropdown UI, and removes selection states from list items.
 */
function resetSelectedContacts() {
  selectedContacts.clear();
  renderSelectedContacts();
  document.querySelectorAll("#dropdownList li").forEach(li => li.classList.remove("selected"));
}

/**
 * Creates a new task by validating the form, saving it to storage,
 * clearing the form fields, and showing the success modal.
 */
function createTask() {
  if (!validateAllTasks()) return;
  saveToStorage(assembleTask());
  clearFields();
  handleAddTaskSuccess();
}

/**
 * Collects all task form input values and assembles them into a task object.
 *
 * @returns {Object} The task object containing title, description, due date, priority,
 * category, task type, assigned contacts, and subtasks.
 */
function assembleTask() {
  const cat = document.getElementById('taskCategory');
  const selectedCategory = cat?.options[cat.selectedIndex]?.text.toLowerCase() || "";

  const TASKTYPE_TO_CATEGORY = {
    "technical task": "to do",
    "user story": "to do"
  };

  return {
    title: document.getElementById('taskTitle').value.trim(),
    description: document.getElementById('taskDescription').value.trim(),
    dueDate: document.getElementById('taskDueDate').value,
    priority: document.querySelector('.priority__button.active')?.value || 'medium',
    taskType: selectedCategory,
    category: (typeof selectedCategoryForNewTask !== 'undefined')
      ? selectedCategoryForNewTask
      : TASKTYPE_TO_CATEGORY[selectedCategory] || 'to do',
    assignedTo: Array.from(selectedContacts.keys()),
    subtasks: getSubtasks()
  };
}

/**
 * Retrieves all subtasks from the form and returns them as an array of objects.
 *
 * @returns {Array<Object>} An array of subtask objects with `title` and `done` properties.
 */
function getSubtasks() {
  return Array.from(document.querySelectorAll('#addedSubtask .subtask-text'))
    .map(st => ({ title: st.textContent.trim(), done: false }));
}

/**
 * Validates all mandatory fields.
 *
 * @returns {boolean} True if all fields are valid, otherwise false.
 */
function validateAllTasks() {
  let isAllValid = true;

  for (let i = 0; i < mandatoryFields.length; i++) {
    const field = mandatoryFields[i];
    const isValid = validateSingleField(field);

    if (isValid === false) {
      isAllValid = false;
    }
  }
  return isAllValid;
}

/**
 * Validates a single input field.
 *
 * @param {Object} field - Field configuration containing inputId and errorId.
 * @returns {boolean} True if the field is valid, otherwise false.
 */
function validateSingleField(field) {
  const input = document.getElementById(field.inputId);
  const errorText = document.getElementById(field.errorId);
  const value = input.value.trim();

  if (value === "") {
    showError(input, errorText);
    return false;
  } else {
    hideError(input, errorText);
    return true;
  }
}

/**
 * Displays a validation error for the given input field.
 */
function showError(input, errorText) {
  if (errorText) {
    errorText.style.visibility = 'visible';
    errorText.textContent = 'This field is required';
  }
  if (input) {
    input.classList.add('error-border');
  }
}

/**
 * Hides the validation error for the given input field.
 */
function hideError(input, errorText) {
  if (errorText) {
    errorText.style.visibility = 'hidden';
  }
  if (input) {
    input.classList.remove('error-border');
  }
}

/**
 * Saves a new task object to session storage under a unique key based on the current timestamp.
 *
 * @param {Object} newTask - The task object to save.
 */
function saveToStorage(newTask) {
  const raw = sessionStorage.getItem('joinData');
  const data = raw ? JSON.parse(raw) : { tasks: {} };
  data.tasks[`task${Date.now()}`] = newTask;
  sessionStorage.setItem('joinData', JSON.stringify(data));
}

/**
 * Generates initials from a full name.
 *
 * @param {string} name - The full name of the contact.
 * @returns {string} The uppercase initials (e.g., "JS" for "John Smith").
 */
function getInitial(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

document.addEventListener('click', closeDropdownExternal);

export {
  initDropdown,
  loadContactsFromSession,
  filterContacts,
  resetSelectedContacts,
  createTask,
  validateAllTasks,
};
