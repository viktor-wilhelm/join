/**
 * Generates the HTML template string for the "Add Task" form.
 *
 * @returns {string} HTML string representing the complete Add Task form.
 */
function templateAddTaskForm() {
    return `
        <div class="form-wrapper">
            <div class="add-task-content">
                <div class="left-side">
                    <div class="section">
                        <div class="headline">Title<span class="red-star">*</span></div>
                        <input type="text" class="task-title" id="taskTitle" placeholder="Enter a title" />
                        <span id="titleErrorMessage" class="error-text"></span>
                    </div>
                    <div class="section section-description">
                        <div class="headline">Description</div>
                        <textarea class="task-description" id="taskDescription" placeholder="Enter a description"></textarea>
                    </div>
                    <div class="section">
                        <div class="headline">Due Date<span class="red-star">*</span></div>
                        <div class="date-wrapper">
                            <input type="date" class="task-due-date" id="taskDueDate" />
                            <img src="../assets/img/addtask/calender.svg" class="calendar-icon" id="calendarIcon" alt="Kalender" />
                            <span id="dateErrorMessage" class="error-text"></span>
                        </div>
                    </div>
                </div>
                <div class="add-task-separator"></div>
                <div class="right-side">
                    <div class="priority-content section-priority">
                        <div class="priority">Priority</div>
                        <div class="priority-selection" id="prioritySelection">
                            <button type="button" value="urgent" class="priority__button">Urgent <img src="../assets/img/addtask/urgent.svg" /></button>
                            <button type="button" value="medium" class="priority__button medium active">Medium <img src="../assets/img/addtask/mediumselected.svg" /></button>
                            <button type="button" value="low" class="priority__button">Low <img src="../assets/img/addtask/low.svg" /></button>
                        </div>
                    </div>
                    <div class="section">
                        <div class="headline">Assigned to</div>
                        <div class="dropdown" id="dropdownContainer">
                            <div class="dropdown-wrapper">
                                <input type="text" class="contact-search-input" id="contactSearchInput" placeholder="Select contacts to assign" />
                                <div class="dropdown-arrow" id="dropdownArrow"></div>
                            </div>
                            <ul class="dropdown-list" id="dropdownList" style="display: none"></ul>
                        </div>
                        <div class="selected-contacts" id="selectedContacts"></div>
                    </div>
                    <div class="section">
                        <div class="headline">Category<span class="red-star">*</span></div>
                        <div class="category-wrapper">
                            <select class="task-category" id="taskCategory">
                                <option value="" disabled selected>Select category</option>
                                <option value="technical-task">Technical Task</option>
                                <option value="user-story">User Story</option>
                            </select>
                            <div class="category-arrow"></div>
                        </div>
                        <span id="categoryErrorMessage" class="error-text"></span>
                    </div>
                    <div class="section">
                        <div class="headline">Subtasks</div>
                        <div class="subtask-wrapper">
                            <input type="text" class="subtask" id="taskSubtasks" placeholder="Add new subtask" />
                            <div class="subtask-actions">
                                <span class="cancel" id="subtaskCancel"><img src="../assets/img/addtask/cross.svg" /></span>
                                <span class="confirm" id="subtaskConfirm"><img src="../assets/img/addtask/checkdark.svg" /></span>
                            </div>
                        </div>
                        <ul class="added-subtask" id="addedSubtask"></ul>
                    </div>
                </div>
            </div>
            <div class="button-wrapper">
                <div><span class="red-star">*</span>This field is required</div>
                <div class="add-task-button">
                    <button type="button" id="clearButton" class="clear__button">Clear <span class="icon"></span></button>
                    <button type="button" id="createTaskButton" class="create-task__button">Create Task <img src="../assets/img/addtask/check.svg" /></button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generates an HTML template string for a subtask list item.
 *
 * @param {string} subtaskText - The text content of the subtask.
 * @returns {string} HTML string representing a subtask item with edit and delete actions.
 */
function templateAddSubtask(subtaskText) {
    return `
        <li class="subtask-item">
            <div class="subtask-item-content">
                <span class="subtask-text">${subtaskText}</span>
                <div class="subtask-item-actions">
                    <button type="button" class="edit-btn">
                        <img src="../assets/img/addtask/edit.svg" alt="Edit">
                    </button>
                    <button type="button" class="delete-btn">
                        <img src="../assets/img/addtask/delete.svg" alt="Delete">
                    </button>
                </div>
            </div>
        </li>
    `;
}

/**
 * Generates an HTML template string for a contact item.
 *
 * @param {string} initial - The initial letter displayed inside the contact avatar.
 * @param {string} name - The full name of the contact.
 * @param {string} color - The background color applied to the avatar (CSS color value).
 * @returns {string} HTML string representing the contact item.
 */
function templateContact(initial, name, color) {
    return `
    <div class="contact-item-container">
      <div class="assign-to-initial" style="background-color: ${color} !important">
        ${initial}
      </div>
      <div class="contact-info">
        <span>${name}</span>
      </div>
      <div class="selection-checkmark"></div>
    </div>
  `;
}

export {
  templateAddTaskForm,
  templateAddSubtask,
  templateContact,
};
