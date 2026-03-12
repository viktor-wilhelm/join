/**
 * Returns the HTML template for an empty column state.
 * @returns {string} The HTML string for the 'No tasks' placeholder.
 */
function getNoTaskTemplate() {
    return `<div class="no-tasks">No tasks</div>`
}

/**
 * Generates the complete HTML string for a task card, incorporating status, subtasks, and assignments.
 * @param {Object} task - The task data object.
 * @param {string} taskType - The formatted CSS class suffix for the task category.
 * @param {string} subtasksSection - Pre-rendered HTML for the subtask progress bar.
 * @param {string} assignedSection - Pre-rendered HTML for the assigned users' badges.
 * @param {string} priorityIcon - The file path to the priority icon image.
 * @returns {string} The HTML template for a task card.   
 */
function getTaskCardTemplate(task, taskType, subtasksSection, assignedSection, priorityIcon) {
    return `
        <div draggable="true" class="task-card" data-id="${task.id}" onclick="openTaskDetails('${task.id}')"> 
            <div class="task-card__header">
                <div class="task-card__category task-card__category--${taskType}">
                    ${task.taskType}
                </div>
                <img src="../assets/img/board/move-to.svg" class="task-move-btn" onclick="toggleMoveToTaskOverlay('${task.id}', event)"/>
            </div>
            <div class="task-card__content">
                <div class="task-card__title">${task.title}</div>
                <div class="task-card__description">${task.description}</div>
            </div>
            ${subtasksSection}
            <div class="task-card__footer">
                <div class="task-card__assigned-users">
                    ${assignedSection}
                </div>
                <div class="task-card__priority">
                    <img class="task-card__priority-icon" src="${priorityIcon}" alt="${task.priority}">
                </div>
            </div>
            <div class="move-overlay hidden" id="overlay-${task.id}"></div>
        </div>
    `;
}

/**
 * Generates the HTML for the subtask progress bar and status text.
 * @param {number} done - The number of completed subtasks.
 * @param {number} total - The total number of subtasks.
 * @param {number} percentage - The calculated progress percentage for the bar width.
 * @returns {string} The HTML template for the progress section.
 */
function getSubtasksTemplate(done, total, percentage) {
    return `
        <div class="task-card__progress-container">
            <div class="task-card__progress-bar">
                <div class="task-card__progress-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="task-card__progress-text">${done}/${total} Subtasks</span>
        </div>
    `;
}

/**
 * Generates the HTML for an individual user badge with initials and a background color.
 * @param {string} initials - The user's initials (e.g., "JD").
 * @param {string} bgColor - The hex or CSS color code for the badge background.
 * @param {string} name - The full name of the user for the tooltip title.
 * @returns {string} The HTML template for a single user badge.
 */
function getAssignedUserBadgeTemplate(initials, bgColor, name) {
    return `
        <div class="task-card__user-badge" 
             style="background-color: ${bgColor}" 
             title="${name}">
             ${initials}
        </div>`;
}

/**
 * Generates the HTML for the "plus" badge when more than 4-5 users are assigned.
 * @param {number} count - The number of remaining users.
 * @returns {string} HTML string for the plus badge.
 */
function getPlusBadgeTemplate(count) {
    return `
        <div class="task-card__user-badge plus-badge">
            +${count}
        </div>`;
}

export {
  getNoTaskTemplate,
  getTaskCardTemplate,
  getSubtasksTemplate,
  getAssignedUserBadgeTemplate,
  getPlusBadgeTemplate,
};
