import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase.config.js';
import { getData, setData } from './firebase.js';
import { initDataStore, injectCurrentUserAsContact, ensureOwnContact } from './dataStore.js';
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
 * Fetches the profile of the signed-in user from `users/<uid>`.
 * A missing profile (e.g. an account created before profiles were stored by UID)
 * is created with a name derived from the email.
 * @param {string} email - The email the user signed in with.
 * @return {Promise<{name: string, email: string}>}
 */
async function getUserProfile(email) {
    const path = `users/${auth.currentUser.uid}`;
    const profile = await getData(path);
    if (profile) return profile;

    const created = { name: getNameFromEmail(email), email };
    await setData(path, created).catch(() => {});
    return created;
}

/**
 * Derives a display name from an email address, used when the user has no database record.
 * Drops the "+tag" and the domain, strips digits and capitalizes each word,
 * e.g. "wilhelm.viktor78+join@gmail.com" becomes "Wilhelm Viktor".
 *
 * @param {string} email - The user's email address.
 * @return {string} The derived name, or "User" if nothing usable is left.
 */
function getNameFromEmail(email) {
    const localPart = email.split('@')[0].split('+')[0];
    const words = localPart.replace(/\d+/g, '').split(/[._-]+/).filter(Boolean);
    const name = words.map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return name || 'User';
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
        const user = await getUserProfile(email);
        completeUserLogin({ name: user.name, email: user.email });
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            showInputError(loginErrorMessage, null, "No account found. Please sign up first.");
        } else {
            showLoginError();
        }
    }
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
 * Handles the guest login process with Firebase Anonymous Authentication, so the guest
 * works with the same shared tasks and contacts. If Anonymous Authentication is not
 * available, the guest works locally without any Firebase request.
 */
async function handleGuestLogin() {
    const guestUser = { name: "Guest", email: "guest@mail.com", guest: true };
    await signInAnonymously(auth).catch(() => {});
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
    await ensureOwnContact(currentUser);
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