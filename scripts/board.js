import { protectPage, formatTaskDate } from './utilities.js';
import { initDataStore, getContacts, getTasks, updateTasks } from './dataStore.js';
import { getNoTaskTemplate, getTaskCardTemplate, getSubtasksTemplate,
         getAssignedUserBadgeTemplate, getPlusBadgeTemplate } from './boardTemplates.js';
import { openAddTaskOverlay, closeAddTaskOverlay } from './addTaskOverlay.js';
import { closeTaskDetails } from './taskDetailOverlay.js';

let currentUser;

let tasks = [];
function setTasks(t) { tasks = t; }
let contacts = {};
function setContacts(c_) { contacts = c_; }
let currentDraggedElement = null;
let currentMoveTask = null;

const searchInput = document.getElementById("search-task");
const columnsTask = ["toDo", "inProgress", "awaitFeedback", "done"];
const CATEGORY_MAP = { "toDo": "to do", "inProgress": "in progress", "awaitFeedback": "await feedback", "done": "done" };
const CATEGORY_ORDER = ["to do", "in progress", "await feedback", "done"];

/**
 * Initializes the board: loads data, renders tasks, and sets up event listeners.
 * @async
 */
async function initBoard() {
    currentUser = protectPage();
    if (!currentUser) return;
    await initDataStore();
    contacts = getContacts();
    tasks = getTasks();
    renderBoard();
    initDragAndDrop();
    initButtons();
}

/**
 * Renders all task columns on the board and initializes drag events for the cards.
 * Supports live search by filtering tasks based on the provided query.
 *
 * @param {string} [filterQuery=""] - Optional search term to filter tasks in real time.
 */
function renderBoard(filterQuery = "") {
    const filteredTasks = filterTasks(tasks, filterQuery);

    renderTaskColumn("toDo", filteredTasks.filter(task => task.category === "to do"));
    renderTaskColumn("inProgress", filteredTasks.filter(task => task.category === "in progress"));
    renderTaskColumn("awaitFeedback", filteredTasks.filter(task => task.category === "await feedback"));
    renderTaskColumn("done", filteredTasks.filter(task => task.category === "done"));

    attachDragEventsToCards();
}

/**
 * Renders a single task column with the given list of tasks.
 * Displays a message if no tasks are available or match the search query.
 *
 * @param {string} columnId - The ID of the column element to render tasks into.
 * @param {Array<Object>} taskList - The list of tasks to render in this column.
 */
function renderTaskColumn(columnId, taskList) {
    const taskColumn = document.getElementById(columnId);
    if (!taskColumn) return;

    if (!taskList || taskList.length === 0) {
        const query = searchInput?.value.trim();
        if (query) {
            taskColumn.innerHTML = `<div class="no-tasks">No tasks match "<strong>${query}</strong>"</div>`;
        } else {
            taskColumn.innerHTML = getNoTaskTemplate();
        }
    } else {
        taskColumn.innerHTML = taskList.map(task => generateTaskHTML(task)).join("");
    }
}

/**
 * Assembles the full HTML structure for a task card by processing subtasks, assignments, and priority.
 * @param {Object} task - The task object containing all card data.
 * @returns {string} The complete HTML string for the task card.
 */
function generateTaskHTML(task) {
    const taskType = task.taskType.toLowerCase().replace(/\s/g, '-');
    const subtasksSection = createSubtasksHTML(task.subtasks);
    const assignedSection = createAssignedUsersHTML(task.assignedTo);
    const priorityIcon = `../assets/img/board/prio-${task.priority.toLowerCase()}.svg`;

    return getTaskCardTemplate(task, taskType, subtasksSection, assignedSection, priorityIcon);
}

/**
 * Calculates progress and returns the subtasks progress bar HTML if subtasks exist.
 * @param {Array} subtasks - Array of subtask objects.
 * @returns {string} The formatted progress bar HTML or an empty string.
 */
function createSubtasksHTML(subtasks) {
    if (!subtasks || subtasks.length === 0) return "";

    const total = subtasks.length;
    const done = subtasks.filter(st => st.done).length;
    const percentage = (done / total) * 100;

    return getSubtasksTemplate(done, total, percentage);
}

