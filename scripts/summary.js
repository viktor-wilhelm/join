import { initDataStore, getTasks } from './dataStore.js';
import { protectPage } from './utilities.js';
let allTasks = [];
let currentUser = {};

const greetingEl = document.querySelector('.summary__greeting-title');
const nameEl = document.getElementById('user-name-display');
const todoCountEl = document.getElementById('todoCount');
const doneCountEl = document.getElementById('doneCount');
const progressCountEl = document.getElementById('progressCount');
const feedbackCountEl = document.getElementById('feedbackCount');
const boardCountEl = document.getElementById('boardCount');
const urgentCountEl = document.getElementById('urgentCount');
const displayDateEl = document.getElementById('displayDate');

/**
 * Initializes the summary page by loading user data and tasks, then displaying the greeting and task summary.     
 *
 * @async
 */
async function initSummary() {
    currentUser = protectPage();
    if (!currentUser) return;

    loadUserFromSessionStorage();

    await initDataStore();
    allTasks = getTasks();

    displayGreetingDesktop(currentUser);
    displayGreetingMobile(currentUser);
    renderSummary();
}

/**
 * Loads the logged-in user's data from session storage. 
 * If no user data is found, redirects to the login page.
 */
function loadUserFromSessionStorage() {
    const userData = sessionStorage.getItem('loggedInUser');
    currentUser = JSON.parse(userData);
}

/**
 * Generates a greeting message based on the current time of day and user information.
 * @param {Object} user - The user object containing guest and name properties.
 * @return {Object} - An object with greeting, symbol, and name properties.
 */
function getGreetingText(user) {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    return {
        greeting,
        symbol: user.guest ? "!" : ",",
        name: user.guest ? "" : user.name
    };
}

/**
 * Displays a personalized greeting on the summary page for desktop users
 * based on the user's info and the current time of day.
 *
 * @param {Object} user - The user object containing relevant info.
 */
function displayGreetingDesktop(user) {
    const data = getGreetingText(user);

    greetingEl.innerText = `${data.greeting}${data.symbol}`;
    nameEl.innerText = data.name;
}

/**
 * Calculates and renders the summary of tasks on the summary page, including counts for each category 
 * and priority, as well as the next upcoming deadline for urgent tasks.
 */
function renderSummary() {
    const summary = {
        todo: allTasks.filter(task => task.category === 'to do').length,
        done: allTasks.filter(task => task.category === 'done').length,
        progress: allTasks.filter(task => task.category === 'in progress').length,
        feedback: allTasks.filter(task => task.category === 'await feedback').length,
        urgent: allTasks.filter(task => task.priority === 'urgent').length,
    };

    todoCountEl.innerText = summary.todo;
    doneCountEl.innerText = summary.done;
    progressCountEl.innerText = summary.progress;
    feedbackCountEl.innerText = summary.feedback;
    boardCountEl.innerText = allTasks.length;
    urgentCountEl.innerText = summary.urgent;
    displayDateEl.innerText = getNextDeadline();
}

/**
 * Finds the next upcoming deadline among tasks marked as "urgent".
 */
function getNextDeadline() {
    const urgentTasks = allTasks.filter(t => t.priority === 'urgent' && t.dueDate);
    if (urgentTasks.length === 0) return "No upcoming deadlines";

    urgentTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const nextDate = new Date(urgentTasks[0].dueDate);

    return nextDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Displays a personalized greeting overlay on mobile devices 
 * based on the user's info and the current time of day.
 *
 * @param {Object} user - The user object containing relevant info.
 */
function displayGreetingMobile(user) {
    if (window.innerWidth > 768) return;
    if (sessionStorage.getItem('mobileGreetingShown')) return;

    // Only show greeting once per session
    if (sessionStorage.getItem('greetingShown')) return;

    const data = getGreetingText(user);
    const overlay = createOverlayElement(data);
    document.body.appendChild(overlay);
    
    // Mark that greeting has been shown
    sessionStorage.setItem('greetingShown', 'true');
    
    runOverlayAnimation(overlay);

    sessionStorage.setItem('mobileGreetingShown', 'true');
}

/**
 * Creates and returns a greeting overlay DOM element populated with HTML content.
 *
 * @param {Object} data - The data used to generate the overlay content.
 * @returns {HTMLElement} The greeting overlay element.
 */
function createOverlayElement(data) {
    const overlay = document.createElement('div');

    overlay.id = 'greetingOverlay';
    overlay.className = 'summary__greeting-overlay';
    overlay.innerHTML = getGreetingOverlayHTML(data);
    return overlay;
}

/**
 * Animates a greeting overlay by showing it, fading it out, and then removing it from the DOM.
 *
 * @param {HTMLElement} overlay - The overlay element to animate and remove.
 */
function runOverlayAnimation(overlay) {
    overlay.classList.add('show');

    setTimeout(() => {
        overlay.classList.remove('show');

        setTimeout(() => overlay.remove(), 1000);
    }, 1500);
}

/**
 * Pure HTML Template for the overlay.
 */
function getGreetingOverlayHTML(data) {
    return `
        <h2 class="summary__greeting-title">${data.greeting}${data.symbol}</h2>
        <span class="summary__greeting-name">${data.name}</span>
    `;
}

document.addEventListener("DOMContentLoaded", initSummary);