/**
 * Generates the HTML template for the detailed view of a task.
 * This includes task information such as title, description, due date,
 * priority, assigned users, subtasks, and action buttons (edit/delete).
 *
 * @param {Object} task - The task object containing details about the task.
 * @param {string} contactsHTML - HTML string representing the list of assigned contacts.
 * @param {string} subtasksHTML - HTML string representing the list of subtasks.
 * @param {string} dueDateText - Formatted string representing the task's due date.
 * @param {string} priorityName - The display name of the task's priority (e.g., "High", "Medium").
 * @param {string} priorityIcon - URL or path to the icon representing the priority.
 * @param {string} taskTypeClass - CSS class name representing the task type for styling.
 * @returns {string} - HTML string of the task detail template ready to be inserted into the DOM.
 */
function getTaskDetailTemplate(task, contactsHTML, subtasksHTML, dueDateText, priorityName, priorityIcon, taskTypeClass) {
    return `
        <div class="task-detail">
            <div class="task-detail__header">
                <span class="task-card__category task-card__category--${taskTypeClass}">
                    ${task.taskType}
                </span>
                <button class="task-detail__close-btn" onclick="closeTaskDetails()">
                    <img src="../assets/img/contacts/cancel.svg" alt="Close">
                </button>
            </div>

            <h1 class="task-detail__title">${task.title}</h1>
            <p class="task-detail__description">${task.description || ''}</p>

            <div class="task-detail__property">
                <span class="label">Due date:</span>
                <span>${dueDateText}</span>
            </div>

            <div class="task-detail__property">
                <span class="label">Priority:</span>
                <div class="priority-badge">
                    <span>${priorityName} <img src="${priorityIcon}" alt=""></span>
                </div>
            </div>

            <div class="task-detail__section">
                <span class="label">Assigned To:</span>
                <div class="detail-assigned-list">
                    ${contactsHTML}
                </div>
            </div>

            <div class="task-detail__section">
                <span class="label">Subtasks</span>
                <div class="detail-subtask-list">
                    ${subtasksHTML}
                </div>
            </div>

            <div class="task-detail__actions">
                <button class="action-btn" onclick="deleteTask('${task.id}')">
                    <img src="../assets/img/contacts/delete.svg" alt="Delete Icon"> Delete
                </button>
                <div class="action-divider"></div>
                <button class="action-btn" onclick="editTask('${task.id}')">
                    <img src="../assets/img/contacts/edit.svg" alt="Edit Icon"> Edit
                </button>
            </div>
        </div>
    `;
}

/**
 * Generates the HTML template for a single assigned contact item
 * in the task detail view.
 *
 * @param {Object} contact - The contact object containing at least `name` and `color`.
 * @param {string} initials - The initials displayed inside the contact badge.
 * @returns {string} The generated HTML string for the contact item.
 */
function getDetailedContactItemTemplate(contact, initials) {
    return `
        <div class="detail-contact-item">
            <div class="task-card__user-badge"
                 style="background-color: ${contact.color}">
                 ${initials}
            </div>
            <span>${contact.name}</span>
        </div>
    `;
}

/**
 * Returns a fallback HTML template displayed when no contacts
 * are assigned to the task.
 *
 * @returns {string} The generated HTML string indicating no assigned contacts.
 */
function getNoAssignedTemplate() {
    return `
        <span class="no-assigned">
            No one assigned
        </span>
    `;
}

/**
 * Generates the HTML template for a single subtask item
 * in the task detail view.
 *
 * @param {string} taskId - The ID of the parent task.
 * @param {number} index - The index of the subtask in the subtasks array.
 * @param {string} title - The title of the subtask.
 * @param {boolean} isDone - Indicates whether the subtask is completed.
 * @returns {string} The generated HTML string for the subtask item.
 */
function getDetailSubtaskItemTemplate(taskId, index, title, isDone) {
    const imgChecked = isDone
        ? '../assets/img/auth/checkbox-checked.svg'
        : '../assets/img/auth/checkbox-default.svg';

    return `
        <div class="detail-subtask-item"
             onclick="toggleSubtask('${taskId}', ${index})">
            <img src="${imgChecked}" alt="checkbox">
            <span>${title}</span>
        </div>
    `;
}

/**
 * Returns a fallback HTML template displayed when a task
 * has no subtasks.
 *
 * @returns {string} The generated HTML string indicating no subtasks.
 */
function getNoSubtasksTemplate() {
    return `
        <span class="no-subtasks">
            No subtasks
        </span>
    `;
}

/**
 * Generates the HTML template for a single editable subtask item
 * in the edit task view.
 *
 * @param {Object} st - The subtask object containing at least a `title` property.
 * @param {number} index - The index of the subtask in the subtasks array.
 * @returns {string} The generated HTML string for the editable subtask item.
 */
function templateEditSubtaskItem(st, index) {
    return `
        <li class="subtask-item">
            <div class="subtask-item-content">
                <span class="subtask-text">${st.title}</span>
                <div class="subtask-item-actions">
                    <button type="button" class="edit-btn" onclick="editExistingSubtask(${index})">
                        <img src="../assets/img/addtask/edit.svg" alt="Edit">
                    </button>
                    <div class="subtask-divider"></div>
                    <button type="button" class="delete-btn" onclick="deleteEditSubtask(${index})">
                        <img src="../assets/img/addtask/delete.svg" alt="Delete">
                    </button>
                </div>
            </div>
        </li>
    `;
}