/**
 * Generates HTML badges for assigned users (max 4 + optional plus-badge).
 */
function createAssignedUsersHTML(assignedIds = []) {
    const max = 4;
    const contactsArray = getContacts();
    const html = assignedIds.slice(0, max).map(id => {
        const c = contactsArray.find(contact => contact.id === id);
        if (!c) return "";
        const initials = (c.name || "").split(" ").map(n => n[0]).join("");
        return getAssignedUserBadgeTemplate(initials, c.color || "#D1D1D1", c.name);
    }).join("");
    const extra = assignedIds.length > max ? getPlusBadgeTemplate(assignedIds.length - max) : "";
    return html + extra;
}

/**
 * Attaches dragstart event listeners to all task cards to track the currently dragged element.
 */
function attachDragEventsToCards() {
    const cards = document.querySelectorAll(".task-card");
    cards.forEach((card) => {
        card.addEventListener("dragstart", () => {
            currentDraggedElement = card.dataset.id;
        });
    });
}

/**
 * Sets up dragover, dragleave, and drop event listeners for each task column.
 */
function initDragAndDrop() {
    columnsTask.forEach((columnId) => {
        const dropZone = document.getElementById(columnId);

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("board-column__drop-zone--highlight");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("board-column__drop-zone--highlight");
        });

        dropZone.addEventListener("drop", () => {
            moveTaskToColumn(columnId);
            dropZone.classList.remove("board-column__drop-zone--highlight");
        });
    });
}

/**
 * Updates a task's category based on the drop target and re-renders the board.
 * @param {string} columnId - The ID of the target column where the task was dropped.
 */
function moveTaskToColumn(columnId) {
    const newCategory = CATEGORY_MAP[columnId];
    if (!newCategory) return;

    const task = tasks.find(task => task.id === currentDraggedElement);
    if (!task) return;

    task.category = newCategory;

    if (columnId === "done") {
        autoCompleteSubtasksAsDone(task);
    }

    updateTasks(tasksFromArrayToObject(tasks));
    renderBoard();
}

/**
 * Helper to mark all subtasks as done.
 */
function autoCompleteSubtasksAsDone(task) {
    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => subtask.done = true);
    }
}

/**
 * Initializes all static button event listeners and overlay interactions
 * on the board page.
 */
function initButtons() {
    initAddTaskButtons();
    initTaskDetailOverlay();
    initAddTaskOverlayClose();
}

/**
 * Initializes all "Add Task" buttons (header + column buttons)
 * and passes the corresponding category to the overlay.
 */
function initAddTaskButtons() {
    const addTaskButtons = document.querySelectorAll(
        ".board__add-btn, .board-column__add-btn"
    );

    addTaskButtons.forEach((btn) => {
        btn.addEventListener("click", handleAddTaskButtonClick);
    });
}

/**
 * Handles clicks on Add Task buttons.
 *
 * @param {MouseEvent} event - The click event.
 */
function handleAddTaskButtonClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.category || "to do";
    openAddTaskOverlay(category);
}

/**
 * Initializes close behavior for the task detail overlay.
 */
function initTaskDetailOverlay() {
    const detailOverlay = document.getElementById("taskDetailsOverlay");
    const detailContent = document.getElementById("taskDetailContent");
    detailOverlay?.addEventListener("click", () => {
        closeTaskDetails();
    });
    detailContent?.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}

/**
 * Initializes the close button for the Add Task overlay.
 */
function initAddTaskOverlayClose() {
    const closeAddTaskBtn = document.querySelector(".addtask-panel__close");
    closeAddTaskBtn?.addEventListener("click", closeAddTaskOverlay);
}

/**
 * Toggles the move task overlay on mobile for a specific task.
 *
 * @param {string} taskId - The unique ID of the task to move.
 * @param {Event} event - The DOM event that triggered this action.
 */
