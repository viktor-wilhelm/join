import { tasks, setTasks, renderBoard, tasksFromArrayToObject } from './board.js';
import { updateTasks, getContacts } from './dataStore.js';
import { getInitials } from './shared/utilities.js';
import { formatTaskDate } from './utilities.js';
import { getTaskDetailTemplate, getDetailedContactItemTemplate, getNoAssignedTemplate,
         getDetailSubtaskItemTemplate, getNoSubtasksTemplate } from './taskDetailTemplate.js';

const taskDetailsOverlay = document.getElementById('taskDetailsOverlay');
const taskDetailContent = document.getElementById('taskDetailContent');
const overlayTransitionDuration = 250;
let currentTask = null;
function setCurrentTask(t) { currentTask = t; }

/**
 * Opens the task details overlay for a specific task.
 * Finds the task by its ID, renders the overlay content,
 * and displays the overlay if the task exists.
 *
 * @param {string} taskId - The unique ID of the task to open.
 */
function openTaskDetails(taskId) {
    currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    renderTaskOverlay();
    showOverlay();
}

/**
 * Closes the task details overlay with a transition effect.
 * Hides the overlay after the animation duration,
 * restores page scrolling, and resets the current task reference.
 */
function closeTaskDetails() {
    taskDetailsOverlay.classList.remove('show');

    setTimeout(() => {
        taskDetailsOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        currentTask = null;
    }, overlayTransitionDuration);
}

/**
 * Displays the task details overlay with a short delay
 * to trigger the CSS transition and disables page scrolling.
 */
function showOverlay() {
    taskDetailsOverlay.classList.remove('hidden');
    setTimeout(() => {
        taskDetailsOverlay.classList.add('show');
    }, 10);
    document.body.style.overflow = 'hidden';
}

/**
 * Renders the task details overlay content for the currently selected task.
 * Generates contact and subtask HTML templates and injects them into the overlay container.
 */
function renderTaskOverlay() {
    if (!currentTask) return;

    const contactsHTML = getDetailedContactTemplate(currentTask.assignedTo);
    const subtasksHTML = getDetailSubtasksTemplate(currentTask.id, currentTask.subtasks);
    const dueDateText = currentTask.dueDate ? formatTaskDate(currentTask.dueDate) : 'No date set';
    const priorityName = currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1);
    const priorityIcon = `../assets/img/board/prio-${currentTask.priority.toLowerCase()}.svg`;
    const taskTypeClass = currentTask.taskType.toLowerCase().replace(/\s/g, '-');

    taskDetailContent.innerHTML = getTaskDetailTemplate(
        currentTask,
        contactsHTML,
        subtasksHTML,
        dueDateText,
        priorityName,
        priorityIcon,
        taskTypeClass
    );
}

/**
 * Toggles the completion status of a specific subtask,
 * updates the stored tasks asynchronously, and re-renders
 * both the task details overlay and the board.
 *
 * @param {string} taskId - The ID of the parent task.
 * @param {number} subtaskIndex - The index of the subtask to toggle.
 * @returns {Promise<void>}
 */
async function toggleSubtask(taskId, subtaskIndex) {
    if (!currentTask || !currentTask.subtasks?.[subtaskIndex]) return;

    currentTask.subtasks[subtaskIndex].done =
        !currentTask.subtasks[subtaskIndex].done;

    await updateTasks(tasksFromArrayToObject(tasks));

    renderTaskOverlay();
    renderBoard(document.getElementById('search-task')?.value || '');
}

/**
 * Deletes a task by its ID, updates the stored task data asynchronously,
 * and re-renders the board. If the update fails, the previous task state
 * is restored.
 *
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
        await updateTasks(tasksFromArrayToObject(tasks));
        closeTaskDetails();
        renderBoard(document.getElementById('search-task')?.value || '');
    } catch {
        setTasks(previousTasks);
        renderBoard(document.getElementById('search-task')?.value || '');
    }
}

/**
 * Builds the HTML string for displaying assigned contacts in the task detail view.
 * If no contacts are assigned, a fallback template is returned.
 * Each contact is looked up by ID and rendered using a detailed contact item template.
 *
 * @param {Array<string>} assignedIds - List of assigned contact IDs.
 * @returns {string} The generated HTML markup for the assigned contacts section.
 */
function getDetailedContactTemplate(assignedIds) {
    if (!assignedIds?.length) {
        return getNoAssignedTemplate();
    }
    const contactsArray = getContacts();
    return assignedIds.map(id => {
        const contact = contactsArray.find(c => c.id === id);
        if (!contact) return "";

        const initials = getInitials(contact.name);

        return getDetailedContactItemTemplate(contact, initials);
    }).join("");
}

/**
 * Generates the HTML markup for the subtasks section in the task detail view.
 * Returns a fallback template if no subtasks exist.
 *
 * @param {string} taskId - The ID of the parent task.
 * @param {Array<Object>} subtasks - Array of subtask objects containing `title` and `done` state.
 * @returns {string} The generated HTML string for the subtasks section.
 */
function getDetailSubtasksTemplate(taskId, subtasks) {
    if (!subtasks?.length) {
        return getNoSubtasksTemplate();
    }

    return subtasks.map((st, index) => {
        const isDone = st.done;
        return getDetailSubtaskItemTemplate(taskId, index, st.title, isDone);
    }).join("");
}

// Expose onclick handlers to global scope
window.openTaskDetails = openTaskDetails;
window.closeTaskDetails = closeTaskDetails;
window.deleteTask = deleteTask;
window.toggleSubtask = toggleSubtask;

export {
  setCurrentTask,
  openTaskDetails,
  closeTaskDetails,
  renderTaskOverlay,
  toggleSubtask,
  deleteTask,
  currentTask,
};
