import { tasks, setTasks, renderBoard, tasksFromArrayToObject } from './board.js';
import { currentTask, renderTaskOverlay } from './taskDetailOverlay.js';
import { updateTasks, getContacts } from './dataStore.js';
import { getInitials } from './shared/utilities.js';
import { templateEditSubtaskItem, templateEditContactItem,
         templateEditTaskForm, templatePriorityButton } from './taskDetailTemplate.js';

let editDropdownInitialized = false;

/**
 * Initializes the edit mode for a specific task.
 * * @param {string} taskId - The unique identifier of the task to be edited.
 */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    currentTask = task;

    setupEditContainer(task);
    renderEditSubtasks(task.subtasks || []);
    renderEditContactList(task.assignedTo || []);
    updateEditSelectedContactsIcons();
    initEditSubtaskInput();
    initEditDropdown();
}

/**
 * Injects the edit form template into the task detail container.
 * * @param {Object} task - The task object containing title, description, and other details.
 */
function setupEditContainer(task) {
    const container = document.getElementById('taskDetailContent');
    if (container) {
        container.innerHTML = templateEditTaskForm(task);
    }
}

/**
 * Updates an existing task with new data from the edit form and persists the changes.
 * * @param {string} taskId - The unique ID of the task to be updated.
 */
function saveEditedTask(taskId) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    const updatedData = getFormDataFromEdit();
    tasks[index] = { ...tasks[index], ...updatedData };

    updateTasks(tasksFromArrayToObject(tasks));
    renderBoard();
    document.getElementById('taskDetailsOverlay').classList.add('hidden');
}

/**
 * Collects and maps all input values from the edit task form.
 * * @returns {Object} The updated task data object including title, description, date, priority, and assigned contacts.
 */
function getFormDataFromEdit() {
    const prioBtn = document.querySelector('#editPriority .priority__button.active');
    const selected = document.querySelectorAll('#editDropdownList .contact-item.selected');

    return {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        dueDate: document.getElementById('editDueDate').value,
        priority: prioBtn ? prioBtn.id.replace('prio-', '') : 'medium',
        assignedTo: Array.from(selected).map(item => item.getAttribute('data-id')),
        subtasks: currentTask.subtasks || [],
        category: currentTask.category
    };
}

/**
 * Updates the selected priority in the edit view.
 * * @param {string} prio - The priority level to activate ('urgent', 'medium', or 'low').
 */
function setEditPriority(prio) {
    resetPriorityButtons();
    const btn = document.getElementById(`prio-${prio}`);
    const img = document.getElementById(`prio-img-${prio}`);

    if (btn && img) {
        btn.classList.add('active', prio);
        img.src = `../assets/img/addtask/${prio}selected.svg`;
    }
}

/**
 * Clears the active visual state from all priority buttons.
 */
function resetPriorityButtons() {
    const priorities = ['urgent', 'medium', 'low'];
    priorities.forEach(p => {
        const btn = document.getElementById(`prio-${p}`);
        const img = document.getElementById(`prio-img-${p}`);
        if (btn && img) {
            btn.classList.remove('active', 'urgent', 'medium', 'low');
            img.src = `../assets/img/addtask/${p}.svg`;
        }
    });
}

/**
 * Renders the full list of contacts in the edit dropdown menu.
 * @param {string[]} currentlyAssigned - Array of contact IDs already assigned to the task.
 */
function renderEditContactList(currentlyAssigned) {
    const list = document.getElementById('editDropdownList');
    if (!list) return;

    const contactsArray = getContacts();
    list.innerHTML = contactsArray.map(contact => {
        const isSelected = currentlyAssigned.includes(contact.id);
        const initials = contact.name.split(" ").map(n => n[0]).join("");
        return templateEditContactItem(contact, isSelected, initials);
    }).join('');
}

/**
 * Toggles a contact's selection state in the UI.
 * Updates the visual classes for the item and checkmark, then refreshes the selection icons.
 * @param {Event} e - The click event from the contact item.
 */
function toggleContactSelectionEdit(e) {
    const item = e.currentTarget;
    const checkmark = item.querySelector('.selection-checkmark');

    item.classList.toggle('selected');
    if (checkmark) checkmark.classList.toggle('checked');

    updateEditSelectedContactsIcons();
}

/**
 * Refreshes the display of selected contact icons.
 */
function updateEditSelectedContactsIcons() {
    const container = document.getElementById('editSelectedContacts');
    const selected = document.querySelectorAll('#editDropdownList .contact-item.selected');
    if (!container) return;

    container.innerHTML = '';
    selected.forEach(item => {
        const initial = item.querySelector('.assign-to-initial').innerText;
        const color = item.querySelector('.assign-to-initial').style.backgroundColor;
        container.innerHTML += `
            <div class="assign-to-initial" style="background-color: ${color}">${initial}</div>
        `;
    });
}


/**
 * Opens the contact selection dropdown.
 */
function openEditDropdown() {
    const list = document.getElementById('editDropdownList');
    const arrow = document.getElementById('editDropdownArrow');
    const input = document.getElementById('editContactSearch');

    if (list) list.style.display = 'block';
    if (arrow) arrow.classList.add('rotated');
    if (input) input.placeholder = "Filter contacts...";
}

/**
 * Closes the contact selection dropdown.
 */