function toggleMoveToTaskOverlay(taskId, event) {
    event.stopPropagation();

    const overlay = document.getElementById(`overlay-${taskId}`);
    const currentTask = tasks.find(task => task.id === taskId);

    if (!overlay || !currentTask) return;

    overlay.innerHTML = generateMoveToOptions(currentTask.category, taskId);
    overlay.classList.toggle("hidden");
    currentMoveTask = currentTask;
}

/**
 * Generates HTML buttons for moving a task to adjacent columns.
 *
 * @param {string} category - The current category of the task (e.g., "to do", "in progress").
 * @param {string} taskId - The unique ID of the task.
 * @returns {string} The HTML string containing move buttons for the overlay.
 */
function generateMoveToOptions(category, taskId) {
    const currentIndex = CATEGORY_ORDER.indexOf(category);
    const options = [];
    if (currentIndex > 0) {
        options.push({ index: currentIndex - 1, label: '↑ ' + formatColumnName(CATEGORY_ORDER[currentIndex - 1]) });
    }
    if (currentIndex < CATEGORY_ORDER.length - 1) {
        options.push({ index: currentIndex + 1, label: '↓ ' + formatColumnName(CATEGORY_ORDER[currentIndex + 1]) });
    }

    return `
        <span class="move-overlay__title">Move to</span>
        ${options.map(opt => `
            <button onclick="moveTaskViaOverlay(${opt.index}, '${taskId}', event)">
                ${opt.label}
            </button>
        `).join('')}
    `;
}

/**
 * Capitalizes the first letter of each word in a column name of the overlay.
 * @param {string} name - The column name to format.
 * @returns {string} The formatted column name with each word capitalized.
 */
function formatColumnName(name) {
    return name
        .split(" ")
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Moves a task to a new column based on the overlay selection.
 *
 * @param {number} newIndex - The index of the target column in CATEGORY_ORDER.
 * @param {string} taskId - The unique ID of the task to move.
 * @param {Event} event - The DOM event that triggered this action.
 * @returns {void} Nothing is returned.
 */
function moveTaskViaOverlay(newIndex, taskId, event) {
    event.stopPropagation();

    const currentTask = tasks.find(task => task.id === taskId);
    if (!currentTask) return;

    currentTask.category = CATEGORY_ORDER[newIndex];

    if (currentTask.category === "done") {
        autoCompleteSubtasksAsDone(currentTask);
    }

    currentMoveTask = null;
    updateTasks(tasksFromArrayToObject(tasks));
    renderBoard();
}

/**
 * Closes all move task overlays by adding the "hidden" class to each overlay element.
 */
function closeAllMoveOverlays() {
    document
        .querySelectorAll(".move-overlay")
        .forEach(el => el.classList.add("hidden"));

    currentMoveTask = null;
}

/**
 * Converts an array of task objects into an object keyed by task IDs.
 *
 * @param {Array<Object>} taskArray - Array of task objects, each containing an `id`.
 * @returns {Object} An object where each key is a task ID and the value is the task data.
 */
function tasksFromArrayToObject(taskArray) {
    const obj = {};
    taskArray.forEach(task => {
        const { id, ...data } = task;
        obj[id] = data;
    });
    return obj;
}

/**
 * Filters tasks by a search query matching the title or description.
 *
 * @param {Array<Object>} tasksArray - Array of all task objects.
 * @param {string} [query=""] - The search term to filter tasks by.
 * @returns {Array<Object>} An array of tasks that match the search query.
 */
function filterTasks(tasksArray, query = "") {
    if (!query) return tasksArray;

    const lowerQuery = query.toLowerCase().trim();

    return tasksArray.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(lowerQuery);
        const descMatch = task.description?.toLowerCase().includes(lowerQuery);
        return titleMatch || descMatch;
    });
}

searchInput.addEventListener("input", (e) => {
    renderBoard(e.target.value);
});

document.addEventListener("click", closeAllMoveOverlays);
document.addEventListener("DOMContentLoaded", initBoard);
// Expose onclick handlers to global scope
window.toggleMoveToTaskOverlay = toggleMoveToTaskOverlay;
window.moveTaskViaOverlay = moveTaskViaOverlay;

export {
  setTasks,
  setContacts,
  renderBoard,
  tasksFromArrayToObject,
  tasks,
  contacts,
};
