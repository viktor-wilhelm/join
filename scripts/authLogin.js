import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase.config.js';
import { getData } from './firebase.js';
import { initDataStore, injectCurrentUserAsContact } from './dataStore.js';
import { initPasswordIconToggle, showInputError, hideInputError } from './authUtilities.js';
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginPasswordIcon = document.getElementById('loginPasswordIcon');
const loginBtn = document.getElementById('loginBtn');
const loginEmailGroup = document.getElementById('loginEmailGroup');
const loginPasswordGroup = document.getElementById('loginPasswordGroup');
const loginErrorMessage = document.getElementById('loginErrorMessage');
const guestBtn = document.getElementById('guestBtn');

initPasswordIconToggle(loginPassword, loginPasswordIcon);
toggleLoginButton();

/**
 * Enables or disables the login button based on input field values.
 */
function toggleLoginButton() {
    const emailValue = loginEmail.value.trim();
    const passwordValue = loginPassword.value.trim();
    loginBtn.disabled = !(emailValue.length > 0 && passwordValue.length > 0);
}

/**
 * Fetches a user profile from the database by email.
 * @param {string} email
 * @return {Promise<Object|null>}
 */
async function getUserByEmail(email) {
    const allUsers = await getData("users");
    if (!allUsers) return null;
    const userList = Object.values(allUsers);
    return userList.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Handles login form submission, validates credentials, 
 * and initializes the data store with `initDataStore()` on success.
 *
 * @param {Event} event - The form submission event.
 * @async
 */
async function handleLogin(event) {
    event.preventDefault();
    resetLoginErrors();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        const user = await getUserByEmail(email);
        const sessionUser = user ? { name: user.name, email: user.email } : { name: email, email };
        await initDataStore();
        completeUserLogin(sessionUser);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            showInputError(loginErrorMessage, null, "No account found. Please sign up first.");
        } else {
            showLoginError();
        }
    }
}

/**
 * Creates a guest user object.
 * @return {Object} The guest user object.
 */
function getGuestUser() {
    return {
        name: "Guest",
        email: "guest@mail.com",
        password: "guest_demo123",
        guest: true,
    };
}

/**
 * Fills the login fields with the provided user's credentials.
 * @param {Object} guestUser - The guest user object containing email and password.
 */
function fillLoginFields(guestUser) {
    if (loginEmail && loginPassword) {
        loginEmail.value = guestUser.email;
        loginPassword.value = guestUser.password;
    }
    disableLoginButton();
}

/**
 * Disables the login button.
 */
function disableLoginButton() {
    if (loginBtn) loginBtn.disabled = true;
}

/**
 * Redirects to the specified URL after a delay.
 * @param {string} url - The URL to redirect to.
 * @param {number} [delay=500] - The delay in milliseconds before redirecting.
 */
function redirectAfterDelay(url, delay = 500) {
    setTimeout(() => {
        window.location.href = url;
    }, delay);
}

/**
 * Handles the guest login process.
 */
/**
 * Handles the guest login process without Firebase Auth.
 */
async function handleGuestLogin() {
    const guestUser = { name: "Guest", email: "guest@mail.com", guest: true };
    completeGuestLogin(guestUser);
}

/**
 * Finalizes login by storing the user session, initializing the data store, 
 * and redirecting to the summary page.
 *
 * @param {Object} currentUser - The logged-in user object.
 * @async
 */
async function completeUserLogin(currentUser) {
    sessionStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    await initDataStore();
    injectCurrentUserAsContact();
    window.location.href = "./html/summary.html";
}


/**
 * Finalizes guest login by storing the session, initializing the data store,
 * and redirecting to the summary page after a delay.
 *
 * @param {Object} guestUser - The guest user object.
 * @async
 */
async function completeGuestLogin(guestUser) {
    sessionStorage.setItem('loggedInUser', JSON.stringify(guestUser));
    await initDataStore();
    injectCurrentUserAsContact();

    redirectAfterDelay("./html/summary.html");
}

/**
 * Displays login error messages and highlights input fields.
 */
function showLoginError() {
    showInputError(loginErrorMessage, null, "Check your email and password. Please try again.");
    showInputError(loginEmailGroup, null);
    showInputError(loginPasswordGroup, null);
}

/**
 * Resets login error messages and input field highlights.
 */
function resetLoginErrors() {
    hideInputError(loginErrorMessage);
    hideInputError(loginEmailGroup);
    hideInputError(loginPasswordGroup);
}

loginForm.addEventListener('submit', handleLogin);
loginEmail.addEventListener('input', toggleLoginButton);
loginPassword.addEventListener('input', toggleLoginButton);
guestBtn.addEventListener('click', handleGuestLogin);