/**
 * Generates the HTML template for a single contact item
 * in the edit task "Assigned To" dropdown list.
 *
 * @param {Object} contact - The contact object containing at least `id`, `name`, and `color`.
 * @param {boolean} isSelected - Indicates whether the contact is currently selected.
 * @param {string} initials - The initials displayed inside the contact badge.
 * @returns {string} The generated HTML string for the editable contact list item.
 */
function templateEditContactItem(contact, isSelected, initials) {
    return `
        <li class="contact-item ${isSelected ? 'selected' : ''}" 
            data-id="${contact.id}"
            onclick="toggleContactSelectionEdit(event, '${contact.id}', '${contact.color}', '${initials}')">

            <div class="assign-to-initial" 
                 style="background-color: ${contact.color}">
                ${initials}
            </div>

            <span class="contact-name">${contact.name}</span>

            <span class="selection-checkmark ${isSelected ? 'checked' : ''}"></span>
        </li>
    `;
}

/**
 * Generates the HTML template for the task edit form
 * displayed inside the task detail overlay.
 * Pre-fills all form fields with the provided task data,
 * including title, description, due date, priority,
 * assigned contacts, and subtasks.
 *
 * @param {Object} task - The task object containing all editable properties.
 * @param {string} task.id - The unique ID of the task.
 * @param {string} task.title - The task title.
 * @param {string} [task.description] - The task description.
 * @param {string} task.dueDate - The task due date (ISO format).
 * @param {string} task.priority - The current priority value.
 * @returns {string} The generated HTML string for the edit task form.
 */
function templateEditTaskForm(task) {
    return `
        <div class="task-detail edit-mode">
            <div class="task-detail__header justify-end">
                <button class="task-detail__close-btn" onclick="closeTaskDetails()">
                    <img src="../assets/img/contacts/cancel.svg" alt="Close">
                </button>
            </div>

            <div class="edit-section mt--16">
                <span class="label">Title</span>
                <input type="text" id="editTitle" class="task-title" value="${task.title}">
            </div>

            <div class="edit-section">
                <span class="label">Description</span>
                <textarea id="editDescription" class="task-description min-height">${task.description || ''}</textarea>
            </div>

            <div class="edit-section">
                <span class="label">Due date</span>
                <input type="date" id="editDueDate" class="task-due-date" value="${task.dueDate}">
            </div>

            <div class="edit-section">
                <span class="label">Priority</span>
                <div class="priority-selection edit-prio-row" id="editPriority">
                    ${getPriorityButtonsHTML(task.priority)}
                </div>
            </div>

            <div class="edit-section">
                <span class="label">Assigned To</span>
                <div class="dropdown" id="editDropdownContainer">
                    <div class="dropdown-wrapper">
                        <input type="text" class="contact-search-input" id="editContactSearch" placeholder="Select contacts">
                        <div class="dropdown-arrow" id="editDropdownArrow"></div>
                    </div>
                    <ul class="dropdown-list" id="editDropdownList" style="display: none"></ul>
                </div>
                <div class="selected-contacts" id="editSelectedContacts"></div>
            </div>

            <div class="edit-section">
                <span class="label">Subtasks</span>
                <div class="subtask-wrapper">
                    <input type="text" class="subtask" id="editSubtaskInput" placeholder="Add new subtask" onkeyup="toggleEditSubtaskActions()">
                    <div class="subtask-actions" id="editSubtaskActions">
                        <span class="cancel" onclick="clearSubtaskInput()">
                            <img src="../assets/img/addtask/cross.svg">
                        </span>
                        <div class="subtask-divider"></div>
                        <span class="confirm" onclick="addEditSubtask()">
                            <img src="../assets/img/addtask/checkdark.svg">
                        </span>
                    </div>
                </div>
                <ul id="editSubtasksList" class="added-subtask"></ul>
            </div>

            <div class="task-detail__actions justify-end">
                <button class="create-task__button" onclick="saveEditedTask('${task.id}')">
                    Ok <img src="../assets/img/addtask/check.svg" alt="">
                </button>
            </div>
        </div>
    `;
}

/**
 * Returns the HTML for a single priority button.
 */
function templatePriorityButton(prio, lowPrio, isActive, iconPath) {
    return `
        <button type="button" 
                id="prio-${lowPrio}" 
                class="priority__button ${isActive ? lowPrio + ' active' : ''}" 
                onclick="setEditPriority('${lowPrio}')">
            ${prio} <img src="${iconPath}" id="prio-img-${lowPrio}">
        </button>
    `;
}

export {
  getTaskDetailTemplate,
  getDetailedContactItemTemplate,
  getNoAssignedTemplate,
  getDetailSubtaskItemTemplate,
  getNoSubtasksTemplate,
  templateEditSubtaskItem,
  templateEditContactItem,
  templateEditTaskForm,
  templatePriorityButton,
};