function closeEditDropdown() {
    const list = document.getElementById('editDropdownList');
    const arrow = document.getElementById('editDropdownArrow');
    const input = document.getElementById('editContactSearch');

    if (list) list.style.display = 'none';
    if (arrow) arrow.classList.remove('rotated');
    if (input) {
        input.placeholder = "Select contacts";
        input.value = '';
    }
    filterEditContactList();
}

/**
 * Initializes the edit contact dropdown by attaching event listeners.
 */
function initEditDropdown() {
    const input = document.getElementById('editContactSearch');
    const arrow = document.getElementById('editDropdownArrow');

    input?.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditDropdown();
    });
    input?.addEventListener('input', filterEditContactList);
    arrow?.addEventListener('click', (e) => {
        e.stopPropagation();
        const list = document.getElementById('editDropdownList');
        list?.style.display === 'block' ? closeEditDropdown() : openEditDropdown();
    });
    setupExternalClickClose();
}

/**
 * Sets up a global listener to close the dropdown when clicking outside.
 */
function setupExternalClickClose() {
    const detailContent = document.getElementById('taskDetailContent');
    if (!editDropdownInitialized && detailContent) {
        detailContent.addEventListener('click', (e) => {
            const container = document.getElementById('editDropdownContainer');
            if (container && !container.contains(e.target)) closeEditDropdown();
        });
        editDropdownInitialized = true;
    }
}

/**
 * Renders the list of subtasks in the edit view.
 * @param {Object[]} subtasks - Array of subtask objects to display.
 */
function renderEditSubtasks(subtasks) {
    const list = document.getElementById('editSubtasksList');
    if (!list) return;
    list.innerHTML = subtasks.map((st, index) =>
        templateEditSubtaskItem(st, index)
    ).join('');
    list.scrollTop = list.scrollHeight;
}

/**
 * Adds a new subtask to the current task.
 */
function addEditSubtask() {
    const input = document.getElementById('editSubtaskInput');
    const title = input?.value.trim();
    if (!title) return;

    if (!currentTask.subtasks) currentTask.subtasks = [];
    currentTask.subtasks.push({ title: title, done: false });

    input.value = '';
    toggleEditSubtaskActions();
    renderEditSubtasks(currentTask.subtasks);
}

/**
 * Removes a subtask from the current task by its index.
 * @param {number} index - The position of the subtask in the array to be removed.
 */
function deleteEditSubtask(index) {
    if (currentTask?.subtasks) {
        currentTask.subtasks.splice(index, 1);
        renderEditSubtasks(currentTask.subtasks);
    }
}

/**
 * Loads a subtask back into the input field for editing.
 * @param {number} index - The index of the subtask to be edited.
 */
function editExistingSubtask(index) {
    const input = document.getElementById('editSubtaskInput');
    if (!input || !currentTask.subtasks[index]) return;

    input.value = currentTask.subtasks[index].title;
    input.focus();
    toggleEditSubtaskActions();
    deleteEditSubtask(index);
}

/**
 * Maps priority data into HTML templates.
 * @param {string} currentPriority - The currently selected priority.
 * @returns {string} The full HTML markup for all priority buttons.
 */
function getPriorityButtonsHTML(currentPriority) {
    const priorityOptions = ['Urgent', 'Medium', 'Low'];

    return priorityOptions.map(prio => {
        const lowPrio = prio.toLowerCase();
        const isActive = currentPriority?.toLowerCase() === lowPrio;
        const iconPath = isActive
            ? `../assets/img/addtask/${lowPrio}selected.svg`
            : `../assets/img/addtask/${lowPrio}.svg`;
        return templatePriorityButton(prio, lowPrio, isActive, iconPath);
    }).join('');
}

/**
 * Toggles the visibility of subtask action icons.
 * Shows or hides the action buttons based on whether the input field has text.
 */
function toggleEditSubtaskActions() {
    const input = document.getElementById('editSubtaskInput');
    const actions = document.getElementById('editSubtaskActions');
    if (input && actions) {
        actions.classList.toggle('visible', input.value.length > 0);
    }
}

/**
* Filters the contact list based on search input.
 */
function filterEditContactList() {
    const search = document.getElementById('editContactSearch')?.value.toLowerCase() || '';
    const items = document.querySelectorAll('#editDropdownList .contact-item');

    items.forEach(item => {
        const name = item.querySelector('.contact-name')?.innerText.toLowerCase() || '';
        item.style.display = name.includes(search) ? 'flex' : 'none';
    });
}

/**
* Sets up the subtask input event listener.
 */
function clearSubtaskInput() {
    const input = document.getElementById('editSubtaskInput');
    if (input) { input.value = ''; toggleEditSubtaskActions(); }
}

function initEditSubtaskInput() {
    const subInput = document.getElementById('editSubtaskInput');
    subInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEditSubtask();
        }
    });
}
// Expose onclick handlers to global scope
window.editTask = editTask;
window.addEditSubtask = addEditSubtask;
window.clearSubtaskInput = clearSubtaskInput;
window.deleteEditSubtask = deleteEditSubtask;
window.editExistingSubtask = editExistingSubtask;
window.toggleEditSubtaskActions = toggleEditSubtaskActions;
window.setEditPriority = setEditPriority;
window.saveEditedTask = saveEditedTask;
window.toggleContactSelectionEdit = toggleContactSelectionEdit;
